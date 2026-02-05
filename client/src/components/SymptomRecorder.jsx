import React, { useState } from "react";
import { 
  Check, 
  AlertCircle, 
  ChevronRight, 
  Stethoscope, 
  User, 
  Calendar,
  Languages
} from "lucide-react";

const SymptomRecorder = ({ onSubmit }) => {
  // ---------------------------------------------------------
  // STATE: Language & Form Data
  // ---------------------------------------------------------
  const [lang, setLang] = useState("en"); // 'en' or 'hi'

  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    coughDuration: "",      
    feverDuration: "",      
    bloodInSputum: "no",
    severeChestPain: "no",
    weightLoss: "no",
    difficultyBreathing: "no",
    nightSweats: "no"
  });

  // ---------------------------------------------------------
  // TRANSLATION DICTIONARY
  // ---------------------------------------------------------
  const t = {
    en: {
      title: "Clinical Symptom Interview",
      subtitle: "Stage 1: Structured Patient History & Triage",
      age: "Patient Age",
      gender: "Gender",
      genderOptions: { select: "Select", male: "Male", female: "Female", other: "Other" },
      q1: "1. Cough History",
      q1Opts: { none: "No Cough", acute: "< 2 Weeks (Acute)", chronic: "> 2 Weeks (Chronic)" },
      q2: "2. Fever History",
      q2Opts: { none: "No Fever", acute: "< 5 Days (Acute)", chronic: "> 5 Days (Persistent)" },
      q3: "3. Critical Symptoms (Check all that apply)",
      symptoms: {
        blood: "Coughing up Blood (Hemoptysis)",
        chest: "Severe Chest Pain",
        weight: "Unexplained Weight Loss",
        breath: "Difficulty Breathing (Dyspnea)",
        sweat: "Excessive Night Sweats"
      },
      btnWait: "Complete Interview to Proceed",
      btnGo: "Confirm Clinical Profile",
      required: "(Required)"
    },
    hi: {
      title: "नैदानिक लक्षण साक्षात्कार",
      subtitle: "चरण 1: रोगी का इतिहास और जांच",
      age: "रोगी की आयु",
      gender: "लिंग",
      genderOptions: { select: "चुनें", male: "पुरुष", female: "महिला", other: "अन्य" },
      q1: "1. खांसी का इतिहास",
      q1Opts: { none: "कोई खांसी नहीं", acute: "< 2 सप्ताह (तीव्र)", chronic: "> 2 सप्ताह (दीर्घकालिक)" },
      q2: "2. बुखार का इतिहास",
      q2Opts: { none: "कोई बुखार नहीं", acute: "< 5 दिन (तीव्र)", chronic: "> 5 दिन (लगातार)" },
      q3: "3. गंभीर लक्षण (जो लागू हों उन्हें चुनें)",
      symptoms: {
        blood: "थूक में खून आना (रक्तसं्राव)",
        chest: "छाती में तेज दर्द",
        weight: "अचानक वजन घटना",
        breath: "सांस लेने में कठिनाई",
        sweat: "रात में अत्यधिक पसीना"
      },
      btnWait: "आगे बढ़ने के लिए विवरण भरें",
      btnGo: "प्रोफाइल की पुष्टि करें",
      required: "(अनिवार्य)"
    }
  };

  // Helper to get current text
  const txt = t[lang];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDemographicChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const isFormComplete = 
    formData.coughDuration !== "" && 
    formData.feverDuration !== "" &&
    formData.age !== "" &&
    formData.gender !== "";

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] p-8 shadow-2xl border border-white/10"
         style={{ background: "linear-gradient(145deg, rgba(10, 5, 32, 0.9) 0%, rgba(20, 10, 60, 0.8) 100%)" }}>
      
      {/* Decorative Glows to fix "Faded" look */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] -z-10"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] -z-10"></div>

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-white/10 pb-8">
        <div className="flex items-center gap-5">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-4 rounded-2xl shadow-lg shadow-blue-900/30 text-white ring-1 ring-white/20">
            <Stethoscope size={32} />
          </div>
          <div>
            <h3 className="text-3xl font-black text-white tracking-tight drop-shadow-md">
              {txt.title}
            </h3>
            <p className="text-blue-200/70 text-sm font-medium mt-1 tracking-wide">
              {txt.subtitle}
            </p>
          </div>
        </div>

        {/* LANGUAGE TOGGLE BTN */}
        <button 
          onClick={() => setLang(lang === "en" ? "hi" : "en")}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-5 py-2.5 transition-all active:scale-95 group"
        >
          <Languages size={18} className="text-blue-400 group-hover:text-white transition-colors" />
          <span className="text-xs font-bold uppercase tracking-widest text-white/80">
            {lang === "en" ? "हिंदी" : "English"}
          </span>
        </button>
      </div>

      <div className="space-y-12">

        {/* --- SECTION 0: DEMOGRAPHICS --- */}
        <div className="grid grid-cols-2 gap-6 p-6 bg-[#050214]/50 rounded-3xl border border-white/5 shadow-inner">
           <div className="space-y-3">
             <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-300/80">
               <Calendar size={12} /> {txt.age}
             </label>
             <input 
               type="number" 
               name="age"
               value={formData.age}
               onChange={handleDemographicChange}
               placeholder="25"
               className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white font-bold placeholder:text-white/10 focus:border-blue-500 focus:bg-blue-900/10 focus:outline-none transition-all"
             />
           </div>
           <div className="space-y-3">
             <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-300/80">
               <User size={12} /> {txt.gender}
             </label>
             <select 
               name="gender" 
               value={formData.gender}
               onChange={handleDemographicChange}
               className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white font-bold focus:border-blue-500 focus:bg-blue-900/10 focus:outline-none transition-all appearance-none cursor-pointer"
             >
               <option value="" className="bg-[#0d0333] text-white/50">{txt.genderOptions.select}</option>
               <option value="male" className="bg-[#0d0333]">{txt.genderOptions.male}</option>
               <option value="female" className="bg-[#0d0333]">{txt.genderOptions.female}</option>
               <option value="other" className="bg-[#0d0333]">{txt.genderOptions.other}</option>
             </select>
           </div>
        </div>

        {/* --- SECTION 1: COUGH HISTORY --- */}
        <div className="space-y-5">
          <label className="text-xs font-black uppercase tracking-[0.15em] text-blue-300 flex items-center gap-2">
            {txt.q1} <span className="text-white/20 font-medium normal-case ml-auto text-[10px] tracking-normal">{txt.required}</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: txt.q1Opts.none, val: 'none' },
              { label: txt.q1Opts.acute, val: 'less_than_2_weeks' },
              { label: txt.q1Opts.chronic, val: 'more_than_2_weeks' }
            ].map((opt) => (
              <button
                key={opt.val}
                onClick={() => handleChange("coughDuration", opt.val)}
                className={`py-5 px-4 rounded-2xl text-xs font-bold border transition-all duration-300 uppercase tracking-wide ${
                  formData.coughDuration === opt.val 
                  ? "bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] scale-[1.02]" 
                  : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white hover:border-white/20"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* --- SECTION 2: FEVER HISTORY --- */}
        <div className="space-y-5">
          <label className="text-xs font-black uppercase tracking-[0.15em] text-blue-300 flex items-center gap-2">
            {txt.q2} <span className="text-white/20 font-medium normal-case ml-auto text-[10px] tracking-normal">{txt.required}</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: txt.q2Opts.none, val: 'none' },
              { label: txt.q2Opts.acute, val: 'less_than_5_days' },
              { label: txt.q2Opts.chronic, val: 'more_than_5_days' }
            ].map((opt) => (
              <button
                key={opt.val}
                onClick={() => handleChange("feverDuration", opt.val)}
                className={`py-5 px-4 rounded-2xl text-xs font-bold border transition-all duration-300 uppercase tracking-wide ${
                  formData.feverDuration === opt.val 
                  ? "bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] scale-[1.02]" 
                  : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white hover:border-white/20"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* --- SECTION 3: RED FLAGS --- */}
        <div className="pt-8 border-t border-white/10">
          <label className="text-xs font-black uppercase tracking-[0.15em] text-red-400 flex items-center gap-2 mb-8">
            <AlertCircle size={16} /> {txt.q3}
          </label>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { id: "bloodInSputum", label: txt.symptoms.blood },
              { id: "severeChestPain", label: txt.symptoms.chest },
              { id: "weightLoss", label: txt.symptoms.weight },
              { id: "difficultyBreathing", label: txt.symptoms.breath },
              { id: "nightSweats", label: txt.symptoms.sweat }
            ].map((item) => (
              <div 
                key={item.id}
                onClick={() => handleChange(item.id, formData[item.id] === "yes" ? "no" : "yes")}
                className={`flex items-center justify-between p-5 rounded-2xl border cursor-pointer transition-all duration-300 group ${
                  formData[item.id] === "yes"
                  ? "bg-red-500/20 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                  : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white hover:border-white/20"
                }`}
              >
                <span className="text-xs font-bold uppercase tracking-wide">{item.label}</span>
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                  formData[item.id] === "yes" ? "bg-red-500 border-red-500 scale-110" : "border-white/30 group-hover:border-white/60"
                }`}>
                  {formData[item.id] === "yes" && <Check size={14} className="text-white" />}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* --- SUBMIT BUTTON --- */}
      <div className="mt-14">
        <button
          onClick={() => onSubmit(formData)}
          disabled={!isFormComplete}
          className={`w-full flex items-center justify-center gap-3 py-6 rounded-2xl font-black uppercase tracking-[0.25em] text-xs transition-all duration-500 ${
            isFormComplete
            ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_0_30px_rgba(37,99,235,0.5)] hover:scale-[1.01] cursor-pointer"
            : "bg-white/5 text-white/20 border border-white/5 cursor-not-allowed"
          }`}
        >
          {isFormComplete ? txt.btnGo : txt.btnWait}
          {isFormComplete && <ChevronRight size={16} />}
        </button>
      </div>

    </div>
  );
};

export default SymptomRecorder;