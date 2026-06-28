import urllib.request
import urllib.error
import json
import time
import io
import zipfile
import subprocess
import os

BACKEND_URL = "https://qevora-api-production-016a.up.railway.app"
FRONTEND_URL = "https://qevora-app.vercel.app"

results = {
    "timestamp": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
    "part1_backend": {},
    "part2_openapi": {},
    "part3_auth": {},
    "part4_projects": {},
    "part5_generation": {},
    "part6_renderer": {},
    "part7_frontend": {},
    "part8_integration": {},
    "part9_performance": {},
    "part10_security": {},
    "part11_negative": {},
    "part12_regression": {}
}

def make_request(url, method="GET", headers=None, data=None, return_headers=True):
    if headers is None:
        headers = {}
    if "User-Agent" not in headers:
        headers["User-Agent"] = "ZeroTrustAudit/1.0"
    
    encoded_data = None
    if data is not None:
        if isinstance(data, dict) or isinstance(data, list):
            encoded_data = json.dumps(data).encode("utf-8")
            headers["Content-Type"] = "application/json"
        elif isinstance(data, str):
            encoded_data = data.encode("utf-8")
        else:
            encoded_data = data

    req = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)
    start_time = time.time()
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            elapsed_ms = round((time.time() - start_time) * 1000, 2)
            body_bytes = resp.read()
            resp_headers = dict(resp.info())
            return {
                "status": resp.getcode(),
                "latency_ms": elapsed_ms,
                "headers": resp_headers,
                "body": body_bytes,
                "url": resp.geturl()
            }
    except urllib.error.HTTPError as e:
        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        body_bytes = e.read()
        resp_headers = dict(e.info())
        return {
            "status": e.code,
            "latency_ms": elapsed_ms,
            "headers": resp_headers,
            "body": body_bytes,
            "url": e.url
        }
    except Exception as e:
        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        return {
            "status": 0,
            "latency_ms": elapsed_ms,
            "headers": {},
            "body": str(e).encode("utf-8"),
            "error": str(e)
        }

print("=== STARTING ZERO TRUST BLACK-BOX AUDIT ===")

# PART 1: BACKEND VERIFICATION
print("\n--- PART 1: Backend Infrastructure ---")
p1_endpoints = ["/", "/docs", "/openapi.json", "/health", "/health/live", "/health/ready"]
part1_data = {}
for ep in p1_endpoints:
    res = make_request(f"{BACKEND_URL}{ep}")
    body_str = res["body"].decode("utf-8", errors="ignore")
    body_preview = body_str[:200] + ("..." if len(body_str) > 200 else "")
    part1_data[ep] = {
        "status": res["status"],
        "latency_ms": res["latency_ms"],
        "headers": {k: res["headers"][k] for k in ["content-type", "server", "date", "strict-transport-security", "access-control-allow-origin"] if k in res["headers"]},
        "body_preview": body_preview
    }
    print(f"  {ep} -> Status {res['status']}, Latency {res['latency_ms']}ms")
results["part1_backend"] = part1_data

# PART 2: OPENAPI AUDIT
print("\n--- PART 2: OpenAPI Audit ---")
openapi_res = make_request(f"{BACKEND_URL}/openapi.json")
if openapi_res["status"] == 200:
    try:
        spec = json.loads(openapi_res["body"])
        paths = spec.get("paths", {})
        total_endpoints = 0
        categories = {"auth": 0, "projects": 0, "generation": 0, "export": 0, "health": 0, "other": 0}
        endpoint_list = []
        
        for path, methods in paths.items():
            for method in methods.keys():
                if method.lower() in ["get", "post", "put", "delete", "patch"]:
                    total_endpoints += 1
                    ep_str = f"{method.upper()} {path}"
                    endpoint_list.append(ep_str)
                    if "/auth" in path:
                        categories["auth"] += 1
                    elif "/projects" in path and ("generate" in path or "edit" in path or "tasks" in path):
                        categories["generation"] += 1
                    elif "/projects" in path and ("export" in path or "publish" in path or "download" in path):
                        categories["export"] += 1
                    elif "/projects" in path:
                        categories["projects"] += 1
                    elif "/health" in path or path == "/":
                        categories["health"] += 1
                    else:
                        categories["other"] += 1
                        
        results["part2_openapi"] = {
            "total_endpoints": total_endpoints,
            "categories": categories,
            "endpoints": endpoint_list
        }
        print(f"  Total Endpoints in OpenAPI: {total_endpoints}")
        print(f"  Categories: {categories}")
    except Exception as e:
        results["part2_openapi"] = {"error": str(e)}
else:
    results["part2_openapi"] = {"error": f"Failed to fetch openapi.json: {openapi_res['status']}"}

# PART 3: AUTHENTICATION FLOW
print("\n--- PART 3: Authentication Verification ---")
test_ts = int(time.time())
test_email = f"audit_user_{test_ts}@qevora-test.com"
test_password = "SecureTestPassword123!"
test_name = "Audit Test User"

