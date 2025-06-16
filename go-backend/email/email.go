package email

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"mentipedia/go-backend/security/baovault"
	"net/mail"
	"os"

	"github.com/sirupsen/logrus"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/gmail/v1"
	"google.golang.org/api/option"
)

const _GMAIL_SENDER_ADDRESS_ENV_NAME = "GMAIL_SENDER_ADDRESS"
const _GMAIL_SENDER_NAME_ENV_NAME = "GMAIL_SENDER_NAME"

var logger = logrus.WithField("unit", "email")

type EmailService struct {
	gmailService  *gmail.Service
	senderAddress string
	senderName    string
	properlyInit  bool
}

func fetchOauthConfig(vault *baovault.BaoVault) (config *oauth2.Config) {
	secretData, err := vault.ReadSecret(baovault.GMAIL_API_PARENT_CONFIG_SECRET_PATH{})

	if err != nil || secretData == nil {
		logger.WithField("error", err).Warning("Could not read gmail api parent config.")
		return nil
	}
	// For now, we are never going to need to read from the Gmail account
	config, err = google.ConfigFromJSON([]byte(secretData.(string)), gmail.GmailSendScope, gmail.GmailComposeScope)
	if err != nil {
		logger.WithField("error", err).Error("Could not parse oauth client config from secret.")
		return nil
	}
	return
}

func fetchOauthToken(vault *baovault.BaoVault) *oauth2.Token {
	secretData, err := vault.ReadSecret(baovault.GMAIL_API_OAUTH_TOKEN_SECRET_PATH{})

	if err != nil || secretData == nil {
		logger.WithField("error", err).Warning("Could not read gmail api oauth token.")
		return nil
	}

	jsonString := secretData.(string)
	token := &oauth2.Token{}
	err = json.Unmarshal([]byte(jsonString), token)
	if err != nil {
		logger.WithFields(logrus.Fields{
			"error":      err,
			"jsonString": jsonString,
		}).Error("Malformed oauth token json string")
		return nil
	}
	return token
}

func newGmailService(vault *baovault.BaoVault) (service *gmail.Service) {
	// Without the config it's impossible to authenticate (the refresh token is not enough, because it doesn't store the auth endpoint)
	oauthConfig := fetchOauthConfig(vault)
	if oauthConfig == nil {
		logger.Warn("Could not fetch oauth config. App will continue to work without email functionality")
		return
	}

	// It includes the refresh token
	oauthToken := fetchOauthToken(vault)
	if oauthToken == nil {
		logger.Warn("Could not fetch oauth token. App will continue to work without email functionality")
		return
	}
	ctx := context.Background()
	var err error
	service, err = gmail.NewService(ctx, option.WithHTTPClient(oauthConfig.Client(ctx, oauthToken)))
	if err != nil {
		logger.WithField("error", err).Warn("Could not instantiate Gmail Service")
		return
	}

	return
}

// The oauth token fetching flow is as follows:
// a) try to fetch it straight from the vault, in case it was already generated previously
// b) if it was not generated, then:
//
//	      b1) read the apiToken from vault (this one has to be present. Oterhwise, the app will log a warning and continue to work without email sending functionality)
//	      b2) print the login URL on stdout
//		  b3) MANUALLY log in (this is supposed to be a one-time action)
//	      b4) store the response in memory and also in the openbao vault
//
// It's important to note that the oauth token itself includes the refresh token. So there's no need to manually
// refresh upon expiry.
func MakeEmailService(vault *baovault.BaoVault) (service EmailService) {
	service.properlyInit = false
	service.senderAddress = os.Getenv(_GMAIL_SENDER_ADDRESS_ENV_NAME)
	service.senderName = os.Getenv(_GMAIL_SENDER_NAME_ENV_NAME)

	if service.senderAddress == "" || service.senderName == "" {
		logger.WithFields(logrus.Fields{
			_GMAIL_SENDER_ADDRESS_ENV_NAME: service.senderAddress,
			_GMAIL_SENDER_NAME_ENV_NAME:    service.senderName,
		}).Warn("ENV vars for Gmail FROM field not properly configured")
		return
	}

	gmailSrv := newGmailService(vault)
	if gmailSrv == nil {
		logger.Warn("Could not finish Oauth flow to make gmail service.")
	}
	service.gmailService = gmailSrv

	if !service.properlyInit {
		logger.Warn("EmailService could not be properly configured. App will continue to work without gmail functionality")
	}

	return
}

// Strictly conforms to RFC 2822
func (service EmailService) makeEmailString(recipientAddress string, recipientName string, body string) (mailMessage string) {
	from := mail.Address{Name: service.senderName, Address: service.senderAddress}
	to := mail.Address{Name: recipientName, Address: recipientAddress}

	mailMessage += "From: " + from.String() + "\r\n"
	mailMessage += "To: " + to.String() + "\r\n"
	mailMessage += "MIME-Version: 1.0\r\n"
	mailMessage += "Content-Type: text/plain; charset=\"UTF-8\"\r\n\r\n"
	mailMessage += body

	return
}

// This routine may fail silently. However, there wouldn't be any flow for handling the error, neither.
func (service EmailService) SendEmail(recipientAddress string, recipientName string, body string) {
	if service.gmailService == nil {
		logger.Warn("Gmail API secret was not configured. Email cannot be sent")
		return
	}
	response, err := service.gmailService.Users.Messages.Send("me", &gmail.Message{
		Raw: base64.URLEncoding.EncodeToString([]byte(service.makeEmailString(recipientAddress, recipientName, body))),
	}).Do()
	if err != nil {
		resJson, _ := response.Payload.MarshalJSON()
		logger.WithFields(logrus.Fields{
			"error":    err,
			"response": string(resJson),
		}).Error("Could not send email Gmail API error")
	}
}
