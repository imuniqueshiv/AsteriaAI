/**
 * STAGE 1: SYMPTOM INTELLIGENCE ENGINE
 * ----------------------------------------
 * Converts qualitative patient answers into a quantitative 
 * Clinical Severity Score (0-100%).
 * * CORE PHILOSOPHY:
 * This is NOT a diagnosis engine. It is a TRIAGE engine.
 * It measures "Urgency of Care" based on standard medical red flags.
 */

export const calculateSymptomSeverity = (responses) => {
  /**
   * Input format expected from SymptomRecorder.jsx:
   * {
   * coughDuration: 'none' | 'less_than_2_weeks' | 'more_than_2_weeks',
   * feverDuration: 'none' | 'less_than_5_days' | 'more_than_5_days',
   * bloodInSputum: 'yes' | 'no',
   * severeChestPain: 'yes' | 'no',
   * weightLoss: 'yes' | 'no',
   * difficultyBreathing: 'yes' | 'no',
   * nightSweats: 'yes' | 'no'
   * }
   */

  let score = 0;
  let riskLevel = "Low Risk";
  let redFlags = [];       // Critical indicators (Go to Hospital)
  let moderateSigns = [];  // Warning signs (Go to Clinic)

  // ---------------------------------------------------------
  // 1. CRITICAL RED FLAGS (The "Danger Zone")
  // Presence of ANY of these escalates risk immediately.
  // ---------------------------------------------------------
  
  // Hemoptysis: Strongest predictor of severe TB or lung injury
  if (responses.bloodInSputum === "yes") {
    score += 40;
    redFlags.push("Hemoptysis (Coughing blood)");
  }

  // Dyspnea: Immediate respiratory distress signal
  if (responses.difficultyBreathing === "yes") {
    score += 30;
    redFlags.push("Dyspnea (Difficulty Breathing)");
  }

  // Acute Chest Pain: Could imply Pneumonia or worse
  if (responses.severeChestPain === "yes") {
    score += 25;
    redFlags.push("Severe Chest Pain");
  }

  // Cachexia/Wasting: Strong signal for active TB
  if (responses.weightLoss === "yes") {
    score += 20;
    redFlags.push("Unexplained Weight Loss");
  }

  // ---------------------------------------------------------
  // 2. MODERATE & CHRONIC SIGNS (The "Warning Zone")
  // Duration-based logic distinguishes acute vs chronic issues.
  // ---------------------------------------------------------

  // Cough Logic
  if (responses.coughDuration === "more_than_2_weeks") {
    score += 20; // Chronic cough -> TB Risk increases
    moderateSigns.push("Chronic Cough (>14 days)");
  } else if (responses.coughDuration === "less_than_2_weeks") {
    score += 10; // Acute cough -> likely viral/bacterial infection
  }

  // Fever Logic
  if (responses.feverDuration === "more_than_5_days") {
    score += 20; // Persistent fever -> Infection not resolving
    moderateSigns.push("Persistent Fever (>5 days)");
  } else if (responses.feverDuration === "less_than_5_days") {
    score += 10; // Acute fever
  }

  // Night Sweats (Classic TB constitutional symptom)
  if (responses.nightSweats === "yes") {
    score += 15;
    moderateSigns.push("Night Sweats");
  }

  // ---------------------------------------------------------
  // 3. FINAL SCORING & SAFETY NORMALIZATION
  // ---------------------------------------------------------

  // Compound Risk Bonus: 
  // If a patient has multiple moderate signs (e.g., Fever + Cough), risk is higher than the sum of parts.
  if ((moderateSigns.length + redFlags.length) >= 3) {
    score += 10;
  }

  // Hard Cap: Score cannot exceed 100%
  if (score > 100) score = 100;

  // ---------------------------------------------------------
  // 4. TRIAGE CLASSIFICATION (The "Action" Logic)
  // ---------------------------------------------------------
  
  // SAFETY RULE: Any critical red flag automatically forces at least Moderate/High risk
  if (redFlags.length > 0) {
    // If score happened to be low but they are coughing blood, force High Risk
    if (score < 70) score = 75; 
    riskLevel = "High Risk";
  } else if (score >= 70) {
    riskLevel = "High Risk";
  } else if (score >= 35) {
    riskLevel = "Moderate Risk";
  } else {
    riskLevel = "Low Risk";
  }

  return {
    score,      // Numeric value (e.g., 65) for the Fusion Engine
    riskLevel,  // Clinical Category
    breakdown: { redFlags, moderateSigns } // Explanation for the doctor
  };
};