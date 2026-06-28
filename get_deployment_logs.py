import urllib.request
import json

token = "seG2pUXoXfWCjxk6l7oPwsIn9_iszExeOTahG5JMSrX"
url = "https://backboard.railway.app/graphql/v2"

query = """
query GetLogs($id: String!) {
  deploymentLogs(deploymentId: $id) {
    message
    timestamp
  }
}
"""

req = urllib.request.Request(
    url,
    data=json.dumps({"query": query, "variables": {"id": "ff28e8be-4ce3-42b8-84f0-b45dcfe73744"}}).encode("utf-8"),
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
