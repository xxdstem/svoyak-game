package room

import (
	"errors"
	"fmt"
	"mime/multipart"
	"os"
	"svoyak/internal/entity"
	"svoyak/internal/entity/dto"
	"svoyak/internal/models"
	"svoyak/pkg/logger"
	"svoyak/pkg/websocket"

	"github.com/ahmetb/go-linq/v3"
	. "github.com/ahmetb/go-linq/v3"
)

const (
	role_host   = "host"
	role_player = "player"
	role_viewer = ""
)

var log *logger.Logger

type Store interface {
	Get(index string) (*entity.User, bool)
	Set(index string, value *entity.User)
	Del(key string)
	FindByName(name string) *entity.User
}

type GameUseCase interface {
	UnpackAndLoadPackage(filename string) (*models.Package, error)
}

type FileService interface {
	SaveTempFile(file multipart.File) (string, error)
}

type uc struct {
	store       Store
	gameUsecase GameUseCase
	fs          FileService
	rooms       map[string]*entity.Room // хранение комнат
}

func New(l *logger.Logger, store Store, gameUsecase GameUseCase, fs FileService) *uc {
	log = l
	return &uc{store: store, rooms: make(map[string]*entity.Room), gameUsecase: gameUsecase, fs: fs}
}

func (uc *uc) CreateGame(req *dto.CreateGameRequest) (*entity.Room, error) {
	pkg, err := uc.saveAndProcessPackage(req.File)
	if err != nil {
		return nil, fmt.Errorf("failed to process package: %w", err)
	}

	room, err := uc.CreateRoom(req.Name, req.Password)
	if err != nil {
		return nil, fmt.Errorf("failed to create room: %w", err)
	}

	room.Package = *pkg

	return room, nil
}

func (uc *uc) saveAndProcessPackage(file multipart.File) (*models.Package, error) {
	tempPath, err := uc.fs.SaveTempFile(file)
	if err != nil {
		return nil, err
	}
	defer os.Remove(tempPath)

	return uc.gameUsecase.UnpackAndLoadPackage(tempPath)
}

func (uc *uc) CreateRoom(name string, password string) (*entity.Room, error) {
	room := entity.NewRoom(name, password)
	uc.rooms[room.ID] = &room
	return &room, nil
}

func (uc *uc) GetRoom(roomID string) (*entity.Room, error) {
	room, ok := uc.rooms[roomID]
	if !ok {
		return nil, errors.New("room not found")
	}
	return room, nil
}

func (uc *uc) LeaveRoom(user *entity.User) error {
	if user.Room == nil {
		return errors.New("user not in room")
	}

	room := user.Room
	for s, p := range room.Players {
		if p != nil && p.SessionID == user.SessionID {
			delete(room.Players, s)
		}
	}
	delete(room.Members, user.SessionID)
	user.Room = nil
	user.RoomStats = nil

	if len(room.Players) == 0 {
		log.Info("Aborting room!")
		uc.AbortRoom(room)
		return nil
	}

	room.Broadcast(websocket.Message{
		Type:    "updated_room",
		Payload: dto.RoomDetailedResponse(room),
	})
	return nil
}
func (uc *uc) ListAvailableRooms() []*entity.Room {
	var rooms []*entity.Room
	for _, room := range uc.rooms {
		rooms = append(rooms, room)
	}
	From(uc.rooms).SelectT(func(kv linq.KeyValue) *entity.Room {
		return kv.Value.(*entity.Room)
	}).WhereT(func(r *entity.Room) bool {
		return !r.IsStarted
	}).ToSlice(&rooms)
	return rooms
}

func (uc *uc) AbortRoom(room *entity.Room) error {
	if len(room.Players) > 0 {
		for _, p := range room.Players {
			p.Room = nil
			p.RoomStats = nil
		}
	}
	delete(uc.rooms, room.ID)
	os.RemoveAll("./temp/pkg/" + room.Package.PackageID)
	room = nil
	return nil
}

func (uc *uc) JoinAsPlayer(user *entity.User, slotId int) error {
	room := user.Room
	if room == nil {
		return errors.New("there's no room")
	}
	if room.PlayersMax == len(room.Players) {
		return errors.New("room is full")
	}
	if room.Players[slotId] != nil {
		return errors.New("slot is busy")
	}

	// Возможно потом сделать возможность менять слот
	for _, p := range room.Players {
		if p.SessionID == user.SessionID {
			return errors.New("you cannot change slot")
		}
	}
	room.Players[slotId] = user
	role := role_player
	if slotId == -1 {
		role = role_host
	}
	user.RoomStats = &entity.RoomStats{Role: role}
	user.Room = room
	room.Broadcast(websocket.Message{
		Type:    "updated_room",
		Payload: dto.RoomDetailedResponse(room),
	})
	return nil
}
