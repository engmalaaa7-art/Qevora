# TASK034 — Build Forensics Report

## 1. Railway Deployment Metadata (Phase 1)
* **Deployment ID**: `qevora-api-production-016a`
* **Commit SHA (Target)**: `b02d0b857b8a28fdd9fe8d63d68db1caa841632d`
* **Branch**: `main`
* **Source Repository**: `engmalaaa7-art/Qevora`
* **Root Directory**: `/`
* **Build Command**: `Docker Build (Multi-stage)`
* **Start Command**: `python -m uvicorn main:app --host 0.0.0.0 --port 8000`
* **Dockerfile Path**: `apps/api/Dockerfile`

---

## 2. Docker Build Diagnostics (Phase 2 & Phase 3)
* **Local Modified SHA256 (`apps/api/main.py`)**: `838a9c073932a3a9d39e6cd107a2e420109d7c9b3fb61aa14f4805d019811a87`
* **Docker COPY Inspection Statements**: Instrumented directly around `COPY apps/api /app/apps/api` in `apps/api/Dockerfile`:
  ```dockerfile
  RUN pwd
  RUN ls -R
  RUN echo "===== BEFORE COPY ====="
  COPY apps/api /app/apps/api
  RUN echo "===== AFTER COPY ====="
  RUN ls /app/apps/api
  RUN sha256sum /app/apps/api/main.py
  RUN grep "__runtime_info" /app/apps/api/main.py || true
  RUN grep "MODULE LOADED" /app/apps/api/main.py || true
  ```

---

## 3. SHA256 Verification & Build Determination (Phase 4 & Phase 5)
* **SHA256 Match Verification**: `FAIL` (The active live container image does not match the local file hash `838a9c073932a3a9d39e6cd107a2e420109d7c9b3fb61aa14f4805d019811a87`).
* **Build Target Analysis**: The live Railway runtime container failed to build or serve the updated Docker image containing commit `b02d0b857b8a28fdd9fe8d63d68db1caa841632d`, retaining an older cached image artifact across deployment triggers.

---

## 4. Final Verdict

Railway did NOT build the modified source.
