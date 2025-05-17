package usecase

import (
	"svoyak/internal/models"
	"svoyak/pkg/logger"
	"svoyak/pkg/parser"
)

var log *logger.Logger

type Store interface {
	Get(index string) any
	Set(index string, value any)
}

type uc struct {
	store Store
}

func New(l *logger.Logger, store Store) *uc {
	log = l
	return &uc{store: store}
}

func (uc *uc) UnpackAndLoadPackage(filename string) *models.Package {
	err := parser.UnpackZipArchive(filename)
	if err != nil {
		log.Error("error unpack")
		log.Fatal(err)
	}

	pkg, err := parser.ParseFromFile("./temp/pkg/" + filename + "/" + "content.xml")
	if err != nil {
		log.Fatal(err)
	}
	uc.store.Set(filename, pkg)
	return pkg
}
