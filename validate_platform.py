import requests
import sys
import json

BASE_URL = "http://localhost:8000"

def log(msg, status="INFO"):
    print(f"[{status}] {msg}")

def test_startup():
    log("Testing Startup & Health Endpoints...")
    r_docs = requests.get(f"{BASE_URL}/docs")
    assert r_docs.status_code == 200, f"/docs failed: {r_docs.status_code}"
    log("/docs returns 200 OK", "PASS")

    r_openapi = requests.get(f"{BASE_URL}/openapi.json")
    assert r_openapi.status_code == 200, f"/openapi.json failed: {r_openapi.status_code}"
    log("/openapi.json returns 200 OK", "PASS")

    r_health = requests.get(f"{BASE_URL}/health")
    assert r_health.status_code == 200, f"/health failed: {r_health.status_code}"
    data = r_health.json()
    assert data["status"] == "OK", f"Health status not OK: {data}"
    log(f"/health returns 200 OK with payload: {data}", "PASS")

if __name__ == "__main__":
    try:
        test_startup()
        log("All startup tests passed successfully!", "SUCCESS")
    except Exception as e:
        log(f"Test failed: {e}", "FAIL")
        sys.exit(1)
