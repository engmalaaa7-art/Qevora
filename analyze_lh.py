import json

with open("lighthouse_report.json", "r", encoding="utf-8") as f:
    data = json.load(f)

audits = data.get("audits", {})
for k, v in audits.items():
    score = v.get("score")
    if score is not None and score < 0.9:
        title = v.get("title")
        desc = v.get("description")
        print(f"[{score*100:.0f}] {k}: {title}")
