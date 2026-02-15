import Screening from "../models/screeningModel.js";
import User from "../models/userModel.js";
import { calculateFusionRisk } from "../utils/fusionEngine.js"; 

/**
 * Controller: Handles the full Triage Pipeline (Dynamic AI Interview + Vision + Fusion)
 * ✅ FEATURES: Offline-First, Guest Mode, Multi-Stage Fusion
 */
export const saveScreening = async (req, res) => {
  try {
    const {
      // --- Stage 2: AI Vision Inputs (Probabilities) ---
      normal = 0,
      pneumonia = 0,
      tb = 0,
      abnormal = 0, 

      // --- Stage 1: Dynamic Interview Data ---
      symptomData, 

      // --- Metadata ---
      xrayImage, // Base64 string (Optional)
      deviceId,
    } = req.body;

    // ---------------------------------------------------------
    // 1. VALIDATION
    // ---------------------------------------------------------
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

    // Run the Math
    const fusionResult = calculateFusionRisk(
      symptomScore, 
      { 
        TB: tb, 
        PNEUMONIA: pneumonia, 
        NORMAL: normal,
        ABNORMAL: abnormal || 0
      },
      clinicalTags, 
      isSymptomOnly 
    );

    // ---------------------------------------------------------
    // 3. PREPARE RECORD (In Memory)
    // ---------------------------------------------------------
    // We create the object properly here so we have an ID even if DB fails
    const recordData = {
      userId: req.userId || "GUEST_USER", // Handle Guest Mode (No ID)

      // --- Patient Identity ---
      patientName: name || "Anonymous",
      patientAge: age,
      patientGender: gender,

      // --- The Final Verdict ---
      prediction: fusionResult.riskLevel, 
      riskLevel: fusionResult.riskLevel, 

      // --- Raw Data Storage ---
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
      xrayImage: xrayImage || null, 
      deviceId: deviceId || "web-client",
      synced: false,
    };

    // Create Mongoose Document (Generates _id immediately)
    const record = new Screening(recordData);

    // ---------------------------------------------------------
    // 4. ATTEMPT SAVE (Offline-Safe)
    // ---------------------------------------------------------
    let savedOnline = false;
    let offlineWarning = null;

    try {
        // Only try to save if it's NOT a Guest (or if you want to allow Guest saves, remove this check)
        if (recordData.userId !== "GUEST_USER") {
             console.log("📝 Saving Triage Report to MongoDB...");
             await record.save();

             // Update User History
             await User.findByIdAndUpdate(recordData.userId, {
                $push: { history: record._id }
             });
             
             savedOnline = true;
             console.log("✅ Report Saved to Cloud");
        } else {
             console.log("👤 Guest User: Skipping Database Save");
        }

    } catch (dbError) {
        // ⚠️ CRITICAL: Catch Offline Errors here so we don't crash the Response
        console.error("❌ Database Save Failed (Offline Mode):", dbError.message);
        offlineWarning = "Network error: Report generated locally but not saved to cloud history.";
        savedOnline = false;
    }

    // ---------------------------------------------------------
    // 5. SEND RESPONSE (Guaranteed)
    // ---------------------------------------------------------
    return res.status(200).json({
      success: true,
      message: xrayImage ? "Multi-Stage Analysis Complete." : "Symptom Screening Complete.",
      savedOnline: savedOnline,
      offlineWarning: offlineWarning,
      recordId: record._id, // ✅ This ID exists even if save failed!
      result: {
        riskLevel: fusionResult.riskLevel,
        action: fusionResult.action,
        confidence: fusionResult.confidence,
        details: {
            patient: `${name || "Patient"} (${age || "?"}, ${gender || "?"})`,
            symptomRisk: `${symptomScore}% (Based on Interview)`,
            visionRisk: isSymptomOnly ? "N/A (Symptom Only)" : (Math.max(tb, pneumonia) * 100).toFixed(1) + "%",
            clinicalTags: clinicalTags
        }
      }
    });

  } catch (error) {
    // This only catches critical logic errors (bugs), not connection errors
    console.error("❌ Critical Controller Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server Logic Error: " + error.message,
    });
  }
};