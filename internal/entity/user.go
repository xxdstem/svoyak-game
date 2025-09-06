package entity

type User struct {
	SessionID string
	Room      *Room
	RoomStats *RoomStats
	UserName  string
}

type RoomStats struct {
	Role           string
	QuestionPicker bool
	Points         int
}
