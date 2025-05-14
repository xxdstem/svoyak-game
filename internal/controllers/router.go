package router

import (
	api "svoyak/internal/controllers/http"
	"svoyak/pkg/logger"

	"github.com/gorilla/mux"
)

type Store interface {
	Get(key int) any
}

func RegisterApi(r *mux.Router, l *logger.Logger, store Store) {
	apiHandler := api.New(l, store)
	apiHandler.Register(r)
}
