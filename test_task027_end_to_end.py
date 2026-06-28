import urllib.request
import urllib.error
import json
import time
import io
import zipfile

BACKEND_URL = "https://qevora-api-production-016a.up.railway.app"
FRONTEND_URL = "https://qevora-app.vercel.app"

def make_req(url, method="GET", headers=None, data=None):
    if headers is None: headers = {}
    headers["User-Agent"] = "Task027Test/1.0"
    enc_data = None
    if data is not None:
        enc_data = json.dumps(data).encode("utf-8")
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=enc_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return {"status": resp.getcode(), "body": resp.read(), "headers": dict(resp.info())}
    except urllib.error.HTTPError as e:
        return {"status": e.code, "body": e.read(), "headers": dict(e.info())}
    except Exception as e:
        return {"status": 0, "body": str(e).encode("utf-8"), "headers": {}}

print("=== PHASE 4 & 5: LIVE END-TO-END VERIFICATION ===")

# 1. Wait for health check confirmation
print("Checking API readiness...")
for i in range(10):
    res = make_req(f"{BACKEND_URL}/health/ready")
    print(f"  Attempt {i+1} /health/ready -> Status {res['status']}")
    if res["status"] == 200:
        break
    time.sleep(5)

# 2. Create new user & authenticate
ts = int(time.time())
email = f"e2e_worker_{ts}@qevora-test.com"
password = "WorkerTestPassword123!"
name = "E2E Worker User"

signup_res = make_req(f"{BACKEND_URL}/auth/signup", method="POST", data={"email": email, "fullName": name, "password": password})
signup_data = json.loads(signup_res["body"].decode("utf-8")) if signup_res["status"] == 200 else {}
token = signup_data.get("access_token")
user_id = signup_data.get("userId")
print(f"User Signup -> Status: {signup_res['status']}, UserID: {user_id}, HasToken: {bool(token)}")

auth_headers = {"Authorization": f"Bearer {token}"}

# 3. Create Project
proj_res = make_req(f"{BACKEND_URL}/projects", method="POST", headers=auth_headers, data={"name": f"E2E Worker Project {ts}", "description": "Testing worker generation end-to-end"})
proj_data = json.loads(proj_res["body"].decode("utf-8")) if proj_res["status"] == 200 else {}
project_id = proj_data.get("id")
print(f"Project Creation -> Status: {proj_res['status']}, ProjectID: {project_id}")

# 4. Trigger AI Generation
gen_res = make_req(f"{BACKEND_URL}/projects/{project_id}/generate", method="POST", headers=auth_headers, data={"projectId": project_id, "prompt": "Create a high-converting Fintech SaaS landing page with dark mode, interactive charts, and Arabic support."})
gen_data = json.loads(gen_res["body"].decode("utf-8")) if gen_res["status"] == 200 else {}
task_id = gen_data.get("taskId")
print(f"Trigger Generation -> Status: {gen_res['status']}, TaskID: {task_id}")

# 5. Poll Task Endpoint for State Transition
task_states = []
completed = False
if task_id:
    print(f"Polling task {task_id}...")
    for poll_i in range(15):
        time.sleep(2)
        poll_res = make_req(f"{BACKEND_URL}/tasks/{task_id}", headers=auth_headers)
        poll_data = json.loads(poll_res["body"].decode("utf-8")) if poll_res["status"] == 200 else {}
        status = poll_data.get("status")
        task_states.append(status)
        print(f"  Poll {poll_i+1} (elapsed {(poll_i+1)*2}s) -> Task status: {status}")
        if status == "completed":
            completed = True
            print("  ✅ TASK COMPLETED SUCCESSFULLY!")
            break
        elif status == "failed":
            print(f"  ❌ TASK FAILED: {poll_data.get('error')}")
            break

# 6. Phase 5: Export Validation
export_success = False
zip_contents = []
if completed:
    print("\n--- PHASE 5: EXPORT VALIDATION ---")
    export_res = make_req(f"{BACKEND_URL}/projects/{project_id}/export/static", headers=auth_headers)
    print(f"Export Static -> Status: {export_res['status']}, ZIP Size: {len(export_res['body'])} bytes")
    if export_res["status"] == 200 and len(export_res["body"]) > 0:
        try:
            with zipfile.ZipFile(io.BytesIO(export_res["body"])) as z:
                zip_contents = z.namelist()
            print(f"  ✅ ZIP extraction successful! Files inside ({len(zip_contents)}): {zip_contents}")
            export_success = True
        except Exception as e:
            print(f"  ❌ ZIP extraction error: {e}")

report = {
    "user_id": user_id,
    "project_id": project_id,
    "task_id": task_id,
    "task_states": task_states,
    "completed": completed,
    "export_success": export_success,
    "zip_files": zip_contents
}

with open("task027_e2e_results.json", "w", encoding="utf-8") as f:
    json.dump(report, f, indent=2)

print("\n=== E2E TEST RUN COMPLETE ===")
