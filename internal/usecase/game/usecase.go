package game

import (
	"svoyak/internal/entity"
	"svoyak/internal/models"
	"svoyak/pkg/logger"
	"svoyak/pkg/parser"
)

var log *logger.Logger

type Store interface {
	Get(index string) (*entity.User, bool)
	Set(index string, value *entity.User)
	Del(key string)
	FindByName(name string) *entity.User
}

type uc struct {
	store Store
}

func New(l *logger.Logger, store Store) *uc {
	log = l
	return &uc{store: store}
}

func (uc *uc) UnpackAndLoadPackage(filename string) (*models.Package, error) {
	uuid, err := parser.UnpackZipArchive(filename)
	if err != nil {
		return nil, err
	}

	pkg, err := parser.ParseFromFile("./temp/pkg/" + uuid + "/" + "content.xml")
	pkg.PackageID = uuid
	if err != nil {
		return nil, err
	}
	return pkg, nil
}
