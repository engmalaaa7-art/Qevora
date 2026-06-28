import urllib.request
import json
import time

BASE_URL = "https://qevora-api-production-016a.up.railway.app"

def run_task033_query():
    print("=== TASK033 QUERYING /__runtime_info ===")
    url = f"{BASE_URL}/__runtime_info"
    req = urllib.request.Request(url)
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            print(f"HTTP {resp.status} OK")
            print(json.dumps(data, indent=2))
            with open("task033_runtime_info.json", "w") as f:
                json.dump(data, f, indent=2)
    except Exception as e:
        print(f"Query failed: {e}")

if __name__ == "__main__":
    run_task033_query()
