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
	"github.com/rs/cors"
)

func Run(log *logger.Logger) {
	// Clean temp folder
	os.RemoveAll("./temp/")
	store := store.New()
	usecase := usecase.New(log, store)
	r := mux.NewRouter()
	apiRouter := api.New(log, usecase)
	rr := r.PathPrefix("/api").Subrouter()
	rr.Use(apihandler.New(log).Handle)
	apiRouter.Register(rr)

	// SPA handler
	spa := spaHandler.GetHandler("web/dist")
	r.PathPrefix("/").Handler(spa)

	// CORS
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"},
		AllowCredentials: true,
		AllowedMethods:   []string{"GET", "POST", "PUT", "OPTIONS", "HEAD"},
	})

	log.Info("Server started on :8080")
	log.Fatal(http.ListenAndServe(":8080", c.Handler(r)))

}
