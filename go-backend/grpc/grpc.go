package grpc

import (
	"mentipedia/go-backend/logging"
	"mentipedia/go-backend/process/shutdown"
	"net"

	"github.com/sirupsen/logrus"
	"google.golang.org/grpc"
)

const GRPC_LISTEN_ADDRESS = "127.0.0.1:10000"

var grpcServerRegistrar = grpc.NewServer()
var tcpSocket net.Listener

func GetGRPCServerRegistrar() *grpc.Server {
	return grpcServerRegistrar
}

// This function is blocking
func Serve() {
	// This will wait for tasks which are currently running to finish
	shutdown.RegisterShutdownCallback(func() { grpcServerRegistrar.GracefulStop() })
	err := grpcServerRegistrar.Serve(tcpSocket)
	if err != nil {
		logging.LogErrorAndGracefulShutdown(logrus.WithField("", ""), err, "GRPC server closed unexpectedly")
	}
}

func init() {
	var err error
	tcpSocket, err = net.Listen("tcp", GRPC_LISTEN_ADDRESS)
	if err != nil {
		logging.LogErrorAndGracefulShutdown(logrus.WithField("", ""), err, "Could not make TCP socket for GRPC server")
	}
}
