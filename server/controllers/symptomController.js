import { analyzeSymptoms } from "../utils/symptomAI.js";

/**
 * POST /api/screen/symptom-check
 * Symptom-only clinical risk assessment (offline-first)
 */
export const symptomCheck = async (req, res) => {
  try {
    const { symptoms } = req.body;

    // -----------------------------
    // Basic validation
    // -----------------------------
    if (!symptoms || !symptoms.age || !symptoms.gender) {
      return res.status(400).json({
        success: false,
        message: "Incomplete symptom data",
      });
    }

    // -----------------------------
    // AI-based symptom reasoning
    // -----------------------------
    const result = analyzeSymptoms(symptoms);

    /*
      result structure:
      {
        riskLevel,
        suspectedCondition,
        confidence,
        uncertainty,
        reasoning,
        recommendedActions
      }
    */

    // -----------------------------
    // Response (NO DB SAVE here)
    // -----------------------------
    return res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Symptom Check Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
