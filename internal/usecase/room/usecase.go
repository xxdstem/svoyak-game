package room

import (
	"errors"
	"math/rand"
	"os"
	"svoyak/internal/entity"
	"svoyak/internal/models"
	"svoyak/pkg/logger"
	"svoyak/pkg/parser"

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
	if room.PlayersMax == len(room.Players) {
		return errors.New("room is full")
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

func (uc *uc) StartGame(room *entity.Room) error {
	room.IsPaused = false
	room.IsStarted = true
	var players []*entity.User
	From(room.Players).SelectT(func(kv KeyValue) *entity.User {
		return kv.Value.(*entity.User)
	}).WhereT(func(p *entity.User) bool {
		return p.RoomStats.Role == role_player
	}).ToSlice(&players)
	if len(players) == 0 {
		return errors.New("no players")
	}
	rndPlayer := players[rand.Intn(len(players))]
	rndPlayer.RoomStats.QuestionPicker = true
	return nil
}

func isValidRole(role string) bool {
	switch role {
	case role_host, role_player, role_viewer:
		return true
	}
	return false
}
