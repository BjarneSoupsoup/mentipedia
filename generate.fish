#!/bin/fish

# Run ./generate.fish for making stubs and artifacts (pre-build)

set -x UID (id -u)
set -x GID (id -g)

set -x COMPOSE_BAKE true
set -x NEXTJS_COMMAND build

docker compose --file ./docker-compose/generate.yaml up --build