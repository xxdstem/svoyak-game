package models

type Info struct {
	Authors []Author `xml:"authors>author,omitempty"`
}

type Global struct {
	Authors []Author `xml:"Authors>Author,omitempty"`
}

type Author struct {
	ID         string `xml:"id,attr,omitempty"`
	Name       string `xml:"Name,omitempty"`
	SecondName string `xml:"SecondName,omitempty"`
	Surname    string `xml:"Surname,omitempty"`
	Country    string `xml:"Country,omitempty"`
	City       string `xml:"City,omitempty"`
}

type Round struct {
	Name   string  `xml:"name,attr"`
	Type   string  `xml:"type,attr,omitempty"`
	Themes []Theme `xml:"themes>theme"`
}

type Theme struct {
	Name      string     `xml:"name,attr"`
	Info      ThemeInfo  `xml:"info,omitempty"`
	Questions []Question `xml:"questions>question"`
}

type ThemeInfo struct {
	Comments string   `xml:"comments,omitempty"`
	Sources  []Source `xml:"sources>source,omitempty"`
}

type Source struct {
	// Может содержать дополнительные поля при необходимости
}

type Param struct {
	Name          string         `xml:"name,attr"`
	Type          string         `xml:"type,attr,omitempty"`
	SelectionMode string         `xml:"selectionMode,omitempty"`
	AnswerType    string         `xml:"answerType,omitempty"`
	Items         []Item         `xml:"item"`
	AnswerOptions *AnswerOptions `xml:"answerOptions,omitempty"`
	Price         *NumberSet     `xml:"price,omitempty"`
}

type Item struct {
	Type          string `xml:"type,attr,omitempty"`
	IsRef         bool   `xml:"isRef,attr,omitempty"`
	Placement     string `xml:"placement,attr,omitempty"`
	WaitForFinish bool   `xml:"waitForFinish,attr,omitempty"`
	Duration      string `xml:"duration,attr,omitempty"`
	Content       string `xml:",chardata"`
}

type AnswerOptions struct {
	Options []Option `xml:",any"`
}

type Option struct {
	Name  string `xml:"name,attr"`
	Value string `xml:",chardata"`
}

type NumberSet struct {
	Minimum int `xml:"minimum,attr"`
	Maximum int `xml:"maximum,attr"`
	Step    int `xml:"step,attr"`
}
