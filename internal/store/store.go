package store

import "svoyak/internal/entity"

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
