import requests
import json
import uuid

BASE_URL = "http://localhost:8000"

def run_test():
    print("=== Testing Qevora API Live Generation ===")
    
    # 1. Signup a unique test user
    email = f"test_live_{uuid.uuid4().hex[:6]}@qevora.com"
    print(f"Signing up user: {email}...")
    signup_payload = {
        "email": email,
        "fullName": "Live Tester",
        "password": "password123"
    }
    r = requests.post(f"{BASE_URL}/auth/signup", json=signup_payload)
    if r.status_code != 200:
        print(f"Signup failed: {r.status_code} - {r.text}")
        return
        
    auth_data = r.json()
    token = auth_data["access_token"]
    userId = auth_data["userId"]
    print(f"✓ Signup success. Token: {token[:20]}... for User: {userId}")
    
    # Set headers
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # 2. Create a project
    print("Creating project...")
    project_payload = {
        "name": "Live Test Cafe Site",
        "description": "Coffee shop website"
    }
    r = requests.post(f"{BASE_URL}/projects", headers=headers, json=project_payload)
    if r.status_code != 200:
        print(f"Project creation failed: {r.status_code} - {r.text}")
        return
        
    project = r.json()
    project_id = project["id"]
    print(f"✓ Project created. ID: {project_id}")
    
    # 3. Trigger generation
    print("Triggering AI schema generation (this may take up to 45 seconds)...")
    gen_payload = {
        "projectId": project_id,
        "prompt": "a beautiful coffee shop named Paris Brew with elegant styling"
    }
    r = requests.post(f"{BASE_URL}/projects/{project_id}/generate", headers=headers, json=gen_payload, timeout=90.0)
    print(f"API Response Status Code: {r.status_code}")
    print(f"API Response Body:")
    try:
        resp_json = r.json()
        print(json.dumps(resp_json, indent=2)[:1000] + "\n...")
        if resp_json.get("success"):
            print("✓ SUCCESS! Schema generated and validated.")
        else:
            print("❌ FAILED: Generation failed.")
    except Exception as e:
        print(f"Failed to parse response: {e}")
        print(r.text)

if __name__ == "__main__":
    run_test()
