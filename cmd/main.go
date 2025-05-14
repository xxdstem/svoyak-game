package main

import (
	"svoyak/internal/app"
	"svoyak/pkg/logger"
)

func main() {
	logger.Init()
	log := logger.New()
	app.Run(log)
}
