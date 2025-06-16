//go:generate protoc --go_out=../stubs --go_opt=paths=source_relative --go-grpc_out=../stubs --go-grpc_opt=paths=source_relative -I ../../../../../common/interface confirmationEmail.proto

package impl

import (
	"context"
	"database/sql"
	"mentipedia/go-backend/email/signup/grpc/stubs"
	"mentipedia/go-backend/logging"
	"regexp"

	"github.com/sirupsen/logrus"
)

var logger *logrus.Entry
var emailRegex *regexp.Regexp

const EMAIL_ADDRESS_REGEX = `(?:[a-z0-9!#$%&'*+/=?^_` + "`" + `{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_` + "`" + `{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])`

func init() {
	var err error
	logger = logrus.WithField("unit", "signupEmailGRPCImpl")
	emailRegex, err = regexp.Compile(EMAIL_ADDRESS_REGEX)
	if err != nil {
		logging.LogErrorAndGracefulShutdown(logger, err, "Could not compile email address regex")
	}
}

type GrpcSignupEmailService struct {
	stubs.UnimplementedSignupConfirmationEmailServiceServer
	sqliteDBCon *sql.DB
}

func MakeGRPCSignupEmailService(sqliteCon *sql.DB) (res GrpcSignupEmailService) {
	res.sqliteDBCon = sqliteCon
	return
}

// Method has to be public so it's visible for GRPC library
func (service GrpcSignupEmailService) RegisterSignupConfirmationEmail(_ context.Context, req *stubs.SignupConfirmationEmailRequest) (res *stubs.EmptyMsg, err error) {
	if !emailRegex.MatchString(req.Email) {
		logger.Error("Got request for sending email to poorly formatted email address")
		return
	}
	_, err = service.sqliteDBCon.Exec(
		"INSERT INTO MentirologoConfirmationMailRequests(deadlineTimestamp, email, mentirologoName) VALUES ($1, $2, $3)",
		req.DeadlineTimestampSeconds, req.Email, req.MentirologoName,
	)
	if err != nil {
		logger.WithFields(logrus.Fields{
			"error":                    err,
			"DeadlineTimestampSeconds": req.DeadlineTimestampSeconds,
			"Email":                    req.Email,
			"MentirologoName":          req.MentirologoName,
		}).Error("Could not store request for future signup email")
		return
	}
	// Response is empty, because the frontend cannot react any differently based on the outcome
	return res, err
}
