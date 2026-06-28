import urllib.request
import json

BASE_URL = "https://qevora-api-production-016a.up.railway.app"

def inspect_openapi():
    print("=== INSPECTING OPENAPI ON LIVE RAILWAY ===")
    req = urllib.request.Request(f"{BASE_URL}/openapi.json")
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            paths = list(data.get("paths", {}).keys())
            print(f"HTTP {resp.status} OK")
            print("Title in OpenAPI:", data.get("info", {}).get("title"))
            print(f"Total paths registered ({len(paths)}):")
            for p in paths[:20]:
                print(" -", p)
            if "/__runtime_info" in paths:
                print("✔ /__runtime_info IS PRESENT IN OPENAPI!")
            else:
                print("❌ /__runtime_info IS MISSING FROM OPENAPI!")
    except Exception as e:
        print("Failed to fetch openapi.json:", e)

if __name__ == "__main__":
    inspect_openapi()
