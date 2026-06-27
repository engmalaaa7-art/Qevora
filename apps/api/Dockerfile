# Stage 1: Build node CLI compiler
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
RUN npx turbo run build --filter=@qevora/qevora-renderer

# Stage 2: Production FastAPI runner
FROM python:3.12-slim AS runner
WORKDIR /app

# Install system dependencies, Node.js, and clean cache
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

# Copy node compiler and its compiled workspace dependencies
COPY --from=node-builder /app/package.json /app/package-lock.json /app/
COPY --from=node-builder /app/packages /app/packages
COPY --from=node-builder /app/node_modules /app/node_modules

# Copy python dependencies
COPY apps/api/requirements.txt ./apps/api/
RUN pip install --no-cache-dir -r apps/api/requirements.txt

# Copy backend source
COPY apps/api /app/apps/api

# Run uvicorn server from the correct working directory
WORKDIR /app/apps/api
EXPOSE 8000

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
