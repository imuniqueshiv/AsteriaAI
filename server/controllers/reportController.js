import Report from "../models/reportModel.js";

export const saveReport = async (req, res) => {
  try {
    const { xrayImage, symptomsText, mcqResponses, voiceSymptoms, riskScore, riskLevel, heatmapImage } = req.body;

    const report = await Report.create({
      userId: req.user.id,
      xrayImage,
      symptomsText,
      mcqResponses,
      voiceSymptoms,
      riskScore,
      riskLevel,
      heatmapImage
    });

    return res.json({ success: true, report });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getHistory = async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
