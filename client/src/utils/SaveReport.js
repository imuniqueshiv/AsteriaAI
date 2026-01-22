import axios from "axios";

/**
 * Saves the screening report to the database.
 * Updated to handle AI prediction data and Base64 images for offline-first persistence.
 */
export const saveReportToDatabase = async (backendUrl, reportData) => {
  try {
    // ------------------------------------------------------------------
    // CLEAN DATA MAPPING
    // ------------------------------------------------------------------
    const cleanData = {
      // ✅ Use the persistent Base64 string from AI instead of a temporary blob preview
      xrayImage: reportData.xrayImage || null, 
      
      // ✅ Include the specific AI labels and scores for accurate history
      prediction: reportData.prediction || "N/A",
      probabilities: reportData.probabilities || {},
      
      symptomsText: reportData.symptomsText || "",
      voiceSymptoms: reportData.voiceSymptoms || "",
      mcqResponses: reportData.mcqResponses || {},
      
      // ✅ Use the scores calculated in ResultPanel
      riskScore: reportData.riskScore || 0,
      riskLevel: reportData.riskLevel || "Unknown",
      confidence: reportData.confidence || "0%",
    };

    console.log("Saving Report to Database...", cleanData.prediction);

    const { data } = await axios.post(
      `${backendUrl}/api/report/save-report`,
      cleanData,
      { withCredentials: true }
    );

    return data;
  } catch (error) {
    // Log the detailed error from the backend to help debugging
    console.error("Error saving report:", error.response?.data || error.message);
    return null;
  }
};