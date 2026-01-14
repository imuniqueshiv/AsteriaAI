import React, { useState, useEffect, useRef } from "react";
import { Mic } from "lucide-react";

const VoiceSymptoms = ({ setVoiceSymptoms, setPatientMCQ, mode }) => {
  const [listening, setListening] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [language, setLanguage] = useState("en-US"); // NEW: language toggle

  const recognitionRef = useRef(null);

  // Patient questionnaire state
  const [answers, setAnswers] = useState({
    fever: null,
    cough: null,
    chestPain: null,
  });

  // ---------------------------------------------------------
  // UPDATE MCQ STATE
  // ---------------------------------------------------------
  const updateMCQ = (field, value) => {
    const updated = { ...answers, [field]: value };
    setAnswers(updated);
    setPatientMCQ(updated);
  };

  // ---------------------------------------------------------
  // SPEECH RECOGNITION SETUP (WITH LANGUAGE SWITCH)
  // ---------------------------------------------------------
  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const recog = new window.webkitSpeechRecognition();
      recog.continuous = false;
      recog.interimResults = false;
      recog.lang = language; // <-- language applied dynamically

      recog.onresult = (event) => {
        const transcript = event.results[0][0].transcript;

        // Append new speech to existing text
        const updated = displayText ? displayText + " " + transcript : transcript;

        setDisplayText(updated);
        setVoiceSymptoms(updated); // sync with parent
      };

      recog.onerror = () => {
        setListening(false);
        setDisplayText("Speech recognition error. Try again.");
      };

      recognitionRef.current = recog;
    } else {
      recognitionRef.current = null;
    }
  }, [language]); // reinitialize when language changes

  // ---------------------------------------------------------
  // TOGGLE VOICE LISTENING
  // ---------------------------------------------------------
  const handleSpeakClick = () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      setDisplayText("Your browser does not support speech recognition.");
      return;
    }

    if (!listening) {
      setListening(true);
      setDisplayText("Listening...");
      recognition.start();
    } else {
      setListening(false);
      recognition.stop();
    }
  };

  // ---------------------------------------------------------
  // UI RENDER
  // ---------------------------------------------------------
  return (
    <div className="w-full bg-[#0b0f29]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg">

      {/* STAFF MODE ONLY */}
      {mode === "staff" && (
        <div className="flex flex-col items-center text-center">

          {/* Mic Icon */}
          <Mic
            className={`w-12 h-12 mb-4 ${
              listening ? "text-pink-400" : "text-purple-300"
            }`}
          />

          <h3 className="text-xl font-semibold mb-1">Voice Symptoms</h3>

          <p className="text-sm text-white/60 mb-4">
            Speak symptoms like “cough, fever…”
          </p>

          {/* LANGUAGE DROPDOWN */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="mb-4 bg-black/30 text-white px-4 py-2 rounded-lg border border-white/10"
          >
            <option value="en-US">English</option>
            <option value="hi-IN">Hindi (हिंदी)</option>
          </select>

          {/* Speak Button */}
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

          {/* Display Text */}
          <div className="w-full mt-5 bg-black/30 border border-white/10 rounded-lg p-4 text-sm text-white/70 min-h-[70px]">
            {displayText || "Voice input will appear here..."}
          </div>
        </div>
      )}

      {/* PATIENT MODE (UNCHANGED EXCEPT SYNC) */}
      {mode === "patient" && (
        <div className="space-y-5">

          {/* Q1 Fever */}
          <div className="p-4 rounded-xl bg-black/20 border border-white/10">
            <p className="text-lg font-semibold mb-2">
              Q1. Do you have fever? / क्या आपको बुखार है?
            </p>

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

          {/* Q2 Cough */}
          <div className="p-4 rounded-xl bg-black/20 border border-white/10">
            <p className="text-lg font-semibold mb-2">
              Q2. Do you have cough? / क्या आपको खांसी है?
            </p>

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

          {/* Q3 Chest Pain */}
          <div className="p-4 rounded-xl bg-black/20 border border-white/10">
            <p className="text-lg font-semibold mb-2">
              Q3. Do you have chest pain? / क्या आपको सीने में दर्द है?
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
