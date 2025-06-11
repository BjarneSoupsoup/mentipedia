package email

//go:generate protoc --go_out=./generated --go_opt=paths=source_relative --go-grpc_out=./generated --go-grpc_opt=paths=source_relative -I ../../../common/interface confirmationEmail.proto
func RegisterSendEmailTask() (res string) {
	res = "s"
	return
}
