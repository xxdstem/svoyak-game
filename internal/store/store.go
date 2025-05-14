package store

type store struct {
	data map[int]any
}

func New() *store {
	return &store{data: make(map[int]any)}
}

func (s *store) Set(key int, value any) {
	s.data[key] = value
}

func (s *store) Get(key int) any {
	return s.data[key]
}
