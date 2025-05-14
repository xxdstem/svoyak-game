package http

import (
	"encoding/json"
	"net/http"
	"svoyak/pkg/logger"

	"github.com/gorilla/mux"
)

type Store interface {
	Get(key int) any
}

type Handler interface {
	Register(router *mux.Router)
}

type handler struct {
	store Store
}

var log *logger.Logger

func New(l *logger.Logger, store Store) Handler {
	log = l
	return &handler{store: store}
}

func (h *handler) Register(router *mux.Router) {
	router.HandleFunc("/", h.Get).Methods("GET")
}

func (h *handler) Get(w http.ResponseWriter, r *http.Request) {
	log.Info("req")
	w.Header().Set("Content-Type", "application/json")
	pkg := h.store.Get(0)
	json, err := json.Marshal(pkg)
	if err == nil {
		w.Write(json)
	}
}
