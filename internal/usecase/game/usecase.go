package game

import (
	"errors"
	"math/rand"
	"svoyak/internal/entity"
	"svoyak/internal/models"
	"svoyak/pkg/logger"
	"svoyak/pkg/parser"

	. "github.com/ahmetb/go-linq/v3"
)

const (
	role_host   = "host"
	role_player = "player"
	role_viewer = ""
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

// Функционал связанный с игрой, вопросы, раунды, очки

func (uc *uc) StartGame(room *entity.Room) error {
	room.IsPaused = false
	room.IsStarted = true
	var players []*entity.User
	From(room.Players).SelectT(func(kv KeyValue) *entity.User {
		return kv.Value.(*entity.User)
	}).WhereT(func(p *entity.User) bool {
		return p.RoomStats.Role == role_player
	}).ToSlice(&players)
	if len(players) == 0 {
		return errors.New("no players")
	}
	rndPlayer := players[rand.Intn(len(players))]
	rndPlayer.RoomStats.QuestionPicker = true
	return nil
}
