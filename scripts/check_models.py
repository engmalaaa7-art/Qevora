import httpx
import os
from dotenv import load_dotenv

load_dotenv()
key = os.getenv("ANTHROPIC_API_KEY", "")

urls = [
    "https://router.bynara.id/v1/models",
    "https://router.bynara.id/models",
    "https://router.bynara.id/anthropic/v1/models",
]

for url in urls:
    print(f"\n--- GETting from {url} ---")
    headers = {
        "x-api-key": key,
        "Authorization": f"Bearer {key}",
    }
    try:
        r = httpx.get(url, headers=headers, timeout=10.0)
        print(f"Status Code: {r.status_code}")
        print(f"Body: {r.text[:1000]}")
    except Exception as e:
        print(f"Exception: {e}")
