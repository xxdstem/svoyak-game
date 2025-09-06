package utils

import (
	"fmt"
	"math/rand"
)

func RandomHexColor() string {
	color := rand.Intn(0xFFFFFF + 1) // от 0 до 16777215
	return fmt.Sprintf("#%06X", color)
}
