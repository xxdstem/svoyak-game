package websocket

import (
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

type WebSocketServer struct {
	upgrader        websocket.Upgrader
	clients         map[string]*Client
	clientsMu       sync.RWMutex
	broadcast       chan Message
	register        chan *Client
	unregister      chan *Client
	messageHandlers map[string]MessageHandler
}

type Client struct {
	ID           string
	SessionID    string
	Conn         *websocket.Conn
	Send         chan Message
	onDisconnect func()
}

type Message struct {
	Type    string `json:"type"`
	Payload any    `json:"payload"`
}

type MessageHandler func(client *Client, message Message)

func NewWebSocketServer() *WebSocketServer {
	return &WebSocketServer{
		upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true // В продакшене нужно настроить properly
			},
		},
		clients:         make(map[string]*Client),
		broadcast:       make(chan Message),
		register:        make(chan *Client),
		unregister:      make(chan *Client),
		messageHandlers: make(map[string]MessageHandler),
	}
}

func (s *WebSocketServer) HandleWebSocket(w http.ResponseWriter, r *http.Request, SessionID string, onDisconnect func()) *Client {
	conn, err := s.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return nil
	}

	client := &Client{
		ID:           generateClientID(),
		SessionID:    SessionID,
		Conn:         conn,
		Send:         make(chan Message, 256),
		onDisconnect: onDisconnect,
	}

	s.register <- client
	go client.writePump()
	go client.readPump(s)
	return client
}

func (s *WebSocketServer) RegisterHandler(messageType string, handler MessageHandler) {
	s.messageHandlers[messageType] = handler
}

func (s *WebSocketServer) Run() {
	for {
		select {
		case client := <-s.register:
			s.clientsMu.Lock()
			s.clients[client.ID] = client
			s.clientsMu.Unlock()
			log.Printf("Client connected: %s (User: %s)", client.ID, client.SessionID)

		case client := <-s.unregister:
			s.clientsMu.Lock()
			if _, ok := s.clients[client.ID]; ok {
				client.onDisconnect()
				delete(s.clients, client.ID)
				close(client.Send)
			}
			s.clientsMu.Unlock()
			log.Printf("Client disconnected: %s", client.ID)

		case message := <-s.broadcast:
			s.broadcastMessage(message)
		}
	}
}

func (s *WebSocketServer) broadcastMessage(message Message) {
	s.clientsMu.RLock()
	defer s.clientsMu.RUnlock()

	for _, client := range s.clients {
		select {
		case client.Send <- message:
		default:
			close(client.Send)
			delete(s.clients, client.ID)
		}
	}
}
