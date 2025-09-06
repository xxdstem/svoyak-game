package entity

import (
	"svoyak/internal/models"

	"github.com/google/uuid"
)

type Room struct {
	ID         string
	Name       string
	Password   string
	Package    models.Package
	Players    map[string]*User
	PlayersMax int
	// Implement this as State with enums?
	IsPaused  bool
	IsStarted bool
}

func NewRoom(name string, password string) Room {
	id := uuid.New().String()
	return Room{
		ID:         id,
		Name:       name,
		Password:   password,
		PlayersMax: 4,
		Players:    make(map[string]*User),
	}
}
