package websocket

import (
	"net/http"
	"svoyak/internal/entity"
	"svoyak/internal/utils"
	"svoyak/pkg/websocket"
)

type Store interface {
	FindUserByToken(token string) *entity.User
}

type WSHandler struct {
	server *websocket.WebSocketServer
	store  Store
}

func NewWSHandler(server *websocket.WebSocketServer, store Store) *WSHandler {
	return &WSHandler{server, store}
}
func (h *WSHandler) HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	token := utils.ExtractTokenFromRequest(r)
	user := h.store.FindUserByToken(token)
	if user == nil {
		http.Error(w, "cannot find user", http.StatusUnauthorized)
		return
	}
	// Подключаем WebSocket с ID пользователя
	ws := h.server.HandleWebSocket(w, r, user.SessionID)
	user.Ws = ws
}
