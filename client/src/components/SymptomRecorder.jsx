import React, { useState } from "react";

const SymptomRecorder = ({ onSubmit }) => {
  const [form, setForm] = useState({
    age: "",
    gender: "",
    cough: false,
    coughDuration: "",
    fever: false,
    feverDuration: "",
    chestPain: false,
    breathlessness: false,
    weightLoss: false,
    nightSweats: false,
    bloodInSputum: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = () => {
    if (!form.age || !form.gender) {
      alert("Demographics (Age & Gender) are required for accurate triage.");
      return;
    }

    // Clinical Logic: Duration-based severity scoring
    let severityScore = 0;
    const duration = parseInt(form.coughDuration) || 0;
    const fDuration = parseInt(form.feverDuration) || 0;

    // Stage 1 Severity Reasoning
    if (form.cough && duration > 14) severityScore += 3; // TB indicator: Cough > 2 weeks
    if (form.bloodInSputum) severityScore += 4;         // Red flag: TB risk
    if (form.fever && fDuration > 7) severityScore += 2; // Persistent fever
    if (form.breathlessness) severityScore += 3;        // Acute risk: Pneumonia indicator
    if (form.weightLoss && form.nightSweats) severityScore += 3; // Combined TB markers

    const triageResult = {
      ...form,
      severityScore,
      riskLevel: severityScore > 6 ? "High Risk" : severityScore > 3 ? "Moderate Risk" : "Low Risk",
      timestamp: new Date().toISOString(),
    };

    onSubmit(triageResult);
  };

  return (
    <div className="bg-[#1b1f3b]/80 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl text-white">
      <h2 className="text-2xl font-bold mb-2 italic text-blue-400">
        Stage 1: Clinical Symptom Triage
      </h2>
      <p className="text-sm text-white/50 mb-6 border-b border-white/10 pb-4">
        Structured assessment for low-resource health screening.
      </p>

      {/* Demographics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-1">
          <label className="text-xs uppercase tracking-widest text-white/60 font-bold">Age</label>
          <input
            type="number"
            name="age"
            placeholder="Years"
            value={form.age}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs uppercase tracking-widest text-white/60 font-bold">Gender</label>
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 outline-none transition-all"
          >
            <option value="" className="bg-[#1b1f3b]">Select Gender</option>
            <option value="male" className="bg-[#1b1f3b]">Male</option>
            <option value="female" className="bg-[#1b1f3b]">Female</option>
            <option value="other" className="bg-[#1b1f3b]">Other</option>
          </select>
        </div>
      </div>

      {/* Symptoms Grid */}
      <div className="space-y-6">
        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
          <Checkbox label="Persistent Cough" name="cough" form={form} onChange={handleChange} />
          {form.cough && (
            <div className="mt-4 ml-8 animate-in fade-in slide-in-from-left-2 duration-300">
              <label className="text-xs text-blue-300 font-bold uppercase block mb-2">
                Cough Duration (Days)
              </label>
              <input
                type="number"
                name="coughDuration"
                value={form.coughDuration}
                onChange={handleChange}
                placeholder="Ex: 14"
                className="w-24 p-2 rounded-lg bg-white/10 border border-white/10 outline-none"
              />
            </div>
          )}
        </div>

        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
          <Checkbox label="Fever" name="fever" form={form} onChange={handleChange} />
          {form.fever && (
            <div className="mt-4 ml-8 animate-in fade-in slide-in-from-left-2 duration-300">
              <label className="text-xs text-blue-300 font-bold uppercase block mb-2">
                Fever Duration (Days)
              </label>
              <input
                type="number"
                name="feverDuration"
                value={form.feverDuration}
                onChange={handleChange}
                className="w-24 p-2 rounded-lg bg-white/10 border border-white/10 outline-none"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4">
          <Checkbox label="Chest Pain" name="chestPain" form={form} onChange={handleChange} />
          <Checkbox label="Shortness of Breath" name="breathlessness" form={form} onChange={handleChange} />
          <Checkbox label="Unintentional Weight Loss" name="weightLoss" form={form} onChange={handleChange} />
          <Checkbox label="Night Sweats" name="nightSweats" form={form} onChange={handleChange} />
          <Checkbox label="Blood in Sputum" name="bloodInSputum" form={form} onChange={handleChange} />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="mt-10 w-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-900/40 transition-all active:scale-95 uppercase tracking-widest"
      >
        Record Stage 1 Data
      </button>
    </div>
  );
};

const Checkbox = ({ label, name, form, onChange }) => (
  <label className="flex items-center gap-4 cursor-pointer group">
    <div className="relative flex items-center justify-center">
      <input
        type="checkbox"
        name={name}
        checked={form[name]}
        onChange={onChange}
        className="peer h-6 w-6 cursor-pointer appearance-none rounded-md border border-white/20 bg-white/5 transition-all checked:bg-blue-500"
      />
      <svg
        className="absolute h-4 w-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </div>
    <span className="text-gray-200 group-hover:text-white transition-colors font-medium">{label}</span>
  </label>
);

export default SymptomRecorder;