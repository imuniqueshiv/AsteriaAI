import React, { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react"; // Added Loader2
import { uploadXray } from "../utils/loadModel";

const UploadImage = ({ xrayImage, setXrayImage }) => {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show local preview immediately
    const previewUrl = URL.createObjectURL(file);
    setLoading(true);

    try {
      const response = await uploadXray(file);
      console.log("AI Response:", response);

      if (!response.success) {
        alert("AI Analysis failed: " + (response.message || "Unknown error"));
        return;
      }

      // ✅ FIX: The controller sends fields directly, not inside a 'result' object
      setXrayImage({
        file,
        preview: previewUrl,
        prediction: response.prediction,
        probabilities: response.probabilities,
        originalBase64: `data:image/jpeg;base64,${response.original_base64}`,
        gradcamBase64: `data:image/jpeg;base64,${response.gradcam_base64}`,
      });

    } catch (error) {
      console.error("Upload error:", error);
      alert("Server error. Check if the backend terminal shows a Python error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#0a0f2b]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg flex flex-col items-center justify-center">
      
      {loading ? (
        <Loader2 className="w-12 h-12 text-blue-400 animate-spin mb-4" />
      ) : (
        <Upload className="w-12 h-12 text-blue-300 mb-4 opacity-90" />
      )}

      <h3 className="text-xl font-semibold mb-1">
        {loading ? "AI is Analyzing..." : "Upload X-ray"}
      </h3>
      
      <p className="text-sm text-white/50 mb-4 text-center">
        {loading ? "Running DenseNet121 & Grad-CAM..." : "Upload a chest X-ray (JPG / PNG)"}
      </p>

      {!loading && (
        <button
          onClick={() => fileInputRef.current.click()}
          className="px-6 py-2 rounded-full bg-blue-500 text-white font-semibold hover:bg-blue-400 transition-all"
        >
          Choose File
        </button>
      )}

      <input
        type="file"
        accept="image/png, image/jpeg"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Show Grad-CAM result if available, otherwise show local preview */}
      {xrayImage?.gradcamBase64 ? (
        <div className="mt-4 grid grid-cols-2 gap-2 w-full">
          <img src={xrayImage.preview} className="rounded-lg border border-white/10" alt="Original" />
          <img src={xrayImage.gradcamBase64} className="rounded-lg border border-blue-500/50 shadow-lg shadow-blue-500/20" alt="Grad-CAM" />
        </div>
      ) : xrayImage?.preview && (
        <img src={xrayImage.preview} className="w-40 h-40 rounded-xl object-cover mt-4 border border-white/10 opacity-50" alt="Preview" />
      )}
    </div>
  );
};

export default UploadImage;