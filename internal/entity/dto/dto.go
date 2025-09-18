package dto

import (
	"mime/multipart"
	"svoyak/internal/entity"
)

type userIdentifyResponse struct {
	SessionID string `json:"session_id"`
	RoomID    string `json:"room_id"`
	Token     string `json:"token"`
	UserName  string `json:"username"`
}
type roomPlayerResponse struct {
	ID          string            `json:"id"`
	UserName    string            `json:"username"`
	Color       string            `json:"color"`
	WsConnected bool              `json:"ws_connected"`
	RoomStats   *entity.RoomStats `json:"room_stats"`
}

func RoomPlayerResponse(user *entity.User) *roomPlayerResponse {
	return &roomPlayerResponse{
		ID:          user.SessionID,
		Color:       user.Color,
		RoomStats:   user.RoomStats,
		UserName:    user.UserName,
		WsConnected: user.Ws != nil,
	}
}

func UserIdentifyResponse(user *entity.User) userIdentifyResponse {
	var roomID string
	if user.Room != nil {
		roomID = user.Room.ID
	}
	return userIdentifyResponse{
		SessionID: user.SessionID,
		Token:     user.Token,
		RoomID:    roomID,
		UserName:  user.UserName,
	}
}

type roomDetailedResponse struct {
	ID           string                      `json:"id"`
	Name         string                      `json:"name"`
	PackageID    string                      `json:"package_id"`
	PackageName  string                      `json:"package_name"`
	PlayersMax   int                         `json:"players_max"`
	CurrentRound int                         `json:"current_round"`
	IsStarted    bool                        `json:"is_started"`
	IsPaused     bool                        `json:"is_paused"`
	Players      map[int]*roomPlayerResponse `json:"players"`
}

func RoomDetailedResponse(room *entity.Room) roomDetailedResponse {
	resp := roomDetailedResponse{
		ID:           room.ID,
		Name:         room.Name,
		PackageID:    room.Package.PackageID,
		CurrentRound: room.CurrentRound,
		PackageName:  room.Package.Name,
		IsStarted:    room.IsStarted,
		IsPaused:     room.IsPaused,
		PlayersMax:   room.PlayersMax,
	}
	players := make(map[int]*roomPlayerResponse, room.PlayersMax+1)
	for i := -1; i < room.PlayersMax; i++ {
		players[i] = nil
	}
	for slotId, player := range room.Players {
		if player != nil {
			players[slotId] = RoomPlayerResponse(player)
		}
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

type CreateGameRequest struct {
	Name         string
	Password     string
	PlayersCount int
	File         multipart.File
}
