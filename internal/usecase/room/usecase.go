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

func (uc *uc) CreateGame(user *entity.User, req *dto.CreateGameRequest) (*entity.Room, error) {
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
	delete(room.Players, user.SessionID)
	user.Room = nil
	user.RoomStats = nil
	if len(room.Players) == 0 {
		log.Info("Aborting room!")
		uc.AbortRoom(room)
	}
	return nil
}
func (uc *uc) ListRooms() []*entity.Room {
	rooms := make([]*entity.Room, 0, len(uc.rooms))
	for _, room := range uc.rooms {
		rooms = append(rooms, room)
	}
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

func (uc *uc) SetPlayerRole(player *entity.User, role string) error {
	if !isValidRole(role) {
		return errors.New("bad request")
	}
	if role == role_host {
		for _, p := range player.Room.Players {
			if p.RoomStats.Role == role_host {
				return errors.New("host role is not available")
			}
		}
	}
	player.RoomStats.Role = role
	return nil
}

func isValidRole(role string) bool {
	switch role {
	case role_host, role_player, role_viewer:
		return true
	}
	return false
}
