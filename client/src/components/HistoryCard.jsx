import React from "react";
import { FileDown, ArrowRight, Calendar, Activity, Eye, Trash2, Clock } from "lucide-react";

const HistoryCard = ({ data, onDelete }) => {
  
  // ------------------------------------------------------------------
  // SAFE DATA EXTRACTION
  // ------------------------------------------------------------------
  const {
    prediction = "N/A",           // e.g., 'PNEUMONIA'
    riskLevel = "Unknown",         // 'Low Risk', 'Moderate Risk', 'High Risk'
    confidence = "N/A",            // e.g., '99%'
    symptomsText = "",             // Mapped from symptomsText in DB
    xrayImage = null,              // Base64 string
    createdAt,                     // Use createdAt instead of timestamp
    _id,
  } = data;

  // ------------------------------------------------------------------
  // FORMAT DATE & FULL TIME (hh:mm:ss)
  // ------------------------------------------------------------------
  const dateObj = createdAt ? new Date(createdAt) : new Date();
  
  // Full Date string (DD MMM YYYY)
  const formattedDate = dateObj.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // Full Time string (hh:mm:ss)
  const formattedTime = dateObj.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });

  // ------------------------------------------------------------------
  // RISK COLOR HANDLER
  // ------------------------------------------------------------------
  const getRiskBadgeStyle = () => {
    if (riskLevel.includes("High"))
      return "text-red-300 bg-red-900/30 border-red-700";
    if (riskLevel.includes("Moderate"))
      return "text-yellow-300 bg-yellow-900/30 border-yellow-700";
    return "text-green-300 bg-green-900/30 border-green-700";
  };

  return (
    <div className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl transition-all hover:shadow-2xl hover:bg-white/20 group">
      
      {/* Title + Date/Time Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-300" />
          {prediction} Analysis
        </h3>

        <div className="flex flex-wrap items-center gap-4 text-white/60 text-xs">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {formattedDate}
          </div>
          <div className="flex items-center gap-1.5 font-mono text-blue-400">
            <Clock className="w-3.5 h-3.5" />
            {formattedTime}
          </div>
        </div>
      </div>

      {/* Result Overview Grid */}
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        
        {/* X-Ray Thumbnail (Persistent Base64) */}
        {xrayImage && (
          <div className="w-24 h-24 flex-shrink-0 bg-black/40 rounded-xl overflow-hidden border border-white/10">
            <img 
              src={xrayImage.startsWith('data:') ? xrayImage : `data:image/jpeg;base64,${xrayImage}`} 
              className="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity" 
              alt="Scan Thumbnail" 
            />
          </div>
        )}

        {/* Status Info */}
        <div className="flex-1">
          <div
            className={`inline-block px-4 py-1.5 rounded-full border text-sm font-bold mb-3 ${getRiskBadgeStyle()}`}
          >
            {riskLevel} — {confidence} Confidence
          </div>

          <p className="text-white/70 text-sm leading-relaxed line-clamp-2">
            {symptomsText || "No symptom notes recorded for this screening."}
          </p>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
        
        {/* View Details */}
        <button
          onClick={() => window.location.href = `/report-details/${_id}`}
          className="flex-1 flex items-center justify-center gap-2 text-white bg-blue-600 px-5 py-2.5 rounded-lg font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20"
        >
          <Eye className="w-4 h-4" />
          Full Report
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Download PDF */}
        <button
          onClick={() => window.location.href = `/report/pdf/${_id}`}
          className="flex items-center gap-2 text-white/80 hover:text-white bg-black/30 px-4 py-2.5 rounded-lg border border-white/20 transition-all"
        >
          <FileDown className="w-4 h-4" />
          PDF
        </button>

        {/* Delete Button (Memory Management) */}
        <button
          onClick={() => {
            if (window.confirm("Delete this screening record permanently?")) {
              onDelete(_id);
            }
          }}
          className="flex items-center justify-center p-2.5 text-red-400 hover:text-white hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-all"
          title="Delete Assessment"
        >
          <Trash2 className="w-5 h-5" />
        </button>

      </div>

    </div>
  );
};

export default HistoryCard;