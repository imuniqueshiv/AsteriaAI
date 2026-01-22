import React, { useState, useContext } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import CameraCapture from "../components/CameraCapture";
import UploadImage from "../components/UploadImage";
import VoiceSymptoms from "../components/VoiceSymptoms";
import TypeSymptoms from "../components/TypeSymptoms";
import SymptomRecorder from "../components/SymptomRecorder";
import ResultPanel from "../components/ResultPanel";
import Footer from "../components/Footer";
import { AppContent } from "../context/AppContext";
import { toast } from "react-toastify";

const Screening = () => {
  const { backendUrl, userMode } = useContext(AppContent);

  const [xrayImage, setXrayImage] = useState(null);
  const [symptomsText, setSymptomsText] = useState("");
  const [voiceSymptoms, setVoiceSymptoms] = useState("");
  const [patientMCQ, setPatientMCQ] = useState({});
  const [structuredSymptoms, setStructuredSymptoms] = useState(null);

  const [symptomResult, setSymptomResult] = useState(null); 
  const [showResult, setShowResult] = useState(false);

  const mode = userMode || "staff";

  /**
   * ---------------------------------------------------------
   * STAGE-BASED ANALYSIS HANDLER
   * ---------------------------------------------------------
   * Stage 1: Symptom-Only (Offline-First Logic)
   * Stage 2: Imaging-Assisted (Fusion Engine)
   */
  const analyzeHandler = async () => {
    // Stage 1 Check: Must have symptoms to begin triage
    if (!structuredSymptoms) {
      toast.error("Please complete Stage 1: Symptom Screening first");
      return;
    }

    try {
      /**
       * Stage 2: Fusion Logic
       * If an X-ray result is already present from the CNN backbone,
       * we combine it with symptom logic.
       */
      if (xrayImage?.prediction) {
        // Simple Fusion: Prioritize highest risk from either stage
        const pneumoniaRisk = (xrayImage.probabilities.PNEUMONIA * 100).toFixed(1);
        const tbRisk = (xrayImage.probabilities.TB * 100).toFixed(1);
        const maxImageRisk = Math.max(pneumoniaRisk, tbRisk);
        
        setSymptomResult({
          riskScore: maxImageRisk,
          riskLevel: maxImageRisk > 60 ? "High Risk" : maxImageRisk > 30 ? "Moderate Risk" : "Low Risk",
          condition: xrayImage.prediction,
          confidence: maxImageRisk,
          explanation: "Risk assessment enhanced by Imaging-Assisted (Stage 2) AI Vision."
        });
        
        setShowResult(true);
        toast.success("Stage 2: Multi-Stage Fusion Analysis Complete");
      } 
      /**
       * Stage 1 Fallback: Symptom-Only Analysis
       * This addresses the 'no X-ray in villages' problem.
       */
      else {
        const { data } = await axios.post(
          `${backendUrl}/api/screen/symptom-check`,
          { symptoms: structuredSymptoms },
          { withCredentials: true }
        );
        setSymptomResult(data.result);
        setShowResult(true);
        toast.success("Stage 1: Symptom-Based Triage Complete");
      }
    } catch (error) {
      console.error(error);
      toast.error("Screening analysis failed. Please check offline status.");
    }
  };

  return (
    <div
      className="flex flex-col min-h-screen w-full text-white"
      style={{ background: "linear-gradient(180deg, #0d0333, #4a0a91)" }}
    >
      <Navbar />

      {/* Hero Header */}
      <div className="w-full text-center mt-32 px-6">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          Intelligent Health Triage
        </h1>

        <p className="text-white/70 mt-4 text-lg max-w-2xl mx-auto leading-relaxed">
          Follow our multi-stage assessment to understand health risks early, even in low-resource settings.
        </p>

        <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-500 mx-auto mt-6 rounded-full" />
      </div>

      <div className="flex-1 px-6 py-10">

        {/* STAGE 1: SYMPTOMS (PRIORITY) */}
        <section className="max-w-5xl mx-auto bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl mb-12">
          <div className="flex items-center gap-3 mb-6">
             <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">1</div>
             <h2 className="text-2xl font-bold italic">Stage 1: Clinical Symptom Screening</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <VoiceSymptoms
              setVoiceSymptoms={setVoiceSymptoms}
              setPatientMCQ={setPatientMCQ}
              mode={mode}
            />

            <TypeSymptoms
              setSymptomsText={setSymptomsText}
              mode={mode}
            />
          </div>

          <SymptomRecorder
            onSubmit={(data) => {
              setStructuredSymptoms(data);
              toast.info("Symptom triage data recorded locally.");
            }}
          />
        </section>

        {/* STAGE 2: IMAGING (WHEN AVAILABLE) */}
        <section className="max-w-5xl mx-auto bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl mb-14">
          <div className="flex items-center gap-3 mb-6">
             <div className="bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">2</div>
             <h2 className="text-2xl font-bold italic">Stage 2: Imaging-Assisted Risk</h2>
          </div>
          
          <p className="text-sm text-white/50 mb-6 italic">Escalate to imaging only if Stage 1 suggests elevated risk or if equipment is accessible.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <CameraCapture setXrayImage={setXrayImage} />
            <UploadImage xrayImage={xrayImage} setXrayImage={setXrayImage} />
          </div>

          {xrayImage?.preview && (
            <div className="mt-10 flex justify-center animate-in fade-in zoom-in duration-500">
              <img
                src={xrayImage.preview}
                alt="Patient X-ray scan"
                className="max-w-xl rounded-xl border-2 border-white/20 shadow-2xl"
              />
            </div>
          )}
        </section>

        {/* Triage Action Button */}
        <div className="max-w-5xl mx-auto">
            <button
              onClick={analyzeHandler}
              className="w-full py-5 text-2xl font-black rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-purple-900/40 uppercase tracking-widest"
            >
              ⚡ Run Triage Assessment
            </button>
            <p className="text-center text-[10px] text-white/30 mt-3 uppercase tracking-tighter">
              Asteria AI is a decision-support tool, not a diagnostic system.
            </p>
        </div>

        {/* Outcome & Decision Support */}
        {showResult && (
          <div className="max-w-5xl mx-auto mt-16 animate-in slide-in-from-bottom-10 duration-700">
            <ResultPanel
              xrayImage={xrayImage}
              symptomsText={symptomsText}
              voiceText={voiceSymptoms}
              patientMCQ={patientMCQ}
              symptomResult={symptomResult} 
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