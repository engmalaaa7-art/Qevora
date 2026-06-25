import httpx
import os
from dotenv import load_dotenv

load_dotenv()
key = os.getenv("ANTHROPIC_API_KEY", "")
print(f"Key: {key[:15]}...")

urls = [
    "https://router.bynara.id/anthropic",
    "https://router.bynara.id",
    "https://router.bynara.id/v1",
]

for url in urls:
    print(f"\n--- Testing base URL: {url} ---")
    headers = {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    }
    
    # We will test the messages endpoint directly
    full_url = f"{url}/v1/messages" if not url.endswith("/v1") else f"{url}/messages"
    print(f"POSTing to: {full_url}")
    
    payload = {
        "model": "claude-3-5-sonnet-20241022",
        "max_tokens": 10,
        "messages": [{"role": "user", "content": "Hello"}]
    }
    
    try:
        r = httpx.post(full_url, headers=headers, json=payload, timeout=10.0)
        print(f"Status Code: {r.status_code}")
        print(f"Headers: {dict(r.headers)}")
        print(f"Body: {r.text[:500]}")
    except Exception as e:
        print(f"Exception: {e}")
