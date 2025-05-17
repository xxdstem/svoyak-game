package apihandler

import (
	"context"
	"net/http"
	"svoyak/pkg/logger"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
)

type apiHandler struct {
	r *mux.Router
}

var log *logger.Logger

var sessionStore = sessions.NewCookieStore([]byte("ILOVEPIZZAAA"))

func generateSessionID() string {
	return uuid.New().String()
}

func New(l *logger.Logger) *apiHandler {
	log = l
	sessionStore.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   86400 * 30, // 30 дней
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	}
	return &apiHandler{}
}

func (h *apiHandler) Handle(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		session, err := sessionStore.Get(r, "session")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		if session.IsNew {
			session.ID = generateSessionID()
			session.Values["ID"] = session.ID

		} else {
			session.ID = session.Values["ID"].(string)
		}
		err = session.Save(r, w)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		ctx := context.WithValue(r.Context(), "sessionID", session.ID)

		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
