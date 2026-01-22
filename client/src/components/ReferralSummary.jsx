import React from "react";
import { X, ClipboardCheck, Activity, FileText, ShieldAlert, Printer, Building2, Calendar, Microscope } from "lucide-react";

/**
 * Stage 3: Referral Summary Component
 * Final clinical handoff note designed for low-resource settings.
 */
const ReferralSummary = ({ isOpen, onClose, hospitalName, screeningData, patientName }) => {
  if (!isOpen) return null;

  // Extract persistent data from the screening result
  const {
    prediction = "Pending Triage",
    riskLevel = "Unknown Risk",
    confidence = "N/A",
    symptomsText = "No structured symptom data recorded for this referral.",
    xrayImage = null,
    createdAt = new Date().toISOString(),
    _id = "UNKNOWN_ID",
    probabilities = {}
  } = screeningData || {};

  const formattedDate = new Date(createdAt).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // Dynamic Risk Styling to ensure consistency with the Triage Dashboard
  const getRiskStyle = () => {
    if (riskLevel.includes("High")) return { 
      bg: "bg-red-900/30", 
      border: "border-red-500/50", 
      text: "text-red-100", 
      icon: "text-red-400",
      accent: "from-red-600 to-red-400" 
    };
    if (riskLevel.includes("Moderate")) return { 
      bg: "bg-yellow-900/30", 
      border: "border-yellow-500/50", 
      text: "text-yellow-100", 
      icon: "text-yellow-400",
      accent: "from-yellow-600 to-yellow-400"
    };
    return { 
      bg: "bg-green-900/30", 
      border: "border-green-500/50", 
      text: "text-green-100", 
      icon: "text-green-400",
      accent: "from-green-600 to-green-400"
    };
  };

  const riskStyle = getRiskStyle();

  return (
    <div className="fixed inset-0 z-[999] bg-[#0d0333]/80 backdrop-blur-md flex items-start justify-center overflow-y-auto pt-10 sm:pt-20 p-4 animate-in fade-in duration-300">
      
      {/* Modal Container - Glassmorphic Medical Aesthetic */}
      <div className="relative w-full max-w-2xl bg-[#1b1f3b]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 mb-10">
        
        {/* Dynamic Header Bar */}
        <div className={`h-3 w-full bg-gradient-to-r ${riskStyle.accent}`}></div>

        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all z-10"
        >
          <X size={20} className="text-white/60 hover:text-white" />
        </button>

        <div className="p-8 sm:p-10">
          {/* Header Section */}
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-blue-600/20 p-4 rounded-2xl border border-blue-500/30 shadow-lg">
              <ClipboardCheck className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-1 font-mono">Stage 3: Referral Logic</p>
              <h2 className="text-3xl font-black text-white leading-none tracking-tight">Clinical Handoff Note</h2>
            </div>
          </div>

          {/* Destination & Proximity Context */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-1">Assigned Medical Facility</p>
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Building2 size={18} className="text-blue-400" /> {hospitalName || "Selected PHC/CHC"}
              </h3>
            </div>
            <div className="text-right">
               <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-1">Date Created</p>
               <p className="text-sm font-bold flex items-center gap-2 justify-end text-white/70">
                 <Calendar size={14} /> {formattedDate}
               </p>
            </div>
          </div>

          {/* Integrated Risk Status - Combines Stage 1 & Stage 2 Data */}
          <div className={`rounded-3xl border ${riskStyle.border} ${riskStyle.bg} p-6 mb-8 relative overflow-hidden`}>
            <ShieldAlert className={`absolute -right-4 -bottom-4 w-32 h-32 opacity-10 ${riskStyle.icon} pointer-events-none`} />
            
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-1 border-r border-white/10 pr-4">
                 <p className="text-[10px] uppercase font-bold opacity-60 tracking-widest">Patient Identity</p>
                 <p className="text-lg font-black truncate">{patientName || "Verified Patient"}</p>
                 <p className="text-[10px] font-mono opacity-50 pt-2 uppercase tracking-tighter">SCREENING_ID: {_id.slice(-8)}</p>
              </div>

              <div className="md:col-span-2 pl-0 md:pl-4">
                 <p className="text-[10px] uppercase font-bold opacity-60 tracking-widest mb-2">Multi-Stage Triage Analysis</p>
                 <div className="flex items-center gap-3 mb-2">
                    <Activity className={`w-6 h-6 ${riskStyle.icon}`} />
                    <h3 className="text-2xl font-black uppercase tracking-tight">{riskLevel}</h3>
                 </div>
                 <p className={`text-sm font-bold flex items-center gap-2 ${riskStyle.text}`}>
                   Primary Indication: {prediction} ({confidence} Confidence)
                 </p>
              </div>
            </div>
          </div>

          {/* Qualitative Clinical Context */}
          <div className="space-y-6 mb-10">
            <div>
               <h4 className="text-[11px] font-black flex items-center gap-2 mb-3 uppercase tracking-[0.2em] text-white/60">
                 <FileText size={16} className="text-purple-400" /> Stage 1: Symptom Intelligence Engine
               </h4>
               <div className="bg-black/30 border border-white/5 rounded-2xl p-5 text-sm text-white/80 italic leading-relaxed font-medium shadow-inner">
                 "{symptomsText}"
               </div>
            </div>
            
            {/* Visual Confirmation */}
            {xrayImage && (
              <div>
                <h4 className="text-[11px] font-black flex items-center gap-2 mb-3 uppercase tracking-[0.2em] text-white/60">
                  <Microscope size={16} className="text-blue-400" /> Stage 2: AI Vision Confirmation
                </h4>
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                   <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/60 border border-white/10 shadow-lg">
                      <img 
                        src={xrayImage.startsWith('data') ? xrayImage : `data:image/jpeg;base64,${xrayImage}`} 
                        alt="Clinical Scan" 
                        className="w-full h-full object-cover" 
                      />
                   </div>
                   <div>
                     <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-0.5">Imaging Metadata</p>
                     <p className="text-sm font-black text-white/90">Anterior-Posterior (AP) Chest X-Ray</p>
                   </div>
                </div>
              </div>
            )}
          </div>

          {/* Referral Actions & Professional Branding */}
          <div className="flex flex-col sm:flex-row gap-6 pt-6 border-t border-white/10 items-center">
            <div className="flex-1">
               <p className="text-[9px] text-white/30 uppercase font-bold tracking-[0.1em] mb-1">System Verification</p>
               <p className="text-xs text-white/40 italic leading-tight">
                 Asteria AI is a decision-support aid. This summary must be validated by a registered medical officer at the receiving facility.
               </p>
            </div>
            
            <button 
              onClick={() => window.print()} 
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-600 hover:to-blue-400 text-white font-black rounded-2xl shadow-xl shadow-blue-900/20 transition-all active:scale-95 uppercase text-xs tracking-[0.2em]"
            >
              <Printer size={18} />
              Print Handoff Note
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ReferralSummary;