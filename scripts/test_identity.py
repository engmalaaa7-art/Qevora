import anthropic
import os
import httpx
from dotenv import load_dotenv

load_dotenv()
key = os.getenv("ANTHROPIC_API_KEY", "")

client = anthropic.Anthropic(
    api_key=key,
    base_url="https://router.bynara.id",
)

models = ["mimo-v2.5-pro-free", "mistral-medium-3-5"]
for model in models:
    try:
        print(f"\n--- Testing model identity: {model} ---")
        response = client.messages.create(
            model=model,
            max_tokens=100,
            messages=[{"role": "user", "content": "Are you Claude? Who created you? Answer in 1 short sentence."}]
        )
        print(f"Response: {response.content[0].text.strip()}")
    except Exception as e:
        print(f"FAILED for {model}: {e}")
