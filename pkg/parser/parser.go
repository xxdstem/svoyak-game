package parser

import (
	"archive/zip"
	"encoding/xml"
	"errors"
	"io"
	"os"
	"path/filepath"
	"svoyak/internal/models"
)

func UnpackZipArchive(filename string) error {
	archivePath := "./temp/" + filename + ".siq"
	if archive, err := zip.OpenReader(archivePath); err == nil {
		defer archive.Close() // Перенесем defer в начало
		defer os.Remove(archivePath)
		basePath := "./temp/pkg/" + filename

		// Создаем корневую директорию
		if err := os.MkdirAll(basePath, 0755); err != nil {
			return err
		}

		for _, f := range archive.File {
			filePath := filepath.Join(basePath, f.Name)

			if f.FileInfo().IsDir() {
				// Создаем директорию
				if err := os.MkdirAll(filePath, 0755); err != nil {
					return err
				}
			} else {
				// Создаем родительские директории для файла
				if err := os.MkdirAll(filepath.Dir(filePath), 0755); err != nil {
					return err
				}

				// Открываем файл в архиве
				reader, err := f.Open()
				if err != nil {
					return err
				}
				defer reader.Close()

				// Создаем файл на диске
				dst, err := os.Create(filePath)
				if err != nil {
					return err
				}
				defer dst.Close()

				// Копируем содержимое
				if _, err := io.Copy(dst, reader); err != nil {
					return err
				}

				// Устанавливаем права файла
				if err := os.Chmod(filePath, f.Mode()); err != nil {
					return err
				}
			}
		}

		return nil
	} else {
		return err
	}
}

func ParseZipArchive(name string) ([]byte, error) {
	if archive, err := zip.OpenReader(name); err == nil {

		defer archive.Close()
		for _, f := range archive.File {
			if f.Name == "content.xml" {
				reader, err := f.Open()
				if err != nil {
					return nil, err
				}
				return io.ReadAll(reader)
			}
		}
	} else {
		return nil, err
	}
	return nil, errors.New("something wrong with package")
}

func ParseFromFile(filePath string) (*models.Package, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return nil, err
	}
	defer file.Close()
	bytes, err := io.ReadAll(file)
	if err != nil {
		return nil, err
	}
	return Parse(bytes)
}

func Parse(data []byte) (*models.Package, error) {
	var pkg models.Package

	err := xml.Unmarshal(data, &pkg)
	if err != nil {
		return nil, err
	}

	return &pkg, nil
}
