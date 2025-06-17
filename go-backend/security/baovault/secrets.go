package baovault

// Defined for consistency

type secretPath string

const (
	GMAIL_API_PARENT_CONFIG_SECRET_PATH secretPath = "secret/gmail/token/parent-config"
	GMAIL_API_OAUTH_TOKEN_SECRET_PATH   secretPath = "secret/gmail/token/oauth-token"
	USER_DB_PASSWORD_PEPPER_SECRET_PATH secretPath = "secret/users/db/pepper"
)
