#!/bin/bash
set -e

cleanup() {
  echo "Shutting down..."
  kill $EXPRESS_PID 2>/dev/null
  exit 0
}
trap cleanup SIGINT SIGTERM

echo "Starting Express on port 4001..."
PORT=4001 npx tsx apps/server/src/index.ts &
EXPRESS_PID=$!

sleep 2

echo "Starting Next.js on port 4000..."
cd apps/web
npx next start --port 4000