# 1. Signup
signup_res = make_request(f"{BACKEND_URL}/auth/signup", method="POST", data={"email": test_email, "fullName": test_name, "password": test_password})
signup_body = json.loads(signup_res["body"].decode("utf-8")) if signup_res["status"] in [200, 201] else {}
access_token = signup_body.get("access_token")
user_id = signup_body.get("userId")
signup_cookies = signup_res["headers"].get("set-cookie", "")

print(f"  Signup -> Status {signup_res['status']}, UserID: {user_id}, HasToken: {bool(access_token)}")

# 2. Login
login_res = make_request(f"{BACKEND_URL}/auth/login", method="POST", data={"email": test_email, "password": test_password})
login_body = json.loads(login_res["body"].decode("utf-8")) if login_res["status"] == 200 else {}
login_token = login_body.get("access_token") or access_token
login_cookies = login_res["headers"].get("set-cookie", "")

print(f"  Login -> Status {login_res['status']}, HasToken: {bool(login_token)}")

# 3. Get /auth/me
me_res = make_request(f"{BACKEND_URL}/auth/me", headers={"Authorization": f"Bearer {login_token}"})
print(f"  GET /auth/me -> Status {me_res['status']}")

# 4. Unauthorized checks
unauth_res = make_request(f"{BACKEND_URL}/projects")
invalid_jwt_res = make_request(f"{BACKEND_URL}/projects", headers={"Authorization": "Bearer invalid.jwt.token"})
print(f"  Unauthorized Request -> Status {unauth_res['status']}")
print(f"  Invalid JWT Request -> Status {invalid_jwt_res['status']}")

results["part3_auth"] = {
    "signup": {"status": signup_res["status"], "body": signup_body, "cookies": signup_cookies},
    "login": {"status": login_res["status"], "body": login_body, "cookies": login_cookies},
    "me": {"status": me_res["status"], "body_preview": me_res["body"].decode("utf-8", errors="ignore")[:200]},
    "unauthorized_status": unauth_res["status"],
    "invalid_jwt_status": invalid_jwt_res["status"]
}

# PART 4: PROJECTS CRUD
print("\n--- PART 4: Projects CRUD ---")
proj_headers = {"Authorization": f"Bearer {login_token}"}
create_proj_res = make_request(f"{BACKEND_URL}/projects", method="POST", headers=proj_headers, data={"name": f"Audit Project {test_ts}", "description": "Black-box test project"})
proj_data = json.loads(create_proj_res["body"].decode("utf-8")) if create_proj_res["status"] in [200, 201] else {}
project_id = proj_data.get("id")

print(f"  Create Project -> Status {create_proj_res['status']}, Project ID: {project_id}")

update_proj_res = make_request(f"{BACKEND_URL}/projects/{project_id}", method="PUT", headers=proj_headers, data={"name": f"Updated Audit Project {test_ts}", "description": "Updated description"}) if project_id else {"status": 0}
print(f"  Update Project -> Status {update_proj_res['status']}")

list_proj_res = make_request(f"{BACKEND_URL}/projects", headers=proj_headers)
print(f"  List Projects -> Status {list_proj_res['status']}")

results["part4_projects"] = {
    "create": {"status": create_proj_res["status"], "project_id": project_id, "body": proj_data},
    "update": {"status": update_proj_res["status"]},
    "list": {"status": list_proj_res["status"], "count": len(json.loads(list_proj_res["body"].decode("utf-8"))) if list_proj_res["status"] == 200 else 0}
}

# PART 5: GENERATION & QUEUE
print("\n--- PART 5: Generation Queue ---")
gen_task_id = None
if project_id:
    gen_res = make_request(f"{BACKEND_URL}/projects/{project_id}/generate", method="POST", headers=proj_headers, data={"projectId": project_id, "prompt": "Build a modern clean legal tech portal with dark mode and Arabic/English language toggle."})
    gen_body = json.loads(gen_res["body"].decode("utf-8")) if gen_res["status"] in [200, 202] else {}
    gen_task_id = gen_body.get("taskId")
    print(f"  Trigger Generation -> Status {gen_res['status']}, TaskID: {gen_task_id}")
    
    poll_results = []
    if gen_task_id:
        for attempt in range(5):
            time.sleep(2)
            task_res = make_request(f"{BACKEND_URL}/tasks/{gen_task_id}", headers=proj_headers)
            task_body = json.loads(task_res["body"].decode("utf-8")) if task_res["status"] == 200 else {}
            poll_results.append({"attempt": attempt+1, "status_code": task_res["status"], "body": task_body})
            print(f"    Poll attempt {attempt+1} -> Task status: {task_body.get('status')}")
            if task_body.get("status") in ["completed", "failed"]:
                break
    results["part5_generation"] = {"trigger_status": gen_res["status"], "task_id": gen_task_id, "body": gen_body, "polls": poll_results}
else:
    results["part5_generation"] = {"error": "No project_id available"}

