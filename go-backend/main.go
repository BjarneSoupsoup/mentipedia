package main

import (
	"mentipedia/go-backend/db/postgre"
	"mentipedia/go-backend/email"
	"mentipedia/go-backend/signup"

	"mentipedia/go-backend/grpc"
	"mentipedia/go-backend/security/baovault"

	"github.com/sirupsen/logrus"
)

func init() {
	logrus.SetFormatter(&logrus.JSONFormatter{})
}

func main() {
	postgreCon := postgre.MakePostgreConnection()

	baovault := baovault.MakeVault()
	// This line is effectively a no-op when go is built with the flag dev
	baovault.Seed()
	emailService := email.MakeEmailService(&baovault)

	signupEmailService := signup.MakeSignupEmailService(postgreCon, &emailService, &baovault)
	if signupEmailService != nil {
		signupEmailService.RegisterGRPCService()
		go signupEmailService.LoopSendEmailsToMaturedDeadlines()
	}

	go grpc.Serve()
	select {}
}
