import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  // Link to the user (Patient or ASHA Worker) who performed the screening
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },

  // --- STAGE 2: AI VISION DATA ---
  // Stores the Original Anterior-Posterior X-Ray Base64 string
  xrayImage: { 
    type: String, 
    required: true 
  }, 

  // Stores the AI Heatmap Base64 string for Explainable AI (Grad-CAM)
  // This is essential for clinical validation by health staff
  gradcamImage: { 
    type: String 
  }, 

  // Primary triage classification (e.g., "PNEUMONIA", "TUBERCULOSIS")
  prediction: { 
    type: String, 
    required: true 
  }, 

  // Full breakdown of probabilities from the CNN backbone
  probabilities: { 
    type: Object, 
    required: true 
  }, 

  // --- STAGE 1: SYMPTOM INTELLIGENCE DATA ---
  // Qualitative patient history from Voice or Type inputs
  symptomsText: { 
    type: String 
  }, 

  // Structured responses from the Triage Checklist
  mcqResponses: { 
    type: Object 
  }, 

  // Raw transcribed text from Voice Symptoms
  voiceSymptoms: { 
    type: String 
  },

  // --- STAGE 3: REFERRAL & TRIAGE LOGIC ---
  // Calculated triage percentage (0-100) based on Fusion Engine logic
  riskScore: { 
    type: Number, 
    required: true 
  }, 

  // Categorical risk level for actionable referral guidance
  riskLevel: { 
    type: String, 
    enum: ["Low Risk", "Moderate Risk", "High Risk", "Unknown"], 
    required: true 
  },

  // Metadata for clinical handoff
  confidence: { 
    type: String 
  }, 

  // Precise timestamp for Stage 3 Triage Dashboard tracking
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

/**
 * INDEXING: Improves performance for the Dashboard history view.
 * Ensures ASHA workers can quickly retrieve past patient records.
 */
reportSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Report", reportSchema);