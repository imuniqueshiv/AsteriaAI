import jsPDF from "jspdf";

export const generatePDF = (data) => {
  // 1. Create Document
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // --- COLORS ---
  const brandColor = "#4F46E5"; // Indigo
  const dangerColor = "#EF4444"; // Red
  const successColor = "#10B981"; // Green
  const secondaryColor = "#6B7280"; // Gray

  // --- HEADER SECTION ---
  // Brand Bar
  doc.setFillColor(brandColor);
  doc.rect(0, 0, pageWidth, 40, "F");

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("ASTERIA AI", 15, 20);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Automated Health Screening & Triage System", 15, 28);

  // Risk Badge (Top Right)
  const riskColor = data.riskLevel.includes("High") ? dangerColor : successColor;
  doc.setFillColor(riskColor);
  doc.roundedRect(pageWidth - 60, 10, 45, 12, 3, 3, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(data.riskLevel.toUpperCase(), pageWidth - 55, 18);

  // --- PATIENT INFO (White Box) ---
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Patient Name: ${data.patientName}`, 15, 55);
  doc.text(`Age / Sex: ${data.patientAge || "N/A"} / ${data.patientGender || "N/A"}`, 15, 62);
  
  doc.setFont("helvetica", "normal");
  doc.text(`Report ID: ${data._id.slice(-6).toUpperCase()}`, 120, 55);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 120, 62);

  doc.setDrawColor(200, 200, 200);
  doc.line(15, 70, pageWidth - 15, 70);

  // --- STAGE 1: CLINICAL PROFILE (The Fix) ---
  let yPos = 85;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(brandColor);
  doc.text("STAGE 1: CLINICAL SYMPTOM PROFILE", 15, yPos);

  yPos += 10;
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");

  // *** THE FIX: READ THE AI SUMMARY ***
  const summaryText = data.clinicalSummary && data.clinicalSummary.length > 5 
    ? data.clinicalSummary 
    : "No specific clinical red flags reported.";

  // Wrap text to fit page
  const splitSummary = doc.splitTextToSize(summaryText, pageWidth - 30);
  doc.text(splitSummary, 15, yPos);

  yPos += (splitSummary.length * 5) + 10; // Dynamic spacing based on text length

  // --- STAGE 2: IMAGING ANALYSIS ---
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(brandColor);
  doc.text("STAGE 2: AI IMAGING ANALYSIS", 15, yPos);

  yPos += 10;
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");

  if (data.xrayImage) {
    // Prediction Result
    doc.text(`AI Detection: ${data.prediction}`, 15, yPos);
    doc.text(`Confidence: ${data.confidence}`, 120, yPos);
    yPos += 8;
    
    // Probabilities
    if (data.probabilities) {
      doc.setFontSize(8);
      doc.setTextColor(secondaryColor);
      const probText = `Pneumonia: ${(data.probabilities.PNEUMONIA * 100).toFixed(1)}% | TB: ${(data.probabilities.TB * 100).toFixed(1)}% | Normal: ${(data.probabilities.NORMAL * 100).toFixed(1)}%`;
      doc.text(probText, 15, yPos);
      yPos += 10;
    }

    // Image (Optional placement)
    try {
      // Add X-Ray thumbnail if valid Base64
      const imgProps = doc.getImageProperties(data.xrayImage);
      const imgWidth = 50;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      doc.addImage(data.xrayImage, "JPEG", 15, yPos, imgWidth, imgHeight);
      yPos += imgHeight + 10;
    } catch (e) {
       doc.text("[ Image rendering failed ]", 15, yPos);
       yPos += 10;
    }
  } else {
    doc.text("[ Imaging Data Not Available ]", 15, yPos);
    yPos += 6;
    doc.setFontSize(9);
    doc.setTextColor(secondaryColor);
    doc.text("Risk assessment was performed using clinical symptom data only.", 15, yPos);
    yPos += 15;
  }

  // --- RECOMMENDED ACTION ---
  doc.setDrawColor(200, 200, 200);
  doc.line(15, yPos, pageWidth - 15, yPos);
  yPos += 15;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(brandColor);
  doc.text("RECOMMENDED ACTION", 15, yPos);

  yPos += 10;
  
  // Dynamic Action Box
  const actionColor = data.riskLevel.includes("High") ? dangerColor : successColor;
  doc.setFillColor(actionColor);
  doc.rect(15, yPos - 6, pageWidth - 30, 16, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  
  // Default action text if prediction missing
  let actionText = "Routine Checkup Recommended.";
  if (data.riskLevel.includes("High")) {
      actionText = "CRITICAL: Immediate referral to District Hospital or Pulmonologist required.";
  } else if (data.riskLevel.includes("Moderate")) {
      actionText = "Consultation Required: Visit Local PHC within 24 hours.";
  }

  doc.text(actionText, 20, yPos + 1);

  // --- FOOTER ---
  doc.setTextColor(secondaryColor);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Disclaimer: This is an AI-generated screening report and does not replace a doctor's diagnosis.", pageWidth / 2, pageHeight - 10, { align: "center" });

  // 2. Save
  doc.save(`Asteria_Report_${data.patientName.replace(/\s+/g, "_")}.pdf`);
};