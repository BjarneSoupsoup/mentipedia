package shutdown

import (
	"context"
	"os"
	"os/signal"
	"sync"
	"syscall"

	"github.com/sirupsen/logrus"
)

type shutdownCleanupFunType func()

var gracefulShutdownStopFn context.CancelFunc
var registeredShutdownCallbacks []shutdownCleanupFunType = make([]shutdownCleanupFunType, 0, 10)
var onceLock = sync.Once{}

func RegisterShutdownCallback(callback shutdownCleanupFunType) {
	registeredShutdownCallbacks = append(registeredShutdownCallbacks, callback)
}

// This will kill the program. Should only be used by main or for unexpected runtime errors
func GracefulShutdownStop() { onceLock.Do(gracefulShutdownStopFn) }

func init() {
	var gracefulShutdownCtx context.Context
	gracefulShutdownCtx, gracefulShutdownStopFn = signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM, syscall.SIGHUP, syscall.SIGINT)
	go func() {
		// Block until signal to shutdown is sent by OS
		<-gracefulShutdownCtx.Done()
		logger := logrus.WithField("unit", "gracefulShutdown")
		logger.Info("Got termination signal. Shutting down ...")
		wg := sync.WaitGroup{}
		for _, callback := range registeredShutdownCallbacks {
			wg.Add(1)
			go func() { defer wg.Done(); callback() }()
		}
		wg.Wait()
		logger.Info("Done shutting down")
	}()
}
