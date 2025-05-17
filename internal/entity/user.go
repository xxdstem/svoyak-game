package entity

import "svoyak/internal/models"

type User struct {
	SessionID        string
	CurrentPackage   *models.Package `json:"-"`
	CurrentPackageId string
	UserName         string
}
