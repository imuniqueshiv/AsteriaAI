import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// ✅ Proper ESM directory resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const analyzeXray = async (req, res) => {
  try {
    // 1. Validate File
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "X-ray image not provided",
      });
    }

    // 2. Setup paths
    const imagePath = path.resolve(req.file.path);
    const scriptPath = path.join(__dirname, "../ml/run_inference.py");

    // ✅ HARDCODED PYTHON PATH (To ensure we use the correct environment)
    const pythonExecutable = "C:\\Users\\singh\\AppData\\Local\\Programs\\Python\\Python312\\python.exe";

    console.log(`[AI] Starting analysis for: ${req.file.filename}`);

    // 3. Spawn Python
    const pythonProcess = spawn(pythonExecutable, [scriptPath, imagePath]);

    let stdoutData = "";
    let stderrData = "";

    pythonProcess.stdout.on("data", (data) => {
      stdoutData += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      stderrData += data.toString();
    });

    pythonProcess.on("close", (code) => {
      // 4. Cleanup Temp File
      if (fs.existsSync(imagePath)) {
        fs.unlink(imagePath, (err) => {
          if (err) console.error("Temp file cleanup failed:", err);
        });
      }

      // 5. Combine Output to find our tags
      const fullOutput = stdoutData + stderrData;

      // ✅ KEY FIX: Look for data strictly between our tags
      const match = fullOutput.match(/<<<JSON_START>>>([\s\S]*?)<<<JSON_END>>>/);

      if (!match) {
        console.error("❌ Python Output Invalid (No Tags Found):", fullOutput);
        return res.status(500).json({
          success: false,
          message: "AI Engine failed to return valid data.",
          debug: fullOutput // Allows you to see the raw error in the frontend popup
        });
      }

      try {
        // Parse the clean JSON extracted from the tags
        const result = JSON.parse(match[1].trim());

        if (result.error) {
          console.error("❌ Python Script Error:", result.error);
          return res.status(500).json({
            success: false,
            message: "AI Analysis Failed",
            debug: result.traceback || result.error
          });
        }

        // Success!
        return res.json({
          success: true,
          prediction: result.prediction,
          probabilities: result.probabilities,
          original_base64: result.original_base64,
          gradcam_base64: result.gradcam_base64
        });

      } catch (err) {
        console.error("❌ JSON Parse Failed:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to parse AI results.",
        });
      }
    });

  } catch (error) {
    console.error("❌ Controller Exception:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};