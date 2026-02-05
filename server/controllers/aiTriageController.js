import axios from "axios";

export const chatWithTriageAI = async (req, res) => {
  try {
    const { history, userResponse, demographics } = req.body;
    
    // 1. Setup Patient Context
    const age = demographics?.age || "Unknown";
    const gender = demographics?.gender || "Unknown";
    const isSummary = userResponse.includes("SYSTEM_COMMAND");

    // ====================================================
    // PATH 1: CLINICAL SUMMARY (Medical Scribe Mode)
    // ====================================================
    if (isSummary) {
      console.log("📝 Generating Summary...");
      
      const conversation = history
        .map(m => `${m.role === "user" ? "Patient" : "Dr. Asteria"}: ${m.content}`)
        .join("\n");

      const messages = [
        {
          role: "system",
          content: "You are a specialized Medical Scribe. Summarize the consultation."
        },
        {
          role: "user",
          content: `Patient Data: ${age}y/${gender}.
          
          TRANSCRIPT:
          ${conversation}
          
          TASK: Create a professional clinical summary in 3 bullet points:
          1. Chief Complaint & Duration (Only state what was explicitly confirmed).
          2. Associated Symptoms (Positive & Negative findings).
          3. Provisional Assessment & Risk Level.`
        }
      ];

      const response = await axios.post("http://127.0.0.1:11434/api/chat", {
        model: "asteria",
        messages: messages,
        stream: false,
        options: { temperature: 0.1 }
      });

      return res.json({
        success: true,
        data: {
          bot_reply: response.data.message.content.trim(),
          updated_symptoms: {},
          risk_level: "Report Generated"
        }
      });
    }

    // ====================================================
    // PATH 2: TRIAGE CHAT (The "Real World" Logic)
    // ====================================================
    
    // A. Analyze History to Prevent Loops
    // We scan previous messages to see what topics were already covered.
    const historyText = history.map(m => m.content.toLowerCase()).join(" ");
    const coveredTopics = [];
    
    if (historyText.includes("cough")) coveredTopics.push("Cough");
    if (historyText.includes("breath") || historyText.includes("tightness")) coveredTopics.push("Breathing/Chest");
    if (historyText.includes("fever") && historyText.includes("days")) coveredTopics.push("Fever Duration");
    if (historyText.includes("travel")) coveredTopics.push("Travel History");

    console.log(`🗣️ User: "${userResponse}" | 🚫 Avoid: ${coveredTopics.join(", ")}`);

    // B. Construct the Prompt
    let messages = [];

    // System Persona
    messages.push({
      role: "system",
      content: `You are Dr. Asteria. 
      Patient: ${age}-year-old ${gender}.
      
      CRITICAL INSTRUCTION:
      - The user just said: "${userResponse}".
      - IF they mentioned a symptom (e.g., "fever") but NOT the duration, your ONLY job is to ask "How long have you had it?".
      - DO NOT assume the duration is 5 days.
      - DO NOT ask about: [${coveredTopics.join(", ")}].
      - Keep it conversational but professional.`
    });

    // Clean History
    if (Array.isArray(history)) {
      history.forEach((msg) => {
        messages.push({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.content.replace(/\[Risk:.*?\]/gi, "").trim()
        });
      });
    }

    // User Input + Tag Enforcer
    messages.push({
      role: "user",
      content: `${userResponse} \n\n(SYSTEM: Reply naturally. End with [Risk: High|Moderate|Low|Unknown])`
    });

    // C. Call AI
    const response = await axios.post("http://127.0.0.1:11434/api/chat", {
      model: "asteria",
      messages: messages,
      stream: false,
      options: { 
        temperature: 0.3, // Balance between strictness and empathy
        presence_penalty: 0.6 // Discourage repeating topics
      }
    });

    let rawText = response.data.message.content.trim();
    let botReply = rawText;
    let riskLevel = "Unknown";

    // D. Extract Risk
    const riskMatch = rawText.match(/\[Risk:\s*(High|Moderate|Low|Unknown)\]/i);
    if (riskMatch) {
      riskLevel = riskMatch[1];
      botReply = rawText.replace(riskMatch[0], "").trim();
    } else {
        // Fallback Scanner
        if (rawText.toLowerCase().includes("emergency") || rawText.toLowerCase().includes("hospital")) riskLevel = "High";
    }

    console.log(`🤖 Bot: "${botReply}"`);
    console.log(`📊 Risk: ${riskLevel}`);

    return res.json({
      success: true,
      data: {
        bot_reply: botReply,
        updated_symptoms: {},
        risk_level: riskLevel,
      },
    });

  } catch (error) {
    console.error("❌ Controller Error:", error.message);
    return res.status(500).json({ success: false, message: "AI Busy" });
  }
};