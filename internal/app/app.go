package app

import (
	"net/http"
	router "svoyak/internal/controllers"
	"svoyak/internal/store"
	"svoyak/pkg/logger"
	"svoyak/pkg/parser"
	spaHandler "svoyak/pkg/spaHandler"

	"github.com/gorilla/mux"
)

func Run(log *logger.Logger) {
	store := store.New()
	file, err := parser.ParseZipArchive("pack.siq")
	if err != nil {
		log.Fatal(err)
	}
	pkg, err := parser.Parse(file)
	if err != nil {
		log.Fatal(err)
	}
	store.Set(0, pkg.Rounds[0])
	r := mux.NewRouter()
	apiRouter := r.PathPrefix("/api").Subrouter()
	router.RegisterApi(apiRouter, log, store)
	// SPA handler
	spa := spaHandler.GetHandler("web/dist")
	r.PathPrefix("/").Handler(spa)

	log.Info("Server started on :8080")
	log.Fatal(http.ListenAndServe(":8080", r))

}
