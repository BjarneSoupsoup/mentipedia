//go: build !dev

package email

import (
	"context"
	"fmt"
	"time"

	"golang.org/x/oauth2"
)

// This is compiled conditionally, because user input to the server's console is not realistic.
func (service EmailService) fetchOauthTokenFromOauthConfig(config *oauth2.Config) (token *oauth2.Token) {
	authURL := config.AuthCodeURL("oauth-token", oauth2.AccessTypeOffline)
	fmt.Printf(`
		Setting up EmailService. User action is required. Gmail API oauth token required. This should only happen once. Further uses will refresh the token
		automatically. Please go the following link: %s log in with the gmail account and paste the code that's returned
	`, authURL)
	var oauthCode string
	_, err := fmt.Scan(&oauthCode)
	if err != nil {
		logger.WithField("error", err).Error("Could not read auth code input by user")
		return nil
	}

	logger.Info("Authenticating against google servers ...")

	ctx, cancelFun := context.WithTimeout(context.Background(), _AUTH_TIMEOUT_SECONDS*time.Second)
	defer cancelFun()
	token, err = config.Exchange(ctx, oauthCode)
	if err != nil {
		logger.WithField("error", err).Error("Gmail auth failed")
		return nil
	}

	logger.Info("Succesfuly received gmail oauth token")
	return
}
