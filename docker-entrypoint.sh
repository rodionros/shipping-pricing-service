#!/usr/bin/env sh
set -e

echo "Running DB migrations..."
bun dist/migrate.js

echo "Starting shipping pricing service..."
bun dist/index.js