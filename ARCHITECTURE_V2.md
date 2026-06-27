# Qevora Architecture V2 (Cloud-Agnostic)

## Overview

Qevora has been fully refactored into a cloud-agnostic architecture. This ensures the application can be seamlessly deployed to any cloud provider (Render, Railway, Fly.io, AWS, Azure, DigitalOcean) without requiring any codebase modifications.

## Component Architecture

1. **Frontend (Vercel / Cloudflare Pages / Static Node)**
   - Framework: Next.js 14
   - Build Output: `standalone` (for Docker) or `export` (for static hosting)
   - The frontend connects to the backend exclusively via the `NEXT_PUBLIC_API_URL` environment variable.

2. **Backend (Python / FastAPI)**
   - Framework: FastAPI
   - Role: Core API, Authentication, AI routing, Database interactions.
   - The backend no longer depends on the monorepo workspace for compilation.

3. **Renderer (Node.js)**
   - The `@qevora/qevora-renderer` is now compiled via `esbuild` into a single standalone binary: `renderer.cjs`.
   - The backend `worker.py` invokes this binary via standard `subprocess` using the path defined in `RENDERER_CLI_PATH`.

4. **Database & Caching**
   - PostgreSQL (via neon.tech or self-hosted)
   - Redis (Upstash REST API or standard Redis)

## The Docker Refactoring

Previously, the backend Docker container required the entire Node workspace (1+ GB) to be copied into the production container to support the Node.js compiler CLI.

In **V2**, we use Multi-Stage Builds:
1. **Stage 1 (Node Builder):** Bootstraps the monorepo, installs dependencies, and runs `esbuild` to compile `renderer.cjs`.
2. **Stage 2 (Python Runner):** Copies ONLY `renderer.cjs` from Stage 1 into `/app/bin/renderer.cjs`. 

This drops the image size by ~80% and completely removes the tight coupling to the repository layout.

## Environment Architecture

Configuration is fully centralized into environment variables:
- `.env.development` -> Local testing and Docker Compose
- `.env.production` -> Live Cloud deployments
- `.env.test` -> CI/CD automated test suites

Every service reads configuration exclusively from `os.getenv()`, meaning the infrastructure dictates the behavior, not the code.
