package postgre

import (
	"database/sql"
	"mentipedia/go-backend/logging"
	"mentipedia/go-backend/process/shutdown"
	"os"

	_ "github.com/lib/pq"
	"github.com/sirupsen/logrus"
)

var _PGSQL_CONNECTION_STRING = os.Getenv("PGSQL_CONNECTION_STRING")

func MakePostgreConnection() (dbCon *sql.DB) {
	var err error

	logContext := logrus.WithFields(logrus.Fields{
		"unit":              "pgsqlConnection",
		"connection_string": _PGSQL_CONNECTION_STRING,
	})
	if _PGSQL_CONNECTION_STRING == "" {
		logContext.Error("PGSQL connection string env var was not present")
		shutdown.GracefulShutdownStop(1)
	}

	dbCon, err = sql.Open("pq", _PGSQL_CONNECTION_STRING)
	dbCon.SetMaxIdleConns(2)
	if err != nil {
		logging.LogErrorAndGracefulShutdown(logContext, err, "Could not open pgsql connection")
	}
	// Opt in to gracefulShutdown
	shutdown.RegisterShutdownCallback(func() { dbCon.Close() })

	return
}
