import urllib.request
import json

token = "seG2pUXoXfWCjxk6l7oPwsIn9_iszExeOTahG5JMSrX"
url = "https://backboard.railway.app/graphql/v2"

query = """
query {
  service(id: "fe325373-37fb-46bd-add9-c6e8b0ac9744") {
    id
    name
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
    print(e)
