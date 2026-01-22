/**
 * summaryGenerator.js
 * ----------------------------------------
 * Generates a clinical-style screening summary
 * for referral and documentation purposes.
 *
 * This is NOT a diagnosis.
 */

export function generateSummary({
  demographics,
  symptoms,
  fusionResult
}) {
  /**
   * demographics = { age, gender }
   * symptoms = symptom object from client
   * fusionResult = output from fusionEngine
   */

  const {
    finalPrediction,
    confidence,
    riskLevel,
    uncertainty,
    probabilities,
    recommendedActions
  } = fusionResult;

  // -----------------------------
  // Symptom text construction
  // -----------------------------
  const symptomLines = [];

  if (symptoms.cough_days > 0) {
    symptomLines.push(`Cough duration: ${symptoms.cough_days} days`);
  }
  if (symptoms.fever) symptomLines.push("Fever present");
  if (symptoms.weight_loss) symptomLines.push("Unintentional weight loss");
  if (symptoms.night_sweats) symptomLines.push("Night sweats");
  if (symptoms.chest_pain) symptomLines.push("Chest pain");
  if (symptoms.breathlessness) symptomLines.push("Breathlessness");

  const symptomText =
    symptomLines.length > 0
      ? symptomLines.join(", ")
      : "No significant symptoms reported";

  // -----------------------------
  // Summary text
  // -----------------------------
  let summary = `
AI CHEST SCREENING SUMMARY
-----------------------------------
Patient Information:
- Age: ${demographics?.age || "N/A"}
- Gender: ${demographics?.gender || "N/A"}

Reported Symptoms:
- ${symptomText}

AI Screening Findings:
- Primary Screening Outcome: ${finalPrediction}
- Risk Level: ${riskLevel}
- Confidence Score: ${(confidence * 100).toFixed(1)}%

Probability Distribution:
- TB: ${(probabilities.TB * 100).toFixed(1)}%
- Pneumonia: ${(probabilities.PNEUMONIA * 100).toFixed(1)}%
- Normal: ${(probabilities.NORMAL * 100).toFixed(1)}%
`;

  // -----------------------------
  // Uncertainty note
  // -----------------------------
  if (uncertainty) {
    summary += `
⚠️ Note:
The AI screening result shows uncertainty between conditions.
Further clinical evaluation and confirmatory testing is advised.
`;
  }

  // -----------------------------
  // Recommendations
  // -----------------------------
  summary += `
Recommended Next Steps:
`;

  recommendedActions.forEach((action, index) => {
    summary += `  ${index + 1}. ${action}\n`;
  });

  // -----------------------------
  // Disclaimer
  // -----------------------------
  summary += `
-----------------------------------
Disclaimer:
This AI output is intended for screening and decision support only.
It does NOT replace clinical diagnosis by a qualified medical professional.
`;

  return summary.trim();
}
