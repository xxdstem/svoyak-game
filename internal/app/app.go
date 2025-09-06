package app

import (
	"net/http"
	"os"
	api "svoyak/internal/controllers/http"
	"svoyak/internal/store"
	"svoyak/internal/usecase/game"
	"svoyak/internal/usecase/room"
	"svoyak/internal/usecase/user"
	apihandler "svoyak/pkg/apiHandler"
	filehandler "svoyak/pkg/fileHandler"
	fileservice "svoyak/pkg/fileService"
	"svoyak/pkg/logger"
	spaHandler "svoyak/pkg/spaHandler"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

func Run(log *logger.Logger) {
	// Clean temp folder
	os.RemoveAll("./temp/")
	store := store.New()

	userUseCase := user.New(log, store)
	gameUseCase := game.New(log, store)
	roomUseCase := room.New(log, store, gameUseCase, fileservice.New())
	r := mux.NewRouter()
	apiRouter := api.New(log, userUseCase, roomUseCase, gameUseCase)
	rr := r.PathPrefix("/api").Subrouter()
	rr.Use(apihandler.New(log).Handle)
	apiRouter.Register(rr)
	rr.NotFoundHandler = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(`Route not found!`))
	})

	r.HandleFunc("/files/{packageID}/{fileType}/{file}", filehandler.Handle)
	r.PathPrefix("/").HandlerFunc(spaHandler.Handle)

	// CORS
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"},
		AllowCredentials: true,
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "OPTIONS", "HEAD"},
	})

	log.Info("Server started on :8080")
	log.Fatal(http.ListenAndServe(":8080", c.Handler(r)))

}
