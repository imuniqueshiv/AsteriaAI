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
    // AI Prediction (after fusion)
    // -----------------------------
    prediction: {
      type: String,
      enum: ["NORMAL", "PNEUMONIA", "TB"],
      required: true,
    },

    // -----------------------------
    // Raw CNN Probabilities
    // -----------------------------
    normal: {
      type: Number,
      required: true,
    },

    pneumonia: {
      type: Number,
      required: true,
    },

    tb: {
      type: Number,
      required: true,
    },

    abnormal: {
      type: Number,
      required: true,
    },

    // -----------------------------
    // Fusion Outputs
    // -----------------------------
    riskLevel: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      required: true,
    },

    confidence: {
      type: Number, // 0–1
      required: true,
    },

    uncertainty: {
      type: Boolean,
      default: false,
    },

    recommendedActions: {
      type: [String],
      default: [],
    },

    summary: {
      type: String,
      required: true,
    },

    // -----------------------------
    // X-ray Image
    // -----------------------------
    xrayImage: {
      type: String, // base64 or local file path
      required: true,
    },

    // =====================================================
    // OFFLINE-FIRST SYNC METADATA (NEW)
    // =====================================================
    synced: {
      type: Boolean,
      default: false, // false when saved offline
    },

    syncedAt: {
      type: Date,
      default: null, // set after cloud sync
    },

    deviceId: {
      type: String,
      required: true, // identifies origin device
    },
  },
  {
    timestamps: true, // createdAt / updatedAt
  }
);

export default mongoose.model("Screening", screeningSchema);
