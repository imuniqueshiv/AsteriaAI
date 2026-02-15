import React, { useRef, useState, useContext } from "react"; // ✅ UNCOMMENTED THIS LINE
import axios from "axios"; 
import { Upload, Loader2, Activity, CheckCircle2 } from "lucide-react"; 
import { AppContent } from "../context/AppContext"; 

const UploadImage = ({ xrayImage, setXrayImage }) => {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // ✅ Get the Dynamic Backend URL
  const { backendUrl } = useContext(AppContent);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show local preview immediately
    const previewUrl = URL.createObjectURL(file);
    setLoading(true);
    setProgress(0);

    // --- 1. SIMULATE PROGRESS ANIMATION ---
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90; 
        return prev + Math.random() * 15; 
      });
    }, 500);

    try {
      // ✅ DIRECT SERVER CALL
      const formData = new FormData();
      formData.append("xray", file);

      console.log(`📤 Sending to: ${backendUrl}/api/screen/analyze`);

      const { data } = await axios.post(`${backendUrl}/api/screen/analyze`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ AI Response:", data);

      if (!data.success) {
        alert("AI Analysis failed: " + (data.message || "Unknown error"));
        setLoading(false);
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
          prediction: data.prediction,
          probabilities: data.probabilities,
          originalBase64: `data:image/jpeg;base64,${data.original_base64}`,
          gradcamBase64: `data:image/jpeg;base64,${data.gradcam_base64}`,
        });
        setLoading(false);
      }, 600);

    } catch (error) {
      console.error("Upload error:", error);
      
      const serverMessage = error.response?.data?.message || error.message;
      const debugInfo = error.response?.data?.debug || "";

      alert(`Server Error: ${serverMessage}\n\n${debugInfo}`);
      setLoading(false);
    } finally {
      clearInterval(progressInterval);
    }
  };

  return (
    <div className="w-full bg-[#0a0f2b]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg flex flex-col items-center justify-center min-h-[350px]">
      
      {loading ? (
        // --- LOADING UI ---
        <div className="flex flex-col items-center justify-center w-full animate-in fade-in duration-500">
          <div className="relative mb-4">
             <Loader2 className="w-16 h-16 text-blue-400 animate-spin opacity-50" />
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
          {/* Default State */}
          {!xrayImage && (
            <>
              <div className="p-4 bg-white/5 rounded-full mb-4 border border-white/10 shadow-inner">
                 <Upload className="w-10 h-10 text-blue-300 opacity-90" />
              </div>

              <h3 className="text-xl font-semibold mb-1 text-white">
                Upload Chest X-ray
              </h3>
              
              <p className="text-sm text-white/50 mb-6 text-center max-w-xs">
                Supported formats: JPG, PNG. <br/> Max file size: 50MB.
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
      {/* Logic: Only show this if NOT loading and if we have the AI result (gradcamBase64) */}
      {!loading && xrayImage?.gradcamBase64 && (
            <div className="mt-8 grid grid-cols-2 gap-4 w-full animate-in slide-in-from-bottom-5 duration-700">
              <div className="flex flex-col items-center">
                 <p className="text-xs uppercase text-white/40 font-bold mb-2 tracking-widest">Original Scan</p>
                 <img src={xrayImage.preview} className="rounded-xl border border-white/10 shadow-xl" alt="Original" />
              </div>
              <div className="flex flex-col items-center">
                 <p className="text-xs uppercase text-blue-400/80 font-bold mb-2 tracking-widest flex items-center gap-1">
                    <Activity size={12} /> AI Attention Map
                 </p>
                 <img src={xrayImage.gradcamBase64} className="rounded-xl border border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.2)]" alt="Grad-CAM" />
              </div>
              
              {/* Reset Button to Upload New Image */}
               <div className="col-span-2 flex justify-center mt-4">
                  <button 
                    onClick={() => setXrayImage(null)}
                    className="text-xs text-white/50 hover:text-white underline"
                  >
                    Upload New Image
                  </button>
               </div>
            </div>
      )}
    </div>
  );
};

export default UploadImage;