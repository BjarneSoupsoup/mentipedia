#!/bin/fish

# For simplified development, run all containers as the current user
set -x UID (id -u)
set -x GID (id -g)

set -x COMPOSE_BAKE true

docker compose --file ./docker-dev/docker-compose.yaml up --build