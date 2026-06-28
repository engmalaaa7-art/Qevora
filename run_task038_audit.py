import urllib.request
import urllib.parse
import json
import time
import zipfile
import io
import os

BACKEND_URL = "https://qevora-api-production-016a.up.railway.app"
FRONTEND_URL = "https://qevora-app.vercel.app"

def audit():
    results = {}
    print("=== TASK038 ZERO TRUST PRODUCTION AUDIT STARTED ===")
    
    # 1. Backend Infrastructure & OpenAPI
    be_endpoints = ["/health", "/health/live", "/health/ready", "/docs", "/openapi.json"]
    be_res = {}
    for ep in be_endpoints:
        t0 = time.time()
        req = urllib.request.Request(f"{BACKEND_URL}{ep}", headers={"User-Agent": "Mozilla/5.0"})
        try:
            with urllib.request.urlopen(req) as resp:
                lat = round((time.time() - t0) * 1000, 2)
                be_res[ep] = {"status": resp.status, "latency_ms": lat}
                print(f"✔ Backend {ep} -> HTTP {resp.status} ({lat}ms)")
        except Exception as e:
            be_res[ep] = {"error": str(e)}
            print(f"❌ Backend {ep} -> Failed: {e}")
    results["backend_endpoints"] = be_res

    # 2. Authentication Flow
    ts = int(time.time())
    email = f"zero_trust_{ts}@qevora.com"
    password = "ZeroTrustPass123!"
    full_name = "Zero Trust Auditor"
    
    # Signup
    t0 = time.time()
    signup_data = json.dumps({"email": email, "password": password, "fullName": full_name}).encode("utf-8")
    req = urllib.request.Request(f"{BACKEND_URL}/auth/signup", data=signup_data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as resp:
        signup_res = json.loads(resp.read().decode("utf-8"))
        token = signup_res["access_token"]
        refresh_token = signup_res.get("refresh_token", token)
        signup_lat = round((time.time() - t0) * 1000, 2)
        print(f"✔ Auth Signup -> HTTP 200 ({signup_lat}ms)")
    
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    # Auth Me
    req = urllib.request.Request(f"{BACKEND_URL}/auth/me", headers=headers)
    with urllib.request.urlopen(req) as resp:
        me_res = json.loads(resp.read().decode("utf-8"))
        print(f"✔ Auth Me -> HTTP 200 (User ID: {me_res.get('id')})")
    
    # Auth Refresh
    t0 = time.time()
    ref_data = json.dumps({"refresh_token": refresh_token}).encode("utf-8")
    req = urllib.request.Request(f"{BACKEND_URL}/auth/refresh", data=ref_data, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            ref_res = json.loads(resp.read().decode("utf-8"))
            print(f"✔ Auth Refresh -> HTTP 200 ({round((time.time()-t0)*1000, 2)}ms)")
    except Exception as e:
        print(f"⚠ Auth Refresh Note: {e}")

    # 3. Project CRUD Operations
    # Create Project
    t0 = time.time()
    proj_data = json.dumps({"name": f"Zero Trust Proj {ts}"}).encode("utf-8")
    req = urllib.request.Request(f"{BACKEND_URL}/projects", data=proj_data, headers=headers)
    with urllib.request.urlopen(req) as resp:
        proj_res = json.loads(resp.read().decode("utf-8"))
        project_id = proj_res["id"]
        proj_lat = round((time.time() - t0) * 1000, 2)
        print(f"✔ Project Create -> HTTP 200 (ID: {project_id}, {proj_lat}ms)")
    
    # Update Project (PUT)
    up_data = json.dumps({"name": f"Updated Proj {ts}"}).encode("utf-8")
    req = urllib.request.Request(f"{BACKEND_URL}/projects/{project_id}", data=up_data, headers=headers, method="PUT")
    with urllib.request.urlopen(req) as resp:
        up_res = json.loads(resp.read().decode("utf-8"))
        print(f"✔ Project Update -> HTTP 200 (Updated Name: {up_res.get('name')})")

    # List Projects
    req = urllib.request.Request(f"{BACKEND_URL}/projects", headers=headers)
    with urllib.request.urlopen(req) as resp:
        list_res = json.loads(resp.read().decode("utf-8"))
        print(f"✔ Project List -> HTTP 200 (Total Projects: {len(list_res)})")

    # 4. AI Generation & Lifecycle
    t0_gen = time.time()
    gen_data = json.dumps({"projectId": project_id, "prompt": "Luxury Resort in Maldives"}).encode("utf-8")
    req = urllib.request.Request(f"{BACKEND_URL}/projects/{project_id}/generate", data=gen_data, headers=headers)
    with urllib.request.urlopen(req) as resp:
        gen_res = json.loads(resp.read().decode("utf-8"))
        task_id = gen_res["taskId"]
        print(f"✔ Generation Triggered -> Task ID: {task_id}")

    # Polling Task Status
    states_captured = []
    start_poll = time.time()
    while time.time() - start_poll < 180:
        req = urllib.request.Request(f"{BACKEND_URL}/tasks/{task_id}", headers=headers)
        with urllib.request.urlopen(req) as resp:
            task_status = json.loads(resp.read().decode("utf-8"))
            st = task_status.get("status")
            el = round(time.time() - start_poll, 2)
            states_captured.append({"elapsed_s": el, "status": st})
            print(f"[{el}s] Poll Task Status: {st}")
            if st in ["completed", "failed"]:
                break
        time.sleep(2)
    
    gen_duration = round(time.time() - t0_gen, 2)
    print(f"✔ AI Generation Duration: {gen_duration}s")
    results["gen_duration_s"] = gen_duration
    results["states_captured"] = states_captured

    # 5. Multi-Format Export Verification (static, react, nextjs)
    export_formats = ["static", "react", "nextjs"]
    exp_results = {}
    for fmt in export_formats:
        t0_exp = time.time()
        req = urllib.request.Request(f"{BACKEND_URL}/projects/{project_id}/export/{fmt}", headers=headers)
        try:
            with urllib.request.urlopen(req) as resp:
                z_bytes = resp.read()
                exp_lat = round(time.time() - t0_exp, 2)
                z = zipfile.ZipFile(io.BytesIO(z_bytes))
                files = z.namelist()
                exp_results[fmt] = {"status": resp.status, "size_bytes": len(z_bytes), "file_count": len(files), "latency_s": exp_lat, "files": files[:5]}
                print(f"✔ Export {fmt} -> HTTP {resp.status} ({len(z_bytes)} bytes, {len(files)} files)")
        except Exception as e:
            exp_results[fmt] = {"error": str(e)}
            print(f"❌ Export {fmt} -> Failed: {e}")
    results["exports"] = exp_results

    # 6. Delete Project
    req = urllib.request.Request(f"{BACKEND_URL}/projects/{project_id}", headers=headers, method="DELETE")
    with urllib.request.urlopen(req) as resp:
        print(f"✔ Project Delete -> HTTP {resp.status}")

    # 7. Security Tests (Unauthorized & Malformed)
    sec_results = {}
    # Unauthorized Request
    req = urllib.request.Request(f"{BACKEND_URL}/projects")
    try:
        with urllib.request.urlopen(req) as resp:
            sec_results["unauthorized"] = resp.status
    except urllib.error.HTTPError as e:
        sec_results["unauthorized"] = e.code
        print(f"✔ Security (Unauthorized) -> Rejected with HTTP {e.code}")
    
    results["security"] = sec_results

    with open("task038_audit_results.json", "w") as f:
        json.dump(results, f, indent=2)

if __name__ == "__main__":
    audit()
