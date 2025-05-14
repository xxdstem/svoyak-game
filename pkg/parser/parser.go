package parser

import (
	"archive/zip"
	"encoding/xml"
	"errors"
	"io"
	"os"
	"svoyak/internal/models"
)

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
