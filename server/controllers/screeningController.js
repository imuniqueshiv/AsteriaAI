import Screening from "../models/screeningModel.js";
import { calculateFusionRisk } from "../utils/fusionEngine.js"; 

/**
 * Controller: Handles the full Triage Pipeline (Dynamic AI Interview + Vision + Fusion)
 */
export const saveScreening = async (req, res) => {
  try {
    const {
      // --- Stage 2: AI Vision Inputs (Probabilities) ---
      normal = 0,
      pneumonia = 0,
      tb = 0,
      abnormal = 0, // Optional general abnormality score

      // --- Stage 1: Dynamic Interview Data ---
      symptomData, 

      // --- Metadata ---
      xrayImage, // Base64 string (Optional)
      deviceId,
    } = req.body;

    // ---------------------------------------------------------
    // 1. VALIDATION
    // ---------------------------------------------------------
    // FIX: Removed strict xrayImage check. Only symptomData is mandatory.
    if (!symptomData) {
      return res.status(400).json({
        success: false,
        message: "Incomplete triage data. Missing Interview Data.",
      });
    }

    // Extract Data
    const symptomScore = symptomData.riskScore || 0;
    const clinicalTags = symptomData.tags || [];
    const chatLog = symptomData.historyLog || [];
    
    // Extract Patient Demographics
    const { name, age, gender } = symptomData.demographics || {};

    // ---------------------------------------------------------
    // 2. STAGE 2 & 3: FUSION ENGINE
    // ---------------------------------------------------------
    // Detect Mode: If no X-ray is uploaded, we flag this as "Symptom Only"
    const isSymptomOnly = !xrayImage;

    const fusionResult = calculateFusionRisk(
      symptomScore, 
      { 
        TB: tb, 
        PNEUMONIA: pneumonia, 
        NORMAL: normal,
        ABNORMAL: abnormal || 0
      },
      clinicalTags, // Pass tags for safety overrides
      isSymptomOnly // FIX: Pass this flag so math works without X-ray
    );

    // ---------------------------------------------------------
    // 3. SAVE TO DATABASE
    // ---------------------------------------------------------
    const record = await Screening.create({
      userId: req.userId, // From auth middleware

      // --- Patient Identity ---
      patientName: name || "Anonymous",
      patientAge: age,
      patientGender: gender,

      // --- The Final Verdict ---
      prediction: fusionResult.riskLevel, 
      
      // FIX: Added missing field that caused 500 Error
      riskLevel: fusionResult.riskLevel, 

      // --- Raw Data Storage (For Audit) ---
      normal,
      pneumonia,
      tb,
      abnormal,
      
      // Symptom Data
      symptomScore: symptomScore,
      symptomTags: clinicalTags, 
      chatHistory: chatLog, 

      // --- Fusion Outputs ---
      fusionScore: fusionResult.finalScore, 
      confidence: fusionResult.confidence, 
      recommendedAction: fusionResult.action, 

      // --- Metadata ---
      xrayImage: xrayImage || null, // FIX: Save null if no image
      deviceId: deviceId || "web-client",
      synced: false,
    });

    // ---------------------------------------------------------
    // 4. RESPONSE
    // ---------------------------------------------------------
    return res.json({
      success: true,
      message: xrayImage ? "Multi-Stage Analysis Complete." : "Symptom Screening Recorded.",
      result: {
        riskLevel: fusionResult.riskLevel,
        action: fusionResult.action,
        confidence: fusionResult.confidence,
        details: {
            patient: `${name || "Patient"} (${age}, ${gender})`,
            symptomRisk: `${symptomScore}% (Based on Interview)`,
            visionRisk: isSymptomOnly ? "N/A (Symptom Only)" : (Math.max(tb, pneumonia) * 100).toFixed(1) + "%",
            clinicalTags: clinicalTags
        }
      },
      recordId: record._id
    });

  } catch (error) {
    console.error("❌ Screening Controller Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};