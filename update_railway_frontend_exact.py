import urllib.request
import json

token = "seG2pUXoXfWCjxk6l7oPwsIn9_iszExeOTahG5JMSrX"
url = "https://backboard.railway.app/graphql/v2"

mutation = """
mutation UpdateServiceInstance($envId: String!, $svcId: String!, $input: ServiceInstanceUpdateInput!) {
  serviceInstanceUpdate(
    environmentId: $envId
    serviceId: $svcId
    input: $input
  )
}
"""

def update_frontend_svc():
    variables = {
        "envId": "c07716e1-7a68-4a7b-a0c4-1209fb3fa0b8",
        "svcId": "fe325373-37fb-46bd-add9-c6e8b0ac9744",
        "input": {
            "dockerfilePath": "apps/web/Dockerfile",
            "rootDirectory": "/",
            "healthcheckPath": "/",
            "healthcheckTimeout": 100,
            "startCommand": None,
            "buildCommand": None
        }
    }
    req = urllib.request.Request(
        url,
        data=json.dumps({"query": mutation, "variables": variables}).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "User-Agent": "Railway/5.23.1"
        }
    )
    try:
        with urllib.request.urlopen(req) as resp:
            print("Response:", resp.read().decode("utf-8"))
    except Exception as e:
        if hasattr(e, 'read'):
            print('Error body:', e.read().decode('utf-8'))
        else:
            print('Error:', e)

update_frontend_svc()
