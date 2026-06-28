import urllib.request

class NoRedirectHandler(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None

opener = urllib.request.build_opener(NoRedirectHandler)

urls = [
    "https://qevora-app.vercel.app",
    "https://qevora-ai-ahmeds-projects-8c92a770.vercel.app",
    "https://qevora-flfdv8crq-ahmeds-projects-8c92a770.vercel.app",
]

for url in urls:
    try:
        resp = opener.open(url)
        print(f"[{resp.getcode()}] {url}")
    except urllib.error.HTTPError as e:
        print(f"[{e.code}] {url} -> Redirect to: {e.headers.get('Location')}")
    except Exception as e:
        print(f"[ERR] {url} -> {e}")
