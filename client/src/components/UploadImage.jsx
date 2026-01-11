import React, { useRef } from "react";
import { Upload } from "lucide-react";

const UploadImage = ({ setXrayImage }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setXrayImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="w-full bg-[#0a0f2b]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg flex flex-col items-center justify-center">
      
      {/* Upload Icon */}
      <Upload className="w-12 h-12 text-blue-300 mb-4 opacity-90" />
      
      {/* Title */}
      <h3 className="text-xl font-semibold mb-1">Upload Image</h3>
      <p className="text-sm text-white/50 mb-4">Select a JPG or PNG file</p>


      {/* Custom Upload Button */}
      <button
        onClick={() => fileInputRef.current.click()}
        className="px-6 py-2 rounded-full bg-blue-500 text-white font-semibold hover:bg-blue-400 transition-all"
      >
        Choose File
      </button>

      {/* Hidden Input */}
      <input
        type="file"
        accept="image/png, image/jpeg"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Format Label */}
      <p className="text-xs text-white/40 mt-2">JPG, PNG supported</p>
    </div>
  );
};

export default UploadImage;
