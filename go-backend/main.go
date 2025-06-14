package main

import (
	"mentipedia/go-backend/db/sqlite"
	"mentipedia/go-backend/grpc"
	"mentipedia/go-backend/process/shutdown"
	baovault "mentipedia/go-backend/security/vault"
	"mentipedia/go-backend/signup/email"

	_ "github.com/mattn/go-sqlite3"
	"github.com/sirupsen/logrus"
)

func init() {
	logrus.SetFormatter(&logrus.JSONFormatter{})
}

func main() {
	defer shutdown.GracefulShutdownStop()

	sqliteCon := sqlite.MakeSqliteConnection()

	baovault := baovault.MakeVault()

	signupEmailService := email.MakeSignupEmailService(sqliteCon)
	signupEmailService.RegisterGRPCService()

	go signupEmailService.LoopSendEmailsToMaturedDeadlines()

	grpc.Serve()
	select {}
}
