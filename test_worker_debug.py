import urllib.request
import json
import time

url = "https://qevora-api-production-016a.up.railway.app"

# 1. Signup
ts = int(time.time())
req = urllib.request.Request(f"{url}/auth/signup", data=json.dumps({"email": f"debug_{ts}@qevora.com", "fullName": "Debug", "password": "Password123!"}).encode("utf-8"), headers={"Content-Type": "application/json"})
resp = json.loads(urllib.request.urlopen(req).read())
token = resp["access_token"]
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

# 2. Project
req = urllib.request.Request(f"{url}/projects", data=json.dumps({"name": "Debug Proj"}).encode("utf-8"), headers=headers)
proj = json.loads(urllib.request.urlopen(req).read())
pid = proj["id"]

# 3. Generate
req = urllib.request.Request(f"{url}/projects/{pid}/generate", data=json.dumps({"projectId": pid, "prompt": "Fintech platform"}).encode("utf-8"), headers=headers)
gen = json.loads(urllib.request.urlopen(req).read())
tid = gen["taskId"]
print("Queued task:", tid)

# 4. Poll
for i in range(10):
    time.sleep(2)
    req = urllib.request.Request(f"{url}/tasks/{tid}", headers=headers)
    tresp = json.loads(urllib.request.urlopen(req).read())
    print(f"Poll {i+1}:", tresp)
    if tresp.get("status") in ["completed", "failed"]:
        break
