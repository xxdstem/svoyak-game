package room

import (
	"errors"
	"os"
	"svoyak/internal/entity"
	"svoyak/internal/models"
	"svoyak/pkg/logger"
	"svoyak/pkg/parser"
)

var log *logger.Logger

type Store interface {
	Get(index string) (*entity.User, bool)
	Set(index string, value *entity.User)
	Del(key string)
	FindByName(name string) *entity.User
}

type uc struct {
	store Store
	rooms map[string]*entity.Room // хранение комнат
}

func New(l *logger.Logger, store Store) *uc {
	log = l
	return &uc{store: store, rooms: make(map[string]*entity.Room)}
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

func (uc *uc) JoinRoom(user *entity.User, roomID string) error {
	room, ok := uc.rooms[roomID]
	if !ok {
		return errors.New("room not found")
	}
	room.Players[user.SessionID] = user
	user.RoomStats = &entity.RoomStats{}
	user.Room = room
	return nil
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

func (uc *uc) UnpackAndLoadPackage(filename string) (*models.Package, error) {
	uuid, err := parser.UnpackZipArchive(filename)
	if err != nil {
		log.Error("error unpack")
		return nil, err
	}

	pkg, err := parser.ParseFromFile("./temp/pkg/" + uuid + "/" + "content.xml")
	pkg.PackageID = uuid
	if err != nil {
		return nil, err
	}
	return pkg, nil
}

func (uc *uc) AbortRoom(room *entity.Room) error {
	if len(room.Players) > 0 {
		for _, p := range room.Players {
			p.Room = nil
			p.RoomStats = nil
		}
	}
	delete(uc.rooms, room.ID)
	room = nil
	os.RemoveAll("./temp/pkg/" + room.Package.PackageID)
	return nil
}
