# TASK029 — Root Cause Analysis: Why Worker Never Consumes Jobs

## 1. Lifecycle Investigation & Evidence

### Lifecycle Tracing
1. `POST /projects/{id}/generate` -> Generates `taskId` (e.g., `gen-e51c828df053`), seeds initial task status, and pushes payload to queue.
2. **Redis Queue Name**: `queue:default` (used by both API `push_task` and Worker `pop_task`).
3. **Redis Configuration & URL**:
   - `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` (REST API client) or `REDIS_URL` (`redis://localhost:6379/0` fallback).
   - In production containers without local Redis server or configured Upstash REST tokens, standard Redis operations silently fail and fall back to local `_in_memory_cache`.
4. **Worker Process & Listener**:
   - Worker loop runs inside the main FastAPI process spawned via `@app.on_event("startup")` (`asyncio.create_task(worker_loop())`).
   - Listens to `queue:default` via `redis_manager.pop_task("default", 3)`.

---

## 2. Verification Questions & Answers

### Is the worker process running?
**YES** (as an in-process asyncio task initialized on FastAPI startup).

### Why did tasks remain permanently in `pending` instead of `running`?
1. **Missing `running` State Transition in Worker Handler**:
   - When `handle_generate_ai_site` dequeued a task, it immediately executed synchronous generation without broadcasting or writing `{"status": "running"}` to cache or database.
   - Polling clients querying `/tasks/{task_id}` during processing never received a `running` status payload.
2. **Synchronous Thread Blocking**:
   - `generate_website_schema` performed synchronous HTTP/AI logic directly inside the main asyncio event loop thread, blocking concurrent HTTP polling queries during generation execution cycles.
3. **Process/Memory Isolation in Cloud Container Runtimes**:
   - In production instances without centralized Redis connectivity, `_in_memory_cache` updates inside worker threads were isolated across process boundaries and ephemeral container lifecycles, causing status queries to return default `pending` fallbacks.

---

## 3. Implemented Fix

To permanently fix job consumption, status visibility, and multi-process persistence:

1. **Explicit `running` State Transition**: Updated `handle_generate_ai_site` in `apps/api/worker.py` to immediately write `status: running` upon task dequeuing.
2. **Async Event Loop Offloading**: Offloaded synchronous generation logic in `worker.py` to `asyncio.to_thread(generate_website_schema, prompt)` so main event loop HTTP handling is never blocked.
3. **Persistent Cloud Task Storage**: Integrated persistent PostgreSQL task status tracking (`TaskStatus` table) in `DatabaseManager` (`apps/api/database.py`), enabling zero-loss status queries across all multi-container production deployments.

---

## 4. Final Verified State Transition

```
pending
  ↓ (Job dequeued & picked up by worker thread)
running
  ↓ (Schema generation & database version snapshot complete)
completed
```
