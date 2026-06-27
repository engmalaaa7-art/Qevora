import { renderSite } from "./index";
import * as fs from "fs";

function main() {
  try {
    const inputData = fs.readFileSync(0, "utf-8");
    if (!inputData.trim()) {
      console.error(JSON.stringify({ success: false, errors: ["No input schema provided on stdin."] }));
      process.exit(1);
    }

    const schema = JSON.parse(inputData);
    const result = renderSite(schema, { mode: "publish" });

    if (result.success) {
      console.log(JSON.stringify({
        success: true,
        files: result.files,
        warnings: result.warnings
      }));
      process.exit(0);
    } else {
      console.log(JSON.stringify({
        success: false,
        errors: result.errors || ["Unknown compilation error"],
        warnings: result.warnings
      }));
      process.exit(1);
    }
  } catch (error: any) {
    console.log(JSON.stringify({
      success: false,
      errors: [error.message || "Invalid JSON or internal failure"]
    }));
    process.exit(1);
  }
}

main();
