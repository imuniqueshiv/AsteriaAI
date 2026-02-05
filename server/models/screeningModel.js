import mongoose from "mongoose";

const screeningSchema = new mongoose.Schema(
  {
    // -----------------------------
    // Ownership
    // -----------------------------
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // -----------------------------
    // Patient Demographics (NEW)
    // -----------------------------
    patientName: {
      type: String,
      default: "Anonymous",
    },

    patientAge: {
      type: Number,
      required: true,
    },

    patientGender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },

    // -----------------------------
    // The Verdict (Fusion Output)
    // -----------------------------
    prediction: {
      type: String, 
      required: true, 
    },

    riskLevel: {
      type: String,
      enum: ["Low Risk", "Moderate Risk", "High Risk", "LOW", "MEDIUM", "HIGH"], 
      required: true,
    },

    fusionScore: {
      type: Number, // The final 0-100 score
      default: 0
    },

    confidence: {
      type: String, // "98.5%"
      required: true,
    },

    recommendedAction: {
      type: String,
      default: "Clinical Review Advised",
    },

    // -----------------------------
    // STAGE 1: SYMPTOM INTELLIGENCE
    // -----------------------------
    symptomScore: {
      type: Number,
      default: 0
    },

    symptomTags: {
      type: [String], // e.g. ["CRITICAL", "TB_FLAG"]
      default: []
    },

    // 🩺 THE CHAT LOG (Audit Trail)
    chatHistory: [
      {
        sender: { type: String, enum: ["user", "ai"] },
        text: { type: String },
        timestamp: { type: Date, default: Date.now }
      }
    ],

    // -----------------------------
    // STAGE 2: AI VISION DATA
    // -----------------------------
    normal: { type: Number, default: 0 },
    pneumonia: { type: Number, default: 0 },
    tb: { type: Number, default: 0 },
    abnormal: { type: Number, default: 0 },

    // -----------------------------
    // Metadata & Offline Sync
    // -----------------------------
    // FIX: Made Optional for Symptom-Only Mode
    xrayImage: {
      type: String, // base64 or local file path
      required: false, 
      default: null
    },

    synced: {
      type: Boolean,
      default: false, 
    },

    syncedAt: {
      type: Date,
      default: null, 
    },

    deviceId: {
      type: String,
      required: true, 
    },
    
    summary: {
      type: String,
      required: false
    }
  },
  {
    timestamps: true, // createdAt / updatedAt
  }
);

export default mongoose.model("Screening", screeningSchema);