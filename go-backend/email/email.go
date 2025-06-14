package email

import (
	baovault "mentipedia/go-backend/security/vault"
)

type EmailService struct {
	vault *baovault.BaoVault
}

func MakeEmailService(vault *baovault.BaoVault) (service EmailService) {
	service.vault = vault
	return
}

func (service EmailService) SendEmail(body string, address string) {
	secret, err := service.vault.ReadSecret("/path/to/secret")
	//TODO: implement
}
