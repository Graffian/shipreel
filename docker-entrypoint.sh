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

# Wait for Express to be ready (up to 30s)
set +e
echo "Waiting for Express to be ready..."
for i in $(seq 1 30); do
  node -e "const h=require('http');h.get('http://localhost:4001/api/health',r=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>process.exit(d.includes('ok')?0:1))}).on('error',()=>process.exit(1))" 2>/dev/null
  if [ $? -eq 0 ]; then
    echo "Express is ready (pid $EXPRESS_PID)"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "Express failed to start within 30s"
    exit 1
  fi
  sleep 1
done
set -e

echo "Starting Next.js on port 4000..."
cd apps/web
npx next start --port 4000
