package sqlite

import (
	"database/sql"
	"mentipedia/go-backend/logging"
	"mentipedia/go-backend/process/shutdown"
	"os"

	"github.com/sirupsen/logrus"
)

const _SQLITE_DB_FILEPATH = "./local.db"
const _INIT_SQL_FILEPATH = "./assets/init_sqlite.sql"

func initDB(dbCon *sql.DB, logContext *logrus.Entry) {
	var (
		fileContentBytes []byte
		err              error
	)
	logContext.Info("Setting up internal SQLite db ...")
	fileContentBytes, err = os.ReadFile(_INIT_SQL_FILEPATH)
	if err != nil {
		logging.LogErrorAndGracefulShutdown(logContext, err, "Could not read init SQL script")
	}
	_, err = dbCon.Exec(string(fileContentBytes))
	if err != nil {
		logging.LogErrorAndGracefulShutdown(logContext, err, "Failed while executing init SQL script")
	}
	logContext.Info("Set up internal SQL db")
}

func MakeSqliteConnection() (dbCon *sql.DB) {
	var err error

	logContext := logrus.WithFields(logrus.Fields{
		"sqlite_filepath":          _SQLITE_DB_FILEPATH,
		"init_sql_script_filepath": _INIT_SQL_FILEPATH,
	})

	dbCon, err = sql.Open("sqlite3", _SQLITE_DB_FILEPATH)
	if err != nil {
		logging.LogErrorAndGracefulShutdown(logContext, err, "Could not open sqlite DB")
	}
	initDB(dbCon, logContext)

	// Opt in to gracefulShutdown
	shutdown.RegisterShutdownCallback(func() { dbCon.Close() })

	return
}
