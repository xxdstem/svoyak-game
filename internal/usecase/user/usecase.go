package user

import (
	"crypto/md5"
	"encoding/hex"
	"errors"
	"net/http"
	"svoyak/internal/entity"
	"svoyak/internal/entity/dto"
	"svoyak/internal/utils"
	"svoyak/pkg/logger"
	"svoyak/pkg/websocket"
	"sync"

	"github.com/google/uuid"
)

var log *logger.Logger

type Store interface {
	Get(index string) (*entity.User, bool)
	Set(index string, value *entity.User)
	Del(key string)
	FindByName(name string) *entity.User
}

type RoomUseCase interface {
	GetRoom(roomID string) (*entity.Room, error)
}

type uc struct {
	store Store
	ruc   RoomUseCase
}

func New(l *logger.Logger, store Store, ruc RoomUseCase) *uc {
	log = l
	return &uc{store, ruc}
}

func (uc *uc) GetUser(r *http.Request) *entity.User {
	sessionID := r.Context().Value("sessionID").(string)
	user, ok := uc.store.Get(sessionID)
	if !ok {
		return nil
	}
	return user
}

func (uc *uc) JoinRoom(user *entity.User, roomID string) error {
	room, err := uc.ruc.GetRoom(roomID)
	if err != nil {
		return err
	}
	if room.PlayersMax == len(room.Players) {
		return errors.New("room is full")
	}
	room.Players[user.SessionID] = user
	user.RoomStats = &entity.RoomStats{}
	user.Room = room
	user.Room.Broadcast(websocket.Message{
		Type:    "joined_user",
		Payload: dto.RoomPlayerResponse(user),
	})
	return nil
}

func (uc *uc) NewUser(sessionID string, name string) (*entity.User, error) {
	if uc.store.FindByName(name) != nil {
		return nil, errors.New("this name is already taken")
	}
	user := &entity.User{SessionID: sessionID, UserName: name, Mutex: sync.RWMutex{}}
	md5 := md5.Sum([]byte(uuid.New().String()))
	user.Token = hex.EncodeToString(md5[:])
	user.Color = utils.RandomHexColor()
	uc.store.Set(sessionID, user)
	return user, nil
}

func (uc *uc) Logout(r *http.Request) error {
	sessionID := r.Context().Value("sessionID").(string)
	_, ok := uc.store.Get(sessionID)
	if !ok {
		return nil
	}
	uc.store.Del(sessionID)
	return nil
}
