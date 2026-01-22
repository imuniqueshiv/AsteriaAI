import { useNavigate } from "react-router-dom";
import React, { useEffect } from "react";
import { saveReportToDatabase } from "../utils/SaveReport";

const ResultPanel = ({
  xrayImage,
  symptomsText,
  voiceText,
  patientMCQ,
  backendUrl,
  symptomResult,
}) => {
  const navigate = useNavigate();

  // ------------------------------------------
  // AI-BASED RISK COMPUTATION (MATCHED TO NEW BACKEND)
  // ------------------------------------------
  // We extract probabilities directly from the xrayImage state populated by UploadImage
  const pneumoniaProb = xrayImage?.probabilities?.PNEUMONIA || 0;
  const tbProb = xrayImage?.probabilities?.TB || 0;
  const normalProb = xrayImage?.probabilities?.NORMAL || 0;

  // Total "Abnormal" risk is the highest of Pneumonia or TB
  const abnormalProb = Math.max(pneumoniaProb, tbProb);

  let riskLevel = "Low Risk";
  if (abnormalProb > 0.6) riskLevel = "High Risk";
  else if (abnormalProb > 0.3) riskLevel = "Moderate Risk";

  // Display the highest probability as the confidence percentage
  const confidence = `${Math.round(
    Math.max(normalProb, abnormalProb) * 100
  )}%`;

  const riskScore = Math.round(abnormalProb * 100);

  // ------------------------------------------
  // SYMPTOM AI DATA (UNCHANGED)
  // ------------------------------------------
  const explanation = symptomResult?.explanation || 
    (riskLevel === "High Risk" ? `AI Vision detected strong indicators of ${xrayImage?.prediction}. Clinical triage recommended.` : "No strong indicators of serious lung disease detected.");
  
  const recommendedActions = symptomResult?.recommendedActions || [
    "Consult a healthcare professional for a physical exam.",
    riskLevel !== "Low Risk" ? "Urgent clinical evaluation recommended." : "Monitor symptoms and rest."
  ];

  // ------------------------------------------
  // COLOR HANDLER
  // ------------------------------------------
  const getRiskColor = () => {
    if (riskLevel === "High Risk")
      return "text-red-400 bg-red-900/40 border-red-700";
    if (riskLevel === "Moderate Risk")
      return "text-yellow-300 bg-yellow-900/40 border-yellow-700";
    return "text-green-300 bg-green-900/40 border-green-700";
  };

  // ------------------------------------------
  // SAVE REPORT
  // ------------------------------------------
  useEffect(() => {
    // Only save if we have a valid prediction to prevent saving empty/default reports
    if (xrayImage?.prediction) {
      saveReportToDatabase(backendUrl, {
        prediction: xrayImage.prediction,
        probabilities: xrayImage.probabilities,
        xrayImage: xrayImage.originalBase64, // Saving the base64 version for history
        symptomsText,
        voiceSymptoms: voiceText,
        mcqResponses: patientMCQ,
        riskScore,
        riskLevel,
        confidence,
      });
    }
  }, [xrayImage]); // Trigger save when xrayImage result arrives

  return (
    <div className="w-full bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-700">

      {/* HEADER */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <span className="text-purple-300">🧠</span> AI Analysis Result
          </h2>
          <div
            className={`w-fit px-5 py-2 rounded-full border text-lg font-semibold ${getRiskColor()}`}
          >
            {riskLevel} — Confidence {confidence}
          </div>
        </div>
        <div className="text-right">
            <p className="text-xs text-white/40 uppercase tracking-widest">Prediction</p>
            <p className="text-xl font-black text-blue-400">{xrayImage?.prediction || "PENDING"}</p>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* DUAL-VIEW X-RAY SECTION */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            📸 AI Vision Explanation
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            {/* ORIGINAL VIEW */}
            <div className="bg-black/40 border border-white/10 rounded-xl p-3">
              <p className="text-[10px] uppercase text-white/50 mb-2 text-center">Original Scan</p>
              <div className="aspect-square bg-black/50 rounded-lg overflow-hidden border border-white/5">
                {xrayImage?.preview ? (
                  <img src={xrayImage.preview} className="w-full h-full object-cover" alt="Original" />
                ) : <div className="h-full flex items-center justify-center text-white/20 text-xs">No Scan</div>}
              </div>
            </div>

            {/* GRAD-CAM VIEW */}
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-3 shadow-lg shadow-blue-500/5">
              <p className="text-[10px] uppercase text-blue-400 mb-2 text-center font-bold">AI Heatmap (Grad-CAM)</p>
              <div className="aspect-square bg-black/50 rounded-lg overflow-hidden border border-blue-500/20">
                {xrayImage?.gradcamBase64 ? (
                  <img src={xrayImage.gradcamBase64} className="w-full h-full object-cover" alt="Grad-CAM" />
                ) : <div className="h-full flex items-center justify-center text-blue-400/20 text-xs animate-pulse">Processing...</div>}
              </div>
            </div>
          </div>
          
          <p className="text-[11px] text-white/40 italic">
            *Heatmap (Red/Yellow) highlights regions driving the AI's diagnosis.
          </p>
        </div>

        {/* CLINICAL ASSESSMENT SECTION */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-6 flex flex-col gap-5">
          <div>
            <h3 className="text-lg font-semibold mb-3">Clinical Assessment</h3>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-sm text-white/80 leading-relaxed">
              {explanation}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold mb-3 text-white/80 uppercase tracking-wider">
              Recommended Actions
            </p>
            <ul className="space-y-2">
              {recommendedActions.map((action, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-white/70">
                  <span className="text-blue-400 font-bold">•</span> {action}
                </li>
              ))}
            </ul>
          </div>

          {/* RISK SCORE METER */}
          <div className="mt-auto pt-6 border-t border-white/10">
            <div className="flex justify-between items-end mb-2">
                <span className="text-sm text-white/60">Aggregated Risk Score</span>
                <span className="text-2xl font-bold text-white">{riskScore}%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${riskLevel === 'High Risk' ? 'bg-red-500' : 'bg-blue-500'}`} 
                  style={{ width: `${riskScore}%` }}
                />
            </div>
          </div>
        </div>
      </div>

      {/* HOSPITAL BUTTON */}
      <div className="text-center mt-10">
        <button
          onClick={() => navigate("/hospital-finder")}
          className="px-10 py-4 bg-gradient-to-r from-blue-700 to-blue-500 hover:scale-105 rounded-xl text-white font-bold transition-all shadow-xl shadow-blue-900/20"
        >
          Find Nearby Medical Facilities
        </button>
      </div>
    </div>
  );
};

export default ResultPanel;