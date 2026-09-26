# --- Backend Dockerfile ---
# Base image: Debian "slim" keeps the image smaller than the default node:20
FROM node:20-bookworm-slim

# Install a real Chromium browser + the fonts it needs to render PDFs correctly.
# We use apt instead of letting Puppeteer download its own copy: apt resolves
# all the shared-library dependencies automatically, which is exactly the kind
# of environment mismatch that caused the Chromium headaches on Render.
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    fonts-liberation \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Tell Puppeteer: don't download your own Chromium, use this one instead.
ENV PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Copy only the manifest files first. Docker caches layers - as long as
# package.json/package-lock.json don't change, this layer (and the slow
# npm install) is reused on rebuilds instead of running again.
COPY package*.json ./
RUN npm install --omit=dev

# Now copy the actual source code (changes far more often than dependencies)
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
