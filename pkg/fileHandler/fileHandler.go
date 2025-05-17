package filehandler

import (
	"net/http"
	"net/url"
	"path/filepath"

	"github.com/gorilla/mux"
)

func Handle(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	packageID := vars["packageID"]
	fileType := vars["fileType"]
	file := vars["file"]

	filePath := filepath.Join("temp", "pkg", packageID, fileType, url.PathEscape(file))
	http.ServeFile(w, r, filePath)
}
