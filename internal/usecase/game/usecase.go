package game

import (
	"errors"
	"math/rand"
	"svoyak/internal/entity"
	"svoyak/internal/entity/dto"
	"svoyak/internal/models"
	"svoyak/pkg/logger"
	"svoyak/pkg/parser"
	"svoyak/pkg/websocket"

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
	room.Broadcast(websocket.Message{
		Type:    "updated_room",
		Payload: dto.RoomDetailedResponse(room),
	})
	return nil
}

func (uc *uc) SelectQustion(room *entity.Room, themeIdx int, questionIdx int) {
	currentRound := room.Package.Rounds[room.CurrentRound]
	currentRound.Themes[themeIdx].Questions[questionIdx].IsAnswered = true
	isLatestQuestion := true
	for _, theme := range currentRound.Themes {
		for _, question := range theme.Questions {
			if !question.IsAnswered {
				isLatestQuestion = false
				break
			}
		}
		if !isLatestQuestion {
			break
		}
	}
	if isLatestQuestion && room.CurrentRound < len(room.Package.Rounds)-1 {
		room.CurrentRound += 1
	}
}

func (uc *uc) ChangePlayerScore(player *entity.User, score int) {
	player.RoomStats.Points += score
	room := player.Room
	room.Broadcast(websocket.Message{
		Type:    "updated_room",
		Payload: dto.RoomDetailedResponse(room),
	})
}
