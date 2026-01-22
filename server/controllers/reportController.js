import Report from "../models/reportModel.js";

/**
 * Saves a full screening report, including Stage 2 AI Vision explainability.
 * Updated to capture gradcamImage for Stage 3 Referral Intelligence.
 */
export const saveReport = async (req, res) => {
  try {
    const {
      xrayImage,      // Original Base64
      gradcamImage,   // Added: Heatmap Base64 for Stage 2 explainability
      prediction,     // e.g., 'TUBERCULOSIS'
      probabilities,  // CNN output scores
      symptomsText,
      mcqResponses,
      voiceSymptoms,
      riskScore,
      riskLevel,
      confidence
    } = req.body;

    // 1. Mandatory Imaging Check
    if (!xrayImage) {
      return res.status(400).json({
        success: false,
        message: "Original X-ray image data is required for clinical records",
      });
    }

    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User session expired",
      });
    }

    // 2. Persistent Storage (Includes Grad-CAM)
    const newReport = await Report.create({
      userId,
      xrayImage,
      gradcamImage,   // Now correctly passed into the document creation
      prediction,
      probabilities,
      symptomsText,
      mcqResponses,
      voiceSymptoms,
      riskScore,
      riskLevel,
      confidence,
      createdAt: new Date()
    });

    return res.json({ 
      success: true, 
      message: "Stage 2 Assessment saved to secure database",
      report: newReport 
    });

  } catch (error) {
    console.error("❌ Save Report Backend Error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Retrieves historical screening records for the authenticated user.
 */
export const getHistory = async (req, res) => {
  try {
    const userId = req.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    // Fetch reports with newest first for the Stage 3 Triage Dashboard
    const reports = await Report.find({ userId }).sort({ createdAt: -1 });
    return res.json({ success: true, count: reports.length, reports });
    
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Fetches a single specific report by ID for the Detailed Analysis view.
 */
export const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId || req.user?.id;

    // Security: Only the owner can access their medical triage data
    const report = await Report.findOne({ _id: id, userId: userId });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Triage record not found or access denied",
      });
    }

    return res.json({ success: true, report });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error retrieving report" });
  }
};

/**
 * Permanent deletion of a specific report to clear database memory.
 */
export const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId || req.user?.id;

    const report = await Report.findOne({ _id: id, userId: userId });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Record not found or unauthorized for deletion",
      });
    }

    await Report.findByIdAndDelete(id);
    return res.json({ success: true, message: "Clinical record successfully purged" });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Database Error during deletion" });
  }
};