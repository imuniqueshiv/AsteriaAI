/**
 * summaryGenerator.js
 * ----------------------------------------
 * Generates a natural language clinical summary 
 * from the Screening Data (Chat + AI Results).
 */

export function generateSummary(record) {
  if (!record) return "No screening data available.";

  // 1. Extract Data
  const {
    patientName, patientAge, patientGender,
    symptomTags = [],
    riskLevel,
    confidence,
    prediction,
    probabilities, // { TB: 0.9, PNEUMONIA: 0.0 ... }
    symptomScore,
    xrayImage
  } = record;

  // 2. Build Patient Header
  let summary = `ASTERIA AI - TRIAGE REPORT\n`;
  summary += `-----------------------------------\n`;
  summary += `PATIENT PROFILE:\n`;
  summary += `Name: ${patientName || "Anonymous"}\n`;
  summary += `Age/Sex: ${patientAge || "N/A"} / ${patientGender || "N/A"}\n`;
  summary += `Date: ${new Date(record.createdAt || Date.now()).toLocaleDateString()}\n\n`;

  // 3. Stage 1: Clinical Findings (From Tags)
  summary += `STAGE 1: CLINICAL SYMPTOM PROFILE\n`;
  summary += `-----------------------------------\n`;
  
  if (symptomTags.length > 0) {
    summary += `Detected Clinical Flags:\n`;
    // Convert tags like "TB_FLAG" to "TB Risk Factor"
    const formattedTags = symptomTags.map(tag => 
      tag.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
    );
    summary += `- ${formattedTags.join("\n- ")}\n`;
  } else {
    summary += `- No specific red flags detected in interview.\n`;
  }
  
  summary += `\nSymptom Severity Score: ${symptomScore}/100\n\n`;

  // 4. Stage 2: AI Vision Findings
  summary += `STAGE 2: IMAGING ANALYSIS\n`;
  summary += `-----------------------------------\n`;
  
  if (xrayImage) {
    summary += `Primary AI Prediction: ${prediction}\n`;
    summary += `Confidence: ${confidence}\n`;
    
    if (probabilities) {
      summary += `\nDetailed Probability Distribution:\n`;
      summary += `- Tuberculosis (TB): ${(probabilities.TB * 100).toFixed(1)}%\n`;
      summary += `- Pneumonia: ${(probabilities.PNEUMONIA * 100).toFixed(1)}%\n`;
      summary += `- Normal: ${(probabilities.NORMAL * 100).toFixed(1)}%\n`;
    }
  } else {
    summary += `[Imaging Not Performed / Unavailable]\n`;
    summary += `Analysis is based on Clinical Symptoms only.\n`;
  }

  // 5. Final Assessment
  summary += `\n-----------------------------------\n`;
  summary += `FINAL TRIAGE ASSESSMENT: ${riskLevel.toUpperCase()}\n`;
  
  if (riskLevel.includes("High")) {
    summary += `ACTION: URGENT REFERRAL to District Hospital recommended.\n`;
  } else if (riskLevel.includes("Moderate")) {
    summary += `ACTION: Clinical Review at nearest PHC within 48 hours.\n`;
  } else {
    summary += `ACTION: Symptomatic relief and home isolation.\n`;
  }

  return summary.trim();
}