package websocket

import (
	"net/http"
	"svoyak/internal/entity"
	"svoyak/internal/utils"
	"svoyak/pkg/logger"
	"svoyak/pkg/websocket"
)

type Store interface {
	FindUserByToken(token string) *entity.User
	FindUserByID(sessionID string) *entity.User
}

type GameUseCase interface {
	SelectQustion(room *entity.Room, themeIdx int, questionIdx int)
}

type RoomUseCase interface {
	LeaveRoom(user *entity.User) error
}

type UserUseCase interface {
	SetWsState(user *entity.User, state *websocket.Client)
}
type WSHandler struct {
	server *websocket.WebSocketServer
	store  Store
	guc    GameUseCase
	ruc    RoomUseCase
	uuc    UserUseCase
}

var log *logger.Logger

func NewWSHandler(l *logger.Logger, server *websocket.WebSocketServer, store Store, guc GameUseCase, ruc RoomUseCase, uuc UserUseCase) *WSHandler {
	log = l
	return &WSHandler{server, store, guc, ruc, uuc}
}

func (h *WSHandler) Register() {
	h.server.RegisterHandler("question/select", h.SelectQustion)
}

func (h *WSHandler) HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	token := utils.ExtractTokenFromRequest(r)
	user := h.store.FindUserByToken(token)
	if user == nil {
		http.Error(w, "cannot find user", http.StatusUnauthorized)
		return
	}
	ws := h.server.HandleWebSocket(w, r, user.SessionID, func() {
		h.uuc.SetWsState(user, nil)
		//h.ruc.LeaveRoom(user)
	})
	h.uuc.SetWsState(user, ws)
}

func (h *WSHandler) SelectQustion(client *websocket.Client, message websocket.Message) {
	user := h.store.FindUserByID(client.SessionID)
	if user == nil || user.Room == nil {
		return
	}
	user.Room.Broadcast(message)
	// TODO:
	// Сделать это не через жопу?
	payload, ok := message.Payload.(map[string]any)
	if !ok {
		log.Error("cannot convert")
		return
	}
	h.guc.SelectQustion(user.Room, int(payload["themeIndex"].(float64)), int(payload["questionIndex"].(float64)))
}
