# Stage 1: Build standalone node CLI compiler
FROM node:20-alpine AS node-builder
WORKDIR /app

COPY package.json package-lock.json tsconfig.json turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/schemas/package.json ./packages/schemas/
COPY packages/shared/package.json ./packages/shared/
COPY packages/design-system/package.json ./packages/design-system/
COPY packages/ui/package.json ./packages/ui/
COPY packages/renderer/package.json ./packages/renderer/
COPY packages/ai-engine/package.json ./packages/ai-engine/

RUN npm ci

COPY packages ./packages
# Using the new esbuild standalone command
RUN npx turbo run build:cli --filter=@qevora/qevora-renderer

# Stage 2: Production FastAPI runner
FROM python:3.12-slim AS runner
WORKDIR /app

# Install system dependencies, Node.js (for the CLI binary), and clean cache
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Setup python environment
ENV PYTHONUNBUFFERED=1
ENV PORT=8000
# Cloud-Agnostic mapping for the renderer binary
ENV RENDERER_CLI_PATH=/app/bin/renderer.cjs

# Copy python dependencies
COPY apps/api/requirements.txt ./apps/api/
RUN pip install --no-cache-dir -r apps/api/requirements.txt

# Copy ONLY the standalone compiled node compiler (No node_modules or workspace needed)
COPY --from=node-builder /app/packages/renderer/dist/renderer.cjs /app/bin/renderer.cjs

# Copy backend source
COPY apps/api /app/apps/api

# Run uvicorn server from the correct working directory using shell form for dynamic PORT expansion
WORKDIR /app/apps/api
EXPOSE ${PORT:-8000}

CMD ["sh", "-c", "python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
