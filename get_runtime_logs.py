import urllib.request
import json

url = "https://backboard.railway.app/graphql/v2"
token = "3d623d6a-5fc5-4fef-97b7-573bfd82c0fc"

query = """
query GetDeploymentLogs($id: String!) {
  deploymentLogs(deploymentId: $id, limit: 100) {
    message
    timestamp
  }
}
"""

req = urllib.request.Request(
    url,
    data=json.dumps({"query": query, "variables": {"id": "2a0731ee-0b0e-4cd4-8292-4c8c1480d532"}}).encode("utf-8"),
    headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
)

with urllib.request.urlopen(req) as resp:
    res = json.loads(resp.read().decode("utf-8"))
    logs = res.get("data", {}).get("deploymentLogs", [])
    for log in logs:
        print(f"[{log.get('timestamp')}] {log.get('message')}")
