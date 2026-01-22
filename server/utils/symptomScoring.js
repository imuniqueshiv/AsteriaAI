/**
 * symptomScoring.js
 * ----------------------------------------
 * Converts patient symptoms into
 * TB and Pneumonia risk scores (0–1)
 *
 * This is NOT diagnosis.
 * It is probabilistic clinical reasoning.
 */

export function scoreSymptoms(symptoms) {
  /**
   * Expected symptoms input:
   * {
   *   age: Number,
   *   cough_days: Number,
   *   fever: Boolean,
   *   night_sweats: Boolean,
   *   weight_loss: Boolean,
   *   chest_pain: Boolean,
   *   breathlessness: Boolean
   * }
   */

  let tbScore = 0;
  let pneumoniaScore = 0;

  // -------------------------
  // Temporal patterns
  // -------------------------
  if (symptoms.cough_days >= 14) {
    tbScore += 0.25;          // chronic cough → TB signal
  } else if (symptoms.cough_days > 0 && symptoms.cough_days < 7) {
    pneumoniaScore += 0.20;  // acute cough → pneumonia signal
  }

  // -------------------------
  // Constitutional symptoms
  // -------------------------
  if (symptoms.weight_loss) {
    tbScore += 0.25;
  }

  if (symptoms.night_sweats) {
    tbScore += 0.20;
  }

  // -------------------------
  // Infection signals
  // -------------------------
  if (symptoms.fever) {
    pneumoniaScore += 0.20;
    if (symptoms.cough_days >= 10) {
      tbScore += 0.10; // prolonged fever shifts toward TB
    }
  }

  // -------------------------
  // Respiratory distress
  // -------------------------
  if (symptoms.breathlessness) {
    pneumoniaScore += 0.20;
  }

  if (symptoms.chest_pain) {
    pneumoniaScore += 0.15;
  }

  // -------------------------
  // Age factor (risk modifier)
  // -------------------------
  if (symptoms.age >= 60) {
    pneumoniaScore += 0.10; // elderly → pneumonia risk ↑
  }

  if (symptoms.age <= 15) {
    pneumoniaScore += 0.05; // pediatric pneumonia bias
  }

  // -------------------------
  // Normalization & safety
  // -------------------------
  tbScore = Math.min(tbScore, 1);
  pneumoniaScore = Math.min(pneumoniaScore, 1);

  return {
    tb_symptom_score: tbScore,
    pneumonia_symptom_score: pneumoniaScore
  };
}
