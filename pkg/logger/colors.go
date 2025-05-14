package logger

import "github.com/fatih/color"

var (
	blackOnWhite        = color.New(color.FgBlack).Add(color.BgWhite).Add(color.Bold)
	whiteOnGreen        = color.New(color.FgWhite).Add(color.BgHiGreen).Add(color.Bold)
	whiteOnBrightGreen  = color.New(color.FgWhite).Add(color.BgHiGreen).Add(color.Bold)
	blueOnWhite         = color.New(color.FgBlue).Add(color.BgWhite).Add(color.Bold)
	whiteOnRed          = color.New(color.FgWhite).Add(color.BgRed).Add(color.Bold)
	whiteOnBlue         = color.New(color.FgWhite).Add(color.BgBlue).Add(color.Bold)
	whiteOnYellow       = color.New(color.FgWhite).Add(color.BgYellow).Add(color.Bold)
	whiteOnBrightYellow = color.New(color.FgWhite).Add(color.BgYellow).Add(color.Bold)
	whiteOnBrightRed    = color.New(color.FgWhite).Add(color.BgHiRed).Add(color.Bold)
	whiteOnBrightBlue   = color.New(color.FgWhite).Add(color.BgHiBlue).Add(color.Bold)
	redOnWhite          = color.New(color.FgRed).Add(color.BgWhite).Add(color.Bold)
	whiteOnMagenta      = color.New(color.FgWhite).Add(color.BgMagenta).Add(color.Bold)
	grey                = color.New(color.FgHiBlack)
)
