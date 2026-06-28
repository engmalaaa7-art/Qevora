import urllib.request
import json
import time
import zipfile
import io
import os

BASE_URL = "https://qevora-api-production-016a.up.railway.app"

def run_proof():
    ts = int(time.time())
    email = f"proof_user_{ts}@qevora.com"
    password = "Password123!"
    full_name = "Task028 Production Proof User"
    
    logs = []
    def log(msg):
        print(msg)
        logs.append(msg)

    log("=== TASK028 LIVE RAILWAY PRODUCTION PROOF ===")
    
    # Step 1 & 2: Signup & Login
    signup_data = json.dumps({"email": email, "password": password, "fullName": full_name}).encode("utf-8")
    req = urllib.request.Request(f"{BASE_URL}/auth/signup", data=signup_data, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req) as resp:
            s_res = json.loads(resp.read().decode("utf-8"))
            token = s_res["access_token"]
            user_id = s_res.get("user", {}).get("id")
            log(f"1 & 2. Signup/Login Success. User ID: {user_id}")
    except Exception as e:
        log(f"Signup/Login Failed: {e}")
        return False, logs, None

    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    # Step 3: Create Project
    proj_data = json.dumps({"name": f"Proof Project {ts}", "description": "Production verification project"}).encode("utf-8")
    req = urllib.request.Request(f"{BASE_URL}/projects", data=proj_data, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            p_res = json.loads(resp.read().decode("utf-8"))
            project_id = p_res["id"]
            log(f"3. Project Created. ID: {project_id}")
    except Exception as e:
        log(f"Project Creation Failed: {e}")
        return False, logs, None

    # Step 4: Trigger Generation
    gen_data = json.dumps({"projectId": project_id, "prompt": "Modern AI SaaS Landing Page with dark mode"}).encode("utf-8")
    req = urllib.request.Request(f"{BASE_URL}/projects/{project_id}/generate", data=gen_data, headers=headers)
    queue_start_time = time.time()
    try:
        with urllib.request.urlopen(req) as resp:
            g_res = json.loads(resp.read().decode("utf-8"))
            task_id = g_res["taskId"]
            log(f"4. Generation Triggered. Task ID: {task_id}")
    except Exception as e:
        log(f"Generation Trigger Failed: {e}")
        return False, logs, None

    # Step 5: Poll Task Status
    log(f"5. Polling Task {task_id}...")
    states_seen = []
    completed = False
    completion_time = None

    for i in range(30):
        time.sleep(2)
        req = urllib.request.Request(f"{BASE_URL}/tasks/{task_id}", headers=headers)
        try:
            with urllib.request.urlopen(req) as resp:
                t_res = json.loads(resp.read().decode("utf-8"))
                status = t_res.get("status")
                log(f"   Poll {i+1} (elapsed {int(time.time() - queue_start_time)}s) -> Status: {status}, Response: {t_res}")
                if status not in states_seen:
                    states_seen.append(status)
                if status == "completed":
                    completed = True
                    completion_time = time.time() - queue_start_time
                    log(f"   Task completed in {completion_time:.2f} seconds!")
                    break
                elif status == "failed":
                    log(f"   Task failed with error: {t_res.get('error')}")
                    break
        except Exception as e:
            log(f"   Poll request failed: {e}")

    if not completed:
        log("❌ STOPPING: Task did not reach 'completed' state.")
        return False, logs, None

    # Step 6: Export Static ZIP
    log("6. Calling GET /projects/{id}/export/static ...")
    req = urllib.request.Request(f"{BASE_URL}/projects/{project_id}/export/static", headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            zip_bytes = resp.read()
            zip_size = len(zip_bytes)
            log(f"   Export Success! HTTP {resp.status}, ZIP Size: {zip_size} bytes ({zip_size/1024:.2f} KB)")
            
            # Verify ZIP contents
            z = zipfile.ZipFile(io.BytesIO(zip_bytes))
            file_list = z.namelist()
            log(f"   ZIP Contents ({len(file_list)} files): {file_list}")
            
            has_index = any("index.html" in f for f in file_list)
            log(f"   - index.html verified: {has_index}")
            
            # Extract to local scratch directory for inspection
            out_dir = os.path.join(os.getcwd(), "scratch", f"export_{project_id}")
            os.makedirs(out_dir, exist_ok=True)
            z.extractall(out_dir)
            log(f"   ZIP extracted to {out_dir}")
            
            summary = {
                "user_id": user_id,
                "project_id": project_id,
                "task_id": task_id,
                "states_seen": states_seen,
                "queue_to_completion_sec": completion_time,
                "zip_size_bytes": zip_size,
                "file_list": file_list,
                "has_index": has_index
            }
            return True, logs, summary
    except Exception as e:
        log(f"Export Failed: {e}")
        return False, logs, None

if __name__ == "__main__":
    success, logs, summary = run_proof()
    with open("task028_results.json", "w") as f:
        json.dump({"success": success, "summary": summary, "logs": logs}, f, indent=2)
