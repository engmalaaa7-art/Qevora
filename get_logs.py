import urllib.request
import json

token = "seG2pUXoXfWCjxk6l7oPwsIn9_iszExeOTahG5JMSrX"
url = "https://backboard.railway.app/graphql/v2"

query = """
query GetDeploymentLogs($id: String!) {
  deployment(id: $id) {
    id
    status
    meta
    canRedeploy
  }
}
"""

req = urllib.request.Request(
    url,
    data=json.dumps({"query": query, "variables": {"id": "d6b844b8-fc6d-481e-ba1a-5eb2991de15d"}}).encode("utf-8"),
    headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "User-Agent": "Railway/5.23.1"
    }
)

try:
    with urllib.request.urlopen(req) as resp:
        print(resp.read().decode("utf-8"))
except Exception as e:
    if hasattr(e, 'read'):
        print('Error body:', e.read().decode('utf-8'))
    else:
        print('Error:', e)
