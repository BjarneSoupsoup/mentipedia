# Image capable of running go generate

FROM golang:1.24.4-bullseye

RUN go install golang.org/x/tools/cmd/stringer@v0.34.0  && \
    go install google.golang.org/protobuf/cmd/protoc-gen-go@v1.36.6 && \
    go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.5.1

WORKDIR /protobuf

RUN apt update -y && apt install -y curl unzip

ARG PROTOBUF_VERSION=30.2

# Install protobuf
RUN curl -LO https://github.com/protocolbuffers/protobuf/releases/download/v${PROTOBUF_VERSION}/protoc-${PROTOBUF_VERSION}-linux-x86_64.zip && \
    unzip protoc-${PROTOBUF_VERSION}-linux-x86_64.zip -d . && \
    cp ./bin/protoc /usr/local/bin && rm -rf *

# Make necessary binaries public to unprivileged users

RUN ln -s /usr/local/go/bin/go /usr/local/bin/go && \
    ln -s /go/bin/stringer /usr/local/bin/stringer && \
    ln -s /go/bin/protoc-gen-go /usr/local/bin/protoc-gen-go && \
    ln -s /go/bin/protoc-gen-go-grpc /usr/local/bin/protoc-gen-go-grpc

# Fix issues with cache permission
RUN mkdir /go_build_cache && chmod -R 777 /go_build_cache /go

WORKDIR /go-backend

ENTRYPOINT [ "sh", "-c", "GOCACHE=/go_build_cache go generate ./..." ]