import urllib.request
import json
import time

BASE_URL = "https://qevora-api-production-016a.up.railway.app"

def run_forensics():
    ts = int(time.time())
    email = f"forensics_{ts}@qevora.com"
    password = "Password123!"
    full_name = "Task031 Forensics User"
    
    print("=== TASK031 RUNTIME FORENSICS EXECUTION ===")
    print("1. Creating user...")
    req = urllib.request.Request(f"{BASE_URL}/auth/signup", data=json.dumps({"email": email, "password": password, "fullName": full_name}).encode("utf-8"), headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        token = res["access_token"]
        print(f"   Token acquired.")

    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    print("2. Creating project...")
    req = urllib.request.Request(f"{BASE_URL}/projects", data=json.dumps({"name": f"Forensics Project {ts}"}).encode("utf-8"), headers=headers)
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        project_id = res["id"]
        print(f"   Project ID: {project_id}")

    print("3. Triggering AI generation...")
    req = urllib.request.Request(f"{BASE_URL}/projects/{project_id}/generate", data=json.dumps({"projectId": project_id, "prompt": "Autonomous Cybernetic Drone Landing Page"}).encode("utf-8"), headers=headers)
    start_t = time.time()
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        task_id = res["taskId"]
        print(f"   Task ID: {task_id}")

    print("\n4. Polling task status...")
    responses = []
    for i in range(1, 15):
        time.sleep(2)
        elapsed = time.time() - start_t
        req = urllib.request.Request(f"{BASE_URL}/tasks/{task_id}", headers=headers)
        try:
            with urllib.request.urlopen(req) as resp:
                t_res = json.loads(resp.read().decode("utf-8"))
                msg = f"Poll #{i:02d} ({elapsed:.1f}s) -> status: {t_res.get('status')} | full response: {t_res}"
                print(msg)
                responses.append(t_res)
                if t_res.get("status") in ["completed", "failed"]:
                    break
        except Exception as e:
            print(f"Poll #{i:02d} error: {e}")

if __name__ == "__main__":
    run_forensics()
