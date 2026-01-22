/**
 * fusionEngine.js
 * ------------------------------------------------
 * Combines X-ray CNN probabilities with
 * symptom-based risk scores to produce:
 * - Final probabilities
 * - Risk level
 * - Uncertainty flag
 * - Recommended actions
 */

export function fusePrediction({
  cnnProbs,
  symptomScores
}) {
  /**
   * cnnProbs = {
   *   TB: Number,
   *   PNEUMONIA: Number,
   *   NORMAL: Number
   * }
   *
   * symptomScores = {
   *   tb_symptom_score: Number,
   *   pneumonia_symptom_score: Number
   * }
   */

  // -----------------------------
  // Step 1: Weighted fusion
  // -----------------------------
  const CNN_WEIGHT = 0.7;
  const SYMPTOM_WEIGHT = 0.3;

  let tb = (cnnProbs.TB * CNN_WEIGHT) +
           (symptomScores.tb_symptom_score * SYMPTOM_WEIGHT);

  let pneumonia = (cnnProbs.PNEUMONIA * CNN_WEIGHT) +
                  (symptomScores.pneumonia_symptom_score * SYMPTOM_WEIGHT);

  let normal = cnnProbs.NORMAL * CNN_WEIGHT;

  // -----------------------------
  // Step 2: Normalize probabilities
  // -----------------------------
  const total = tb + pneumonia + normal;

  tb /= total;
  pneumonia /= total;
  normal /= total;

  // -----------------------------
  // Step 3: Determine top class
  // -----------------------------
  const probs = { TB: tb, PNEUMONIA: pneumonia, NORMAL: normal };

  const sorted = Object.entries(probs)
    .sort((a, b) => b[1] - a[1]);

  const [topLabel, topProb] = sorted[0];
  const [, secondProb] = sorted[1];

  // -----------------------------
  // Step 4: Uncertainty detection
  // -----------------------------
  const UNCERTAINTY_MARGIN = 0.1;
  const uncertainty = (topProb - secondProb) < UNCERTAINTY_MARGIN;

  // -----------------------------
  // Step 5: Risk classification
  // -----------------------------
  let riskLevel = "LOW";

  if (topProb >= 0.65) {
    riskLevel = "HIGH";
  } else if (topProb >= 0.4) {
    riskLevel = "MEDIUM";
  }

  // -----------------------------
  // Step 6: Action recommendations
  // -----------------------------
  let recommendedActions = [];

  if (uncertainty) {
    recommendedActions.push(
      "Result uncertain — recommend confirmatory testing",
      "Clinical evaluation advised"
    );
  } else if (topLabel === "TB") {
    recommendedActions.push(
      "Refer to district hospital",
      "Sputum test (CBNAAT / GeneXpert)",
      "Initiate infection control precautions"
    );
  } else if (topLabel === "PNEUMONIA") {
    recommendedActions.push(
      "Start antibiotics as per protocol",
      "Monitor oxygen saturation",
      "Follow-up X-ray if symptoms persist"
    );
  } else {
    recommendedActions.push(
      "No immediate abnormality detected",
      "Advise routine follow-up if symptoms develop"
    );
  }

  // -----------------------------
  // Final output
  // -----------------------------
  return {
    finalPrediction: topLabel,
    probabilities: {
      TB: Number(tb.toFixed(3)),
      PNEUMONIA: Number(pneumonia.toFixed(3)),
      NORMAL: Number(normal.toFixed(3))
    },
    confidence: Number(topProb.toFixed(3)),
    riskLevel,
    uncertainty,
    recommendedActions
  };
}
