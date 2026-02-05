import React from "react";
import { useNavigate } from "react-router-dom";
import { FileDown, ArrowRight, Calendar, Activity, Eye, Trash2, Clock } from "lucide-react";

const HistoryCard = ({ data, onDelete }) => {
  const navigate = useNavigate();

  // ------------------------------------------------------------------
  // 1. SAFE DATA EXTRACTION
  // ------------------------------------------------------------------
  const {
    prediction = "Assessment Complete", 
    riskLevel = "Low Risk",
    confidence = "0%",
    patientName = "Anonymous",
    xrayImage = null,
    createdAt,
    _id,
  } = data;

  // ------------------------------------------------------------------
  // 2. IMAGE SANITIZER (IMPROVED FIX)
  // ------------------------------------------------------------------
  const getSafeImageSrc = (imgData) => {
    if (!imgData) return null;

    // FIX: Aggressively reject ANY data containing "blob:"
    // This catches both "blob:http..." AND "data:image...blob:http..."
    if (imgData.includes("blob:")) {
        return null;
    }

    // Valid Base64 check
    if (imgData.startsWith("data:image")) {
        return imgData;
    }

    // Raw Base64 fallback
    return `data:image/jpeg;base64,${imgData}`;
  };

  const safeImageSrc = getSafeImageSrc(xrayImage);

  // ------------------------------------------------------------------
  // 3. FORMAT DATE & TIME
  // ------------------------------------------------------------------
  const dateObj = createdAt ? new Date(createdAt) : new Date();
  
  const formattedDate = dateObj.toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });

  const formattedTime = dateObj.toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit", hour12: true
  });

  // ------------------------------------------------------------------
  // 4. COLOR LOGIC
  // ------------------------------------------------------------------
  const getRiskColor = () => {
    if (riskLevel.includes("High")) return "text-red-300 bg-red-900/30 border-red-700";
    if (riskLevel.includes("Moderate")) return "text-yellow-300 bg-yellow-900/30 border-yellow-700";
    return "text-green-300 bg-green-900/30 border-green-700";
  };

  return (
    <div className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg hover:shadow-2xl hover:bg-white/10 transition-all group animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* HEADER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <h3 className="text-lg font-bold flex items-center gap-2 text-white">
          <Activity className="w-5 h-5 text-blue-400" />
          {patientName}
        </h3>

        <div className="flex items-center gap-3 text-white/40 text-xs">
          <span className="flex items-center gap-1"><Calendar size={12}/> {formattedDate}</span>
          <span className="flex items-center gap-1 text-blue-300/60"><Clock size={12}/> {formattedTime}</span>
        </div>
      </div>

      {/* CONTENT GRID */}
      <div className="flex gap-5 mb-5">
        
        {/* THUMBNAIL (With Robust Fallback) */}
        <div className="w-20 h-20 flex-shrink-0 bg-black/40 rounded-xl overflow-hidden border border-white/5 relative">
          {safeImageSrc ? (
            <img 
              src={safeImageSrc} 
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300" 
              alt="Scan" 
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white/20 gap-1">
               <Activity size={20} />
               <span className="text-[9px] uppercase text-white/30">No Scan</span>
            </div>
          )}
        </div>

        {/* DETAILS */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-2 mb-2">
             <span className={`px-3 py-1 rounded-full border text-xs font-bold ${getRiskColor()}`}>
               {riskLevel}
             </span>
             <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white/50 text-xs">
               Confidence: {confidence}
             </span>
          </div>
          
          <p className="text-white/60 text-sm truncate font-medium">
             {prediction.replace(/_/g, " ")} Analysis
          </p>
        </div>
      </div>

      {/* ACTION FOOTER */}
      <div className="flex items-center gap-2 pt-4 border-t border-white/5">
        
        <button
          onClick={() => navigate(`/report-details/${_id}`)}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-2 rounded-lg transition-all shadow-lg shadow-blue-900/20"
        >
          <Eye size={16} /> View Report
        </button>

        <button
          onClick={() => {
            if (window.confirm("Are you sure you want to permanently delete this record?")) {
                onDelete(_id);
            }
          }}
          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          title="Delete Record"
        >
          <Trash2 size={18} />
        </button>

      </div>

    </div>
  );
};

export default HistoryCard;