#!/bin/fish

if test -f ./dev_secrets.fish
    source ./dev_secrets.fish
else
    echo "Seems dev_secrets.fish is not present. Dev mode will work without features that require secrets (like the Gmail API)"
end

# For simplified development, run all containers as the current user
set -x UID (id -u)
set -x GID (id -g)

set -x COMPOSE_BAKE true
set -x NEXTJS_COMMAND dev
set -x USER_DB_PASSWORD_PEPPER mentipedia
set -x GMAIL_SENDER_ADDRESS mentipedia.notify@gmail.com
set -x GMAIL_SENDER_NAME Mentipedia
# For redirects from email message to site
set -x FORUM_DOMAIN_ORIGIN http://localhost:10001
set -x PGSQL_CONNECTION_STRING postgresql://mentipedia_pgsql_test_dev:mentipedia@postgresdb/mentipedia?connect_timeout=60
set -x BAO_ADDR http://0.0.0.0:8200


docker compose --file ./docker-compose/up.yaml up --build