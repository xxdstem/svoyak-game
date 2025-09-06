package dto

import "svoyak/internal/entity"

type userResponse struct {
	SessionID string `json:"session_id"`
	RoomID    string `json:"room_id"`
	UserName  string `json:"username"`
}
type roomPlayerResponse struct {
	ID        string            `json:"id"`
	UserName  string            `json:"username"`
	RoomStats *entity.RoomStats `json:"room_stats"`
}

func RoomPlayerResponse(user *entity.User) roomPlayerResponse {
	return roomPlayerResponse{
		ID:        user.SessionID,
		RoomStats: user.RoomStats,
		UserName:  user.UserName,
	}
}

func UserResponse(user *entity.User) userResponse {
	var roomID string
	if user.Room != nil {
		roomID = user.Room.ID
	}
	return userResponse{
		SessionID: user.SessionID,
		RoomID:    roomID,
		UserName:  user.UserName,
	}
}

type roomDetailedResponse struct {
	ID          string               `json:"id"`
	Name        string               `json:"name"`
	PackageID   string               `json:"package_id"`
	PackageName string               `json:"package_name"`
	PlayersMax  int                  `json:"players_max"`
	IsStarted   bool                 `json:"is_started"`
	IsPaused    bool                 `json:"is_paused"`
	Players     []roomPlayerResponse `json:"players"`
}

func RoomDetailedResponse(room *entity.Room) roomDetailedResponse {
	resp := roomDetailedResponse{
		ID:          room.ID,
		Name:        room.Name,
		PackageID:   room.Package.PackageID,
		PackageName: room.Package.Name,
		IsStarted:   room.IsStarted,
		IsPaused:    room.IsPaused,
		PlayersMax:  room.PlayersMax,
	}
	players := make([]roomPlayerResponse, 0)
	for _, player := range room.Players {
		players = append(players, RoomPlayerResponse(player))
	}
	resp.Players = players
	return resp
}

type roomResponse struct {
	ID           string `json:"id"`
	Name         string `json:"name"`
	WithPassword bool   `json:"with_password"`
	PackageName  string `json:"package_name"`
	PlayersMax   int    `json:"players_max"`
	PlayersCount int    `json:"players_count"`
}

func ListRoomsToDto(rooms []*entity.Room) []roomResponse {
	result := make([]roomResponse, 0, len(rooms))
	for _, room := range rooms {
		result = append(result, RoomResponse(room))
	}
	return result
}

func RoomResponse(room *entity.Room) roomResponse {
	return roomResponse{
		ID:           room.ID,
		Name:         room.Name,
		WithPassword: room.Password != "",
		PackageName:  room.Package.Name,
		PlayersMax:   room.PlayersMax,
		PlayersCount: len(room.Players),
	}
}

type roomCreationResponse struct {
	RoomID string `json:"room_id"`
}

func RoomCreationResponse(room *entity.Room) roomCreationResponse {
	return roomCreationResponse{
		RoomID: room.ID,
	}
}
