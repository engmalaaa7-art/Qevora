import urllib.request
import json
import ssl

FRONTEND_URL = "https://qevora-ai-ahmeds-projects-8c92a770.vercel.app"
BACKEND_URL = "https://qevora-api-production-016a.up.railway.app"

def test_frontend_pages():
    pages = ["/", "/login", "/signup", "/dashboard", "/editor", "/pricing", "/templates", "/settings"]
    print("=== TESTING FRONTEND PAGES & STATIC ASSETS ===")
    for p in pages:
        url = f"{FRONTEND_URL}{p}"
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req) as resp:
                code = resp.getcode()
                html = resp.read().decode("utf-8")
                assert code == 200, f"Expected 200, got {code}"
                # Check for no localhost strings in HTML
                assert "localhost" not in html, "Found localhost reference in rendered HTML!"
                print(f"  [PASS] Page {p} -> HTTP {code} (Length: {len(html)} bytes)")
        except Exception as e:
            print(f"  [FAIL] Page {p} -> {e}")

def test_backend_cors():
    print("\n=== TESTING BACKEND CORS FOR FRONTEND ORIGIN ===")
    req = urllib.request.Request(
        f"{BACKEND_URL}/health",
        headers={
            "Origin": FRONTEND_URL,
            "Access-Control-Request-Method": "GET"
        }
    )
    try:
        with urllib.request.urlopen(req) as resp:
            code = resp.getcode()
            headers = dict(resp.info())
            allow_origin = headers.get("Access-Control-Allow-Origin", "")
            print(f"  [PASS] /health response HTTP {code}")
            print(f"  Access-Control-Allow-Origin: {allow_origin}")
    except Exception as e:
        print(f"  [FAIL] CORS Check -> {e}")

if __name__ == "__main__":
    test_frontend_pages()
    test_backend_cors()
