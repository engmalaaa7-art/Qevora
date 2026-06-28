import urllib.request
import json
import time
import zipfile
import io
import os
import asyncpg
import asyncio

BASE_URL = "https://qevora-api-production-016a.up.railway.app"
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/qevora")

async def run_task030():
    ts = int(time.time())
    email = f"live_proof_{ts}@qevora.com"
    password = "Password123!"
    full_name = "Task030 Proof User"
    
    timeline = []
    def log(msg):
        entry = f"[{datetime.utcnow().strftime('%H:%M:%S.%f')[:-3]}] {msg}"
        print(entry)
        timeline.append(entry)

    log("=== PHASE 1: INITIALIZATION & TRIGGER ===")
    
    # 1. Signup
    signup_payload = json.dumps({"email": email, "password": password, "fullName": full_name}).encode("utf-8")
    req = urllib.request.Request(f"{BASE_URL}/auth/signup", data=signup_payload, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req) as resp:
            s_res = json.loads(resp.read().decode("utf-8"))
            token = s_res["access_token"]
            user_id = s_res.get("user", {}).get("id", "N/A")
            log(f"User created successfully. ID: {user_id}")
    except Exception as e:
        log(f"CRITICAL: Signup failed: {e}")
        return

    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    # 2. Create Project
    proj_payload = json.dumps({"name": f"Live Proof Project {ts}", "description": "Blackbox production proof project"}).encode("utf-8")
    req = urllib.request.Request(f"{BASE_URL}/projects", data=proj_payload, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            p_res = json.loads(resp.read().decode("utf-8"))
            project_id = p_res["id"]
            log(f"Project created successfully. ID: {project_id}")
    except Exception as e:
        log(f"CRITICAL: Project creation failed: {e}")
        return

    # 3. Trigger Generation
    gen_payload = json.dumps({"projectId": project_id, "prompt": "Luxury Autonomous EV Landing Page"}).encode("utf-8")
    req = urllib.request.Request(f"{BASE_URL}/projects/{project_id}/generate", data=gen_payload, headers=headers)
    start_time = time.time()
    try:
        with urllib.request.urlopen(req) as resp:
            g_res = json.loads(resp.read().decode("utf-8"))
            task_id = g_res["taskId"]
            log(f"AI Generation triggered successfully. Task ID: {task_id}")
    except Exception as e:
        log(f"CRITICAL: Generation trigger failed: {e}")
        return

    log("\n=== PHASE 2: POLLING TASK STATUS (Every 2s, up to 120s) ===")
    states_seen = []
    http_responses = []
    completed = False
    completion_time = None

    for poll_idx in range(1, 61):
        time.sleep(2)
        elapsed = time.time() - start_time
        req = urllib.request.Request(f"{BASE_URL}/tasks/{task_id}", headers=headers)
        try:
            with urllib.request.urlopen(req) as resp:
                t_res = json.loads(resp.read().decode("utf-8"))
                st = t_res.get("status", "unknown")
                log_line = f"Poll #{poll_idx:02d} ({elapsed:05.2f}s) -> HTTP {resp.status} | Status: '{st}' | Payload: {t_res}"
                log(log_line)
                http_responses.append({"poll": poll_idx, "elapsed_sec": round(elapsed, 2), "status_code": resp.status, "response": t_res})
                
                if st not in states_seen:
                    states_seen.append(st)
                
                if st == "completed":
                    completed = True
                    completion_time = elapsed
                    log(f"🎉 TASK REACHED 'completed' STATE IN {completion_time:.2f} SECONDS!")
                    break
                elif st == "failed":
                    log(f"❌ TASK FAILED: {t_res.get('error')}")
                    break
        except Exception as e:
            log(f"Poll #{poll_idx:02d} Exception: {e}")
            http_responses.append({"poll": poll_idx, "elapsed_sec": round(elapsed, 2), "error": str(e)})

    if not completed:
        log("\n❌ STOPPING IMMEDIATELY: Task did not reach 'completed' state within polling window.")
        log(f"States observed: {' -> '.join(states_seen)}")
        with open("task030_output.json", "w") as f:
            json.dump({"completed": False, "timeline": timeline, "http_responses": http_responses, "states_seen": states_seen}, f, indent=2)
        return

    log("\n=== PHASE 3: EXPORT STATIC SITE VERIFICATION ===")
    req = urllib.request.Request(f"{BASE_URL}/projects/{project_id}/export/static", headers=headers)
    export_proof = {}
    try:
        with urllib.request.urlopen(req) as resp:
            zip_bytes = resp.read()
            zip_size = len(zip_bytes)
            log(f"Static Export HTTP {resp.status} OK. Received {zip_size} bytes ({zip_size/1024:.2f} KB).")
            
            z = zipfile.ZipFile(io.BytesIO(zip_bytes))
            file_list = z.namelist()
            log(f"ZIP Files ({len(file_list)} total): {file_list[:10]}")
            
            has_index = "index.html" in file_list or any(f.endswith("index.html") for f in file_list)
            log(f"Verification - index.html present: {has_index}")
            
            export_proof = {
                "status_code": resp.status,
                "zip_size_bytes": zip_size,
                "file_count": len(file_list),
                "has_index": has_index,
                "sample_files": file_list[:5]
            }
    except Exception as e:
        log(f"Export verification failed: {e}")

    log("\n=== PHASE 4: DIRECT POSTGRESQL VERIFICATION ===")
    db_proof = {}
    try:
        clean_url = DATABASE_URL.split("?")[0]
        conn = await asyncpg.connect(clean_url)
        row = await conn.fetchrow('SELECT * FROM "TaskStatus" WHERE id = $1', task_id)
        if row:
            log(f"Database TaskStatus Row Found: ID={row['id']}, Status={row['status']}, UpdatedAt={row['updatedAt']}")
            payload_db = json.loads(row['payload']) if isinstance(row['payload'], str) else dict(row['payload'])
            log(f"Database Stored Payload Status: {payload_db.get('status')}")
            db_proof = {
                "row_exists": True,
                "db_status": row['status'],
                "updated_at": str(row['updatedAt']),
                "payload_status": payload_db.get('status')
            }
        else:
            log("❌ TaskStatus row not found in PostgreSQL!")
            db_proof = {"row_exists": False}
        await conn.close()
    except Exception as e:
        log(f"Database query failed: {e}")
        db_proof = {"error": str(e)}

    with open("task030_output.json", "w") as f:
        json.dump({
            "completed": completed,
            "user_id": user_id,
            "project_id": project_id,
            "task_id": task_id,
            "completion_time_sec": completion_time,
            "states_seen": states_seen,
            "timeline": timeline,
            "http_responses": http_responses,
            "export_proof": export_proof,
            "db_proof": db_proof
        }, f, indent=2)

if __name__ == "__main__":
    from datetime import datetime
    asyncio.run(run_task030())
