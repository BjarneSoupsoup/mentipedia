package email

import (
	"database/sql"
	"mentipedia/go-backend/grpc"
	"mentipedia/go-backend/signup/email/grpc/impl"
	"mentipedia/go-backend/signup/email/grpc/stubs"
	"time"

	"github.com/sirupsen/logrus"
)

const _POLL_TIME_MINUTES = 5

var logger = logrus.WithField("unit", "signupEmailService")

type signupEmailService struct {
	sqliteCon *sql.DB
}

func MakeSignupEmailService(dbCon *sql.DB) (service signupEmailService) {
	service.sqliteCon = dbCon
	return
}

func (service signupEmailService) RegisterGRPCService() {
	grpcIml := impl.MakeGRPCSignupEmailService(service.sqliteCon)
	stubs.RegisterSignupConfirmationEmailServiceServer(grpc.GetGRPCServerRegistrar(), grpcIml)
}

// This function is blocking
func (service signupEmailService) LoopSendEmailsToMaturedDeadlines() {
	ticker := time.NewTicker(_POLL_TIME_MINUTES * time.Minute)
	for {
		select {
		case <-ticker.C:
			for _, email := range service.checkEmailsWithMaturedDeadline() {

			}
		}
	}
}

func (service signupEmailService) checkEmailsWithMaturedDeadline() (maturedEmails []string) {
	maturedEmails = make([]string, 0)
	var (
		returnedRows *sql.Rows
		err          error
	)
	returnedRows, err = service.sqliteCon.Query("SELECT email FROM MentirologoConfirmationMailRequests WHERE deadlineTimestamp <= $1", time.Now())
	if err != nil {
		logger.WithField("error", err).Error("Error while fetching matured deadlines")
		return
	}
	defer returnedRows.Close()
	for returnedRows.Next() {
		var email string
		err = returnedRows.Scan(&email)
		if err != nil {
			logger.WithField("error", err).Error("Error while parsing columns from matured deadlines")
			continue
		}
		maturedEmails = append(maturedEmails, email)
	}
	return
}
