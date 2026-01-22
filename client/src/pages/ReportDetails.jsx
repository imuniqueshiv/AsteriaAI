import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ArrowLeft, FileDown, Activity, ShieldAlert, Zap, ClipboardCheck, Microscope, AlertCircle } from "lucide-react";
import { generatePDF } from "../utils/PDFGenerator";

const ReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContent);

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/report/${id}`, {
        credentials: "include",
      });
      const data = await response.json();

      if (data.success) {
        setReport(data.report);
      }
    } catch (error) {
      console.error("Error fetching report:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-white text-lg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <div className="animate-pulse tracking-widest text-sm uppercase font-black">Retrieving Triage Data...</div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex justify-center items-center text-white text-lg font-mono">
        404: TRIAGE REPORT NOT FOUND
      </div>
    );
  }

  const {
    xrayImage,
    gradcamImage,
    prediction,
    probabilities,
    riskLevel,
    confidence,
    symptomsText,
    mcqResponses,
    createdAt,
  } = report;

  const formattedDate = new Date(createdAt).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const getRiskBadgeStyle = () => {
    if (riskLevel?.includes("High")) return "text-red-300 bg-red-900/40 border-red-700 shadow-[0_0_15px_rgba(239,68,68,0.3)]";
    if (riskLevel?.includes("Moderate")) return "text-yellow-300 bg-yellow-900/40 border-yellow-700";
    return "text-green-300 bg-green-900/40 border-green-700";
  };

  // Helper to ensure Base64 images have the correct prefix and are not empty
  const renderBase64Image = (imgSource, fallbackLabel) => {
    if (!imgSource || imgSource === "" || imgSource === "null") {
      return (
        <div className="w-full aspect-square flex flex-col items-center justify-center bg-white/5 rounded-xl border border-white/10 text-white/20">
          <AlertCircle className="w-8 h-8 mb-2" />
          <p className="text-[10px] font-black uppercase tracking-tighter">{fallbackLabel} Unavailable</p>
        </div>
      );
    }
    const cleanSrc = imgSource.startsWith('data:') ? imgSource : `data:image/jpeg;base64,${imgSource}`;
    return (
      <img 
        src={cleanSrc} 
        alt={fallbackLabel} 
        className="w-full h-auto rounded-xl shadow-2xl transition-opacity duration-700 hover:opacity-100 opacity-90"
        onError={(e) => {
          e.target.onerror = null; 
          e.target.src = "https://via.placeholder.com/400?text=Invalid+Image+Data";
        }}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col text-white" style={{ background: "linear-gradient(180deg, #0d0333, #4a0a91)" }}>
      <Navbar />

      {/* Header - Multi-Stage Framing */}
      <div className="max-w-6xl mx-auto text-center mt-32 mb-10 px-6">
        <div className="flex flex-col items-center gap-2 mb-4">
          <span className="text-xs font-bold tracking-[0.3em] text-blue-400 uppercase">Stage 3: Assessment Summary</span>
          <h1 className="text-3xl md:text-5xl font-black flex items-center justify-center gap-3">
            Integrated Triage: {prediction}
          </h1>
        </div>
        
        <p className="text-white/50 font-mono text-xs tracking-tighter">SCREENING_ID: {id.toUpperCase()}</p>
        <p className="text-white/40 mt-1 text-[11px] font-bold uppercase tracking-widest">{formattedDate}</p>

        <div className={`inline-block mt-6 px-8 py-2.5 rounded-full border text-xl font-black tracking-tight ${getRiskBadgeStyle()}`}>
          {riskLevel} — {confidence} CONFIDENCE
        </div>

        <button onClick={() => navigate("/dashboard")} className="mt-8 flex items-center gap-2 mx-auto text-white/40 hover:text-blue-300 transition-all text-[10px] font-black uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Back to History
        </button>
      </div>

      <main className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
        
        {/* STAGE 2: IMAGING-ASSISTED RISK (AI VISION EXPLAINABILITY) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
            <h3 className="text-xl font-black mb-8 flex items-center gap-3 italic tracking-tight">
              <Microscope className="w-6 h-6 text-blue-400" /> Stage 2: AI Vision Explainability
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-black text-center">Original Anterior-Posterior Scan</p>
                <div className="bg-black/60 rounded-2xl p-2 border border-white/5 shadow-inner">
                  {renderBase64Image(xrayImage, "X-Ray")}
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-blue-400 font-black text-center">Grad-CAM Spatial Mapping</p>
                <div className="bg-blue-900/20 rounded-2xl p-2 border border-blue-500/20 shadow-lg ring-1 ring-blue-500/30">
                  {renderBase64Image(gradcamImage, "Heatmap")}
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-5 bg-blue-500/5 rounded-2xl border border-blue-500/10 backdrop-blur-md">
               <p className="text-[11px] text-blue-200/60 leading-relaxed font-medium italic">
                * Clinical Note: The Spatial Mapping Heatmap utilizes gradient-weighted activation to isolate pulmonary abnormalities detected by the CNN. This assists clinicians in identifying focal opacities associated with {prediction}.
              </p>
            </div>
          </div>

          {/* QUANTITATIVE CONFIDENCE METRICS */}
          {probabilities && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8">
              <h3 className="text-lg font-black mb-8 flex items-center gap-2 uppercase tracking-tighter">
                 <Zap className="w-5 h-5 text-yellow-400" /> Quantitative Confidence Metrics
              </h3>
              <div className="space-y-7">
                {Object.entries(probabilities).map(([key, value]) => (
                  <div key={key} className="group">
                    <div className="flex justify-between text-[11px] mb-2.5">
                      <span className="font-black tracking-[0.2em] text-white/50 group-hover:text-white transition-colors uppercase">{key}</span>
                      <span className="font-mono font-bold text-blue-400 tracking-tighter">{(value * 100).toFixed(2)}% Confidence</span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(37,99,235,0.4)]" style={{ width: `${value * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* STAGE 1 & 3: CLINICAL SUMMARY & REFERRAL ACTION */}
        <div className="space-y-8">
          <div className="bg-[#1b1f3b]/70 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl sticky top-28">
            <h3 className="text-xl font-black mb-8 flex items-center gap-3 italic tracking-tight">
               <ClipboardCheck className="w-6 h-6 text-purple-400" /> Stage 1: Clinical Profile
            </h3>
            
            <div className="space-y-8">
              <div>
                <p className="text-[10px] uppercase text-white/30 mb-3 font-black tracking-[0.2em]">Qualitative Symptom History</p>
                <div className="bg-white/5 p-5 rounded-2xl text-xs text-white/70 border border-white/5 italic leading-relaxed font-medium">
                  "{symptomsText || "No qualitative patient history recorded."}"
                </div>
              </div>

              {mcqResponses && (
                <div>
                  <p className="text-[10px] uppercase text-white/30 mb-4 font-black tracking-[0.2em]">Risk Factor Checklist</p>
                  <div className="space-y-1">
                    {Object.entries(mcqResponses).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-[11px] py-2.5 border-b border-white/5 last:border-0">
                        <span className="text-white/50 capitalize font-bold">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="text-blue-300 font-black uppercase tracking-tighter">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-12 pt-8 border-t border-white/10">
              <h4 className="text-[11px] font-black flex items-center gap-2 mb-4 uppercase tracking-[0.2em] text-orange-400">
                <ShieldAlert className="w-4 h-4" /> Stage 3: Referral Action
              </h4>
              {riskLevel.includes("High") ? (
                <div className="text-[12px] font-bold text-red-100 bg-red-900/30 p-5 rounded-2xl border border-red-500/30 leading-relaxed shadow-[inset_0_0_15px_rgba(239,68,68,0.1)]">
                  CRITICAL: Severe risk indicators identified. Immediate referral to a Primary Health Centre (PHC) or District Hospital for expert clinical validation is required.
                </div>
              ) : (
                <div className="text-[12px] font-bold text-green-100 bg-green-900/30 p-5 rounded-2xl border border-green-500/30 leading-relaxed shadow-[inset_0_0_15px_rgba(34,197,94,0.1)]">
                  MONITOR: Low to Moderate triage risk. Routine observation suggested. If symptoms like persistent cough worsen within 48 hours, proceed to medical evaluation.
                </div>
              )}
            </div>

            <button 
              onClick={() => generatePDF(report)} 
              className="w-full mt-10 bg-gradient-to-r from-blue-700 to-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] active:scale-95 text-white font-black py-4.5 rounded-2xl flex items-center justify-center gap-3 transition-all uppercase text-[11px] tracking-[0.2em] shadow-xl"
            >
              <FileDown className="w-5 h-5" /> Export Referral Note
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ReportDetails;