package http

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"svoyak/internal/entity"
	"svoyak/internal/entity/dto"
	"svoyak/pkg/logger"

	"github.com/gorilla/mux"
)

type Handler interface {
	Register(router *mux.Router)
}

type UserUseCase interface {
	NewUser(sessionID string, name string) (*entity.User, error)
	JoinRoom(user *entity.User, roomID string) error
	GetUser(r *http.Request) *entity.User
	Logout(r *http.Request) error
}

type RoomUseCase interface {
	CreateGame(user *entity.User, req *dto.CreateGameRequest) (*entity.Room, error)
	LeaveRoom(user *entity.User) error
	ListAvailableRooms() []*entity.Room
	GetRoom(roomID string) (*entity.Room, error)
	AbortRoom(room *entity.Room) error
	JoinAsPlayer(user *entity.User, slotId int) error
}

type GameUseCase interface {
	StartGame(room *entity.Room) error
}

type handler struct {
	uuc UserUseCase
	ruc RoomUseCase
	guc GameUseCase
}

var log *logger.Logger

func New(l *logger.Logger, uuc UserUseCase, ruc RoomUseCase, guc GameUseCase) Handler {
	log = l
	return &handler{uuc, ruc, guc}
}

func (h *handler) Register(router *mux.Router) {
	router.HandleFunc("/identify", h.GetIdentify).Methods("GET")
	router.HandleFunc("/identify", h.SetIdentify).Methods("PUT")
	router.HandleFunc("/logout", h.Logout).Methods("POST")
	router.HandleFunc("/rooms/list", h.ListRooms)
	router.HandleFunc("/rooms/join", h.JoinRoom).Methods("POST")
	router.HandleFunc("/rooms/get", h.GetCurrentRoom)
	router.HandleFunc("/game/create", h.CreateGame).Methods("POST")
	router.HandleFunc("/game/gamedata", h.GameData)
	router.HandleFunc("/game/abort", h.AbortGame)
	router.HandleFunc("/game/join", h.JoinAsPlayer).Methods("PATCH")
	router.HandleFunc("/room/start", h.StartGame).Methods("PATCH")
}

func (h *handler) GetIdentify(w http.ResponseWriter, r *http.Request) {
	user := h.uuc.GetUser(r)
	if user != nil {
		j, _ := json.Marshal(dto.UserIdentifyResponse(user))
		w.Write(j)
		return
	}
	http.Error(w, "No identity", http.StatusUnauthorized)

}

func (h *handler) SetIdentify(w http.ResponseWriter, r *http.Request) {

	sessionID := r.Context().Value("sessionID").(string)
	user, err := h.uuc.NewUser(sessionID, r.FormValue("name"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	j, _ := json.Marshal(dto.UserIdentifyResponse(user))
	w.Write(j)
}

func (h *handler) Logout(w http.ResponseWriter, r *http.Request) {
	user := h.uuc.GetUser(r)
	if user.Room != nil {
		h.ruc.LeaveRoom(user)
	}
	h.uuc.Logout(r)
	w.WriteHeader(http.StatusNoContent)
}

func (h *handler) ListRooms(w http.ResponseWriter, r *http.Request) {
	user := h.uuc.GetUser(r)
	if user == nil {
		http.Error(w, "Non authorized", http.StatusUnauthorized)
		return
	}
	rooms := h.ruc.ListAvailableRooms()

	jsonData, err := json.Marshal(dto.ListRoomsToDto(rooms))
	if err == nil {
		w.Write(jsonData)
	} else {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func (h *handler) GetCurrentRoom(w http.ResponseWriter, r *http.Request) {
	user := h.uuc.GetUser(r)
	if user == nil {
		http.Error(w, "Non authorized", http.StatusUnauthorized)
		return
	}

	if user.Room == nil {
		http.Error(w, "Game cannot be found", http.StatusNotFound)
		return
	}
	json, err := json.Marshal(dto.RoomDetailedResponse(user.Room))
	if err == nil {
		w.Write(json)
	}
}

func (h *handler) GameData(w http.ResponseWriter, r *http.Request) {
	user := h.uuc.GetUser(r)
	if user == nil {
		http.Error(w, "Non authorized", http.StatusUnauthorized)
		return
	}

	if user.Room == nil {
		http.Error(w, "Game cannot be found", http.StatusNotFound)
		return
	}
	json, err := json.Marshal(user.Room.Package)
	if err == nil {
		w.Write(json)
	}
}

func (h *handler) JoinRoom(w http.ResponseWriter, r *http.Request) {
	// This is join as MEMBER (can be a viewer too)
	user := h.uuc.GetUser(r)
	if user == nil {
		http.Error(w, "Non authorized", http.StatusUnauthorized)
		return
	}
	if user.Room != nil {
		http.Error(w, "Room already taken", http.StatusBadRequest)
		return
	}
	user.Mutex.Lock()
	defer user.Mutex.Unlock()
	id := r.FormValue("room_id")
	password := r.FormValue("password")
	room, err := h.ruc.GetRoom(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if room.Password != "" && room.Password != password {
		http.Error(w, "Wrong password!", http.StatusUnauthorized)
		return
	}
	h.uuc.JoinRoom(user, id)
	j, _ := json.Marshal(dto.RoomCreationResponse(room))
	w.Write(j)
}

func (h *handler) CreateGame(w http.ResponseWriter, r *http.Request) {
	user := h.uuc.GetUser(r)
	if user == nil {
		http.Error(w, "Non authorized", http.StatusUnauthorized)
		return
	}
	if user.Room != nil {
		http.Error(w, "Room already taken", http.StatusBadRequest)
		return
	}
	user.Mutex.Lock()
	defer user.Mutex.Unlock()
	if err := r.ParseMultipartForm(1000 << 20); err != nil {
		http.Error(w, "Failed to parse form", http.StatusBadRequest)
		return
	}
	file, _, err := r.FormFile("package")
	if err != nil {
		http.Error(w, "Error retrieving the file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	req := &dto.CreateGameRequest{
		Name:     r.FormValue("name"),
		Password: r.FormValue("password"),
		File:     file,
	}

	room, err := h.ruc.CreateGame(user, req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if err := h.uuc.JoinRoom(user, room.ID); err != nil {
		http.Error(w, fmt.Sprintf("failed to join room: %w", err), http.StatusBadRequest)
		return
	}
	j, _ := json.Marshal(dto.RoomCreationResponse(room))
	w.Write(j)
}

func (h *handler) JoinAsPlayer(w http.ResponseWriter, r *http.Request) {
	user := h.uuc.GetUser(r)
	if user == nil {
		http.Error(w, "Non authorized", http.StatusUnauthorized)
		return
	}
	slotId, _ := strconv.Atoi(r.FormValue("slotId"))
	err := h.ruc.JoinAsPlayer(user, slotId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	j, _ := json.Marshal(dto.RoomDetailedResponse(user.Room))
	w.Write(j)
}

func (h *handler) AbortGame(w http.ResponseWriter, r *http.Request) {
	user := h.uuc.GetUser(r)
	h.ruc.LeaveRoom(user)
	w.WriteHeader(http.StatusNoContent)
}

func (h *handler) StartGame(w http.ResponseWriter, r *http.Request) {
	user := h.uuc.GetUser(r)
	h.guc.StartGame(user.Room)
	j, _ := json.Marshal(dto.RoomDetailedResponse(user.Room))
	w.Write(j)
}
