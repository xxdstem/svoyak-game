package entity

import "sync"

type User struct {
	SessionID string
	Room      *Room
	RoomStats *RoomStats
	UserName  string
	Color     string
	Mutex     sync.RWMutex
	Token     string
}

type RoomStats struct {
	Role           string
	QuestionPicker bool
	Points         int
}
