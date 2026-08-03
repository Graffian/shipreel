#!/bin/bash
set -e

cleanup() {
  echo "Shutting down..."
  kill $EXPRESS_PID 2>/dev/null
  exit 0
}
trap cleanup SIGINT SIGTERM

echo "Starting Express on port 4001..."
PORT=4001 node apps/server/dist/index.js &
EXPRESS_PID=$!

echo "Starting Next.js on port ${PORT:-4000}..."
cd apps/web
npx next start --port ${PORT:-4000}
