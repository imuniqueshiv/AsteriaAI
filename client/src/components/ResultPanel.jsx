import React from "react";

const ResultPanel = ({ xrayImage, symptomsText, voiceText }) => {
  // Temporary placeholder risk logic
  const riskLevel = "High Risk";
  const confidence = "92%";

  const getRiskColor = () => {
    if (riskLevel.includes("High")) return "text-red-400 bg-red-900/40 border-red-700";
    if (riskLevel.includes("Moderate")) return "text-yellow-300 bg-yellow-900/40 border-yellow-700";
    return "text-green-300 bg-green-900/40 border-green-700";
  };

  return (
    <div className="w-full bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
      
      {/* HEADER */}
      <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
        <span className="text-purple-300">🧠</span> AI Analysis Result
      </h2>
      <p className="text-white/60 mb-6">
        Combined output from chest X-ray + symptoms
      </p>

      {/* RISK BADGE */}
      <div
        className={`w-fit px-5 py-2 rounded-full border text-lg font-semibold mb-6 ${getRiskColor()}`}
      >
        {riskLevel} — Confidence {confidence}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

        {/* X-RAY PREVIEW + HEATMAP */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-4 flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-3">Chest X-ray Heatmap</h3>

          <div className="w-full h-64 bg-black/50 border border-white/20 rounded-lg flex items-center justify-center">
            {xrayImage ? (
              <img
                src={xrayImage}
                alt="heatmap"
                className="w-full h-full object-cover rounded-lg opacity-90"
              />
            ) : (
              <span className="text-white/40 text-sm">
                Heatmap will appear here
              </span>
            )}
          </div>

          <p className="text-xs text-white/40 mt-3">
            *Heatmap highlights areas of abnormality
          </p>
        </div>

        {/* SYMPTOMS SUMMARY */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-4 flex flex-col">
          <h3 className="text-lg font-semibold mb-3">Symptoms Summary</h3>

          <div className="bg-black/30 border border-white/10 rounded-lg p-4 mb-4 min-h-[80px] text-sm text-white/80">
            {voiceText || symptomsText || "No symptoms provided."}
          </div>

          {/* Suggested Action */}
          <div className="mt-auto">
            <h3 className="text-lg font-semibold mb-2">Suggested Action</h3>

            <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-lg p-4 text-sm">
              Immediate referral recommended.  
              Advise visiting nearest PHC or district hospital for confirmatory testing.
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ResultPanel;
