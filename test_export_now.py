import urllib.request
import json
import zipfile
import io

BACKEND_URL = "https://qevora-api-production-016a.up.railway.app"

def test_export():
    # Signup fresh user
    signup_payload = json.dumps({"email": "export_test_user@qevora.com", "password": "Password123!", "fullName": "Export User"}).encode("utf-8")
    req = urllib.request.Request(f"{BACKEND_URL}/auth/signup", data=signup_payload, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as resp:
        token = json.loads(resp.read().decode("utf-8"))["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test export on completed project 0a9423e2-7bf9-4577-a232-70063b9f02eb
        project_id = "0a9423e2-7bf9-4577-a232-70063b9f02eb"
        req = urllib.request.Request(f"{BACKEND_URL}/projects/{project_id}/export/static", headers=headers)
        with urllib.request.urlopen(req) as r2:
            zip_bytes = r2.read()
            print(f"HTTP {r2.status} OK! ZIP size: {len(zip_bytes)} bytes")
            z = zipfile.ZipFile(io.BytesIO(zip_bytes))
            print("ZIP Contents:", z.namelist())

if __name__ == "__main__":
    test_export()
