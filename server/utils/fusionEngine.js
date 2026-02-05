/**
 * STAGE 2 & 3: MULTI-MODAL FUSION ENGINE
 * ---------------------------------------------------------
 * Merges Clinical Symptom Data (Stage 1) with AI Vision Probabilities (Stage 2).
 * * * NEW CAPABILITIES:
 * 1. "Tag-Based Safety Overrides": Forces high-risk referrals for tags like "HEMOPTYSIS".
 * 2. "Symptom-Only Mode": Adapts math if no X-ray is available.
 */

export const calculateFusionRisk = (symptomScore, cnnProbabilities, clinicalTags = [], isSymptomOnly = false) => {
  
  // ---------------------------------------------------------
  // 1. NORMALIZE INPUTS
  // ---------------------------------------------------------
  
  // Symptom Score comes as 0-100. Convert to 0.0 - 1.0
  const normalizedSymptomScore = Math.min(Math.max(symptomScore, 0), 100) / 100;

  // Extract the highest threat level from the AI Vision model.
  const visualAnomalyScore = Math.max(
    cnnProbabilities.TB || 0, 
    cnnProbabilities.PNEUMONIA || 0, 
    cnnProbabilities.ABNORMAL || 0,
    cnnProbabilities.NORMAL ? 0 : 0 // Normal contributes 0 risk
  );

  // ---------------------------------------------------------
  // 2. APPLY WEIGHTED FUSION FORMULA (DYNAMIC)
  // ---------------------------------------------------------
  let finalFusionScore = 0;

  if (isSymptomOnly) {
    // --- MODE A: SYMPTOM ONLY ---
    // If no X-ray, 100% of risk comes from symptoms.
    // We do not let the missing X-ray drag the score down to 0.
    finalFusionScore = normalizedSymptomScore;
  } else {
    // --- MODE B: HYBRID FUSION ---
    // Standard Weights: Symptoms (40%) + Imaging (60%)
    const SYMPTOM_WEIGHT = 0.4;
    const VISION_WEIGHT = 0.6;
    finalFusionScore = (normalizedSymptomScore * SYMPTOM_WEIGHT) + (visualAnomalyScore * VISION_WEIGHT);
  }

  let overrideReason = null; // To track if we forced a score change

  // ---------------------------------------------------------
  // 3. CLINICAL OVERRIDE RULES (THE SAFETY NET)
  // ---------------------------------------------------------

  // RULE 1: IMMEDIATE LIFE THREAT (Cyanosis / Hypoxia)
  // Tag: "EMERGENCY"
  // Logic: Force Max Score (95%+). Immediate Hospitalization.
  if (clinicalTags.includes("EMERGENCY") || clinicalTags.includes("HYPOXIA")) {
    finalFusionScore = Math.max(finalFusionScore, 0.95);
    overrideReason = "CRITICAL EMERGENCY: Immediate Hospitalization Required";
  }

  // RULE 2: CRITICAL RED FLAGS (Hemoptysis)
  // Tag: "CRITICAL"
  // Logic: Force High Risk (at least 80%). Coughing blood needs a specialist regardless of X-ray.
  else if (clinicalTags.includes("CRITICAL")) {
    finalFusionScore = Math.max(finalFusionScore, 0.80);
    overrideReason = "Risk escalated due to Critical Symptoms (e.g., Hemoptysis)";
  }

  // RULE 3: TB SENSITIVITY BOOST
  // Tag: "TB_FLAG"
  // Logic: If historical/symptomatic TB signs exist, boost risk by 10% to prevent false negatives.
  else if (clinicalTags.includes("TB_FLAG") || clinicalTags.includes("TB_HIGH_RISK")) {
    finalFusionScore += 0.10; 
    // Cap at 1.0
    if (finalFusionScore > 1.0) finalFusionScore = 1.0;
  }

  // RULE 4: AI VISION OVERRIDE (Only runs if X-ray exists)
  // Logic: If the X-ray is undeniably bad (>95%), ignore mild symptoms.
  if (!isSymptomOnly && visualAnomalyScore > 0.95 && finalFusionScore < 0.85) {
    finalFusionScore = 0.85;
    overrideReason = "High Confidence AI Detection overrides mild symptoms";
  }

  // ---------------------------------------------------------
  // 4. GENERATE FINAL OUTPUT
  // ---------------------------------------------------------
  const displayScore = Math.round(finalFusionScore * 100);

  // Determine Triage Action
  let riskLevel = "Low Risk";
  let action = "Observation Advised";
  
  if (displayScore >= 75) {
    riskLevel = "High Risk";
    action = "URGENT REFERRAL: District Hospital (Specialist Review Required)";
  } else if (displayScore >= 40) {
    riskLevel = "Moderate Risk";
    action = "CLINICAL REVIEW: Visit nearest PHC within 48 hours for sputum test.";
  } else {
    riskLevel = "Low Risk";
    action = "HOME ISOLATION: Monitor symptoms. Return if fever persists > 3 days.";
  }

  return {
    finalScore: displayScore, 
    riskLevel,                
    action,                   
    confidence: (displayScore).toFixed(1) + "%", 
    details: {
      mode: isSymptomOnly ? "Symptom Only" : "Multi-Modal Fusion",
      symptomContribution: (normalizedSymptomScore * 100).toFixed(0) + "%",
      visionContribution: isSymptomOnly ? "N/A" : (visualAnomalyScore * 100).toFixed(0) + "%",
      dominantFactor: isSymptomOnly ? "Clinical Symptoms" : (normalizedSymptomScore > visualAnomalyScore ? "Clinical Symptoms" : "X-Ray Abnormalities"),
      safetyOverride: overrideReason || "None"
    }
  };
};