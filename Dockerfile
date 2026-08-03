FROM node:22-bookworm-slim

# Install Chrome for Remotion/Puppeteer + FFmpeg
RUN apt-get update && apt-get install -y \
    chromium \
    ffmpeg \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV CHROME_PATH=/usr/bin/chromium

WORKDIR /app

# Copy package manifests first (Docker layer caching)
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/
COPY apps/server/package.json apps/server/
COPY packages/shared-types/package.json packages/shared-types/
COPY packages/video-engine/package.json packages/video-engine/
COPY packages/ai-pipeline/package.json packages/ai-pipeline/

RUN npm ci

COPY . .

# Create runtime directories
RUN mkdir -p apps/server/uploads apps/server/output

# Build shared-types and web (with production API base)
ENV NEXT_PUBLIC_API_URL=/api
RUN npm run build

# Build ai-pipeline (used at runtime by server)
RUN npm run build -w packages/ai-pipeline

# Build server (CommonJS output for Node.js native)
RUN npm run build -w apps/server

EXPOSE 10000

COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

ENV NODE_ENV=production
ENV EXPRESS_URL=http://localhost:4001

CMD ["bash", "/app/docker-entrypoint.sh"]
