import urllib.request
import json

token = "seG2pUXoXfWCjxk6l7oPwsIn9_iszExeOTahG5JMSrX"
url = "https://backboard.railway.app/graphql/v2"

query = """
query GetService {
  service(id: "3d6a8383-36f6-4acb-b608-bed858f962a7") {
    id
    name
    serviceInstances {
      edges {
        node {
          environmentId
          builder
          dockerfilePath
          rootDirectory
          healthcheckPath
        }
      }
    }
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
        print(resp.read().decode("utf-8"))
except Exception as e:
    if hasattr(e, 'read'):
        print('Error body:', e.read().decode('utf-8'))
    else:
        print('Error:', e)
