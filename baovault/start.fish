#!/usr/bin/fish

# For production mode, the server should start with a persistent storage backend and also
# an explicit config

bao server -dev -dev-listen-address="0.0.0.0:8200" -dev-root-token-id="mentipedia"