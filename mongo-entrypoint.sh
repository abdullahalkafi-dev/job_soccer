#!/bin/bash
set -e

# Copy keyfile from temp location and set proper permissions
if [ -f /tmp/mongodb-keyfile ]; then
    cat /tmp/mongodb-keyfile > /data/mongodb-keyfile
    chmod 400 /data/mongodb-keyfile
    chown mongodb:mongodb /data/mongodb-keyfile
fi

# Execute the original docker-entrypoint.sh
exec docker-entrypoint.sh "$@"
