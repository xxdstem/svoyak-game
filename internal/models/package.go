package models

type Package struct {
	PackageID  string
	Name       string   `xml:"name,attr"`
	Version    int      `xml:"version,attr"`
	ID         string   `xml:"id,attr"`
	Date       string   `xml:"date,attr"`
	Publisher  string   `xml:"publisher,attr,omitempty"`
	ContactUri string   `xml:"contactUri,attr,omitempty"`
	Difficulty int      `xml:"difficulty,attr"`
	Logo       string   `xml:"logo,attr,omitempty"`
	Tags       []string `xml:"tags>tag"`
	Info       Info     `xml:"info,omitempty"`
	Global     Global   `xml:"global,omitempty"`
	Rounds     []Round  `xml:"rounds>round"`
}

func (p *Package) GetMediaQuestions(mediaType string) []Question {
	var mediaQuestions []Question

	for _, round := range p.Rounds {
		for _, theme := range round.Themes {
			for _, question := range theme.Questions {
				if hasMediaType(question, mediaType) {
					mediaQuestions = append(mediaQuestions, question)
				}
			}
		}
	}

	return mediaQuestions
}

func hasMediaType(question Question, mediaType string) bool {
	for _, param := range question.Params {
		for _, item := range param.Items {
			if item.Type == mediaType {
				return true
			}
		}
	}
	return false
}

// CountQuestions возвращает общее количество вопросов в пакете
func (p *Package) CountQuestions() int {
	count := 0

	for _, round := range p.Rounds {
		for _, theme := range round.Themes {
			count += len(theme.Questions)
		}
	}

	return count
}

// GetAuthors возвращает список всех авторов пакета
func (p *Package) GetAuthors() []Author {
	if len(p.Global.Authors) > 0 {
		return p.Global.Authors
	}
	return p.Info.Authors
}
