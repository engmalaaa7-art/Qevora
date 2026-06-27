# Qevora Docker Guide

## Multi-Stage Build Architecture

The `apps/api/Dockerfile` has been fully optimized using multi-stage builds to remove dependencies on the monorepo workspace for runtime.

### Stage 1: `node-builder`
- Uses `node:20-alpine`.
- Copies `package.json` and workspaces.
- Runs `npm ci` to bootstrap Turbo.
- Executes `npx turbo run build:cli --filter=@qevora/qevora-renderer` to use `esbuild` to compile a massive Next.js/React workspace into a **single 1.5MB standalone JavaScript file (`renderer.cjs`)**.

### Stage 2: `runner`
- Uses `python:3.12-slim`.
- Installs Python dependencies from `requirements.txt`.
- Installs basic `nodejs` from apt.
- **Crucial Step:** Copies `renderer.cjs` from the `node-builder` stage into `/app/bin/renderer.cjs`.
- No `node_modules`, no `packages/` folder, and no Turbo CLI exist in the final production image.

## Benefits
1. **Security:** No development dependencies or source code exist in the production API container.
2. **Size:** Container size reduced by ~80% as we drop 1GB+ of `node_modules`.
3. **Cloud-Agnosticism:** Because we don't rely on the Docker Context containing `packages/`, the container can now be built by ANY CI/CD platform cleanly.

## Running Locally

To test the production container locally:
```bash
docker build -t qevora-api -f apps/api/Dockerfile .
docker run -p 8000:8000 --env-file .env.production qevora-api
```
