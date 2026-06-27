# Qevora Infrastructure Topography

## Core Services

### 1. API Service (`qevora-api`)
- **Runtime:** Python 3.12 (FastAPI) + Node 20 (Renderer Binary)
- **Containerization:** Yes (Docker Multi-stage)
- **Scaling:** Stateless. Can be horizontally scaled infinitely.
- **Role:** Handles all API requests, authentication, DB orchestration, and synchronous LLM generation.

### 2. Background Worker (`qevora-worker`)
- **Runtime:** Python 3.12 (Asyncio Loop) + Node 20 (Renderer Binary)
- **Containerization:** Yes (Uses the same Docker image as API, different CMD: `python worker.py`)
- **Scaling:** Stateless. Scale based on queue depth.
- **Role:** Processes asynchronous heavy tasks (AI generation, headless site compilation, email dispatching, custom domain verification) from Redis queues.

### 3. Frontend Service (`qevora-web`)
- **Runtime:** Node 20 (Next.js Standalone) or Static Edge Network
- **Containerization:** Optional (Docker or Vercel Edge)
- **Role:** React User Interface.

## Backing Services

### PostgreSQL (Database)
- **Type:** Relational
- **Usage:** Stores users, projects, custom domains, schemas, and analytics.
- **Production Spec:** Neon Serverless Postgres with Connection Pooling (`pgbouncer`).

### Redis (Cache & Message Broker)
- **Type:** In-memory KV
- **Usage:** API Rate limiting, caching LLM responses, caching schemas, and Pub/Sub queue for `qevora-worker`.
- **Production Spec:** Upstash Serverless Redis (REST API) or Standard Redis 7.

### Cloudinary (Blob Storage)
- **Type:** CDN & Object Storage
- **Usage:** Image uploads, user avatars, generated AI assets.

## CI/CD Pipeline
- **Orchestration:** GitHub Actions (`ci-cd.yml`)
- **Flow:**
  1. Push to `main`.
  2. GitHub Actions runs Turbo linting, TS checks, and pytest.
  3. GitHub Actions builds the Docker images.
  4. Platform webhooks (Railway/Render) trigger new deployments.
