import urllib.request
import json

url = "https://backboard.railway.app/graphql/v2"

# Let's test standard GraphQL query with various possible auth formats
query = "query { me { id email } }"

for token in ["seG2pUXoXfWCjxk6l7oPwsIn9_iszExeOTahG5JMSrX"]:
    req = urllib.request.Request(
        url,
        data=json.dumps({"query": query}).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
    )
    try:
        with urllib.request.urlopen(req) as resp:
            print("Token test success:", resp.read().decode("utf-8"))
    except Exception as e:
        print("Token test failed:", e)
