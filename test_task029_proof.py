import urllib.request
import json
import time

BASE_URL = "https://qevora-api-production-016a.up.railway.app"

def test_transitions():
    ts = int(time.time())
    email = f"task029_user_{ts}@qevora.com"
    password = "Password123!"
    full_name = "Task029 Proof User"
    
    print("=== TASK029 LIVE STATE TRANSITION TEST ===")
    
    # Signup
    req = urllib.request.Request(f"{BASE_URL}/auth/signup", data=json.dumps({"email": email, "password": password, "fullName": full_name}).encode("utf-8"), headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        token = res["access_token"]
        print(f"Token acquired successfully.")

    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    # Create Project
    req = urllib.request.Request(f"{BASE_URL}/projects", data=json.dumps({"name": f"Transition Project {ts}"}).encode("utf-8"), headers=headers)
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        project_id = res["id"]
        print(f"Project Created: {project_id}")

    # Trigger Generation
    req = urllib.request.Request(f"{BASE_URL}/projects/{project_id}/generate", data=json.dumps({"projectId": project_id, "prompt": "Luxury Tech Startup Landing Page"}).encode("utf-8"), headers=headers)
    start_t = time.time()
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        task_id = res["taskId"]
        print(f"Generation Queued: Task ID {task_id}")

    states_seen = []
    log_history = []
    
    for i in range(40):
        time.sleep(1.5)
        elapsed = time.time() - start_t
        req = urllib.request.Request(f"{BASE_URL}/tasks/{task_id}", headers=headers)
        try:
            with urllib.request.urlopen(req) as resp:
                t_res = json.loads(resp.read().decode("utf-8"))
                st = t_res.get("status")
                entry = f"Poll {i+1} ({elapsed:.1f}s) -> status: '{st}' | response: {t_res}"
                print(entry)
                log_history.append(entry)
                if st and st not in states_seen:
                    states_seen.append(st)
                if st == "completed":
                    print(f"🎉 SUCCESS! Task reached 'completed' state in {elapsed:.2f}s!")
                    break
                elif st == "failed":
                    print(f"❌ FAILED! Task error: {t_res.get('error')}")
                    break
        except Exception as e:
            print(f"Poll request exception: {e}")

    print("\nState transitions observed:", " -> ".join(states_seen))
    with open("task029_proof_results.json", "w") as f:
        json.dump({"states_seen": states_seen, "log_history": log_history}, f, indent=2)

if __name__ == "__main__":
    test_transitions()
