package logger

import (
	"time"

	"github.com/fatih/color"
)

type Logger struct {
	Mode uint8
}

type log struct {
	Time time.Time
	Mode uint8
	Body string
}

type header struct {
	Prefix string
	Color  *color.Color
}
