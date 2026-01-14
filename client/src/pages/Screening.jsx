import React, { useState, useContext } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import CameraCapture from "../components/CameraCapture";
import UploadImage from "../components/UploadImage";
import VoiceSymptoms from "../components/VoiceSymptoms";
import TypeSymptoms from "../components/TypeSymptoms";
import ResultPanel from "../components/ResultPanel";
import Footer from "../components/Footer";
import { AppContent } from "../context/AppContext";
import { toast } from "react-toastify";

const Screening = () => {
  const { backendUrl, userData, userMode } = useContext(AppContent);

  const [xrayImage, setXrayImage] = useState(null);
  const [symptomsText, setSymptomsText] = useState("");
  const [voiceSymptoms, setVoiceSymptoms] = useState("");
  const [showResult, setShowResult] = useState(false);

  const [patientMCQ, setPatientMCQ] = useState({});

  const mode = userMode || "staff";

  // SAVE DIAGNOSIS TO BACKEND
  const saveDiagnosisToBackend = async (finalData) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/screen/save`,
        finalData,
        { withCredentials: true }
      );

      if (data.success) toast.success("Diagnosis saved to history!");
      else toast.error(data.message);
    } catch (error) {
      console.log(error);
      toast.error("Failed to save diagnosis.");
    }
  };

  // ANALYZE HANDLER (UPDATED)
  const analyzeHandler = () => {
    if (!xrayImage) return;

    setShowResult(true);

    // CENTRALIZED RISK CALCULATION
    const yesCount = Object.values(patientMCQ || {}).filter(
      (v) => v === "yes"
    ).length;

    let riskLevel = "Low Risk";
    let confidenceValue = "65%";

    if (yesCount === 1) {
      riskLevel = "Moderate Risk";
      confidenceValue = "78%";
    }

    if (yesCount >= 2) {
      riskLevel = "High Risk";
      confidenceValue = "92%";
    }

    // BUILD DATA FOR BACKEND
    const diagnosisData = {
      xrayImage,
      symptomsText,
      voiceSymptoms,
      patientMCQ,
      mode,
      riskScore: yesCount,
      riskLevel,
      confidence: confidenceValue,
      timestamp: new Date().toISOString(),
      userId: userData?._id || null,
    };

    saveDiagnosisToBackend(diagnosisData);
  };

  return (
    <div
      className="flex flex-col min-h-screen w-full text-white"
      style={{ background: "linear-gradient(180deg, #0d0333, #4a0a91)" }}
    >
      <Navbar />

      {/* Page Intro */}
      <div className="w-full text-center mt-45 px-6">
        <h1 className="text-3xl md:text-4xl font-bold">Begin Your Screening</h1>

        <p className="text-white/70 mt-3 text-lg max-w-2xl mx-auto">
          Upload or capture a chest X-ray and provide symptoms to generate an
          intelligent AI assessment.
        </p>

        <div className="w-24 h-1 bg-blue-400/50 mx-auto mt-5 rounded-full"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 py-10">

        {/* Capture X-ray Section */}
        <section className="max-w-5xl mx-auto bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl mb-10">
          <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
            <span className="text-green-300">📷</span> Capture Chest X-ray
          </h2>

          <p className="text-white/70 mb-4">Upload an existing X-ray or capture a new one</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CameraCapture setXrayImage={setXrayImage} />
            <UploadImage setXrayImage={setXrayImage} />
          </div>

          {xrayImage && (
            <div className="mt-10 flex justify-center">
              <div className="bg-black/30 p-4 rounded-xl border border-white/10 w-full max-w-[520px] md:max-w-[580px]">
                <h3 className="text-lg font-semibold mb-3 text-center">Preview</h3>

                <img
                  src={xrayImage}
                  alt="X-ray preview"
                  className="w-full h-auto rounded-lg shadow-lg object-contain"
                />
              </div>
            </div>
          )}
        </section>

        {/* Symptoms Section */}
        <section className="max-w-5xl mx-auto bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl mb-14">

          <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
            <span className="text-pink-300">🩺</span> Patient Symptoms
          </h2>

          <p className="text-white/70 mb-4">Speak or type symptoms in simple language</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <VoiceSymptoms
              setVoiceSymptoms={setVoiceSymptoms}
              setPatientMCQ={setPatientMCQ}
              mode={mode}
            />

            <TypeSymptoms setSymptomsText={setSymptomsText} mode={mode} />
          </div>

          <div className="mt-4 text-sm text-blue-300 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
            📌 Speak or type symptoms in simple words. This information is combined with X-ray findings.
          </div>
        </section>

        {/* Analyze Button */}
        <button
          disabled={!xrayImage}
          onClick={analyzeHandler}
          className={`w-full max-w-5xl mx-auto block py-4 text-center text-xl font-semibold rounded-xl transition-all ${
            xrayImage
              ? "bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90"
              : "bg-gray-600 cursor-not-allowed opacity-50"
          }`}
        >
          ⚡ Analyze Patient
        </button>

        {!xrayImage && (
          <p className="max-w-5xl mx-auto mt-3 text-yellow-300 bg-yellow-900/40 border border-yellow-700 rounded-lg py-2 px-4 text-sm flex items-center gap-2">
            ⚠ Please capture an X-ray before analysis
          </p>
        )}

        {/* Result Section */}
        {showResult && (
          <div className="max-w-5xl mx-auto mt-10">
            <ResultPanel
              xrayImage={xrayImage}
              symptomsText={symptomsText}
              voiceText={voiceSymptoms}
              patientMCQ={patientMCQ}
              riskLevel={
                Object.values(patientMCQ || {}).filter((v) => v === "yes").length >= 2
                  ? "High Risk"
                  : Object.values(patientMCQ || {}).filter((v) => v === "yes").length === 1
                  ? "Moderate Risk"
                  : "Low Risk"
              }
              riskScore={Object.values(patientMCQ || {}).filter((v) => v === "yes").length}
              confidence={
                Object.values(patientMCQ || {}).filter((v) => v === "yes").length >= 2
                  ? "92%"
                  : Object.values(patientMCQ || {}).filter((v) => v === "yes").length === 1
                  ? "78%"
                  : "65%"
              }
              backendUrl={backendUrl}
            />
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Screening;
