import React, { useState } from "react";
import { Mic } from "lucide-react";

const VoiceSymptoms = ({ setVoiceSymptoms, setPatientMCQ }) => {
  const [mode, setMode] = useState("staff"); // staff | patient
  const [listening, setListening] = useState(false);
  const [displayText, setDisplayText] = useState("");

  // Patient questionnaire state
  const [answers, setAnswers] = useState({
    fever: null,
    cough: null,
    chestPain: null,
  });

  // update MCQ selections
  const updateMCQ = (field, value) => {
    const updated = { ...answers, [field]: value };
    setAnswers(updated);
    setPatientMCQ(updated);
  };

  const handleSpeakClick = () => {
    setListening(!listening);

    if (!listening) {
      setDisplayText("Listening...");
      setTimeout(() => {
        const dummy = "Patient reports cough, fever & chest pain.";
        setDisplayText(dummy);
        setVoiceSymptoms(dummy);
        setListening(false);
      }, 2000);
    }
  };

  return (
    <div className="w-full bg-[#0b0f29]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg">

      {/* Mode Selector */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button
          onClick={() => setMode("staff")}
          className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all ${
            mode === "staff"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-500/40"
              : "bg-black/20 text-white/60 hover:bg-black/30"
          }`}
        >
          Health Staff
        </button>

        <button
          onClick={() => setMode("patient")}
          className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all ${
            mode === "patient"
              ? "bg-pink-600 text-white shadow-lg shadow-pink-500/40"
              : "bg-black/20 text-white/60 hover:bg-black/30"
          }`}
        >
          Patient
        </button>
      </div>

      {/* ========================== STAFF MODE =========================== */}
      {mode === "staff" && (
        <div className="flex flex-col items-center text-center">

          <Mic
            className={`w-12 h-12 mb-4 ${
              listening ? "text-pink-400" : "text-purple-300"
            }`}
          />

          <h3 className="text-xl font-semibold mb-1">Voice Symptoms</h3>
          <p className="text-sm text-white/60 mb-4">
            Speak symptoms like “cough, fever…”
          </p>

          <button
            onClick={handleSpeakClick}
            className={`px-6 py-2 rounded-full text-white font-semibold transition-all ${
              listening
                ? "bg-pink-600 shadow-lg shadow-pink-500/40"
                : "bg-purple-600 hover:bg-purple-500"
            }`}
          >
            {listening ? "Listening..." : "Speak"}
          </button>

          {/* Output */}
          <div className="w-full mt-5 bg-black/30 border border-white/10 rounded-lg p-4 text-sm text-white/70 min-h-[70px]">
            {displayText || "Voice input will appear here..."}
          </div>
        </div>
      )}

      {/* ========================== PATIENT MODE =========================== */}
      {mode === "patient" && (
        <div className="space-y-5">

          <div className="p-4 rounded-xl bg-black/20 border border-white/10">
            <p className="text-lg font-semibold mb-2">Q1. Do you have fever?/क्या आपको बुखार है?</p>

            <div className="flex gap-6 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="fever"
                  checked={answers.fever === "yes"}
                  onChange={() => updateMCQ("fever", "yes")}
                />
                <span>Yes / हाँ</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="fever"
                  checked={answers.fever === "no"}
                  onChange={() => updateMCQ("fever", "no")}
                />
                <span>No / नहीं</span>
              </label>
            </div>
          </div>

          {/* Cough */}
          <div className="p-4 rounded-xl bg-black/20 border border-white/10">
            <p className="text-lg font-semibold mb-2">Q2. Do you have cough?/क्या आपको खांसी है?</p>

            <div className="flex gap-6 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="cough"
                  checked={answers.cough === "yes"}
                  onChange={() => updateMCQ("cough", "yes")}
                />
                <span>Yes / हाँ</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="cough"
                  checked={answers.cough === "no"}
                  onChange={() => updateMCQ("cough", "no")}
                />
                <span>No / नहीं</span>
              </label>
            </div>
          </div>

          {/* Chest Pain */}
          <div className="p-4 rounded-xl bg-black/20 border border-white/10">
            <p className="text-lg font-semibold mb-2">
              Q3. Do you have chest pain?/क्या आपको सीने में दर्द है?
            </p>

            <div className="flex gap-6 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="chestPain"
                  checked={answers.chestPain === "yes"}
                  onChange={() => updateMCQ("chestPain", "yes")}
                />
                <span>Yes / हाँ</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="chestPain"
                  checked={answers.chestPain === "no"}
                  onChange={() => updateMCQ("chestPain", "no")}
                />
                <span>No / नहीं</span>
              </label>
            </div>
          </div>

          <button className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-lg shadow-lg hover:opacity-90">
            Submit
          </button>
        </div>
      )}
    </div>
  );
};

export default VoiceSymptoms;
