import anthropic
import os
import json
import httpx
import time
from dotenv import load_dotenv

load_dotenv()
key = os.getenv("ANTHROPIC_API_KEY", "")

client = anthropic.Anthropic(
    api_key=key,
    base_url="https://router.bynara.id",
    timeout=httpx.Timeout(90.0)
)

SYSTEM_PROMPT = """You are Qevora AI, an expert website architect and bilingual content specialist.
Your mission: Transform natural language requests into valid Qevora Site Schema JSON.
ABSOLUTE RULES:
1. Output ONLY valid JSON. No markdown. No prose. No code fences.
2. Never fabricate real contact details. Use placeholders.
3. Always include navbar and footer on every page.
4. Set direction "rtl" when language is "ar" — no exceptions.
5. All BilingualText fields must be populated for the primary language."""

prompt = "Generate a complete Qevora Site Schema based on: 'a coffee shop named Cafe Paris'"

models = ["mimo-v2.5-pro-free"]
for model in models:
    try:
        print(f"\n==========================================")
        print(f"Testing model: {model}")
        print(f"==========================================")
        
        start = time.time()
        response = client.messages.create(
            model=model,
            max_tokens=100,
            temperature=0.2,
            messages=[{"role": "user", "content": "Tell me a very short joke."}]
        )
        elapsed = time.time() - start
        print(f"Success in {elapsed:.2f} seconds!")
        print(f"Response: {response.content[0].text.strip()}")
        
    except Exception as e:
        print(f"FAILED for {model}: {e}")
