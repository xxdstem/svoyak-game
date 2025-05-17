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

type Store interface {
	Get(key string) any
}

type Handler interface {
	Register(router *mux.Router)
}

type UseCase interface {
	UnpackAndLoadPackage(filename string) *models.Package
}

type handler struct {
	store Store
	uc    UseCase
}

var log *logger.Logger

func New(l *logger.Logger, store Store, uc UseCase) Handler {
	log = l
	return &handler{store: store, uc: uc}
}

func (h *handler) Register(router *mux.Router) {
	router.HandleFunc("/identify", h.Identify)
	router.HandleFunc("/package/upload", h.Upload).Methods("POST")
	router.HandleFunc("/round/{round}", h.Get)
}

func (h *handler) Identify(w http.ResponseWriter, r *http.Request) {
	sessionID := r.Context().Value("sessionID").(string)
	j, _ := json.Marshal(entity.IdentifyResponse{SessionID: sessionID})
	w.Write(j)
}

func (h *handler) Get(w http.ResponseWriter, r *http.Request) {
	sessionID := r.Context().Value("sessionID").(string)
	round := mux.Vars(r)["round"]
	i, _ := strconv.Atoi(round)
	log.Info("getting package for", sessionID)
	pkg := h.store.Get(sessionID)
	if pkg == nil {
		http.Error(w, "Game cannot be found", http.StatusNotFound)
		return
	}
	json, err := json.Marshal(pkg.(*models.Package).Rounds[i])
	if err == nil {
		w.Write(json)
	}

}

func (h *handler) Upload(w http.ResponseWriter, r *http.Request) {
	sessionID := r.Context().Value("sessionID").(string)
	r.ParseMultipartForm(1000 << 20) // 1 GB
	log.Info(sessionID)
	// Получаем файл из формы
	file, _, err := r.FormFile("package") // "myFile" - имя поля в форме
	if err != nil {
		http.Error(w, "Error retrieving the file", http.StatusBadRequest)
		return
	}
	defer file.Close()
	// Создаем новый файл на сервере
	err = os.MkdirAll("./temp/pkg/"+sessionID, os.ModePerm|os.ModeSticky)
	if err != nil {
		log.Error(err)
	}
	dst, err := os.Create("./temp/" + sessionID + ".siq")
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
	h.uc.UnpackAndLoadPackage(sessionID)
	j, _ := json.Marshal(entity.IdentifyResponse{SessionID: sessionID})
	w.Write(j)
}
