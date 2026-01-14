import React from "react";
import { FileDown, ArrowRight, Calendar, Activity } from "lucide-react";

const HistoryCard = ({ data }) => {
  
  // Safe data extraction
  const {
    riskLevel = "Unknown",
    confidence = "N/A",
    symptomsSummary = "",
    timestamp,
    _id,
  } = data;

  // Format date
  const dateObj = timestamp ? new Date(timestamp) : new Date();
  const formattedDate = dateObj.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // Risk color classes
  const getRiskBadgeStyle = () => {
    if (riskLevel.includes("High"))
      return "text-red-300 bg-red-900/30 border-red-700";
    if (riskLevel.includes("Moderate"))
      return "text-yellow-300 bg-yellow-900/30 border-yellow-700";
    return "text-green-300 bg-green-900/30 border-green-700";
  };

  return (
    <div className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl transition-all hover:shadow-2xl hover:bg-white/20">
      
      {/* Title + Date */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-300" />
          Screening Result
        </h3>

        <div className="flex items-center gap-2 text-white/60 text-sm">
          <Calendar className="w-4 h-4" />
          {formattedDate}
        </div>
      </div>

      {/* Risk Badge */}
      <div
        className={`inline-block px-4 py-1.5 rounded-full border text-sm font-semibold mb-4 ${getRiskBadgeStyle()}`}
      >
        {riskLevel} — {confidence}
      </div>

      {/* Symptoms Summary */}
      <p className="text-white/70 text-sm leading-relaxed mb-6">
        {symptomsSummary || "No symptom summary available."}
      </p>

      {/* Buttons Row */}
      <div className="flex items-center justify-between">
        
        {/* View Details */}
        <button
          onClick={() => window.location.href = `/report/${_id}`}
          className="flex items-center gap-2 text-white bg-purple-600 px-5 py-2 rounded-lg font-medium hover:bg-purple-500 transition-all"
        >
          View Details
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Download PDF */}
        <button
          onClick={() => window.location.href = `/report/pdf/${_id}`}
          className="flex items-center gap-2 text-white/80 hover:text-white bg-black/30 px-4 py-2 rounded-lg border border-white/20 transition-all"
        >
          <FileDown className="w-4 h-4" />
          PDF
        </button>

      </div>

    </div>
  );
};

export default HistoryCard;
