//go:generate protoc --go_out=../stubs --go_opt=paths=source_relative --go-grpc_out=../stubs --go-grpc_opt=paths=source_relative -I ../../../../../common/interface signup.proto

package impl

import (
	"context"
	"mentipedia/go-backend/security/baovault"
	"mentipedia/go-backend/signup/grpc/stubs"
	"mentipedia/go-backend/signup/token"
	"time"

	"github.com/sirupsen/logrus"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

const _TOKEN_EXPIRY_DURATION_SECONDS = 72 * 60 * 60

var logger = logrus.WithField("unit", "signupService")

type grpcSignupService struct {
	stubs.UnimplementedSignupServiceServer
	vault baovault.BaoVault
}

func MakeGrpcSignupService(vault baovault.BaoVault) (service grpcSignupService) {
	service.vault = vault
	return
}

func (service grpcSignupService) DecodeAndVerify(ctx context.Context, req *stubs.SingupEmailTokenString) (res *stubs.SignupEmailToken, err error) {
	var unmarshalledToken stubs.SignupEmailToken
	var verificationOK bool
	unmarshalledToken, verificationOK, err = token.UnmarshallSignedToken(service.vault, req.Token)
	if err != nil {
		logger.WithError(err).Error("Error unmarshalling and verifying signup email token")
		err = status.Errorf(codes.Internal, "internal error while unmarshalling token: %+v", err)
		return
	}
	loggerContext := logger.WithFields(logrus.Fields{
		"tokenStr":         req.GetToken(),
		"mentirologoId":    unmarshalledToken.GetMentirologoId(),
		"mentirologName":   unmarshalledToken.GetMentirologo(),
		"mentirologoEmail": unmarshalledToken.GetEmail(),
		"timestamp":        unmarshalledToken.GetTimestamp(),
	})
	if !verificationOK {
		loggerContext.Warn("Signup email token verification failed")
		err = status.Error(codes.PermissionDenied, "signature verification failed")
		return
	}
	secondsSinceTokenCreation := time.Now().Unix() - unmarshalledToken.GetTimestamp()
	if secondsSinceTokenCreation > _TOKEN_EXPIRY_DURATION_SECONDS {
		loggerContext.WithField("secondsSinceTokenCreation", secondsSinceTokenCreation).Warn("Got expired signup token")
		err = status.Errorf(codes.PermissionDenied, "token has expired. Duration: %v. Max duration: %v", secondsSinceTokenCreation, _TOKEN_EXPIRY_DURATION_SECONDS)
		return
	}
	res = &unmarshalledToken
	return
}
