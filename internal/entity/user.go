package entity

import (
	"svoyak/pkg/websocket"
	"sync"
)

type User struct {
	SessionID string
	Room      *Room
	RoomStats *RoomStats
	UserName  string
	Color     string
	Mutex     sync.RWMutex
	Token     string
	Ws        *websocket.Client
}

type RoomStats struct {
	Role           string
	QuestionPicker bool
	Points         int
	WsConnected    bool
}
