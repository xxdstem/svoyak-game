package entity

import (
	"svoyak/internal/models"
	"svoyak/pkg/websocket"

	"github.com/google/uuid"
)

type Room struct {
	ID       string
	Name     string
	Password string
	Package  models.Package
	Players  map[int]*User
	// All members
	Members      map[string]*User
	PlayersMax   int
	CurrentRound int
	// Implement this as State with enums?
	IsPaused  bool
	IsStarted bool
}

func NewRoom(name string, password string, playersCount int) Room {
	id := uuid.New().String()
	return Room{
		ID:         id,
		Name:       name,
		Password:   password,
		PlayersMax: playersCount,
		Players:    make(map[int]*User, playersCount+1),
		Members:    make(map[string]*User),
	}
}

func (r *Room) Broadcast(msg websocket.Message) {
	for _, u := range r.Members {
		if u.Ws != nil {
			u.Ws.Send <- msg
		}
	}
}
