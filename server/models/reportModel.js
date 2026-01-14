import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  xrayImage: { type: String, required: true }, // Base64 or Cloud URL
  symptomsText: { type: String },
  mcqResponses: { type: Object },
  voiceSymptoms: { type: String },

  riskScore: { type: Number, required: true },
  riskLevel: { type: String, enum: ["Low", "Medium", "High"], required: true },

  heatmapImage: { type: String }, // Optional (if generated)
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Report", reportSchema);
