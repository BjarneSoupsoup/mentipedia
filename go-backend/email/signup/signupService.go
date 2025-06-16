package signup

import (
	"database/sql"
	"fmt"
	"mentipedia/go-backend/email"
	"mentipedia/go-backend/email/signup/grpc/impl"
	"mentipedia/go-backend/email/signup/grpc/stubs"
	"mentipedia/go-backend/grpc"
	"os"
	"time"

	"github.com/sirupsen/logrus"
)

const _POLL_TIME_MINUTES = 5

var _FORUM_DOMAIN_ORIGIN = os.Getenv("FORUM_DOMAIN_ORIGIN")

var logger = logrus.WithField("unit", "signupEmailService")

type signupEmailService struct {
	sqliteCon    *sql.DB
	emailService *email.EmailService
}

func MakeSignupEmailService(dbCon *sql.DB, emailService *email.EmailService) (service *signupEmailService) {
	if _FORUM_DOMAIN_ORIGIN == "" {
		logger.Warn("undefined FORUM_DOMAIN_ORIGIN. Wouldn't be able to construct signup emails, as url origin would be missing.")
		return nil
	}
	service.sqliteCon = dbCon
	service.emailService = emailService
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
			for _, emailRecipient := range service.checkEmailsWithMaturedDeadline() {
				service.emailService.SendEmail()

				rowId, _ := sqlResponse.LastInsertId()
				_, err = service.sqliteDBCon.Exec(
					"UPDATE MentirologoConfirmationMailRequests(deadlineTimestamp, email, mentirologoName) SET emailSent = 1 WHERE id = $1",
					rowId,
				)
				if err != nil {
					logger.WithField("error", err).Error("Couldn't flag email as sent ")
				}

			}
		}
	}
}

// For now, there's no need for anything fancy. No templating engine, a simple string sub will suffice
func makeSignupMailEmailBody(mentirologoName string, signupLink string) (body string) {
	redirectURL := fmt.Sprintf("%s/altaMentirologo/registro?token=%s", _FORUM_DOMAIN_ORIGIN)

	body = fmt.Sprintf(`
<!DOCTYPE html>
<html>

<head>
  <meta charset="utf-8">
  <meta name="author" content="Mentipedia">
  <meta name="description" content="Mensaje de alta mentirólogo">
</head>

<body>
  <p>Estimado <b>%s</b>, desde <i>Mentipedia</i> nos congratula informarle que <b>que ha superado exitosamente el examen de mentirólogo</b></p>
  <p>Estamos orgullosos de recibirlo en nuestro foro, agradecemos su voluntad para luchar contra la mentira.</p>
  <p>Haga click en el siguiente enlace: </p>
  <p><a href="%s">%s</a></p>
  <p>para finalizar el proceso de alta de mentirólogo.</p>
  <p>Un cordial saludo, </p>
  <p>Mentipedia, la enciclopedia de las mentiras.</p>
</body>

</html>
`, mentirologoName, signupLink, signupLink)
	return
}

type emailRecipientFields struct {
	recipientAddress string
	recipientName    string
}

func (service signupEmailService) checkEmailsWithMaturedDeadline() (maturedEmails []emailRecipientFields) {
	maturedEmails = make([]emailRecipientFields, 0)
	var (
		returnedRows *sql.Rows
		err          error
	)
	returnedRows, err = service.sqliteCon.Query("SELECT email, mentirologoName FROM MentirologoConfirmationMailRequests WHERE deadlineTimestamp <= $1", time.Now())
	if err != nil {
		logger.WithField("error", err).Error("Error while fetching matured deadlines")
		return
	}
	defer returnedRows.Close()
	for returnedRows.Next() {
		var (
			email           string
			mentirologoName string
		)
		err = returnedRows.Scan(&email, &mentirologoName)
		if err != nil {
			logger.WithField("error", err).Error("Error while parsing columns from matured deadlines")
			continue
		}
		maturedEmails = append(maturedEmails, emailRecipientFields{email, mentirologoName})
	}
	return
}
