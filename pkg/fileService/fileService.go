package fileservice

import (
	"errors"
	"io"
	"mime/multipart"
	"os"

	"github.com/google/uuid"
)

type service struct{}

func New() *service {
	return &service{}
}

func (*service) SaveTempFile(file multipart.File) (string, error) {
	uuid := uuid.New().String()
	err := os.MkdirAll("./temp", os.ModePerm|os.ModeSticky)
	if err != nil {
		return "", err
	}
	filePath := "./temp/" + uuid + ".siq"
	dst, err := os.Create(filePath)
	if err != nil {
		return "", err
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		return "", errors.New("error saving file")
	}
	return filePath, nil
}
