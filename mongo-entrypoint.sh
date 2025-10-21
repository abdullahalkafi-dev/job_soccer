#!/bin/bash
set -e

# Fix keyfile permissions
if [ -f /data/mongodb-keyfile ]; then
    chmod 400 /data/mongodb-keyfile
    chown mongodb:mongodb /data/mongodb-keyfile
fi

# Execute the original docker entrypoint
exec docker-entrypoint.sh "$@"
