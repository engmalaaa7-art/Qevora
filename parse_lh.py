import json
import os

if os.path.exists("lighthouse_report.json"):
    with open("lighthouse_report.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    categories = data.get("categories", {})
    for cat, val in categories.items():
        score = (val.get("score") or 0) * 100
        print(f"{cat.upper()}: {score:.1f}")
else:
    print("Report file not found.")
