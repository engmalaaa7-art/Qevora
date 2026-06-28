import urllib.request
import json
import time

BASE_URL = "https://qevora-api-production-016a.up.railway.app"

def run_task032_trigger():
    ts = int(time.time())
    email = f"startup_proof_{ts}@qevora.com"
    password = "Password123!"
    full_name = "Task032 Proof User"
    
    print("=== TASK032 EXECUTING SINGLE GENERATION TRIGGER ===")
    req = urllib.request.Request(f"{BASE_URL}/auth/signup", data=json.dumps({"email": email, "password": password, "fullName": full_name}).encode("utf-8"), headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        token = res["access_token"]
        print("User created & authenticated.")

    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    req = urllib.request.Request(f"{BASE_URL}/projects", data=json.dumps({"name": f"Startup Proof {ts}"}).encode("utf-8"), headers=headers)
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        project_id = res["id"]
        print(f"Project created: {project_id}")

    req = urllib.request.Request(f"{BASE_URL}/projects/{project_id}/generate", data=json.dumps({"projectId": project_id, "prompt": "Luxury Resort Landing Page"}).encode("utf-8"), headers=headers)
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        task_id = res["taskId"]
        print(f"Generation triggered. Task ID: {task_id}")

if __name__ == "__main__":
    run_task032_trigger()
