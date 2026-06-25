import anthropic
import os
import httpx
from dotenv import load_dotenv

load_dotenv()
key = os.getenv("ANTHROPIC_API_KEY", "")

client = anthropic.Anthropic(
    api_key=key,
    base_url="https://router.bynara.id",
    timeout=httpx.Timeout(10.0)
)

models = [
    "mimo-v2.5-free",
    "mimo-v2.5-pro-free",
    "mistral-large",
    "mistral-medium-3-5"
]

for model in models:
    try:
        print(f"Testing model {model} via Anthropic client...")
        response = client.messages.create(
            model=model,
            max_tokens=20,
            messages=[{"role": "user", "content": "Hello"}]
        )
        print(f"SUCCESS! Response: {response.content[0].text.strip()}")
    except Exception as e:
        print(f"FAILED for {model}: {e}")
