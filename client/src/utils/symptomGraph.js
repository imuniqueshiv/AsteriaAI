/**
 * 🧠 ASTERIA AI - ROBUST CLINICAL KNOWLEDGE GRAPH
 * ---------------------------------------------------------
 * "The Digital Chief Resident"
 * * UPGRADES:
 * 1. "Safe Exits": Every question has a "No/Normal" option.
 * 2. "Real-World Logic": Handles vague answers by defaulting to low risk.
 * 3. "Bug Fixes": Corrected broken navigation links (e.g., breath_check -> breath_context).
 * 4. "Clinical Depth": Added Appetite Loss check for better TB sensitivity.
 */

export const SYMPTOM_GRAPH = {
  // --- ROOT: THE STARTING POINT ---
  root: {
    id: "root",
    text: {
      en: "What is the patient's primary complaint?",
      hi: "रोगी की मुख्य शिकायत क्या है?"
    },
    why: "Determines the primary clinical pathway.",
    type: "single_choice",
    options: [
      { 
        label: { en: "Cough", hi: "खांसी" }, 
        next: "cough_duration",
        riskScore: 5 
      },
      { 
        label: { en: "Fever", hi: "बुखार" }, 
        next: "fever_duration",
        riskScore: 5 
      },
      { 
        label: { en: "Difficulty Breathing", hi: "सांस लेने में तकलीफ" }, 
        next: "breath_context",
        tags: ["DYSPNEA"],
        riskScore: 10 
      },
      { 
        label: { en: "Chest Pain", hi: "छाती में दर्द" }, 
        next: "pain_nature",
        riskScore: 10 
      },
      { 
        label: { en: "Weakness / Weight Loss", hi: "कमजोरी / वजन घटना" }, 
        next: "appetite_check", // Updated to start constitutional flow
        riskScore: 5 
      },
      // SAFE EXIT
      { 
        label: { en: "Routine Checkup / Other", hi: "सामान्य जांच / अन्य" }, 
        next: "history_check",
        riskScore: 0 
      }
    ]
  },

  // =========================================================
  // 🫁 PATHWAY 1: COUGH & SPUTUM ANALYTICS
  // =========================================================
  cough_duration: {
    id: "cough_duration",
    text: {
      en: "How long has the patient had the cough?",
      hi: "रोगी को खांसी कब से है?"
    },
    why: "Chronic cough (>2 weeks) is the #1 screening criteria for Tuberculosis (TB).",
    type: "single_choice",
    logic: { type: "duration", unit: "days", threshold: 14 }, 
    options: [
      { 
        label: { en: "Less than 2 weeks", hi: "2 सप्ताह से कम" }, 
        next: "sputum_check", 
        tags: ["ACUTE"],
        riskScore: 5,
        condition: (days) => days <= 14 
      },
      { 
        label: { en: "More than 2 weeks", hi: "2 सप्ताह से अधिक" }, 
        next: "hemoptysis_check", 
        tags: ["CHRONIC", "TB_FLAG"],
        riskScore: 25,
        condition: (days) => days > 14
      },
      // SAFE EXIT
      { 
        label: { en: "Unsure / Recent", hi: "पता नहीं / अभी हाल ही में" }, 
        next: "sputum_check", 
        riskScore: 0 
      }
    ]
  },

  hemoptysis_check: {
    id: "hemoptysis_check",
    text: {
      en: "Is there ANY blood in the sputum (Hemoptysis)?",
      hi: "क्या बलगम में खून आ रहा है?"
    },
    why: "CRITICAL RED FLAG: Indicates tissue destruction (TB, Cancer) or Pulmonary Embolism.",
    type: "boolean",
    options: [
      { label: { en: "Yes", hi: "हाँ" }, next: "night_sweats_check", tags: ["CRITICAL", "TB_HIGH_RISK"], riskScore: 50 },
      { label: { en: "No", hi: "नहीं" }, next: "sputum_check", riskScore: 0 }
    ]
  },

  sputum_check: {
    id: "sputum_check",
    text: {
      en: "Describe the nature of the cough/sputum.",
      hi: "खांसी/बलगम की प्रकृति कैसी है?"
    },
    why: "Sputum consistency differentiates bacterial vs. viral vs. allergic causes.",
    type: "single_choice",
    options: [
      { label: { en: "Dry / Hacking", hi: "सूखी / धास वाली" }, next: "breath_wheeze", riskScore: 0 },
      { label: { en: "Productive (Has Sputum)", hi: "बलगम वाली" }, next: "sputum_color", riskScore: 10 },
      // SAFE EXIT
      { label: { en: "No Cough / Normal", hi: "खांसी नहीं है" }, next: "fever_check", riskScore: 0 }
    ]
  },

  sputum_color: {
    id: "sputum_color",
    text: {
      en: "What is the color of the sputum?",
      hi: "बलगम का रंग क्या है?"
    },
    why: "Yellow/Green = Infection. Rusty = Pneumonia. Pink/Frothy = Pulmonary Edema.",
    type: "single_choice",
    options: [
      { label: { en: "Clear / White", hi: "साफ / सफेद" }, next: "fever_check", riskScore: 0 },
      { label: { en: "Yellow / Green (Pus)", hi: "पीला / हरा" }, next: "fever_check", tags: ["BACTERIAL"], riskScore: 15 },
      { label: { en: "Rusty / Brown", hi: "जंग जैसा / भूरा" }, next: "fever_check", tags: ["PNEUMONIA_RISK"], riskScore: 20 },
      { label: { en: "Pink / Frothy", hi: "गुलाबी / झागदार" }, next: "breath_context", tags: ["EDEMA_RISK"], riskScore: 30 },
      // SAFE EXIT
      { label: { en: "Don't Know / Not Seen", hi: "पता नहीं / नहीं देखा" }, next: "fever_check", riskScore: 0 }
    ]
  },

  // =========================================================
  // 🌡️ PATHWAY 2: FEVER & INFECTION
  // =========================================================
  fever_check: {
    id: "fever_check",
    text: {
      en: "Does the patient currently have a fever?",
      hi: "क्या रोगी को अभी बुखार है?"
    },
    type: "boolean",
    options: [
      { label: { en: "Yes", hi: "हाँ" }, next: "fever_severity", riskScore: 10 },
      { label: { en: "No", hi: "नहीं" }, next: "appetite_check", riskScore: 0 } // Route to constitutional
    ]
  },

  fever_severity: {
    id: "fever_severity",
    text: {
      en: "Describe the fever pattern.",
      hi: "बुखार कैसा है?"
    },
    why: "High grade + Chills = Pneumonia/Malaria. Low grade + Evening rise = Typical TB.",
    type: "single_choice",
    options: [
      { 
        label: { en: "High Grade with Chills/Shivering", hi: "तेज बुखार और कंपकंपी" }, 
        next: "breath_context", // FIX: Was "breath_check" (Broken)
        tags: ["ACUTE_INFECTION"], 
        riskScore: 20 
      },
      { 
        label: { en: "Low Grade (mostly evenings)", hi: "हल्का बुखार (शाम को)" }, 
        next: "fever_duration", 
        tags: ["TB_PATTERN"], 
        riskScore: 15 
      },
      { 
        label: { en: "Mild / Constant", hi: "हल्का / लगातार" }, 
        next: "fever_duration", 
        riskScore: 10 
      },
      // SAFE EXIT
      { label: { en: "Not Measured / Unsure", hi: "नापा नहीं / पता नहीं" }, next: "fever_duration", riskScore: 5 }
    ]
  },

  fever_duration: {
    id: "fever_duration",
    text: {
      en: "How long has the fever persisted?",
      hi: "बुखार कब से है?"
    },
    logic: { type: "duration", unit: "days", threshold: 5 },
    options: [
      { 
        label: { en: "Less than 5 days", hi: "5 दिन से कम" }, 
        next: "breath_context", // FIX: Was "breath_check" (Broken)
        riskScore: 5, 
        condition: (d) => d <= 5 
      },
      { 
        label: { en: "More than 5 days", hi: "5 दिन से अधिक" }, 
        next: "night_sweats_check", 
        tags: ["PERSISTENT_FEVER"], 
        riskScore: 15, 
        condition: (d) => d > 5 
      },
      // SAFE EXIT
      { label: { en: "Don't Know / Variable", hi: "पता नहीं" }, next: "breath_context", riskScore: 0 }
    ]
  },

  // =========================================================
  // 📉 PATHWAY 3: CONSTITUTIONAL (TB TRIAD - ENHANCED)
  // =========================================================
  night_sweats_check: {
    id: "night_sweats_check",
    text: {
      en: "Does the patient experience drenching night sweats?",
      hi: "क्या रोगी को रात में कपड़े भिगोने वाला पसीना आता है?"
    },
    why: "A hallmark sign of Tuberculosis, often ignored.",
    type: "boolean",
    options: [
      { label: { en: "Yes", hi: "हाँ" }, next: "appetite_check", tags: ["TB_FLAG"], riskScore: 20 },
      { label: { en: "No", hi: "नहीं" }, next: "appetite_check", riskScore: 0 }
    ]
  },

  // NEW NODE: APPETITE CHECK (Quality Question)
  appetite_check: {
    id: "appetite_check",
    text: {
      en: "Has there been a significant loss of appetite (Anorexia)?",
      hi: "क्या भूख कम लग रही है?"
    },
    why: "Loss of appetite is an early constitutional symptom of TB and chronic lung disease.",
    type: "boolean",
    options: [
      { label: { en: "Yes", hi: "हाँ" }, next: "weight_loss_check", tags: ["ANOREXIA"], riskScore: 15 },
      { label: { en: "No", hi: "नहीं" }, next: "weight_loss_check", riskScore: 0 }
    ]
  },

  weight_loss_check: {
    id: "weight_loss_check",
    text: {
      en: "Is there noticeable, unintentional weight loss?",
      hi: "क्या बिना कारण वजन कम हुआ है?"
    },
    why: "Cachexia (wasting) suggests chronic active TB, malignancy, or advanced COPD.",
    type: "boolean",
    options: [
      { label: { en: "Yes (Clothes fit loose)", hi: "हाँ (कपड़े ढीले हो गए)" }, next: "history_check", tags: ["CHRONIC_WASTING"], riskScore: 20 },
      { label: { en: "No", hi: "नहीं" }, next: "history_check", riskScore: 0 }
    ]
  },

  // =========================================================
  // 🫀 PATHWAY 4: BREATHING & EMERGENCIES
  // =========================================================
  breath_context: {
    id: "breath_context",
    text: {
      en: "When does the breathlessness happen?",
      hi: "सांस फूलना कब शुरू होता है?"
    },
    why: "Differentiates Asthma/COPD (Exertion) from Pneumonia/Failure (Rest).",
    type: "single_choice",
    options: [
      { label: { en: "Only on heavy exertion", hi: "भारी काम करने पर" }, next: "breath_wheeze", riskScore: 10 },
      { label: { en: "On walking level ground", hi: "सीधा चलने पर" }, next: "breath_wheeze", tags: ["MODERATE_DYSPNEA"], riskScore: 20 },
      { label: { en: "At rest / While sitting", hi: "बैठे-बैठे भी" }, next: "cyanosis_check", tags: ["SEVERE_DYSPNEA", "URGENT"], riskScore: 30 },
      // SAFE EXIT
      { label: { en: "No Breathlessness / Normal", hi: "सांस नहीं फूलती / सामान्य" }, next: "breath_wheeze", riskScore: 0 }
    ]
  },

  breath_wheeze: {
    id: "breath_wheeze",
    text: {
      en: "Is there a whistling sound (Wheeze) when breathing?",
      hi: "क्या सांस लेते समय सीटी जैसी आवाज आती है?"
    },
    why: "Wheezing indicates airway obstruction (Asthma, COPD).",
    type: "boolean",
    options: [
      { label: { en: "Yes", hi: "हाँ" }, next: "history_check", tags: ["AIRWAY_OBSTRUCTION"], riskScore: 15 },
      { label: { en: "No", hi: "नहीं" }, next: "history_check", riskScore: 0 }
    ]
  },

  cyanosis_check: {
    id: "cyanosis_check",
    text: {
      en: "Are the lips or fingertips turning blue (Cyanosis)?",
      hi: "क्या होंठ या उंगलियां नीली पड़ रही हैं?"
    },
    why: "MEDICAL EMERGENCY: Indicates severe Hypoxia (Oxygen deprivation).",
    type: "boolean",
    options: [
      { label: { en: "Yes", hi: "हाँ" }, next: "end", tags: ["EMERGENCY", "HYPOXIA"], riskScore: 100 }, // Max Score Trigger
      { label: { en: "No", hi: "नहीं" }, next: "pain_nature", riskScore: 0 }
    ]
  },

  pain_nature: {
    id: "pain_nature",
    text: {
      en: "Describe the chest pain.",
      hi: "छाती के दर्द का वर्णन करें।"
    },
    type: "single_choice",
    options: [
      { label: { en: "Sharp pain on deep breath", hi: "गहरी सांस लेने पर चुभन" }, next: "cough_duration", tags: ["PLEURITIC"], riskScore: 15 },
      { label: { en: "Heavy / Crushing pressure", hi: "भारीपन / दबाव" }, next: "end", tags: ["CARDIAC_RED_FLAG"], riskScore: 30 },
      // SAFE EXIT
      { label: { en: "No Pain", hi: "दर्द नहीं" }, next: "history_check", riskScore: 0 }
    ]
  },

  // =========================================================
  // 🏭 PATHWAY 5: RISK FACTORS & OCCUPATION
  // =========================================================
  history_check: {
    id: "history_check",
    text: {
      en: "Does the patient smoke or have previous TB history?",
      hi: "क्या रोगी धूम्रपान करता है या पुरानी टीबी है?"
    },
    type: "multi_choice",
    options: [
      { label: { en: "Previous TB Treatment", hi: "पुरानी टीबी का इलाज" }, next: "occupation_check", tags: ["RELAPSE_RISK"], riskScore: 20 },
      { label: { en: "Current Smoker", hi: "वर्तमान धूम्रपान करने वाला" }, next: "occupation_check", tags: ["COPD_RISK"], riskScore: 15 },
      { label: { en: "None", hi: "कुछ नहीं" }, next: "occupation_check", riskScore: 0 }
    ]
  },

  occupation_check: {
    id: "occupation_check",
    text: {
      en: "Does the patient work in dusty environments (Mines, Stone Crushing, Cotton)?",
      hi: "क्या रोगी धूल वाली जगह (खान, पत्थर क्रशर, कपास) में काम करता है?"
    },
    why: "Screens for Silicosis, Asbestosis, and Occupational Lung Diseases common in rural laborers.",
    type: "boolean",
    options: [
      { label: { en: "Yes", hi: "हाँ" }, next: "end", tags: ["OCCUPATIONAL_HAZARD"], riskScore: 15 },
      { label: { en: "No", hi: "नहीं" }, next: "end", riskScore: 0 }
    ]
  },

  // --- END ---
  end: {
    id: "end",
    text: {
      en: "Assessment Complete. Please confirm the profile below.",
      hi: "मूल्यांकन पूरा हुआ। कृपया नीचे दिए गए प्रोफाइल की पुष्टि करें।"
    },
    type: "info",
    options: []
  }
};

export const getStartNode = () => SYMPTOM_GRAPH.root;
export const getNode = (nodeId) => SYMPTOM_GRAPH[nodeId];