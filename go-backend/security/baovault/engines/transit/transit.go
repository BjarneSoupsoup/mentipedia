package transit

import (
	"encoding/base64"
	"fmt"

	vaultApi "github.com/hashicorp/vault/api"
)

type Engine struct {
	vaultLogicalApi *vaultApi.Logical
}

func MakeEngine(logicalApi *vaultApi.Logical) (engine Engine) {
	engine.vaultLogicalApi = logicalApi
	return
}

func (engine Engine) ReadKey(keyPath keyPath) (secret *vaultApi.Secret, err error) {
	secret, err = engine.vaultLogicalApi.Read(fmt.Sprintf("/transit/keys/%s", keyPath))
	if err != nil {
		return
	}
	return
}

// For now, the transit engine is just used for HMAC (message integrity and authentication)
func (engine Engine) CreateKey(keyPath keyPath) (err error) {
	_, err = engine.vaultLogicalApi.Write(fmt.Sprintf("/transit/keys/%s", keyPath), map[string]any{
		"type":               "hmac",
		"auto_rotate_period": "180d",
	})
	if err != nil {
		return
	}
	return
}

// Signature is base64 encoding of an HMAC
func (engine Engine) Sign(keyPath keyPath, message []byte) (signature string, err error) {
	var secret *vaultApi.Secret
	secret, err = engine.vaultLogicalApi.Write(fmt.Sprintf("/transit/hmac/%s", keyPath), map[string]any{
		"input": base64.URLEncoding.EncodeToString(message),
	})
	if err != nil {
		return
	}
	signature = secret.Data["hmac"].(string)

	return
}

// signature is base-64 encoded, as returned by Sign()
func (engine Engine) Verify(keyPath keyPath, message []byte, signature string) (verificationOk bool, err error) {
	var secret *vaultApi.Secret
	secret, err = engine.vaultLogicalApi.Write(fmt.Sprintf("/transit/verify/%s", keyPath), map[string]any{
		"input": base64.URLEncoding.EncodeToString(message),
		"hmac":  signature,
	})
	if err != nil {
		return
	}

	verificationOk = secret.Data["valid"].(bool)

	return
}
