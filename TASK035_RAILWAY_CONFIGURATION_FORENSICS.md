# TASK035 — Railway Configuration & Deployment Forensics Report

## 1. Railway Service Configuration (Phase 1)
* **Project ID**: `2fc2be11-7fa8-4eed-8328-66cba1383bf5`
* **Service ID / Name**: `qevora-api`
* **Environment Name**: `production`
* **Repository URL**: `https://github.com/engmalaaa7-art/Qevora`
* **Connected Git Branch**: `main`
* **Root Directory**: `/`
* **Dockerfile Path**: `apps/api/Dockerfile`
* **Builder Type**: `DOCKERFILE`
* **Start Command**: `python -m uvicorn main:app --host 0.0.0.0 --port 8000`
* **Auto Deploy Status**: `INACTIVE` (Webhooks disconnected / non-responsive to GitHub pushes).

---

## 2. Git SHA Comparison Audit (Phase 2)
* **Local Git HEAD SHA**: `e9d532840a12e23b49c04a742a0b1297e6411ab1`
* **GitHub Remote main SHA**: `e9d532840a12e23b49c04a742a0b1297e6411ab1`
* **Railway Deployed SHA**: `Legacy Image Artifact` (Missing committed `/__runtime_info` route).
* **SHA Match Finding**: `DOES NOT MATCH` (Railway runtime container is detached from remote branch updates).

---

## 3. Deployment History & Build Trigger Verification (Phase 3 & Phase 4)
* **Git Push Trigger Verification**: Executed multiple code commits (`73c5aa0`, `b02d0b8`, `e9d5328`) directly to `origin/main`.
* **Deployment Trigger Result**: Railway registered zero build events or deployment tasks following GitHub pushes.
* **Runtime Image Status (Phase 5)**: Railway continues executing a legacy cached image from a previous static deployment.

---

## 4. Single Root Cause Determination (Phase 6)

The root cause preventing deployment of the modified backend is: Repository integration is broken.
