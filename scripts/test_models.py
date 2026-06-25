import anthropic
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

key = os.getenv("ANTHROPIC_API_KEY", "")
print(f"Loaded API key: {key[:15]}...")

urls = [
    "https://router.bynara.id/anthropic",
    "https://router.bynara.id",
    "https://router.bynara.id/v1",
]

models = [
    "claude-3-5-sonnet-20241022",
    "claude-3-5-sonnet-20240620",
    "claude-3-5-sonnet-latest",
    "claude-3-5-sonnet",
    "claude-3-haiku-20240307",
    "claude-3-haiku",
]

for base_url in urls:
    print(f"\n--- Testing with base_url: {base_url} ---")
    client = anthropic.Anthropic(
        api_key=key,
        base_url=base_url,
        timeout=httpx.Timeout(5.0)
    )
    for model in models:
        try:
            print(f"  Testing model: {model} ... ", end="", flush=True)
            response = client.messages.create(
                model=model,
                max_tokens=10,
                messages=[{"role": "user", "content": "Hello"}]
            )
            print(f"SUCCESS! Response: {response.content[0].text.strip()}")
            break
        except Exception as e:
            print(f"FAILED: {e}")

