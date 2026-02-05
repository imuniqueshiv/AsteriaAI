import React, { useRef, useState, useEffect } from "react";
// FIX: Added 'Activity' and 'CheckCircle2' to imports to prevent the blank screen crash
import { Upload, Loader2, Activity, CheckCircle2 } from "lucide-react"; 
import { uploadXray } from "../utils/loadModel";

const UploadImage = ({ xrayImage, setXrayImage }) => {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0); // State for progress percentage

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show local preview immediately
    const previewUrl = URL.createObjectURL(file);
    setLoading(true);
    setProgress(0);

    // --- 1. SIMULATE PROGRESS ANIMATION ---
    // Since we don't have real-time sockets, we simulate progress up to 90%
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90; // Hold at 90% until server responds
        return prev + Math.random() * 15; // Randomly increase speed
      });
    }, 500);

    try {
      const response = await uploadXray(file);
      console.log("AI Response:", response);

      if (!response.success) {
        alert("AI Analysis failed: " + (response.message || "Unknown error"));
        return;
      }

      // --- 2. FINISH ANIMATION ---
      clearInterval(progressInterval);
      setProgress(100);

      // Small delay to let user see "100%" before showing result
      setTimeout(() => {
        setXrayImage({
          file,
          preview: previewUrl,
          prediction: response.prediction,
          probabilities: response.probabilities,
          originalBase64: `data:image/jpeg;base64,${response.original_base64}`,
          gradcamBase64: `data:image/jpeg;base64,${response.gradcam_base64}`,
        });
        setLoading(false);
      }, 600);

    } catch (error) {
      console.error("Upload error:", error);
      alert("Server error. Check if the backend terminal shows a Python error.");
      setLoading(false);
    } finally {
      clearInterval(progressInterval);
    }
  };

  return (
    <div className="w-full bg-[#0a0f2b]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg flex flex-col items-center justify-center min-h-[350px]">
      
      {loading ? (
        // --- LOADING UI WITH PROGRESS BAR ---
        <div className="flex flex-col items-center justify-center w-full animate-in fade-in duration-500">
          <div className="relative mb-4">
             {/* Spinner */}
             <Loader2 className="w-16 h-16 text-blue-400 animate-spin opacity-50" />
             {/* Percentage Text in Center */}
             <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                {Math.round(progress)}%
             </div>
          </div>

          <h3 className="text-xl font-semibold mb-2 text-white animate-pulse">
            AI Analysis in Progress...
          </h3>
          
          <p className="text-sm text-white/50 mb-6 text-center max-w-[80%]">
            Running DenseNet121 Deep Learning Model & Generating Heatmap...
          </p>

          {/* PROGRESS BAR STRIP */}
          <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-blue-300 mt-2 font-mono">
            {progress < 100 ? "Processing Neural Layers..." : "Finalizing Result..."}
          </p>
        </div>
      ) : (
        // --- UPLOAD UI ---
        <>
          <div className="p-4 bg-white/5 rounded-full mb-4 border border-white/10 shadow-inner">
             <Upload className="w-10 h-10 text-blue-300 opacity-90" />
          </div>

          <h3 className="text-xl font-semibold mb-1 text-white">
            Upload Chest X-ray
          </h3>
          
          <p className="text-sm text-white/50 mb-6 text-center max-w-xs">
            Supported formats: JPG, PNG. <br/> Max file size: 10MB.
          </p>

          <button
            onClick={() => fileInputRef.current.click()}
            className="group relative px-8 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold tracking-wide hover:scale-105 transition-all shadow-lg hover:shadow-blue-500/30 active:scale-95"
          >
            <span className="flex items-center gap-2">
               Choose File <Upload size={18} className="group-hover:-translate-y-0.5 transition-transform"/>
            </span>
          </button>
        </>
      )}

      <input
        type="file"
        accept="image/png, image/jpeg"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* --- PREVIEW RESULTS (GRAD-CAM) --- */}
      {!loading && (
          xrayImage?.gradcamBase64 ? (
            <div className="mt-8 grid grid-cols-2 gap-4 w-full animate-in slide-in-from-bottom-5 duration-700">
              <div className="flex flex-col items-center">
                 <p className="text-xs uppercase text-white/40 font-bold mb-2 tracking-widest">Original Scan</p>
                 <img src={xrayImage.preview} className="rounded-xl border border-white/10 shadow-xl" alt="Original" />
              </div>
              <div className="flex flex-col items-center">
                 <p className="text-xs uppercase text-blue-400/80 font-bold mb-2 tracking-widest flex items-center gap-1">
                    {/* This caused the error before - Fixed by importing Activity */}
                    <Activity size={12} /> AI Attention Map
                 </p>
                 <img src={xrayImage.gradcamBase64} className="rounded-xl border border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.2)]" alt="Grad-CAM" />
              </div>
            </div>
          ) : xrayImage?.preview && (
            <div className="mt-6 relative group">
                <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1 rounded-full z-10 shadow-lg">
                    <CheckCircle2 size={16} />
                </div>
                <img src={xrayImage.preview} className="w-32 h-32 rounded-xl object-cover border-2 border-white/20 opacity-80 group-hover:opacity-100 transition-opacity" alt="Preview" />
                <p className="text-[10px] text-center text-white/40 mt-2">Ready for analysis</p>
            </div>
          )
      )}
    </div>
  );
};

export default UploadImage;