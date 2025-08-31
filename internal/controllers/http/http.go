package http

import (
	"encoding/json"
	"io"
	"net/http"
	"os"
	"svoyak/internal/entity"
	"svoyak/internal/entity/dto"
	"svoyak/internal/models"
	"svoyak/pkg/logger"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type Handler interface {
	Register(router *mux.Router)
}

type UserUseCase interface {
	NewUser(sessionID string, name string) (*entity.User, error)
	GetUser(r *http.Request) *entity.User
	Logout(r *http.Request) error
}

type RoomUseCase interface {
	CreateRoom(name string, password string) (*entity.Room, error)
	LeaveRoom(user *entity.User) error
	JoinRoom(user *entity.User, roomID string) error
	UnpackAndLoadPackage(filename string) (*models.Package, error)
	ListRooms() []*entity.Room
	AbortRoom(room *entity.Room) error
}

type GameUseCase interface {
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
	router.HandleFunc("/rooms/get", h.GetRoom)
	router.HandleFunc("/game/create", h.CreateGame).Methods("POST")
	router.HandleFunc("/game/gamedata", h.GameData)
	router.HandleFunc("/game/abort", h.AbortGame)
}

func (h *handler) GetIdentify(w http.ResponseWriter, r *http.Request) {
	user := h.uuc.GetUser(r)
	if user != nil {
		j, _ := json.Marshal(dto.UserResponse(user))
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
	j, _ := json.Marshal(dto.UserResponse(user))
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
	rooms := h.ruc.ListRooms()

	jsonData, err := json.Marshal(dto.ListRoomsToDto(rooms))
	if err == nil {
		w.Write(jsonData)
	} else {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func (h *handler) GetRoom(w http.ResponseWriter, r *http.Request) {
	user := h.uuc.GetUser(r)
	if user == nil {
		http.Error(w, "Non authorized", http.StatusUnauthorized)
		return
	}

	if user.Room == nil {
		http.Error(w, "Game cannot be found", http.StatusNotFound)
		return
	}
	json, err := json.Marshal(dto.RoomResponse(user.Room))
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
	name := r.FormValue("name")
	password := r.FormValue("password")
	r.ParseMultipartForm(1000 << 20)
	file, _, err := r.FormFile("package")
	if err != nil {
		http.Error(w, "Error retrieving the file", http.StatusBadRequest)
		return
	}
	defer file.Close()
	uuid := uuid.New().String()
	err = os.MkdirAll("./temp/pkg/"+uuid, os.ModePerm|os.ModeSticky)
	if err != nil {
		log.Error(err)
	}
	dst, err := os.Create("./temp/" + uuid + ".siq")
	if err != nil {
		http.Error(w, "Error creating file", http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		http.Error(w, "Error saving file", http.StatusInternalServerError)
		return
	}
	pkg, err := h.ruc.UnpackAndLoadPackage(uuid)
	if err != nil {
		log.Error(err)
		return
	}
	room, err := h.ruc.CreateRoom(name, password)
	if err != nil {
		log.Error(err)
		return
	}
	room.Package = *pkg
	h.ruc.JoinRoom(user, room.ID)
	user.Room = room
	j, _ := json.Marshal(dto.RoomCreationResponse(room))
	w.Write(j)
}

func (h *handler) AbortGame(w http.ResponseWriter, r *http.Request) {
	user := h.uuc.GetUser(r)
	h.ruc.LeaveRoom(user)
	w.WriteHeader(http.StatusNoContent)
}
