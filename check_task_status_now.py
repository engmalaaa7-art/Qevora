import urllib.request
import json
import time

BACKEND_URL = "https://qevora-api-production-016a.up.railway.app"

def check_task():
    ts = int(time.time())
    email = f"check_user_{ts}@qevora.com"
    signup_payload = json.dumps({"email": email, "password": "Password123!", "fullName": "Check User"}).encode("utf-8")
    req = urllib.request.Request(f"{BACKEND_URL}/auth/signup", data=signup_payload, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req) as resp:
            token = json.loads(resp.read().decode("utf-8"))["access_token"]
            headers = {"Authorization": f"Bearer {token}"}
            req = urllib.request.Request(f"{BACKEND_URL}/tasks/gen-7e80583c5524", headers=headers)
            with urllib.request.urlopen(req) as r2:
                print("Task Status Now:", json.loads(r2.read().decode("utf-8")))
    except Exception as e:
        print("Check failed:", e)

if __name__ == "__main__":
    check_task()
