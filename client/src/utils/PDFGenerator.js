import jsPDF from "jspdf";

/**
 * Generates a professional, medical-grade PDF report for Asteria AI.
 * Uses a structured layout to display Dual-View AI results and clinical triage.
 */
export const generatePDF = async (report) => {
  const {
    prediction,
    probabilities,
    riskLevel,
    confidence,
    symptomsText,
    xrayImage,
    gradcamImage,
    createdAt,
    _id
  } = report;

  const pdf = new jsPDF("p", "mm", "a4");
  const margin = 20;
  const pageWidth = pdf.internal.pageSize.getWidth();
  let currentY = 20;

  // --- 1. HEADER (Medical Institute Style) ---
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.setTextColor(40, 40, 100);
  pdf.text("ASTERIA AI", margin, currentY);
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(100);
  pdf.text("Automated Health Screening & Triage System", margin, currentY + 6);
  
  pdf.setDrawColor(200);
  pdf.line(margin, currentY + 10, pageWidth - margin, currentY + 10);
  currentY += 20;

  // --- 2. PATIENT & REPORT INFO ---
  pdf.setFontSize(10);
  pdf.setTextColor(0);
  pdf.setFont("helvetica", "bold");
  pdf.text(`Report ID:`, margin, currentY);
  pdf.setFont("helvetica", "normal");
  pdf.text(`${_id}`, margin + 20, currentY);

  pdf.setFont("helvetica", "bold");
  pdf.text(`Date:`, margin, currentY + 7);
  pdf.setFont("helvetica", "normal");
  pdf.text(`${new Date(createdAt).toLocaleString()}`, margin + 20, currentY + 7);
  currentY += 20;

  // --- 3. PRIMARY AI FINDING ---
  pdf.setFillColor(245, 245, 255);
  pdf.rect(margin, currentY - 5, pageWidth - (margin * 2), 25, "F");
  
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text("PRIMARY AI VISION FINDING:", margin + 5, currentY + 2);
  
  pdf.setFontSize(16);
  pdf.setTextColor(riskLevel.includes("High") ? 200 : 0, 0, 0);
  pdf.text(`${prediction} (${riskLevel})`, margin + 5, currentY + 10);
  
  pdf.setFontSize(10);
  pdf.setTextColor(100);
  pdf.text(`Confidence Score: ${confidence}`, margin + 5, currentY + 16);
  currentY += 35;

  // --- 4. DUAL-VIEW IMAGING (Original & Grad-CAM) ---
  pdf.setFontSize(12);
  pdf.setTextColor(40, 40, 100);
  pdf.setFont("helvetica", "bold");
  pdf.text("AI VISION EXPLANATION (GRAD-CAM)", margin, currentY);
  currentY += 10;

  const imgWidth = 80;
  const imgHeight = 80;

  // Original X-Ray
  if (xrayImage) {
    const originalSrc = xrayImage.startsWith('data') ? xrayImage : `data:image/jpeg;base64,${xrayImage}`;
    pdf.addImage(originalSrc, "JPEG", margin, currentY, imgWidth, imgHeight);
    pdf.setFontSize(8);
    pdf.text("ORIGINAL SCAN", margin + 25, currentY + imgHeight + 5);
  }

  // Grad-CAM Heatmap
  if (gradcamImage) {
    const gradcamSrc = gradcamImage.startsWith('data') ? gradcamImage : `data:image/jpeg;base64,${gradcamImage}`;
    pdf.addImage(gradcamSrc, "JPEG", margin + imgWidth + 10, currentY, imgWidth, imgHeight);
    pdf.text("AI GRAD-CAM HEATMAP", margin + imgWidth + 25, currentY + imgHeight + 5);
  }
  currentY += imgHeight + 20;

  // --- 5. PROBABILITY BREAKDOWN (TB & PNEUMONIA) ---
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text("QUANTITATIVE PROBABILITY ANALYSIS", margin, currentY);
  currentY += 10;

  if (probabilities) {
    Object.entries(probabilities).forEach(([key, value]) => {
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(0);
      pdf.text(`${key}:`, margin, currentY);
      
      // Draw Progress Bar
      const barWidth = 100;
      pdf.setDrawColor(230);
      pdf.rect(margin + 40, currentY - 3, barWidth, 4);
      pdf.setFillColor(60, 100, 250);
      pdf.rect(margin + 40, currentY - 3, barWidth * value, 4, "F");
      
      pdf.text(`${(value * 100).toFixed(2)}%`, margin + 40 + barWidth + 5, currentY);
      currentY += 8;
    });
  }
  currentY += 15;

  // --- 6. CLINICAL TRIAGE & SYMPTOMS ---
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text("CLINICAL TRIAGE SUMMARY", margin, currentY);
  currentY += 10;

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "italic");
  pdf.setTextColor(50);
  const splitSymptoms = pdf.splitTextToSize(`Symptoms: ${symptomsText || "None recorded."}`, pageWidth - (margin * 2));
  pdf.text(splitSymptoms, margin, currentY);
  currentY += (splitSymptoms.length * 5) + 10;

  // --- 7. DISCLAIMER ---
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(150);
  const disclaimer = "DISCLAIMER: Asteria AI is a decision-support tool, not a definitive diagnostic system. Results must be validated by a registered medical professional. Urgency is based on AI confidence and symptom severity.";
  const splitDisclaimer = pdf.splitTextToSize(disclaimer, pageWidth - (margin * 2));
  pdf.text(splitDisclaimer, margin, pdf.internal.pageSize.getHeight() - 20);

  // --- SAVE FILE ---
  pdf.save(`Asteria_Report_${prediction}_${_id.slice(-6)}.pdf`);
};