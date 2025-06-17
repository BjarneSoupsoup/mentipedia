// Package for managing openbao (HasiCorp Vault fork). Set-up and secret fetching

package baovault

import (
	"fmt"
	"io/fs"
	"maps"
	"mentipedia/go-backend/logging"
	"mentipedia/go-backend/process/shutdown"
	"mentipedia/go-backend/security/baovault/engines/transit"
	"os"
	"path/filepath"
	"strings"

	vaultApi "github.com/hashicorp/vault/api"
	"github.com/sirupsen/logrus"
)

const _POLICIES_DIR = "./assets/baovault"
const _APP_ROLE_AUTH_NAME = "go-backend"

var logger = logrus.WithField("unit", "baovault")

type BaoVault struct {
	TransitEngine transit.Engine
	client        *vaultApi.Client
}

// Key is the policy name, value is the file contents
func readPolicyFiles() (res map[string]string) {
	res = make(map[string]string)
	filepath.WalkDir(_POLICIES_DIR, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			logger.Error("Could not read Vault policies dir")
			shutdown.GracefulShutdownStop(1)
		}
		if !d.IsDir() && strings.HasSuffix(d.Name(), ".hcl") {
			readBytes, readErr := os.ReadFile(path)
			if readErr != nil {
				logger.WithFields(logrus.Fields{
					"error":          readErr,
					"policyFilepath": path,
				}).Error("Could not read policy file")
				shutdown.GracefulShutdownStop(1)
			}
			res[strings.Replace(d.Name(), ".hcl", "", 1)] = string(readBytes)
		}
		return nil
	})
	return
}

// This function is blocking.
// vault.client has to have prepared the token which is to be renewed itself (call client.SetToken())
func (vault BaoVault) autoRefreshToken(tokenSecret *vaultApi.Secret) {
	if !tokenSecret.Auth.Renewable {
		logger.WithField("approleName", _APP_ROLE_AUTH_NAME).Error("approle gave a token which is not renewable. Backend cannot function properly")
		shutdown.GracefulShutdownStop(1)
	}

	watcher, err := vault.client.NewLifetimeWatcher(&vaultApi.LifetimeWatcherInput{
		Secret: tokenSecret,
	})
	if err != nil {
		logger.WithField("error", err).Error("Error while requesting token watcher")
		shutdown.GracefulShutdownStop(1)
	}

	go watcher.Start()
	defer watcher.Stop()

	// Listen for incoming messages indefinitely and act accordingly
	for {
		select {
		case err := <-watcher.DoneCh():
			logging.LogErrorAndGracefulShutdown(logger, err, "Could not renew baovault token any further. Application cannot function. Shutting down ...")
		case <-watcher.RenewCh():
			logger.Debug("Succesfully renewed openbao token")
		}
	}
}

func makeVaultClient() *vaultApi.Client {
	config := vaultApi.DefaultConfig()
	config.Address = os.Getenv("BAOVAULT_ORIGIN")
	if config.Address == "" {
		logger.Error("BAOVAULT_ORIGIN was missing")
		shutdown.GracefulShutdownStop(1)
	}
	newClient, err := vaultApi.NewClient(config)
	if err != nil {
		logging.LogErrorAndGracefulShutdown(logger, err, "Could not set up openbao client")
	}
	return newClient
}

func (vault BaoVault) createPolicies(policyData map[string]string) {
	for policyName, fileContents := range policyData {
		err := vault.client.Sys().PutPolicy(policyName, fileContents)
		if err != nil {
			logger.WithFields(logrus.Fields{
				"policyName":   policyName,
				"fileContents": fileContents,
			}).Error("Could not create policy")
			shutdown.GracefulShutdownStop(1)
		}
	}
}

// Returns the first token fetched after login
func (vault BaoVault) loginWithAppRole() (secret *vaultApi.Secret) {
	var err error
	// Fetch the role-id
	secret, err = vault.client.Logical().Read(fmt.Sprintf("auth/approle/role/%s/role-id", _APP_ROLE_AUTH_NAME))
	if secret == nil || secret.Data == nil {
		logger.WithFields(logrus.Fields{
			"error":       err,
			"appRoleName": _APP_ROLE_AUTH_NAME,
		}).Error("Could not read role-id")
		shutdown.GracefulShutdownStop(1)
	}

	appRoleId := secret.Data["role_id"]
	logger.WithField("appRoleId", appRoleId).Info("Succesfully created appRole auth")

	// Generate a secret-id
	secret, err = vault.client.Logical().Write(fmt.Sprintf("auth/approle/role/%s/secret-id", _APP_ROLE_AUTH_NAME), nil)
	if err != nil || secret == nil || secret.Data == nil {
		logger.WithFields(logrus.Fields{
			"error":       err,
			"appRoleName": _APP_ROLE_AUTH_NAME,
		}).Error("Could not read secret-id")
		shutdown.GracefulShutdownStop(1)
	}
	appRoleAuthSecretId := secret.Data["secret_id"]

	// Fetch the first token
	secret, err = vault.client.Logical().Write("auth/approle/login", map[string]any{
		"role_id":   appRoleId,
		"secret_id": appRoleAuthSecretId,
	})
	if err != nil || secret == nil || secret.Auth == nil {
		logging.LogErrorAndGracefulShutdown(logger, err, "Error fetching the first token with appRole")
	}
	return
}

