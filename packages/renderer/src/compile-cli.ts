import { renderSite } from "./index";
import * as fs from "fs";

function exitWithJson(obj: any, code: number) {
  const payload = JSON.stringify(obj) + "\n";
  process.exitCode = code;
  if (!process.stdout.write(payload)) {
    process.stdout.once("drain", () => {
      process.exit(code);
    });
  } else {
    // Small timeout to allow stream flush in bundled execution
    setTimeout(() => {
      process.exit(code);
    }, 10);
  }
}

function main() {
  try {
    const inputData = fs.readFileSync(0, "utf-8");
    if (!inputData.trim()) {
      exitWithJson({ success: false, errors: ["No input schema provided on stdin."] }, 1);
      return;
    }

    const schema = JSON.parse(inputData);
    const result = renderSite(schema, { mode: "publish" });

    if (result.success) {
      exitWithJson({
        success: true,
        files: result.files,
        warnings: result.warnings
      }, 0);
    } else {
      exitWithJson({
        success: false,
        errors: result.errors || ["Unknown compilation error"],
        warnings: result.warnings
      }, 1);
    }
  } catch (error: any) {
    exitWithJson({
      success: false,
      errors: [error.message || "Invalid JSON or internal failure"]
    }, 1);
  }
}

main();
