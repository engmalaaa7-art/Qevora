import urllib.request
import json
import time
import zipfile
import io
import os
from datetime import datetime

BACKEND_URL = "https://qevora-api-production-016a.up.railway.app"
FRONTEND_URL = "https://qevora-app.vercel.app"

def run_cert():
    cert_data = {}
    print("=== TASK037 CERTIFICATION RUN STARTED ===")
    
    # Phase 1: Health Latency & Version
    t0 = time.time()
    req = urllib.request.Request(f"{BACKEND_URL}/health/ready")
    with urllib.request.urlopen(req) as resp:
        h_ready = json.loads(resp.read().decode("utf-8"))
        h_latency = round((time.time() - t0) * 1000, 2)
    print(f"Health Ready: {h_ready} (Latency: {h_latency}ms)")
    cert_data["health_latency_ms"] = h_latency
    cert_data["health_ready"] = h_ready

    # Phase 2: User Creation & Auth
    ts = int(time.time())
    email = f"cert_user_{ts}@qevora.com"
    password = "CertPassword123!"
    full_name = "Cert User"
    
    t0 = time.time()
    signup_payload = json.dumps({"email": email, "password": password, "fullName": full_name}).encode("utf-8")
    req = urllib.request.Request(f"{BACKEND_URL}/auth/signup", data=signup_payload, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as resp:
        auth_res = json.loads(resp.read().decode("utf-8"))
        token = auth_res["access_token"]
        auth_latency = round((time.time() - t0) * 1000, 2)
    print(f"Auth Success (Latency: {auth_latency}ms)")
    cert_data["auth_latency_ms"] = auth_latency

    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    # Project Creation
    t0 = time.time()
    proj_payload = json.dumps({"name": f"Cert Project {ts}"}).encode("utf-8")
    req = urllib.request.Request(f"{BACKEND_URL}/projects", data=proj_payload, headers=headers)
    with urllib.request.urlopen(req) as resp:
        proj_res = json.loads(resp.read().decode("utf-8"))
        project_id = proj_res["id"]
        proj_latency = round((time.time() - t0) * 1000, 2)
    print(f"Project Created: {project_id} (Latency: {proj_latency}ms)")
    cert_data["project_id"] = project_id

    # Trigger AI Generation
    t0_gen = time.time()
    gen_payload = json.dumps({"projectId": project_id, "prompt": "Modern Luxury Boutique Hotel in Paris"}).encode("utf-8")
    req = urllib.request.Request(f"{BACKEND_URL}/projects/{project_id}/generate", data=gen_payload, headers=headers)
    with urllib.request.urlopen(req) as resp:
        gen_res = json.loads(resp.read().decode("utf-8"))
        task_id = gen_res["taskId"]
    print(f"Generation Triggered. Task ID: {task_id}")
    cert_data["task_id"] = task_id

    # Polling State Machine
    states_captured = []
    start_poll = time.time()
    while time.time() - start_poll < 180:
        req = urllib.request.Request(f"{BACKEND_URL}/tasks/{task_id}", headers=headers)
        with urllib.request.urlopen(req) as resp:
            task_status = json.loads(resp.read().decode("utf-8"))
            status_str = task_status.get("status")
            elapsed = round(time.time() - start_poll, 2)
            print(f"[{elapsed}s] Poll Status: {status_str} -> {task_status}")
            states_captured.append({"elapsed_s": elapsed, "status": status_str, "payload": task_status})
            if status_str in ["completed", "failed"]:
                break
        time.sleep(2)

    gen_duration = round(time.time() - t0_gen, 2)
    print(f"Generation Duration: {gen_duration}s")
    cert_data["gen_duration_s"] = gen_duration
    cert_data["states_captured"] = states_captured

    # Export Verification
    t0_exp = time.time()
    req = urllib.request.Request(f"{BACKEND_URL}/projects/{project_id}/export/static", headers=headers)
    with urllib.request.urlopen(req) as resp:
        zip_bytes = resp.read()
        exp_duration = round(time.time() - t0_exp, 2)
        zip_size = len(zip_bytes)
        print(f"Export Success! Size: {zip_size} bytes (Latency: {exp_duration}s)")
        
        # Verify ZIP contents
        z = zipfile.ZipFile(io.BytesIO(zip_bytes))
        file_list = z.namelist()
        print("ZIP Contents:", file_list)
        cert_data["zip_size_bytes"] = zip_size
        cert_data["zip_contents"] = file_list
        cert_data["export_duration_s"] = exp_duration

    with open("task037_cert_results.json", "w") as f:
        json.dump(cert_data, f, indent=2)

if __name__ == "__main__":
    run_cert()
