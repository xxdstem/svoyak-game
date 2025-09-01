package filehandler

import (
	"errors"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/gorilla/mux"
)

func safeJoin(baseDir, packageID, fileType, filename string) (string, error) {
	// Проверяем на path traversal
	if strings.Contains(filename, "..") || strings.Contains(filename, "/") {
		return "", errors.New("invalid file name")
	}

	// Берем только базовое имя файла (убираем пути)
	cleanedName := filepath.Base(filename)
	cleanedName = strings.ReplaceAll(cleanedName, " ", "%20")
	if cleanedName == "." || cleanedName == "/" {
		return "", errors.New("invalid file name")
	}

	// Собираем путь БЕЗ декодирования - оставляем %20 как есть
	filePath := filepath.Join(baseDir, "pkg", packageID, fileType, cleanedName)

	// Проверяем что путь остается в ожидаемой директории
	expectedPrefix := filepath.Join(baseDir, "pkg", packageID)
	if !strings.HasPrefix(filepath.Clean(filePath), filepath.Clean(expectedPrefix)) {
		return "", errors.New("access denied")
	}

	return filePath, nil
}

func Handle(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	packageID := vars["packageID"]
	fileType := vars["fileType"]
	file := vars["file"]
	filePath, err := safeJoin("temp", packageID, fileType, file)
	if err != nil {
		http.Error(w, "Invalid file name", http.StatusBadRequest)
		return
	}

	// Дополнительная проверка что файл существует внутри ожидаемой директории
	if !strings.HasPrefix(filepath.Clean(filePath), filepath.Clean("temp/pkg/"+packageID)) {
		http.Error(w, "Access denied", http.StatusForbidden)
		return
	}
	http.ServeFile(w, r, filePath)
}
