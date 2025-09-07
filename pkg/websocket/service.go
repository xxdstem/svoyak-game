package websocket

import (
	"errors"
)

type WebSocketService interface {
	SendToUser(userID string, message Message) error
	SendToRoom(roomID string, message Message) error
	Broadcast(message Message) error
	GetConnectedUsers() []string
}

func (s *WebSocketServer) SendToUser(SessionID string, message Message) error {
	s.clientsMu.RLock()
	defer s.clientsMu.RUnlock()

	for _, client := range s.clients {
		if client.SessionID == SessionID {
			select {
			case client.Send <- message:
				return nil
			default:
				return errors.New("something went wrong")
			}
		}
	}
	return errors.New("no client available")
}

func (s *WebSocketServer) Broadcast(message Message) error {
	s.broadcast <- message
	return nil
}

func (s *WebSocketServer) GetConnectedUsers() []string {
	s.clientsMu.RLock()
	defer s.clientsMu.RUnlock()

	users := make([]string, 0, len(s.clients))
	for _, client := range s.clients {
		users = append(users, client.SessionID)
	}
	return users
}
