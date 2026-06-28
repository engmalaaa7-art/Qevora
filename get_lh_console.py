import json

with open("lighthouse_report.json", "r", encoding="utf-8") as f:
    data = json.load(f)

errs = data.get("audits", {}).get("errors-in-console", {})
print("Console details:", json.dumps(errs.get("details", {}), indent=2))
