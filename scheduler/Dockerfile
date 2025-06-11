FROM golang:1.24.4-bullseye AS builder

WORKDIR /build

RUN apt update && apt install -y sqlite3 libsqlite3-dev build-essential
RUN go install golang.org/x/tools/cmd/stringer@latest

COPY . ./

RUN CGO_ENABLED=1 go build -ldflags='-s -w -extldflags "-static"' -o scheduler ./scheduler.go



FROM debian:bullseye-slim

WORKDIR /scheduler

COPY --from=builder /build/scheduler .

ENTRYPOINT [ "./scheduler" ]
