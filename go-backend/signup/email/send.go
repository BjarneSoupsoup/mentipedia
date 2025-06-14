package email

import (
	"golang.org/x/oauth2/google"
)

// Used for non-interactive authentication. This token is saved automatically upon calling the RefreshToken endpoint, and also, for every
// request to the GMail API.
const REFRESH_AUTH_TOKEN_FILEPATH = "assets/"

func sendEmail(emailRecipient string) {
	google.ConfigFromJSON()
}
