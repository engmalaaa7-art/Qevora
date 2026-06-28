import urllib.request

FRONTEND_URL = "https://qevora-app.vercel.app"

def check_frontend():
    routes = ["/", "/login", "/signup", "/dashboard"]
    for r in routes:
        url = f"{FRONTEND_URL}{r}"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        try:
            with urllib.request.urlopen(req) as resp:
                print(f"✔ Frontend {r} -> HTTP {resp.status}")
        except Exception as e:
            print(f"❌ Frontend {r} -> Failed: {e}")

if __name__ == "__main__":
    check_frontend()
