package models

type Question struct {
	Price      int     `xml:"price,attr"`
	Type       string  `xml:"type,attr,omitempty"`
	IsAnswered bool    `xml:"omitempty"`
	Params     []Param `xml:"params>param"`
	Right      Answer  `xml:"right"`
}

type Answer struct {
	Answers []string `xml:"answer"`
}

// GetQuestionMedia возвращает медиа-файлы вопроса
func (q *Question) GetQuestionMedia() []Item {
	var media []Item
	for _, param := range q.Params {
		if param.Name == "question" {
			for _, item := range param.Items {
				if item.Type == "audio" || item.Type == "image" || item.Type == "video" {
					media = append(media, item)
				}
			}
		}
	}
	return media
}

// GetAnswerMedia возвращает медиа-файлы ответа
func (q *Question) GetAnswerMedia() []Item {
	var media []Item
	for _, param := range q.Params {
		if param.Name == "answer" {
			for _, item := range param.Items {
				if item.Type == "audio" || item.Type == "image" || item.Type == "video" {
					media = append(media, item)
				}
			}
		}
	}
	return media
}
