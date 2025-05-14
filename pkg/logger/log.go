package logger

import (
	"fmt"
	"os"
	"time"
)

var latest = make(chan log)

func Init() {
	go func() {
		for {
			c := <-latest

			var h header

			switch c.Mode {
			case MODE_INFO:
				{
					h.Color = blackOnWhite
					h.Prefix = "INFO"
				}
			case MODE_ERR:
				{
					h.Color = whiteOnBrightRed
					h.Prefix = "ERR*"
				}
			case MODE_WARN:
				{
					h.Color = whiteOnYellow
					h.Prefix = "WARN"
				}
			case MODE_DONE:
				{
					h.Color = whiteOnGreen
					h.Prefix = "DONE"
				}
			case MODE_FATAL:
				h.Color = redOnWhite
				h.Prefix = "FATAL"
			}

			printLog(c.Time, h, c.Body)
			if h.Prefix == "FATAL" {
				os.Exit(-1)
			}
		}
	}()
}

func New(opts ...interface{}) *Logger {
	var L Logger

	for _, o := range opts {
		if o == NOCOLOR {
			L.Mode = 1
		}
	}

	return &L
}

func printLog(T time.Time, h header, body string) {
	t := T.Format(timeLayout)

	h.Color.Printf(" ")
	grey.Printf(" [%s] ", t)

	// h.Color.Printf(" [%s] ", h.Prefix)
	fmt.Printf("[%s] %s\n", h.Prefix, body)

	// fmt.Printf(" %s\n", fmt.Sprint(args...))

}

func (l *Logger) Info(args ...interface{}) {
	latest <- log{
		Time: time.Now(),
		Mode: MODE_INFO,
		Body: fmt.Sprint(args...),
	}
}

func (l *Logger) Done(args ...interface{}) {
	latest <- log{
		Time: time.Now(),
		Mode: MODE_DONE,
		Body: fmt.Sprint(args...),
	}
}

func (l *Logger) Warn(args ...interface{}) {
	latest <- log{
		Time: time.Now(),
		Mode: MODE_WARN,
		Body: fmt.Sprint(args...),
	}
}

func (l *Logger) Error(args ...interface{}) {
	latest <- log{
		Time: time.Now(),
		Mode: MODE_ERR,
		Body: fmt.Sprint(args...),
	}
}

func (l *Logger) Fatal(args ...interface{}) {
	latest <- log{
		Time: time.Now(),
		Mode: MODE_FATAL,
		Body: fmt.Sprint(args...),
	}
}
