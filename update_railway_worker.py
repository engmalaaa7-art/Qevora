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

def update_svc(service_id, env_id):
    variables = {
        "envId": env_id,
        "svcId": service_id,
        "input": {
            "dockerfilePath": "apps/api/Dockerfile",
            "rootDirectory": "/",
            "healthcheckPath": "/health",
            "healthcheckTimeout": 100,
            "startCommand": "sh -c \"python worker.py & python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}\"",
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

print("Updating startCommand to run both worker.py and main:app for qevora-api...")
update_svc("3d6a8383-36f6-4acb-b608-bed858f962a7", "c07716e1-7a68-4a7b-a0c4-1209fb3fa0b8")
