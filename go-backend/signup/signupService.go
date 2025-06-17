package signup

import (
	"database/sql"
	"errors"
	"fmt"
	"mentipedia/go-backend/email"
	"mentipedia/go-backend/grpc"
	"mentipedia/go-backend/security/baovault"
	"mentipedia/go-backend/security/baovault/engines/transit"
	"mentipedia/go-backend/signup/grpc/impl"
	"mentipedia/go-backend/signup/grpc/stubs"
	"mentipedia/go-backend/signup/token"
	"os"
	"time"

	"github.com/sirupsen/logrus"
)

// Make them wait!  •`_´•
const _SIGNUP_EMAIL_WAITING_TIME = 7 * 24 * time.Hour
const _POLL_TIME_MINUTES = 5

var _FORUM_DOMAIN_ORIGIN = os.Getenv("FORUM_DOMAIN_ORIGIN")

var logger = logrus.WithField("unit", "signupEmailService")

type signupEmailService struct {
	pgsqlCon     *sql.DB
	emailService *email.EmailService
	baovault     *baovault.BaoVault
}

func (service signupEmailService) createSignupUrlTokenKey() {
	service.baovault.TransitEngine.CreateKey(transit.SIGNUP_EMAIL_URL_TOKEN)
}

func (service signupEmailService) signupUrlTokenKeyExists() bool {
	_, err := service.baovault.TransitEngine.ReadKey(transit.SIGNUP_EMAIL_URL_TOKEN)
	if err != nil {
		return false
	}
	return true
}

func MakeSignupEmailService(dbCon *sql.DB, emailService *email.EmailService, baovault *baovault.BaoVault) (service *signupEmailService) {
	if _FORUM_DOMAIN_ORIGIN == "" {
		logger.Warn("undefined FORUM_DOMAIN_ORIGIN. Wouldn't be able to construct signup emails, as url origin would be missing.")
		return nil
	}
	service = &signupEmailService{}
	service.pgsqlCon = dbCon
	service.emailService = emailService
	service.baovault = baovault

	// Potentially, the key could be created every time at server boot. However, this would pollute the keyring, filling it with useless keys. It's better to only create it once
	if !service.signupUrlTokenKeyExists() {
		service.createSignupUrlTokenKey()
	}

	return
}

func (service signupEmailService) RegisterGRPCService() {
	grpcIml := impl.MakeGrpcSignupService(*service.baovault)
	stubs.RegisterSignupServiceServer(grpc.GetGRPCServerRegistrar(), grpcIml)
}

// This function is blocking
func (service signupEmailService) LoopSendEmailsToMaturedDeadlines() {
	ticker := time.NewTicker(_POLL_TIME_MINUTES * time.Minute)
	for range ticker.C {
		for _, maturedMentirologo := range service.checkEmailsWithMaturedDeadline() {
			loggerContext := logger.WithField("mentirologoId", maturedMentirologo.id)
			loggerContext.Info("Enough time elapsed since mentirlogo finished exam. Sending email ...")
			emailBody, err := service.makeSignupMailEmailBody(maturedMentirologo)
			if err != nil {
				loggerContext.WithField("error", err).Error("Could not make email body")
				continue
			}
			err = service.emailService.SendEmail(maturedMentirologo.emailAddres, maturedMentirologo.mentirologoName, emailBody)
			if err != nil {
				loggerContext.WithField("error", err).Error("Could not send email")
				continue
			}

			_, err = service.pgsqlCon.Exec(
				"UPDATE Mentirologos SET signup_email_was_sent = TRUE WHERE id = $1", maturedMentirologo.id,
			)
			if err != nil {
				loggerContext.WithField("error", err).Error("CRITICAL: Couldn't flag email as sent")
			}

		}
	}
}

// For now, there's no need for anything fancy. No templating engine, a simple string sub will suffice
func (service signupEmailService) makeSignupMailEmailBody(mentirologo maturedMentirologo) (body string, err error) {
	var signedTokenString string
	signedTokenString, err = token.MakeSignedToken(*service.baovault, mentirologo.id, mentirologo.emailAddres, mentirologo.mentirologoName)
	if err != nil {
		return signedTokenString, errors.Join(err, errors.New("could not make signup URL for email"))
	}

	signupLink := fmt.Sprintf("%s/altaMentirologo/registro?token=%s", _FORUM_DOMAIN_ORIGIN, signedTokenString)

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
`, mentirologo.mentirologoName, signupLink, signupLink)
	return
}

type maturedMentirologo struct {
	id              int
	emailAddres     string
	mentirologoName string
}

func (service signupEmailService) checkEmailsWithMaturedDeadline() (maturedEmails []maturedMentirologo) {
	maturedEmails = make([]maturedMentirologo, 0)
	var (
		returnedRows *sql.Rows
		err          error
	)
	returnedRows, err = service.pgsqlCon.Query(
		"SELECT id, email, mentirologo_name FROM Mentirologos WHERE ($1 - exam_finish_date) > $2 AND signup_email_was_sent = FALSE",
		time.Now(), _SIGNUP_EMAIL_WAITING_TIME,
	)
	if err != nil {
		logger.WithField("error", err).Error("Error while fetching matured deadlines")
		return
	}
	defer returnedRows.Close()
	for returnedRows.Next() {
		var (
			id              int
			email           string
			mentirologoName string
		)
		err = returnedRows.Scan(&email, &mentirologoName)
		if err != nil {
			logger.WithField("error", err).Error("Error while parsing columns from matured deadlines")
			continue
		}
		maturedEmails = append(maturedEmails, maturedMentirologo{id, email, mentirologoName})
	}
	return
}
