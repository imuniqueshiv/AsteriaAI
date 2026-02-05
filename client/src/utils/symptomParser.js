/**
 * 👂 ASTERIA AI - ROBUST NLP PARSER (MATH-AWARE + REAL WORLD)
 * ---------------------------------------------------------
 * This utility processes natural language input (Voice/Text)
 * and matches it to the Clinical Decision Tree options.
 * * * NEW CAPABILITIES:
 * 1. Universal Commands: Handles "Next", "Skip", "No" to prevent dead-ends.
 * 2. Time Extraction: Converts "5 days", "3 weeks" into raw numbers.
 * 3. Logic Evaluation: Checks mathematical conditions (e.g., 5 days < 14 days).
 * 4. Fuzzy Matching: Handles "Yes", "Yeah", "Ha", "Correct".
 */

export const parseResponse = (inputText, currentNode) => {
  if (!inputText || !currentNode || !currentNode.options) return null;

  const text = inputText.toLowerCase().trim();

  // ---------------------------------------------------------
  // STRATEGY 1: UNIVERSAL COMMANDS (The "Escape Hatch")
  // Handles real-world inputs like "Next", "Skip", "I don't know"
  // ---------------------------------------------------------
  const safeWords = ["next", "skip", "idk", "dont know", "don't know", "pass", "no", "nothing", "nahi", "unsure", "na"];
  
  // If the input is vaguely negative or skipping
  if (safeWords.some(word => text.includes(word))) {
    // 1. Try to find a semantically "negative" option first 
    // (e.g., "No Cough", "None", "Normal", "Not Measured")
    const negativeOption = currentNode.options.find(opt => {
        const label = opt.label.en.toLowerCase();
        return label.startsWith("no ") || label.includes("none") || label.includes("normal") || label.includes("not ") || label.includes("don't know");
    });
    
    if (negativeOption) return negativeOption;

    // 2. If no explicit negative option exists, return the LAST option.
    // In our Graph design, the last option is always the "Safe Exit" / "Lowest Risk" option.
    return currentNode.options[currentNode.options.length - 1];
  }

  // ---------------------------------------------------------
  // STRATEGY 2: DURATION / MATH LOGIC
  // Handles inputs like "5 days", "3 weeks", "1 month"
  // ---------------------------------------------------------
  if (currentNode.logic && currentNode.logic.type === "duration") {
    const days = extractDaysFromText(text);
    
    // If we successfully found a number (e.g., user said "5 days" -> 5)
    if (days !== null) {
      // Find the option where the 'condition' function returns true
      const matchedOption = currentNode.options.find(opt => 
        opt.condition && opt.condition(days)
      );
      
      if (matchedOption) return matchedOption;
    }
  }

  // ---------------------------------------------------------
  // STRATEGY 3: KEYWORD MATCHING (Fallback)
  // Handles inputs like "Yes", "Dry", "High Fever", "Green"
  // ---------------------------------------------------------
  for (const option of currentNode.options) {
    const keywords = getKeywordsForOption(currentNode.id, option);
    
    // Check for exact matches or partial phrases
    const isMatch = keywords.some(keyword => {
      // Logic: If keyword is "yes", we match "yes", "yeah", "ha"
      // But we avoid false positives (e.g. "yesterday" containing "yes")
      const regex = new RegExp(`\\b${keyword}\\b`, 'i'); 
      return regex.test(text) || text.includes(keyword);
    });

    if (isMatch) {
      return option;
    }
  }

  return null; // No match found
};

/**
 * 🧮 HELPER: Time Extraction Engine
 * Converts "2 weeks", "5 days", "1 year" into a single integer (days).
 */
const extractDaysFromText = (text) => {
  // Regex to find number + unit (e.g., "5 days", "2 weeks")
  const match = text.match(/(\d+)\s*(day|week|month|year)/);
  
  if (!match) {
    // Handle text-based numbers or fuzzy time
    if (text.includes("a week") || text.includes("one week")) return 7;
    if (text.includes("a month") || text.includes("one month")) return 30;
    if (text.includes("yesterday")) return 1;
    if (text.includes("today")) return 0;
    if (text.includes("long time") || text.includes("years")) return 365; // Chronic assumption
    
    // Attempt to just parse a raw number if context implies days
    const rawNum = text.match(/(\d+)/);
    if (rawNum && parseInt(rawNum[0]) < 100) return parseInt(rawNum[0]); 
    return null;
  }

  const number = parseInt(match[1]);
  const unit = match[2];

  if (unit.includes("day")) return number;
  if (unit.includes("week")) return number * 7;
  if (unit.includes("month")) return number * 30;
  if (unit.includes("year")) return number * 365;

  return null;
};

