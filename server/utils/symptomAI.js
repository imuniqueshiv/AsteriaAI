export const analyzeSymptoms = (symptoms) => {
  const {
    age,
    cough,
    coughDuration,
    fever,
    weightLoss,
    nightSweats,
    breathlessness,
    chestPain,
  } = symptoms;

  // -----------------------------
  // Feature encoding (0–1 scale)
  // -----------------------------
  const chronicCoughScore =
    cough && coughDuration >= 14 ? 1.0 :
    cough ? 0.5 : 0.0;

  const constitutionalScore =
    (weightLoss ? 0.5 : 0) +
    (nightSweats ? 0.5 : 0);

  const infectionScore = fever ? 0.8 : 0.0;
  const respiratoryScore = breathlessness ? 0.7 : 0.0;
  const painScore = chestPain ? 0.4 : 0.0;

  const ageFactor =
    age >= 60 ? 0.3 :
    age >= 40 ? 0.2 :
    0.1;

  // -----------------------------
  // Probabilistic disease scores
  // (continuous, not rules)
  // -----------------------------
  const tbLikelihood =
    0.35 * chronicCoughScore +
    0.30 * constitutionalScore +
    0.20 * infectionScore +
    0.15 * ageFactor;

  const pneumoniaLikelihood =
    0.40 * infectionScore +
    0.30 * respiratoryScore +
    0.20 * painScore +
    0.10 * (cough ? 1 : 0);

  // -----------------------------
  // Normalize (soft comparison)
  // -----------------------------
  const total = tbLikelihood + pneumoniaLikelihood + 0.01;
  const tbProb = tbLikelihood / total;
  const pneumoniaProb = pneumoniaLikelihood / total;

  // -----------------------------
  // Decision logic (triage, not diagnosis)
  // -----------------------------
  let suspectedCondition = "LOW_RISK";
  let riskLevel = "LOW";

  if (tbProb > 0.6) {
    suspectedCondition = "TB_RISK";
    riskLevel = tbProb > 0.75 ? "HIGH" : "MEDIUM";
  } else if (pneumoniaProb > 0.6) {
    suspectedCondition = "PNEUMONIA_RISK";
    riskLevel = pneumoniaProb > 0.75 ? "HIGH" : "MEDIUM";
  }

  // -----------------------------
  // Confidence & uncertainty
  // -----------------------------
  const confidence = Math.max(tbProb, pneumoniaProb);
  const uncertainty = confidence < 0.65;

  // -----------------------------
  // Explanation (LLM-style, but fixed)
  // -----------------------------
  let explanation =
    "Based on the provided symptoms, no strong indicators of serious lung disease are detected at this time.";

  if (suspectedCondition === "TB_RISK") {
    explanation =
      "The combination of prolonged cough, systemic symptoms, and patient age suggests a possible tuberculosis risk. Further clinical testing is recommended.";
  }

  if (suspectedCondition === "PNEUMONIA_RISK") {
    explanation =
      "Acute symptoms such as fever, breathing difficulty, and chest discomfort are consistent with a possible pneumonia risk and warrant medical attention.";
  }

  // -----------------------------
  // Action guidance (triage)
  // -----------------------------
  const recommendedActions = uncertainty
    ? ["Clinical evaluation recommended to clarify risk"]
    : suspectedCondition === "TB_RISK"
    ? ["Sputum test", "Chest X-ray", "Visit TB clinic"]
    : suspectedCondition === "PNEUMONIA_RISK"
    ? ["Chest X-ray", "Consult physician within 24–48 hours"]
    : ["Monitor symptoms", "Seek care if symptoms worsen"];

  return {
    suspectedCondition,
    riskLevel,
    confidence: Number(confidence.toFixed(2)),
    uncertainty,
    explanation,
    recommendedActions,
  };
};
