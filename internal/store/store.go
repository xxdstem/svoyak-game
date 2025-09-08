package store

import (
	"strings"
	"svoyak/internal/entity"
)

type store struct {
	data map[string]*entity.User
}

func New() *store {
	return &store{data: make(map[string]*entity.User)}
}

func (s *store) Set(key string, value *entity.User) {
	s.data[key] = value
}

func (s *store) Get(key string) (*entity.User, bool) {
	k, ok := s.data[key]
	return k, ok
}

func (s *store) Del(key string) {
	delete(s.data, key)
}

func (s *store) FindByName(name string) *entity.User {
	lowerName := strings.ToLower(name)
	for _, u := range s.data {
		if strings.ToLower(u.UserName) == lowerName {
			return u
		}
	}
	return nil
}

func (s *store) FindUserByToken(token string) *entity.User {
	for _, user := range s.data {
		if user.Token == token {
			return user
		}
	}
	return nil
}

func (s *store) FindUserByID(sessionID string) *entity.User {
	for _, user := range s.data {
		if user.SessionID == sessionID {
			return user
		}
	}
	return nil
}
