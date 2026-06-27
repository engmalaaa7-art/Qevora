# Qevora SaaS Production Hardening Implementation Plan

This implementation plan details the strategy for moving the Qevora monorepo to a production-ready SaaS state, addressing Docker orchestration, CI/CD pipelines, security mitigations, caching/session states via Redis, background worker queues, SMTP email integration, testing coverage, documentation, and the final production audit.

---

## Phase 1: Docker Orchestration
We will create production-ready Docker containers for the microservices architecture.

1. **`apps/web/Dockerfile`**:
   - Multi-stage build for Next.js 15.
   - Stage 1: Dependency resolution and typescript compilation.
   - Stage 2: Production runner with minimized image footprint and standalone output optimizations.
2. **`apps/api/Dockerfile`**:
   - Production Python virtualenv runner for FastAPI.
   - Integrates Node.js runtime inside the Python container so the compiler subprocess (`packages/renderer/dist/compile-cli.js`) runs natively.
3. **`docker-compose.dev.yml`**:
   - Local workspace mounts for rapid development.
   - Ports: PostgreSQL (`5432`), Redis (`6379`), API (`8000`), Web (`3000`).
4. **`docker-compose.prod.yml`**:
   - Production configurations with health checks, memory limits, logging optimization, and restart policies.
   - Services: `postgres`, `redis`, `api` (API gateway), `web` (Next.js runner), `worker` (Python background worker task loop).

---

## Phase 2: CI/CD Pipeline
We will create GitHub Actions workflows to validate codebase integrity.

1. **`.github/workflows/ci.yml`**:
   - Spawns on PR/push to `main` and `develop`.
   - Steps:
     - Dependency install (`npm ci` / `pip install -r requirements.txt`).
     - Monorepo Linting (`npm run lint`).
     - Type checks (`npm run build` validation).
     - Test Suite Execution (Unit, Integration, Renderer tests).
     - Fail build on any non-zero exit code.
2. **Automatic Deploy Stage**:
   - Simulates deployment to cloud environments (e.g., AWS/GCP container registry pushing).

---

## Phase 3: Security Hardening & Environment Validation

1. **FastAPI Security Features**:
   - **Rate Limiting**: Custom Redis-based sliding window rate limiter to restrict high-frequency endpoint abuse.
   - **Refresh Tokens & httpOnly Cookies**: Safe session persistence via encrypted HTTP-only, secure, SameSite cookies.
   - **CORS Whitelist**: Domain restriction patterns.
   - **Security Headers**: Injects protection headers (HSTS, Content Security Policy, X-Frame-Options, X-Content-Type-Options).
2. **Next.js Security Features**:
   - CSRF protection checks.
   - Strict Content-Security-Policy (CSP) headers.
3. **Environment & Secrets Validation**:
   - Explicit environment variable validation on startup in both Next.js (`src/lib/config.ts`) and FastAPI (`config.py`).

---

## Phase 4: Production Monitoring & Diagnostics

1. **Structured Logging**:
   - Python `logging.config` structured JSON formatter for standard output logs.
2. **Request Tracking**:
   - Middleware to generate unique `X-Request-ID` UUID headers and propagate them through all logs.
3. **Health Endpoints**:
   - `/health` (liveness: returns 200 immediately).
   - `/health/ready` (readiness: tests PostgreSQL connection pool and Redis ping).

---

## Phase 5: Redis State Management & Caching

1. **Session & Auth Caching**:
   - Move active session maps to Redis.
2. **AI Rate Limiting & Version Caching**:
   - Store SiteSchema version numbers and responses to reduce duplicate LLM calls.
3. **Queue States**:
   - Store tasks for background generation/publishing.

---

## Phase 6: Background Worker Queue & Tasks
We will implement a custom task queue/worker script using Redis as the message broker.

1. **Heavy Task Delegation**:
   - AI Website Generation.
   - Static Compiler Publishing.
   - Export ZIP generation.
   - Custom Domain DNS validation.
2. **Architecture**:
   - `worker.py`: Background consumer process running loop, listening to `BLPOP` on Redis task list queue.

---

## Phase 7: SMTP Transactional Email
We will configure real transactional email support.

1. **Email Service (`apps/api/email_service.py`)**:
   - Uses `aiosmtplib` to connect to SMTP hosts.
   - Triggers:
     - User registration verification.
     - Password reset tokens.
     - Welcome onboarding emails.
     - Website published link completion details.

---

## Phase 8: Hardened Test Suite
We will implement automated verification suites.

1. **Backend Tests (`apps/api/tests/`)**:
   - FastAPI `TestClient` integrations for all endpoints.
2. **Accessibility & Compiler Tests**:
   - Extended unit tests in renderer.
3. **Minimum Code Coverage**: Enforce >= 80% coverage check scripts.

---

## Phase 9: Project Documentation
We will update and generate:
- API OpenAPISchema documentation.
- Architecture flowcharts.
- Deployment instructions.
- Developer onboarding checklists.

---

## Phase 10: Final Validation
Audit code for console.logs, hardcoded credentials, and localhost URLs. Complete final launch readiness report (`FINAL_PRODUCTION_AUDIT.md`).
