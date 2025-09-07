package utils

import (
	"fmt"
	"math/rand"
	"net/http"
	"strings"
)

func RandomHexColor() string {
	color := rand.Intn(0xFFFFFF + 1) // от 0 до 16777215
	return fmt.Sprintf("#%06X", color)
}

const (
	AuthorizationHeader = "Authorization"
	BearerPrefix        = "Bearer "
)

func ExtractTokenFromRequest(r *http.Request) string {
	authHeader := r.Header.Get(AuthorizationHeader)
	if authHeader == "" {
		return r.URL.Query().Get("token")
	}

	if strings.HasPrefix(authHeader, BearerPrefix) {
		return strings.TrimPrefix(authHeader, BearerPrefix)
	}

	return authHeader
}
