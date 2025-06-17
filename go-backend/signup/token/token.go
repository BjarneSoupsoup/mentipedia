package token

import (
	"bytes"
	"encoding/base64"
	"encoding/gob"
	"mentipedia/go-backend/security/baovault"
	"mentipedia/go-backend/security/baovault/engines/transit"
	"mentipedia/go-backend/signup/grpc/stubs"
	"time"

	"google.golang.org/protobuf/proto"
)

type signedMessage struct {
	payloadBytes []byte
	signature    string
}

func MakeSignedToken(vault baovault.BaoVault, mentirologoId int, mentirologoAddress string, mentirologoName string) (token string, err error) {
	tokenPayload := &stubs.SignupEmailToken{
		MentirologoId: int64(mentirologoId),
		Mentirologo:   mentirologoName,
		Email:         mentirologoAddress,
		Timestamp:     time.Now().Unix(),
	}
	payloadBytes, _ := proto.Marshal(tokenPayload)

	var signature string
	signature, err = vault.TransitEngine.Sign(transit.SIGNUP_EMAIL_URL_TOKEN, payloadBytes)
	if err != nil {
		return
	}

	tokenStruct := signedMessage{payloadBytes, signature}

	var buffer bytes.Buffer
	gob.NewEncoder(&buffer).Encode(tokenStruct)

	token = base64.URLEncoding.EncodeToString(buffer.Bytes())

	return
}

// Also checks for the validity of the embedded signature, in which case, returns an error
func UnmarshallSignedToken(vault baovault.BaoVault, tokenString string) (tokenStruct stubs.SignupEmailToken, verificationOk bool, err error) {
	var tokenBytes []byte
	tokenBytes, err = base64.URLEncoding.DecodeString(tokenString)
	if err != nil {
		return
	}
	var signedMessage signedMessage
	err = gob.NewDecoder(bytes.NewReader(tokenBytes)).Decode(&signedMessage)
	if err != nil {
		return
	}

	err = proto.Unmarshal(signedMessage.payloadBytes, &tokenStruct)
	if err != nil {
		return
	}

	verificationOk, err = vault.TransitEngine.Verify(transit.SIGNUP_EMAIL_URL_TOKEN, signedMessage.payloadBytes, signedMessage.signature)
	if err != nil {
		return
	}

	return
}
