import urllib.request
import json
import time

url = "https://qevora-api-production-016a.up.railway.app"

# Signup new test user
ts = int(time.time())
req = urllib.request.Request(f"{url}/auth/signup", data=json.dumps({"email": f"worker_check_{ts}@qevora.com", "fullName": "Worker Check", "password": "Password123!"}).encode("utf-8"), headers={"Content-Type": "application/json"})
resp = json.loads(urllib.request.urlopen(req).read())
token = resp["access_token"]
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

# Create Project
req = urllib.request.Request(f"{url}/projects", data=json.dumps({"name": f"Check Project {ts}"}).encode("utf-8"), headers=headers)
proj = json.loads(urllib.request.urlopen(req).read())
pid = proj["id"]

# Trigger Generation
req = urllib.request.Request(f"{url}/projects/{pid}/generate", data=json.dumps({"projectId": pid, "prompt": "Luxury Hotel Landing Page"}).encode("utf-8"), headers=headers)
gen = json.loads(urllib.request.urlopen(req).read())
tid = gen["taskId"]
print(f"Queued generation task: {tid} for project {pid}")

for i in range(15):
    time.sleep(2)
    req = urllib.request.Request(f"{url}/tasks/{tid}", headers=headers)
    tresp = json.loads(urllib.request.urlopen(req).read())
    print(f"Poll {i+1} (elapsed {(i+1)*2}s): {tresp}")
    if tresp.get("status") in ["completed", "failed"]:
        break
