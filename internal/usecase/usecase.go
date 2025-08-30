package usecase

import (
	"net/http"
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
}

type uc struct {
	store Store
}

func New(l *logger.Logger, store Store) *uc {
	log = l
	return &uc{store: store}
}

func (uc *uc) UnpackAndLoadPackage(user *entity.User) (*models.Package, error) {
	uuid, err := parser.UnpackZipArchive(user.SessionID)
	if err != nil {
		log.Error("error unpack")
		return nil, err
	}

	pkg, err := parser.ParseFromFile("./temp/pkg/" + uuid + "/" + "content.xml")
	pkg.PackageID = uuid
	if err != nil {
		return nil, err
	}
	user.CurrentPackage = pkg
	user.CurrentPackageId = pkg.PackageID
	return pkg, nil
}

func (uc *uc) GetUser(r *http.Request) *entity.User {
	sessionID := r.Context().Value("sessionID").(string)
	user, ok := uc.store.Get(sessionID)
	if !ok {
		return nil
	}
	return user
}

func (uc *uc) NewUser(sessionID string, name string) *entity.User {
	user := &entity.User{SessionID: sessionID, UserName: name}
	uc.store.Set(sessionID, user)
	return user
}

func (uc *uc) Logout(r *http.Request) error {
	sessionID := r.Context().Value("sessionID").(string)
	_, ok := uc.store.Get(sessionID)
	if !ok {
		return nil
	}
	uc.store.Del(sessionID)
	return nil
}

func (uc *uc) AbortGame(user *entity.User) error {
	user.CurrentPackage = nil
	user.CurrentPackageId = ""
	return nil
}
