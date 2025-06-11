package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"flag"
	"fmt"
	"mentipedia/go-backend/logging"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

const INIT_SQL_FILEPATH = "./init.sql"
const LISTEN_SOCKET = "127.0.0.1:10000"
const POLL_TIME_MINUTES = 5

type SchedulerRequest struct {
	Endpoint    *string    `json:"endpoint"`
	EnqueueTime *time.Time `json:"enqueueTime"`
	Deadline    *time.Time `json:"deadline"`
}

func initDB(dbCon *sql.DB) (err error) {
	var fileContentBytes []byte
	fileContentBytes, err = os.ReadFile(INIT_SQL_FILEPATH)
	if err != nil {
		return err
	}
	logging.Log(fmt.Sprintf("Running %s", INIT_SQL_FILEPATH), logging.INFO)
	_, err = dbCon.Exec(string(fileContentBytes))
	if err != nil {
		return err
	}
	return err
}

func makeHttpServer(dbCon *sql.DB) *http.Server {

	mux := http.NewServeMux()
	mux.HandleFunc("POST /scheduleTask", func(w http.ResponseWriter, r *http.Request) {
		var request SchedulerRequest

		err := json.NewDecoder(r.Body).Decode(&request)

		if err != nil || request.EnqueueTime == nil || request.Deadline == nil || request.Endpoint == nil {
			http.Error(w, fmt.Sprintf("Bad request: %+v. Err was: %+v", request, err), 400)
			return
		}

		_, err = dbCon.Exec(
			"INSERT INTO ScheduledTasks(enqueueTime, deadline, endpoint) VALUES ($1, $2, $3)",
			*request.EnqueueTime, *request.Deadline, *request.Endpoint,
		)
		if err != nil {
			http.Error(w, "Could not insert task into local DB", 500)
			return
		}
		logging.Log(fmt.Sprintf("Enqueued task for endpoint %s with deadline %s", *request.Endpoint, request.Deadline.Format(time.RFC3339)), logging.INFO)
		w.WriteHeader(200)
	})

	srv := &http.Server{
		Addr:    LISTEN_SOCKET,
		Handler: mux,
	}

	go srv.ListenAndServe()

	logging.Log(fmt.Sprintf("Listening at %s", LISTEN_SOCKET), logging.INFO)
	return srv
}

func processMaturedTask(id int, endpoint string, workerAddress string, httpClient *http.Client, dbCon *sql.DB) {
	var err error
	// TODO: for now, errors on the consumer side are ignored. If the worker
	// does not do the work OK or was not listening, the task will still be flagged
	// as finished. A retry mechanism should be implemented (possible as simple as retry in 1 hour)
	_, err = httpClient.Post(
		fmt.Sprintf("http://%s/%s", workerAddress, endpoint), "", nil,
	)
	if err != nil {
		logging.Log(fmt.Sprintf("Error when calling POST to worker: %+v", err), logging.ERROR)
	}
	_, err = dbCon.Exec("DELETE FROM ScheduledTasks WHERE id = $1", id)
	if err != nil {
		panic(fmt.Sprintf("Error when marking task as done: %+v", err))
	}
}

func poll_db_for_deadlines(dbCon *sql.DB, httpClient *http.Client, workerAddress string) {
	var (
		returnedRows *sql.Rows
		err          error
	)
	returnedRows, err = dbCon.Query("SELECT id, endpoint FROM ScheduledTasks WHERE deadline <= $1", time.Now())
	if err != nil {
		logging.Log(fmt.Sprintf("Error while fetching tasks from DB: %+v", err), logging.ERROR)
		return
	}
	defer returnedRows.Close()
	for returnedRows.Next() {
		var (
			id       int
			endpoint string
			err      error
		)
		err = returnedRows.Scan(&id, &endpoint)
		if err != nil {
			logging.Log(fmt.Sprintf("Error while parsing columns from DB: %+v", err), logging.ERROR)
			continue
		}
		logging.Log(fmt.Sprintf("Sent request to /%s", endpoint), logging.INFO)
		go processMaturedTask(id, endpoint, workerAddress, httpClient, dbCon)
	}
}

type cliInputArgs struct {
	workerAddress string
}

func parseArgs() string {
	workerAddressPtr := flag.String("worker-address", "", "The scheduler will send HTTP (no TLS) requests to this address once the deadline is reached. Format: 'host:port'")
	flag.Parse()
	if *workerAddressPtr == "" {
		panic("--worker-address flag is mandatory")
	}
	return *workerAddressPtr
}

func main() {

	// Set up context for graceful shutdown
	sigtermCtx, stop := signal.NotifyContext(context.Background(), syscall.SIGTERM, syscall.SIGINT)
	defer stop()

	var dbCon *sql.DB
	dbCon, err = sql.Open("sqlite3", "./local.db")
	if err != nil {
		logging.Log("Error while loading local sqlite DB", logging.ERROR)
		panic(err)
	}
	defer dbCon.Close()

	err = initDB(dbCon)
	if err != nil {
		logging.Log(fmt.Sprintf("Error while setting up sqlite DB: %s", err), logging.ERROR)
		panic(err)
	}

	httpServer := makeHttpServer(dbCon)

	httpClient := http.Client{Timeout: 60 * time.Second}

	polling_ticker := time.NewTicker(POLL_TIME_MINUTES * time.Minute)
	defer polling_ticker.Stop()

	for {
		select {
		case <-polling_ticker.C:
			poll_db_for_deadlines(dbCon, &httpClient, *workerAddress)
		case <-sigtermCtx.Done():
			wg := sync.WaitGroup{}
			go func() { httpServer.Shutdown(context.Background()); wg.Add(1) }()
			go func() { httpClient.CloseIdleConnections(); wg.Add(1) }()
			wg.Wait()
			return
		}
	}
}
