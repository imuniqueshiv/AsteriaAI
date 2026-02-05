import Screening from "../models/screeningModel.js"; // <--- SWITCHED TO CORRECT MODEL

/**
 * CONTROLLER: REPORT MANAGEMENT
 * ---------------------------------------------------------
 * Manages the retrieval and management of Triage Reports.
 * Updated to fetch from the 'Screening' collection where
 * Stage 1 (Chat) and Stage 2 (Fusion) data are stored.
 */

/**
 * Saves a report (Legacy/Manual Endpoint).
 * Note: Main triage flow uses screeningController.js, but this remains
 * for specific report-only actions or legacy support.
 */
export const saveReport = async (req, res) => {
  try {
    const {
      xrayImage,      
      gradcamImage,   // Optional: For Heatmap storage
      prediction,     
      probabilities,  
      
      // New Data Structure from Client
      symptomData, // { riskScore, tags, historyLog, demographics }
      
      // Legacy fields
      symptomsText,
      riskLevel,
      confidence
    } = req.body;

    const userId = req.userId;

    // 1. Create Record using the new Screening Schema
    const newReport = await Screening.create({
      userId,
      
      // Map Demographics
      patientName: symptomData?.demographics?.name || "Anonymous",
      patientAge: symptomData?.demographics?.age || 0,
      patientGender: symptomData?.demographics?.gender || "Unknown",

      // Map Clinical Data
      symptomScore: symptomData?.riskScore || 0,
      symptomTags: symptomData?.tags || [],
      chatHistory: symptomData?.historyLog || [], // <--- Critical for PDF Summary

      // Map Vision Data (Optional)
      xrayImage: xrayImage || null, 
      gradcamImage: gradcamImage || null, // If you decide to add heatmap storage field
      
      // Map Results
      prediction: prediction || "Unknown",
      riskLevel: riskLevel || "Low Risk",
      confidence: confidence || "0%",
      
      // Legacy/Fallback
      summary: symptomsText || "Generated Report",
      deviceId: "web-client-report",
      synced: false
    });

    return res.json({ 
      success: true, 
      message: "Report record created successfully",
      report: newReport 
    });

  } catch (error) {
    console.error("❌ Save Report Error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Retrieves historical screening records for the user.
 * Fetches from 'Screening' so the Dashboard sees the real data.
 */
export const getHistory = async (req, res) => {
  try {
    const userId = req.userId;
    // Fetch newest reports first
    const reports = await Screening.find({ userId }).sort({ createdAt: -1 });
    return res.json({ success: true, count: reports.length, reports });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Fetches a single specific report by ID.
 * This is what the 'Report Details' page calls.
 */
export const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Security check: Ensure user owns the report
    const report = await Screening.findOne({ _id: id, userId });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Triage record not found or access denied",
      });
    }

    return res.json({ success: true, report });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Error retrieving report" });
  }
};

/**
 * Permanent deletion of a report.
 */
export const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const report = await Screening.findOne({ _id: id, userId });

    if (!report) {
      return res.status(404).json({ success: false, message: "Record not found" });
    }

    await Screening.findByIdAndDelete(id);
    return res.json({ success: true, message: "Record deleted successfully" });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Database Error during deletion" });
  }
};