import React, { useState } from "react";
import { FileText } from "lucide-react";

const TypeSymptoms = ({ setSymptomsText, mode }) => {
  const [text, setText] = useState("");
  const maxChars = 200;

  const handleChange = (e) => {
    const value = e.target.value;
    if (value.length <= maxChars) {
      setText(value);
      setSymptomsText(value);
    }
  };

  return (
    <div className="w-full bg-[#0b0f29]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg">

      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <FileText className="w-6 h-6 text-blue-300" />
        <h3 className="text-xl font-semibold">Type Symptoms</h3>
      </div>

      <p className="text-sm text-white/60 mb-4">
        e.g. Cough, fever, chest pain…
      </p>

      {/* Text Box only enabled in Staff mode */}
      <textarea
        value={text}
        onChange={handleChange}
        disabled={mode === "patient"}
        placeholder={
          mode === "patient"
            ? "Disabled in Patient mode — Use MCQ questions above."
            : "Type symptoms here..."
        }
        className={`w-full bg-black/30 text-white p-4 rounded-xl border border-white/10 
          h-40 resize-none outline-none transition-all ${
            mode === "patient"
              ? "opacity-40 cursor-not-allowed"
              : "focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30"
          }`}
      />

      {/* Footer */}
      <div className="flex items-center justify-between mt-2 text-xs text-white/40">
        <span>Eng/Hin</span>
        <span>{text.length} / {maxChars} chars</span>
      </div>
    </div>
  );
};

export default TypeSymptoms;
