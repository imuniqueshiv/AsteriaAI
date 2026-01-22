import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// ✅ Proper ESM directory resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * POST /api/screen/analyze
 * Controller to bridge Node.js and the Python AI Inference Engine
 */
export const analyzeXray = async (req, res) => {
  try {
    // 1. Validate that Multer successfully received the file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "X-ray image not provided or invalid file type",
      });
    }

    // 2. Setup absolute paths
    const imagePath = path.resolve(req.file.path);
    const scriptPath = path.join(__dirname, "../ml/run_inference.py");

    /**
     * 3. Define the Python Executable
     * CRITICAL: If 'python' gives Code 1, replace it with the absolute path 
     * you get by typing 'where python' in your (asteria) terminal.
     * Example: "C:\\Users\\singh\\anaconda3\\envs\\asteria\\python.exe"
     */
    const pythonExecutable = "python"; 

    console.log(`[AI] Starting analysis for: ${req.file.filename}`);

    // 4. Spawn the Python process
    const pythonProcess = spawn(pythonExecutable, [scriptPath, imagePath]);

    let stdoutData = "";
    let stderrData = "";

    // Collect data from Python's standard output
    pythonProcess.stdout.on("data", (data) => {
      stdoutData += data.toString();
    });

    // Collect error messages from Python's standard error
    pythonProcess.stderr.on("data", (data) => {
      stderrData += data.toString();
    });

    pythonProcess.on("close", (code) => {
      // 5. Cleanup: Always delete the temporary upload file
      if (fs.existsSync(imagePath)) {
        fs.unlink(imagePath, (err) => {
          if (err) console.error("Temp file cleanup failed:", err);
        });
      }

      // 6. Handle failure (Python exit code != 0)
      if (code !== 0) {
        console.error(`❌ Python Error (Exit Code ${code}):\n`, stderrData);
        return res.status(500).json({
          success: false,
          message: "The AI engine encountered an error.",
          debug: stderrData // Helps you see missing libraries in terminal
        });
      }

      // 7. Parse result and send to Frontend
      try {
        const result = JSON.parse(stdoutData.trim());

        // We return a flat object to match your React component expectations
        return res.json({
          success: true,
          prediction: result.prediction,
          probabilities: result.probabilities,
          original_base64: result.original_base64,
          gradcam_base64: result.gradcam_base64
        });

      } catch (err) {
        console.error("❌ JSON Parse Error. Raw Output was:", stdoutData);
        return res.status(500).json({
          success: false,
          message: "Failed to process AI output. Ensure Python returns valid JSON.",
        });
      }
    });
  } catch (error) {
    console.error("❌ Controller Exception:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error during X-ray analysis",
    });
  }
};