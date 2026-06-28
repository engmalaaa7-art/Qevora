import urllib.request
import json

token = "seG2pUXoXfWCjxk6l7oPwsIn9_iszExeOTahG5JMSrX"
url = "https://backboard.railway.app/graphql/v2"

query = """
query {
  project(id: "2fc2be11-7fa8-4eed-8328-66cba1383bf5") {
    id
    name
    environments {
      edges {
        node {
          id
          name
        }
      }
    }
    services {
      edges {
        node {
          id
          name
          serviceInstances {
            edges {
              node {
                domains {
                  serviceDomains {
                    domain
                  }
                }
              }
            }
          }
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
        print(json.dumps(json.loads(resp.read().decode("utf-8")), indent=2))
except Exception as e:
    print(e)
