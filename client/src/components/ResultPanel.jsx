import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { saveReportToDatabase } from "../utils/SaveReport";

const ResultPanel = ({
  xrayImage,
  symptomsText,
  voiceText,
  patientMCQ,
  backendUrl,
  riskLevel,
  riskScore,
  confidence,
}) => {

  const navigate = useNavigate();
  const [showHospitals, setShowHospitals] = useState(false);

  // ------------------------------------------
  // COMBINE ALL SYMPTOMS
  // ------------------------------------------
  const combinedSymptoms = [];

  if (voiceText) combinedSymptoms.push(`Voice: ${voiceText}`);
  if (symptomsText) combinedSymptoms.push(`Typed: ${symptomsText}`);
  if (patientMCQ?.fever) combinedSymptoms.push(`Fever: ${patientMCQ.fever}`);
  if (patientMCQ?.cough) combinedSymptoms.push(`Cough: ${patientMCQ.cough}`);
  if (patientMCQ?.chestPain)
    combinedSymptoms.push(`Chest Pain: ${patientMCQ.chestPain}`);

  const summaryText =
    combinedSymptoms.length > 0
      ? combinedSymptoms.join(" | ")
      : "No symptoms provided.";

  // COLOR
  const getRiskColor = () => {
    if (riskLevel.includes("High"))
      return "text-red-400 bg-red-900/40 border-red-700";
    if (riskLevel.includes("Moderate"))
      return "text-yellow-300 bg-yellow-900/40 border-yellow-700";
    return "text-green-300 bg-green-900/40 border-green-700";
  };

  // SAVE REPORT
  useEffect(() => {
    saveReportToDatabase(backendUrl, {
      xrayImage,
      symptomsText,
      voiceSymptoms: voiceText,
      mcqResponses: patientMCQ,
      riskScore,
      riskLevel,
      confidence,
    });
  }, []);

  return (
    <div className="w-full bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">

      {/* HEADER */}
      <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
        <span className="text-purple-300">🧠</span> AI Analysis Result
      </h2>

      <div className={`w-fit px-5 py-2 rounded-full border text-lg font-semibold mb-6 ${getRiskColor()}`}>
        {riskLevel} — Confidence {confidence || "80%"}
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

        {/* X-RAY */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-4 flex flex-col items-center">
          
          <h3 className="text-lg font-semibold mb-3">Chest X-ray Heatmap</h3>

          <div className="w-full h-64 bg-black/50 border border-white/20 rounded-lg flex items-center justify-center">
            {xrayImage ? (
              <img src={xrayImage} alt="heatmap" className="w-full h-full object-cover rounded-lg" />
            ) : (
              <span className="text-white/40">Heatmap will appear here</span>
            )}
          </div>

        </div>

        {/* SYMPTOMS */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-4 flex flex-col">
          
          <h3 className="text-lg font-semibold mb-3">Symptoms Summary</h3>

          <div className="bg-black/30 border border-white/10 rounded-lg p-4 mb-4 text-sm text-white/80">
            {summaryText}
          </div>

        </div>

      </div>

      {/* ------------------------------ */}
      {/* HOSPITAL FINDER BUTTON         */}
      {/* ------------------------------ */}

      <div className="text-center mt-10">
        <button
          onClick={() => navigate("/hospital-finder")}  // <-- FIXED
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-semibold transition-all"
        >
          {riskLevel === "High Risk" ? "View Nearby Hospitals" : "Find Nearby Hospitals"}
        </button>
      </div>

    </div>
  );
};

export default ResultPanel;