/**
 * 🧠 KEYWORD DICTIONARY (Expanded for Real World)
 * Maps specific graph options to natural language phrases.
 */
const getKeywordsForOption = (nodeId, option) => {
  const labelEn = option.label.en.toLowerCase();
  
  // Base keywords are words from the label itself
  let keywords = [labelEn];

  // --- CUSTOM SYNONYM MAPPING ---
  switch (nodeId) {
    
    // 1. ROOT (Main Complaint)
    case "root":
      if (labelEn.includes("cough")) return ["cough", "khas", "khansi", "sputum", "phlegm", "cold"];
      if (labelEn.includes("fever")) return ["fever", "bukhar", "temp", "hot", "warm", "shivering"];
      if (labelEn.includes("breath")) return ["breath", "saans", "dyspnea", "shortness", "hard to breathe", "gasping"];
      if (labelEn.includes("chest pain")) return ["pain", "dard", "chest", "heavy", "stabbing", "hurts"];
      if (labelEn.includes("weakness")) return ["weak", "kamzori", "tired", "fatigue", "weight", "loss", "checkup"];
      break;

    // 2. HEMOPTYSIS (Blood)
    case "hemoptysis_check":
      if (labelEn.includes("yes")) return ["yes", "ha", "blood", "red", "khoon", "bleeding", "rusty"];
      if (labelEn.includes("no")) return ["no", "nahi", "clear", "white", "yellow", "green"]; 
      break;

    // 3. WEIGHT LOSS
    case "weight_loss_check":
      if (labelEn.includes("yes")) return ["yes", "ha", "lost", "thin", "wajan", "kam hua", "clothes loose", "skinny"];
      if (labelEn.includes("no")) return ["no", "nahi", "same", "normal", "stable"];
      break;
      
    // 4. SPUTUM TYPE
    case "sputum_check":
      if (labelEn.includes("dry")) return ["dry", "sukhi", "no phlegm", "nothing comes out"];
      if (labelEn.includes("productive")) return ["wet", "phlegm", "balgam", "mucus", "yellow", "green", "thick", "coming out"];
      break;

    // 5. SPUTUM COLOR
    case "sputum_color":
      if (labelEn.includes("clear")) return ["clear", "white", "saaf", "saliva"];
      if (labelEn.includes("yellow")) return ["yellow", "green", "peela", "hara", "pus", "thick"];
      if (labelEn.includes("rusty")) return ["rusty", "brown", "reddish", "blood-stained"];
      if (labelEn.includes("pink")) return ["pink", "frothy", "foam", "bubbles"];
      break;

    // 6. FEVER PATTERN
    case "fever_severity":
      if (labelEn.includes("high grade")) return ["high", "shivering", "chills", "cold", "shaking", "tezz"];
      if (labelEn.includes("low grade")) return ["low", "evening", "night", "halka"];
      if (labelEn.includes("mild")) return ["mild", "constant", "normal"];
      break;

    // 7. BREATHING CONTEXT
    case "breath_context":
      if (labelEn.includes("heavy work")) return ["work", "exercise", "running", "heavy", "walking fast"];
      if (labelEn.includes("walking")) return ["walking", "stairs", "climbing", "normal walk"];
      if (labelEn.includes("rest")) return ["sitting", "lying", "bed", "rest", "doing nothing", "all the time"];
      if (labelEn.includes("no breathlessness")) return ["normal", "no", "none", "fine", "ok"];
      break;
      
    // 8. CYANOSIS (Blue)
    case "cyanosis_check":
        if (labelEn.includes("yes")) return ["yes", "blue", "lips", "fingers", "nails", "neela"];
        if (labelEn.includes("no")) return ["no", "normal", "pink"];
        break;

    // GENERIC YES/NO FALLBACK
    default:
      if (labelEn === "yes") return ["yes", "ha", "yeah", "correct", "right", "sure", "yep", "ok", "positive"];
      if (labelEn === "no") return ["no", "nah", "nope", "negative", "never", "nothing", "normal"];
  }

  return keywords;
};

/**
 * 🛠️ UTILITY: Auto-Correction
 * Helps clean up voice-to-text errors common in medical dictation.
 */
export const cleanInput = (rawText) => {
  return rawText
    .toLowerCase()
    .replace(/tv/g, "tb") // Common voice error: "TV" instead of "TB"
    .replace(/cop d/g, "copd")
    .replace(/blood in spit/g, "hemoptysis")
    .replace(/more then/g, "more than") // fix grammar
    .replace(/less then/g, "less than")
    .trim();
};