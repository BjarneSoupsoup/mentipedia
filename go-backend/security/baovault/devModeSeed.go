//go:build dev

package baovault

import (
	"mentipedia/go-backend/logging"
	"os"

	"github.com/sirupsen/logrus"
)

func (vault BaoVault) writeGmailApiTokens() {
	if os.Getenv("GMAIL_API_PARENT_CONFIG") == "" {
		logger.Warn("Gmail API parent config not present. Not writing it to vault. It can be fetched from the Google Developer Console, under Gmail API > Clients > Oauth ClientIDs")
	} else {
		vault.WriteSecret(GMAIL_API_PARENT_CONFIG_SECRET_PATH, os.Getenv("GMAIL_API_PARENT_CONFIG"))
	}

	if os.Getenv("GMAIL_API_OAUTH_TOKEN") == "" {
		logger.Warn("Gmail API parent config not present. Not writing it to vault. It can be generated with the mentipedia tool gmail-oauth-token-fetcher")
	} else {
		vault.WriteSecret(GMAIL_API_OAUTH_TOKEN_SECRET_PATH, os.Getenv("GMAIL_API_OAUTH_TOKEN"))
	}
}

func (vault BaoVault) Seed() {
	var logger = logger.WithField("unit", "baoVaultDevSeeder")
	var err error
	logger.Info("Running dev mode vault seeder.")

	vault.writeGmailApiTokens()

	if os.Getenv("USER_DB_PASSWORD_PEPPER") == "" {
		// Even in DEV mode, the password pepper has to be present
		logrus.Fatal("USER_DB_PASSWORD_PEPPER not present. Shutting down ...")
	} else {
		err = vault.WriteSecret(USER_DB_PASSWORD_PEPPER_SECRET_PATH, os.Getenv("USER_DB_PASSWORD_PEPPER"))
		if err != nil {
			logging.LogErrorAndGracefulShutdown(logger, err, "Could not insert password pepper into vault")
		}
	}

}
