import os
import re
import json

KEYWORDS = ["TODO", "FIXME", "HACK", "XXX", "NotImplemented", "console.log", "debugger", "localhost", "127.0.0.1"]

def audit_source(root_dir):
    findings = {k: [] for k in KEYWORDS}
    ignore_dirs = [".git", "node_modules", ".next", "dist", "build", "__pycache__", ".venv"]
    
    for dirpath, dirnames, filenames in os.walk(root_dir):
        dirnames[:] = [d for d in dirnames if d not in ignore_dirs]
        for f in filenames:
            if f.endswith((".py", ".js", ".ts", ".tsx", ".json", ".yml", ".yaml", ".md")):
                filepath = os.path.join(dirpath, f)
                # Skip audit scripts themselves or report markdown
                if "run_zero_trust" in f or "TASK" in f or "validate_" in f:
                    continue
                try:
                    with open(filepath, "r", encoding="utf-8", errors="ignore") as file_content:
                        lines = file_content.readlines()
                        for idx, line in enumerate(lines, start=1):
                            for kw in KEYWORDS:
                                if kw in line:
                                    findings[kw].append({
                                        "file": os.path.relpath(filepath, root_dir),
                                        "line": idx,
                                        "snippet": line.strip()[:100]
                                    })
                except Exception as e:
                    pass
    
    summary = {k: len(v) for k, v in findings.items()}
    print("Source Audit Summary:", summary)
    with open("task038_source_audit.json", "w") as f:
        json.dump(findings, f, indent=2)

if __name__ == "__main__":
    audit_source("c:\\Users\\A Al Malah\\Desktop\\Qevora")
