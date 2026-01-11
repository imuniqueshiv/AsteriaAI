import React from "react";
import { Camera } from "lucide-react";

const CameraCapture = ({ setXrayImage }) => {
  return (
    <div className="w-full bg-[#0a0f2b]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg flex flex-col items-center justify-center">
      
      {/* Camera Icon */}
      <Camera className="w-12 h-12 text-green-300 mb-4 opacity-90" />
      
      {/* Title */}
      <h3 className="text-xl font-semibold mb-1">Use Camera</h3>
      <p className="text-sm text-white/50 mb-4">Capture X-ray using device camera</p>

      {/* Activate Button */}
      <button
        onClick={() => alert("Camera logic will be added later")}
        className="px-6 py-2 rounded-full bg-green-500 text-black font-semibold hover:bg-green-400 transition-all"
      >
        Activate
      </button>

    </div>
  );
};

export default CameraCapture;