type ReadSecretValueNotFoundError struct{}

func (e ReadSecretValueNotFoundError) Error() string {
	return "Member 'value' was not present on the secret in the KV store"
}

func (vault BaoVault) ReadSecret(path secretPath) (res any, err error) {
	secret, err := vault.client.Logical().Read(string(path))
	if err != nil {
		return
	}
	_, valueExists := secret.Data["value"]
	if !valueExists {
		return nil, ReadSecretValueNotFoundError{}
	}
	res = secret.Data["value"]
	return res, nil
}

// Writes can sometimes also return data (like secret_id). However, this function will ignore it, for simplicity. It enforces
// the member "value" to be the sole content of the secret.
func (vault BaoVault) WriteSecret(path secretPath, value any) (err error) {
	_, err = vault.client.Logical().Write(string(path), map[string]any{"value": value})
	return
}

func (newVault *BaoVault) initVault() {
	var err error
	// To be injected at CI time
	adminVaultToken := os.Getenv("ADMIN_VAULT_TOKEN")
	if adminVaultToken == "" {
		logger.Error("ADMIN_VAULT_TOKEN was not set")
		shutdown.GracefulShutdownStop(1)
	}
	newVault.client.SetToken(adminVaultToken)
	logger.Info("Starting baovault setup ...")

	// Enable features
	err = newVault.client.Sys().EnableAuthWithOptions("approle", &vaultApi.EnableAuthOptions{Type: "approle"})
	if err != nil {
		logging.LogErrorAndGracefulShutdown(logger, err, "Could not enable approle auth method")
	}

	err = newVault.client.Sys().Mount("kv", &vaultApi.MountInput{Type: "kv", Options: map[string]string{"version": "1"}})
	if err != nil {
		logging.LogErrorAndGracefulShutdown(logger, err, "Could not enable key-value store")
	}

	// Enables cryptography as a service, which comes in handy for encrypting and authenticating messages
	err = newVault.client.Sys().Mount("transit", &vaultApi.MountInput{Type: "transit"})
	if err != nil {
		logging.LogErrorAndGracefulShutdown(logger, err, "Could not enable transit secret engine")
	}

	// Make policies
	// Read local config
	policyData := readPolicyFiles()
	// Submit to vault instance
	newVault.createPolicies(policyData)
	// Make actual auth method for the server. The server cannot use the admin token because it's not refresheable and
	// it's quite short lived. This is done intentionally, as a security measure. It's, effectively a downgrade in privileges.
	_, err = newVault.client.Logical().Write(fmt.Sprintf("auth/approle/role/%s", _APP_ROLE_AUTH_NAME), map[string]any{
		// This auth endpoint will actually only be used once, for getting the first token. Further tokens will be re-fetched,
		// because they are refresheable
		"secret_id_num_uses": 1,
		// Authentication is going to be right after this, so there's no point in extending it much
		"secret_id_ttl": "60",
		"token_ttl":     "5m",
		// After this, a manual redeployment would be necessary
		"token_max_ttl":  "360d",
		"token_policies": maps.Keys(policyData),
	})
	if err != nil {
		logging.LogErrorAndGracefulShutdown(logger, err, "Could not create approle auth method")
	}

	// Now log in with this appRole

	// We can now discard the high-privileged token and being using the downgraded one.
	// This token will be refreshed automatically
	firstTokenSecret := newVault.loginWithAppRole()
	newVault.client.SetToken(firstTokenSecret.Auth.ClientToken)
	go newVault.autoRefreshToken(firstTokenSecret)

	logger.Info("Finished baovault setup! Client will refresh the token before expiry asynchronously")
}

// Sets up features, policies and auth methods. Requires a (very short lived) token with high privileges set as env variable (ADMIN_VAULT_TOKEN)
func MakeVault() (newVault BaoVault) {
	newVault.client = makeVaultClient()
	newVault.initVault()
	newVault.TransitEngine = transit.MakeEngine(newVault.client.Logical())

	return
}