# PART 6: RENDERER & EXPORT
print("\n--- PART 6: Renderer & ZIP Export ---")
if project_id:
    export_res = make_request(f"{BACKEND_URL}/projects/{project_id}/export", headers=proj_headers)
    print(f"  Export ZIP -> Status {export_res['status']}, Size {len(export_res['body'])} bytes")
    zip_files = []
    if export_res["status"] == 200 and len(export_res["body"]) > 0:
        try:
            with zipfile.ZipFile(io.BytesIO(export_res["body"])) as z:
                zip_files = z.namelist()
            print(f"    ZIP contains {len(zip_files)} files: {zip_files[:5]}")
        except Exception as e:
            print(f"    ZIP Extraction Error: {e}")
    results["part6_renderer"] = {"export_status": export_res["status"], "zip_size_bytes": len(export_res["body"]), "files": zip_files}
else:
    results["part6_renderer"] = {"error": "No project_id available"}

# PART 7: FRONTEND VERIFICATION
print("\n--- PART 7: Frontend Verification ---")
fe_routes = ["/", "/login", "/signup", "/dashboard", "/editor", "/pricing", "/templates", "/settings"]
fe_results = {}
for route in fe_routes:
    url = f"{FRONTEND_URL}{route}"
    res = make_request(url)
    html = res["body"].decode("utf-8", errors="ignore")
    fe_results[route] = {
        "status": res["status"],
        "latency_ms": res["latency_ms"],
        "html_len": len(html),
        "has_localhost": "localhost" in html
    }
    print(f"  Frontend Route {route} -> Status {res['status']}, Length {len(html)} bytes")
results["part7_frontend"] = fe_results

# PART 8: CORS & INTEGRATION
print("\n--- PART 8: CORS & Integration ---")
cors_res = make_request(f"{BACKEND_URL}/health", headers={"Origin": FRONTEND_URL, "Access-Control-Request-Method": "GET"})
allow_origin = cors_res["headers"].get("access-control-allow-origin", "")
print(f"  CORS Preflight Check -> Access-Control-Allow-Origin: '{allow_origin}'")
results["part8_integration"] = {
    "health_cors_status": cors_res["status"],
    "allow_origin_header": allow_origin
}

# PART 9: PERFORMANCE METRICS
print("\n--- PART 9: Performance Metrics ---")
perf_samples = []
for _ in range(3):
    r = make_request(f"{BACKEND_URL}/health")
    perf_samples.append(r["latency_ms"])
avg_api_latency = round(sum(perf_samples) / len(perf_samples), 2)
print(f"  Average Backend /health Latency: {avg_api_latency}ms")
results["part9_performance"] = {
    "health_latencies_ms": perf_samples,
    "avg_health_latency_ms": avg_api_latency
}

# PART 10: SECURITY AUDIT
print("\n--- PART 10: Security Headers Audit ---")
sec_res = make_request(f"{BACKEND_URL}/health")
sec_headers = {k: sec_res["headers"][k] for k in ["strict-transport-security", "x-content-type-options", "x-frame-options", "content-security-policy", "x-xss-protection"] if k in sec_res["headers"]}
print(f"  Security Headers Present: {list(sec_headers.keys())}")
results["part10_security"] = {
    "security_headers": sec_headers,
    "missing_headers": [h for h in ["strict-transport-security", "x-content-type-options", "x-frame-options"] if h not in sec_res["headers"]]
}

# PART 11: NEGATIVE TESTING
print("\n--- PART 11: Negative Testing ---")
neg_bad_login = make_request(f"{BACKEND_URL}/auth/login", method="POST", data={"email": "nonexistent@qevora.com", "password": "wrongpassword"})
neg_bad_json = make_request(f"{BACKEND_URL}/auth/login", method="POST", data="{malformed json", headers={"Content-Type": "application/json"})
neg_bad_uuid = make_request(f"{BACKEND_URL}/projects/not-a-valid-uuid", headers=proj_headers)

print(f"  Bad Login -> Status {neg_bad_login['status']}")
print(f"  Malformed JSON -> Status {neg_bad_json['status']}")
print(f"  Invalid Project UUID -> Status {neg_bad_uuid['status']}")

results["part11_negative"] = {
    "bad_login_status": neg_bad_login["status"],
    "malformed_json_status": neg_bad_json["status"],
    "invalid_uuid_status": neg_bad_uuid["status"]
}

# PART 12: REGRESSION AUTOMATED TESTS
print("\n--- PART 12: Automated Regression Tests ---")
try:
    cmd_res = subprocess.run(["pytest", "apps/api/tests/test_api.py", "-v"], capture_output=True, text=True, cwd="c:\\Users\\A Al Malah\\Desktop\\Qevora")
    print(f"  Pytest Exit Code: {cmd_res.returncode}")
    results["part12_regression"] = {
        "exit_code": cmd_res.returncode,
        "stdout_preview": cmd_res.stdout[:500],
        "stderr_preview": cmd_res.stderr[:500]
    }
except Exception as e:
    results["part12_regression"] = {"error": str(e)}

# Save raw results to JSON file
with open("c:\\Users\\A Al Malah\\Desktop\\Qevora\\zero_trust_raw_results.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2)

print("\n=== ZERO TRUST AUDIT COMPLETED. Raw results saved to zero_trust_raw_results.json ===")
