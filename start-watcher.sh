#!/bin/sh

echo "Waiting for files to be copied..."

# Wait for the required files to exist
MAX_WAIT=60
ELAPSED=0

while [ ! -f /app/watch-and-generate.js ] || [ ! -f /app/generate-slideshows.js ]; do
    if [ $ELAPSED -ge $MAX_WAIT ]; then
        echo "ERROR: Timeout waiting for files to be copied"
        ls -la /app/
        exit 1
    fi

    echo "Waiting for files... ($ELAPSED seconds)"
    sleep 2
    ELAPSED=$((ELAPSED + 2))
done

echo "Files found! Starting watcher..."
ls -la /app/*.js

exec node /app/watch-and-generate.js
