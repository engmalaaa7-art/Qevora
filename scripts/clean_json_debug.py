import re

def clean_json_text_debug(text: str) -> str:
    """Strips markdown backticks and extracts JSON from prose."""
    text = text.strip()
    
    # 1. Try to find json code block
    match = re.search(r"```json\s*([\s\S]*?)\s*```", text, flags=re.IGNORECASE)
    if match:
        return match.group(1).strip()
        
    # 2. Try to find generic code block
    match = re.search(r"```\s*([\s\S]*?)\s*```", text)
    if match:
        return match.group(1).strip()
        
    # 3. Try to find JSON object bounds { ... }
    first_brace = text.find('{')
    last_brace = text.rfind('}')
    if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
        return text[first_brace:last_brace+1].strip()
        
    # 4. Fallback to original text strip
    return text
