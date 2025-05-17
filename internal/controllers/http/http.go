package http

import (
	"encoding/json"
	"io"
	"net/http"
	"os"
	"strconv"
	"svoyak/internal/entity"
	"svoyak/internal/models"
	"svoyak/pkg/logger"

	"github.com/gorilla/mux"
)

type Handler interface {
	Register(router *mux.Router)
}

type UseCase interface {
	NewUser(sessionID string, name string) *entity.User
	GetUser(r *http.Request) *entity.User
	UnpackAndLoadPackage(user *entity.User) *models.Package
}

type handler struct {
	uc UseCase
}

var log *logger.Logger

func New(l *logger.Logger, uc UseCase) Handler {
	log = l
	return &handler{uc: uc}
}

func (h *handler) Register(router *mux.Router) {
	router.HandleFunc("/identify", h.GetIdentify).Methods("GET")
	router.HandleFunc("/identify", h.SetIdentify).Methods("PUT")
	router.HandleFunc("/package/upload", h.Upload).Methods("POST")
	router.HandleFunc("/round/{round}", h.Get)
}

func (h *handler) GetIdentify(w http.ResponseWriter, r *http.Request) {
	user := h.uc.GetUser(r)
	log.Info("WRONG!`")
	if user != nil {
		j, _ := json.Marshal(user)
		w.Write(j)
		return
	}
	http.Error(w, "No identity", http.StatusNoContent)

}

func (h *handler) SetIdentify(w http.ResponseWriter, r *http.Request) {
	log.Info("req...", r.FormValue("name"))
	sessionID := r.Context().Value("sessionID").(string)
	user := h.uc.NewUser(sessionID, r.FormValue("name"))
	j, _ := json.Marshal(user)
	w.Write(j)
}

func (h *handler) Get(w http.ResponseWriter, r *http.Request) {
	user := h.uc.GetUser(r)
	if user == nil {
		http.Error(w, "Non authorized", http.StatusUnauthorized)
		return
	}
	round := mux.Vars(r)["round"]
	i, _ := strconv.Atoi(round)

	if user.CurrentPackage == nil {
		http.Error(w, "Game cannot be found", http.StatusNotFound)
		return
	}
	json, err := json.Marshal(user.CurrentPackage.Rounds[i])
	if err == nil {
		w.Write(json)
	}

}

func (h *handler) Upload(w http.ResponseWriter, r *http.Request) {
	user := h.uc.GetUser(r)
	r.ParseMultipartForm(1000 << 20) // 1 GB
	// Получаем файл из формы
	file, _, err := r.FormFile("package") // "myFile" - имя поля в форме
	if err != nil {
		http.Error(w, "Error retrieving the file", http.StatusBadRequest)
		return
	}
	defer file.Close()
	// Создаем новый файл на сервере
	err = os.MkdirAll("./temp/pkg/"+user.SessionID, os.ModePerm|os.ModeSticky)
	if err != nil {
		log.Error(err)
	}
	dst, err := os.Create("./temp/" + user.SessionID + ".siq")
	if err != nil {
		http.Error(w, "Error creating file", http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	// Копируем содержимое загруженного файла
	if _, err := io.Copy(dst, file); err != nil {
		http.Error(w, "Error saving file", http.StatusInternalServerError)
		return
	}
	h.uc.UnpackAndLoadPackage(user)
	j, _ := json.Marshal(entity.IdentifyResponse{SessionID: user.SessionID})
	w.Write(j)
}
