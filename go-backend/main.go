package main

import (
	"mentipedia/go-backend/db/sqlite"
	"mentipedia/go-backend/email"
	"mentipedia/go-backend/email/signup"
	"mentipedia/go-backend/grpc"
	"mentipedia/go-backend/process/shutdown"
	"mentipedia/go-backend/security/baovault"

	"github.com/sirupsen/logrus"
)

func init() {
	logrus.SetFormatter(&logrus.JSONFormatter{})
}

func main() {
	defer shutdown.GracefulShutdownStop()

	sqliteCon := sqlite.MakeSqliteConnection()

	baovault := baovault.MakeVault()
	emailService := email.MakeEmailService(&baovault)

	signupEmailService := signup.MakeSignupEmailService(sqliteCon, &emailService)
	signupEmailService.RegisterGRPCService()

	go signupEmailService.LoopSendEmailsToMaturedDeadlines()

	grpc.Serve()
	select {}
}
