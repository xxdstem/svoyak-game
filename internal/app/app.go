package app

import (
	"net/http"
	"os"
	api "svoyak/internal/controllers/http"
	"svoyak/internal/store"
	"svoyak/internal/usecase"
	apihandler "svoyak/pkg/apiHandler"
	"svoyak/pkg/logger"
	spaHandler "svoyak/pkg/spaHandler"

	"github.com/gorilla/mux"
)

func Run(log *logger.Logger) {
	// Clean temp folder
	os.RemoveAll("./temp/")
	store := store.New()
	usecase := usecase.New(log, store)
	r := mux.NewRouter()
	apiRouter := api.New(log, store, usecase)
	rr := r.PathPrefix("/api").Subrouter()
	rr.Use(apihandler.New(log).Handle)
	apiRouter.Register(rr)

	// SPA handler
	spa := spaHandler.GetHandler("web/dist")
	r.PathPrefix("/").Handler(spa)

	log.Info("Server started on :8080")
	log.Fatal(http.ListenAndServe(":8080", r))

}
