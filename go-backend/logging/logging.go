package logging

import (
	"mentipedia/go-backend/process/shutdown"

	"github.com/sirupsen/logrus"
)

// Will kill the program (albeit gracefully)

func LogErrorAndGracefulShutdown(logEntry *logrus.Entry, err error, msg string) {
	logEntry.WithField("error", err).Error(msg)
	shutdown.GracefulShutdownStop(1)
}
