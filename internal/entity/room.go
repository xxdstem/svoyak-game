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

func NewRoom(name string, password string) Room {
	id := uuid.New().String()
	players := 4
	return Room{
		ID:         id,
		Name:       name,
		Password:   password,
		PlayersMax: players,
		Players:    make(map[int]*User, players+1),
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
