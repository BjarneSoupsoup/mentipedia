package baovault

// Defined for consistency

type secretPath interface {
	getPath() string
}

type GMAIL_API_PARENT_CONFIG_SECRET_PATH struct{}

func (s GMAIL_API_PARENT_CONFIG_SECRET_PATH) getPath() string {
	return "secret/gmail/token/parent-config"
}

// Holds both a short-lived token and also a long-lived refresh token
type GMAIL_API_OAUTH_TOKEN_SECRET_PATH struct{}

func (s GMAIL_API_OAUTH_TOKEN_SECRET_PATH) getPath() string { return "secret/gmail/token/oauth-token" }

type USER_DB_PASSWORD_PEPPER_SECRET_PATH struct{}

func (s USER_DB_PASSWORD_PEPPER_SECRET_PATH) getPath() string { return "secret/users/db/pepper" }
