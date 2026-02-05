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
import SymptomInvestigator from "../components/SymptomInvestigator";
import { 
  Activity, 
  Languages, 
  Mic, 
  Keyboard, 
  Zap, 
  Microscope,
  AlertTriangle,
  Loader2 
} from "lucide-react";

const Screening = () => {
  const { backendUrl, userMode } = useContext(AppContent);

  // 1. LANGUAGE STATE
  const [lang, setLang] = useState("en");

  const t = {
    en: {
      title: "Intelligent Health Triage",
      subtitle: "Follow our multi-stage assessment to understand health risks early.",
      staffSection: "Health Staff Tools (ASHA)",
      voiceTitle: "Voice Triage",
      voiceSub: "Speak symptoms for rapid entry",
      typeTitle: "Manual Notes",
      typeSub: "Type unstructured clinical observations",
      stage2Title: "Stage 2: Imaging-Assisted Risk",
      stage2Desc: "Escalate to imaging only if Stage 1 suggests elevated risk.",
      runBtn: "Run Triage Assessment",
      disclaimer: "Asteria AI is a decision-support tool, not a diagnostic system.",
      errorStage1: "Please complete the Stage 1 Clinical Interview first.",
      successStage1: "Stage 1: Symptom-Based Triage Complete",
      successStage2: "Multi-Stage Fusion Analysis Complete"
    },
    hi: {
      title: "बुद्धिमान स्वास्थ्य ट्राइएज",
      subtitle: "स्वास्थ्य जोखिमों को जल्दी समझने के लिए मूल्यांकन करें।",
      staffSection: "स्वास्थ्य कर्मचारी उपकरण (आशा)",
      voiceTitle: "वॉयस ट्राइएज",
      voiceSub: "लक्षण बोलें",
      typeTitle: "मैनुअल नोट्स",
      typeSub: "नैदानिक ​​टिप्पणियां टाइप करें",
      stage2Title: "चरण 2: इमेजिंग-सहायता प्राप्त जोखिम",
      stage2Desc: "इमेजिंग का उपयोग तभी करें जब चरण 1 में उच्च जोखिम हो।",
      runBtn: "ट्राइएज मूल्यांकन शुरू करें",
      disclaimer: "एस्टीरिया एआई एक निर्णय-समर्थन उपकरण है।",
      errorStage1: "कृपया पहले चरण 1 साक्षात्कार पूरा करें।",
      successStage1: "चरण 1: ट्राइएज पूरा हुआ",
      successStage2: "चरण 2: विश्लेषण पूरा हुआ"
    }
  };

  const txt = t[lang];

  // 2. STATE MANAGEMENT
  const [xrayImage, setXrayImage] = useState(null);
  const [symptomsText, setSymptomsText] = useState("");
  const [voiceSymptoms, setVoiceSymptoms] = useState("");
  const [patientMCQ, setPatientMCQ] = useState({});
  const [structuredSymptoms, setStructuredSymptoms] = useState(null); // The Chat Data

  const [symptomResult, setSymptomResult] = useState(null); 
  const [showResult, setShowResult] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 

  const isHealthStaff = userMode === "health_staff" || userMode === "asha" || !userMode; 

  // 3. ANALYSIS LOGIC
  const analyzeHandler = async () => {
    if (!structuredSymptoms) {
      toast.error(txt.errorStage1);
      document.getElementById("stage1-section")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    setIsLoading(true);

    try {
      // FIX: Extract Image String for DB
      const imagePayload = xrayImage?.originalBase64 || xrayImage?.preview || (typeof xrayImage === 'string' ? xrayImage : null);
      const probs = xrayImage?.probabilities || {}; 

      const payload = {
        symptomData: structuredSymptoms, 
        xrayImage: imagePayload,         
        deviceId: "web-client-v1",
        normal: probs.NORMAL || 0,
        pneumonia: probs.PNEUMONIA || 0,
        tb: probs.TB || 0
      };

      const { data } = await axios.post(
        `${backendUrl}/api/screen/save-screening`,
        payload,
        { withCredentials: true }
      );

      if (data.success) {
        setSymptomResult(data.result);
        setShowResult(true);
        toast.success(imagePayload ? txt.successStage2 : txt.successStage1);
        
        setTimeout(() => {
            document.getElementById("result-section")?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      console.error("Analysis Error:", error);
      toast.error("Screening analysis failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // 4. RENDER
  return (
    <div
      className="flex flex-col min-h-screen w-full text-white relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0d0333, #4a0a91)" }}
    >
      <Navbar />
      
      {/* HERO SECTION */}
      <div className="w-full text-center mt-32 px-6 relative z-10">
        <button 
            onClick={() => setLang(lang === "en" ? "hi" : "en")}
            className="absolute top-0 right-6 md:right-20 flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md px-4 py-2 rounded-full transition-all active:scale-95 shadow-lg"
        >
            <Languages size={18} className="text-blue-300" />
            <span className="text-xs font-bold uppercase tracking-widest">
                {lang === "en" ? "हिंदी" : "English"}
            </span>
        </button>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-300 text-xs font-black uppercase tracking-widest shadow-[0_0_15px_rgba(59,130,246,0.5)] mb-6">
            <Activity size={14} /> {txt.title}
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
           {lang === 'en' ? "Multi-Stage " : "बहु-स्तरीय "}
           <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
             {lang === 'en' ? "Assessment" : "मूल्यांकन"}
           </span>
        </h1>
        <p className="text-white/70 mt-4 text-lg max-w-2xl mx-auto leading-relaxed">{txt.subtitle}</p>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-500 mx-auto mt-8 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.5)]" />
      </div>

      <div className="flex-1 px-6 py-10 max-w-6xl mx-auto w-full relative z-10">

        {/* STAGE 1: SYMPTOM SCREENING */}
        <section id="stage1-section" className="animate-in fade-in slide-in-from-bottom-10 duration-700 mb-16">
          
          {isHealthStaff && (
             <div className="mb-12">
               <div className="flex items-center gap-2 mb-6 opacity-70">
                  <div className="h-px bg-white/20 flex-1"></div>
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-300">{txt.staffSection}</span>
                  <div className="h-px bg-white/20 flex-1"></div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 {/* Voice Card */}
                 <div className="bg-[#0a0520]/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group hover:border-blue-500/30 transition-all">
                   <div className="flex items-center gap-4 mb-6">
                     <div className="bg-blue-600/20 p-3 rounded-xl text-blue-400 border border-blue-500/20">
                       <Mic size={24} />
                     </div>
                     <div>
                       <h3 className="text-lg font-bold text-white">{txt.voiceTitle}</h3>
                       <p className="text-white/40 text-xs uppercase tracking-widest">{txt.voiceSub}</p>
                     </div>
                   </div>
                   <div className="opacity-90">
                      <VoiceSymptoms 
                         setVoiceSymptoms={setVoiceSymptoms} 
                         setPatientMCQ={setPatientMCQ} 
                         mode={userMode} 
                      />
                   </div>
                 </div>

                 {/* Type Card */}
                 <div className="bg-[#0a0520]/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group hover:border-purple-500/30 transition-all">
                   <div className="flex items-center gap-4 mb-6">
                     <div className="bg-purple-600/20 p-3 rounded-xl text-purple-400 border border-purple-500/20">
                       <Keyboard size={24} />
                     </div>
                     <div>
                       <h3 className="text-lg font-bold text-white">{txt.typeTitle}</h3>
                       <p className="text-white/40 text-xs uppercase tracking-widest">{txt.typeSub}</p>
                     </div>
                   </div>
                   <div className="opacity-90">
                     <TypeSymptoms setSymptomsText={setSymptomsText} mode={userMode} />
                   </div>
                 </div>
               </div>
             </div>
          )}

          {/* MAIN INTERVIEW (This is your Chat Box) */}
          <SymptomInvestigator 
             language={lang} 
             onSubmit={(data) => setStructuredSymptoms(data)} 
          />
        </section>

        {/* STAGE 2: IMAGING */}
        <section id="stage2-section" className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl mb-16 relative overflow-hidden">
           <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
              <div className="bg-purple-500/20 p-4 rounded-2xl text-purple-300 border border-purple-500/30">
                 <Microscope size={32} />
              </div>
              <div>
                 <h2 className="text-2xl md:text-3xl font-black text-white">{txt.stage2Title}</h2>
                 <p className="text-white/50 mt-2 text-sm max-w-2xl">{txt.stage2Desc}</p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <CameraCapture setXrayImage={setXrayImage} />
             <UploadImage xrayImage={xrayImage} setXrayImage={setXrayImage} />
           </div>

           {xrayImage?.preview && (
             <div className="mt-10 flex justify-center animate-in fade-in zoom-in duration-500">
                <img src={xrayImage.preview} alt="Scan" className="max-w-md w-full rounded-xl shadow-2xl" />
             </div>
           )}
        </section>

        {/* RUN BUTTON */}
        <div className="max-w-4xl mx-auto text-center">
            <button
              onClick={analyzeHandler}
              disabled={isLoading}
              className={`w-full py-6 text-xl md:text-2xl font-black rounded-2xl flex items-center justify-center gap-4 transition-all shadow-2xl shadow-purple-900/40 uppercase tracking-widest ${
                isLoading ? "bg-gray-600 cursor-not-allowed text-white/50" : "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:scale-[1.02] active:scale-95"
              }`}
            >
              {isLoading ? ( <><Loader2 className="animate-spin"/> Processing...</> ) : ( <><Zap className="fill-white"/> {txt.runBtn} </> )}
            </button>
            <p className="text-center text-[10px] text-white/30 mt-6 uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-2">
              <AlertTriangle size={12} /> {txt.disclaimer}
            </p>
        </div>

        {/* RESULTS PANEL */}
        {showResult && (
          <div id="result-section" className="mt-20 animate-in slide-in-from-bottom-20 duration-1000">
            <ResultPanel
              symptomData={structuredSymptoms} 
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