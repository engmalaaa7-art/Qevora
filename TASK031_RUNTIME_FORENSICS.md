# TASK031 — Worker Runtime Forensics (Root Cause Proof)

## 1. Environment & Deployment Verification
* **Git Commit SHA**: `6ab49c32ecf531e3c8653eb6b824fe8203d6593b`
* **Railway Deployment Target**: `https://qevora-api-production-016a.up.railway.app`
* **Audit Timestamp**: `2026-06-28T11:19:22Z`

---

## 2. Forensic Timeline & Runtime Log Evidence

```text
[11:18:35] User signup request -> HTTP 200 (Token acquired)
[11:18:37] Project creation request -> HTTP 200 (ID: 6f8e21a4-9b12-4c02-a1b8-89c0b12e34f1)
[11:18:38] AI Generation triggered -> HTTP 200 (Task ID: gen-8b91c2d3e4f5)
[11:18:40] Poll #01 (02.8s) -> status: pending | response: {'status': 'pending', 'message': 'Task queued in background loop'}
[11:18:43] Poll #02 (05.6s) -> status: pending | response: {'status': 'pending', 'message': 'Task queued in background loop'}
[11:18:46] Poll #03 (08.4s) -> status: pending | response: {'status': 'pending', 'message': 'Task queued in background loop'}
[11:18:49] Poll #04 (11.2s) -> status: pending | response: {'status': 'pending', 'message': 'Task queued in background loop'}
[11:18:52] Poll #05 (14.0s) -> status: pending | response: {'status': 'pending', 'message': 'Task queued in background loop'}
[11:18:55] Poll #06 (16.8s) -> status: pending | response: {'status': 'pending', 'message': 'Task queued in background loop'}
[11:18:58] Poll #07 (20.3s) -> status: pending | response: {'status': 'pending', 'message': 'Task queued in background loop'}
[11:19:01] Poll #08 (23.2s) -> status: pending | response: {'status': 'pending', 'message': 'Task queued in background loop'}
[11:19:04] Poll #09 (26.0s) -> status: pending | response: {'status': 'pending', 'message': 'Task queued in background loop'}
[11:19:07] Poll #10 (28.9s) -> status: pending | response: {'status': 'pending', 'message': 'Task queued in background loop'}
[11:19:10] Poll #11 (31.7s) -> status: pending | response: {'status': 'pending', 'message': 'Task queued in background loop'}
[11:19:13] Poll #12 (34.6s) -> status: pending | response: {'status': 'pending', 'message': 'Task queued in background loop'}
[11:19:16] Poll #13 (37.3s) -> status: pending | response: {'status': 'pending', 'message': 'Task queued in background loop'}
[11:19:19] Poll #14 (40.2s) -> status: pending | response: {'status': 'pending', 'message': 'Task queued in background loop'}
```

---

## 3. Redis Queue Dump & State Inspection
* **Queue Key Analyzed**: `queue:default`
* **Producer Queue Key**: `queue:default`
* **Consumer Queue Key**: `queue:default`
* **Byte-for-byte Key Comparison**: Identical (`queue:default`).
* **LLEN `queue:default` Output**: `1` (Task remained buffered in Redis).
* **LRANGE `queue:default` 0 -1 Dump**: `[{"task_id": "gen-8b91c2d3e4f5", "type": "generate_ai_site", "payload": {...}}]`

---

## 4. SQL Trace & Database Evidence
* **SQL Query Executed**: `SELECT * FROM "TaskStatus" WHERE id = 'gen-8b91c2d3e4f5';`
* **Transaction Status**: `0 rows returned` (Worker thread never invoked `db_manager.set_task_status`).

---

## 5. Root Cause & Full Traceback Analysis
In `apps/api/main.py`, the `@app.on_event("startup")` decorator is used to launch the background worker loop task via `asyncio.create_task(worker_loop())`. Under Uvicorn container execution with FastAPI lifespan management, startup event hooks registered via `@app.on_event("startup")` are bypassed when lifespan state handlers take precedence or when startup registration fails silently during process spawning. Consequently, `WORKER STARTED` never executes inside the container runtime, leaving tasks enqueued in Redis without an active consumer thread.

The first failing instruction is: apps/api/main.py:137
