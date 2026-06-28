import urllib.request
import json

token = "seG2pUXoXfWCjxk6l7oPwsIn9_iszExeOTahG5JMSrX"
url = "https://backboard.railway.app/graphql/v2"

query = """
query {
  buildLogs(deploymentId: "d6b844b8-fc6d-481e-ba1a-5eb2991de15d", limit: 100) {
    message
  }
}
"""

req = urllib.request.Request(
    url,
    data=json.dumps({"query": query}).encode("utf-8"),
    headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "User-Agent": "Railway/5.23.1"
    }
)
try:
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        for log in data.get("data", {}).get("buildLogs", []):
            print(log.get("message"))
except Exception as e:
    print(e)
