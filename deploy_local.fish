#!/bin/fish

# For simplified development, run all containers as the current user
set -x UID (id -u)
set -x GID (id -g)

set -x COMPOSE_BAKE true
set -x NEXTJS_COMMAND start

docker compose --file ./docker-compose/up.yaml up --build