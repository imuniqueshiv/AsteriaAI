import Screening from "../models/screeningModel.js";
import { scoreSymptoms } from "../utils/symptomScoring.js";
import { fusePrediction } from "../utils/fusionEngine.js";
import { generateSummary } from "../utils/summaryGenerator.js";

/**
 * Save full screening (Symptoms + CNN + Fusion)
 */
export const saveScreening = async (req, res) => {
  try {
    const {
      // CNN outputs
      normal,
      pneumonia,
      tb,
      abnormal,

      // symptoms object
      symptoms,

      // image
      xrayImage,

      // offline metadata (optional)
      deviceId,
    } = req.body;

    // -----------------------------
    // Basic validation
    // -----------------------------
    if (
      normal === undefined ||
      pneumonia === undefined ||
      tb === undefined ||
      abnormal === undefined ||
      !symptoms ||
      !xrayImage
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required screening fields",
      });
    }

    // -----------------------------
    // Step 1: Symptom scoring
    // -----------------------------
    const symptomScores = scoreSymptoms(symptoms);

    // -----------------------------
    // Step 2: Fusion (CNN + Symptoms)
    // -----------------------------
    const fusionResult = fusePrediction({
      cnnProbs: {
        TB: tb,
        PNEUMONIA: pneumonia,
        NORMAL: normal,
      },
      symptomScores,
    });

    // -----------------------------
    // Step 3: Generate referral summary
    // -----------------------------
    const summaryText = generateSummary({
      demographics: {
        age: symptoms.age,
        gender: symptoms.gender,
      },
      symptoms,
      fusionResult,
    });

    // -----------------------------
    // Step 4: Save screening record
    // -----------------------------
    const record = await Screening.create({
      userId: req.userId,

      // Final prediction (after fusion)
      prediction: fusionResult.finalPrediction,

      // Raw CNN probabilities
      normal,
      pneumonia,
      tb,
      abnormal,

      // Fusion outputs
      riskLevel: fusionResult.riskLevel,
      confidence: fusionResult.confidence,
      uncertainty: fusionResult.uncertainty,
      recommendedActions: fusionResult.recommendedActions,

      // Clinical summary
      summary: summaryText,

      // Image
      xrayImage,

      // Offline support
      deviceId: deviceId || "unknown-device",
      synced: false,
    });

    // -----------------------------
    // Response
    // -----------------------------
    return res.json({
      success: true,
      record,
      summary: summaryText,
    });
  } catch (error) {
    console.error("Screening Save Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
