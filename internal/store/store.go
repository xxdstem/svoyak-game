package store

type store struct {
	data map[string]any
}

func New() *store {
	return &store{data: make(map[string]any)}
}

func (s *store) Set(key string, value any) {
	s.data[key] = value
}

func (s *store) Get(key string) any {
	return s.data[key]
}
