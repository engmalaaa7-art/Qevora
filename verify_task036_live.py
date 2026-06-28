import urllib.request
import json

BASE_URL = "https://qevora-api-production-016a.up.railway.app"

def verify_endpoints():
    endpoints = ["/health", "/health/live", "/health/ready"]
    results = {}
    for ep in endpoints:
        url = f"{BASE_URL}{ep}"
        req = urllib.request.Request(url)
        try:
            with urllib.request.urlopen(req) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                results[ep] = {"status": resp.status, "body": data}
                print(f"✔ {ep} -> HTTP {resp.status} : {data}")
        except Exception as e:
            results[ep] = {"error": str(e)}
            print(f"❌ {ep} -> Failed: {e}")
    with open("task036_health_results.json", "w") as f:
        json.dump(results, f, indent=2)

if __name__ == "__main__":
    verify_endpoints()
