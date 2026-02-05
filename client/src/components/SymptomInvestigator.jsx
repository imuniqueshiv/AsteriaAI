import React, { useState, useContext, useRef, useEffect } from "react";
import axios from "axios";
import { AppContent } from "../context/AppContext";
import { 
  Send, Bot, Activity, Loader2, FileText 
} from "lucide-react";

const SymptomInvestigator = ({ language = "en", onSubmit }) => {
  const { backendUrl } = useContext(AppContent);

  const [demographics, setDemographics] = useState({ name: "", age: "", gender: "" });
  const [isRegistered, setIsRegistered] = useState(false);
  
  const [history, setHistory] = useState([]);
  const [chatLog, setChatLog] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [risk, setRisk] = useState("Unknown");
  const [isComplete, setIsComplete] = useState(false);
  const [symptoms, setSymptoms] = useState({});

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  
  // FIXED: Better scroll function
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  // Auto scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [history, loading]);

  // Focus input when not loading
  useEffect(() => {
    if (!loading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [loading]);

  // Registration
  const handleRegistration = (e) => {
    e.preventDefault();
    if (demographics.age && demographics.gender) {
      setIsRegistered(true);
      
      const startText = language === "en" 
        ? `Hello. I am Dr. Asteria. What symptoms are you experiencing?`
        : `नमस्ते। मैं डॉ. एस्टीरिया हूँ। आपके लक्षण क्या हैं?`;

      const initialMsg = { role: "assistant", content: startText };
      setHistory([initialMsg]);
      setChatLog([initialMsg]);
    }
  };

  // Send Message
  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || loading) return;

    const userMsg = { role: "user", content: trimmedInput };
    
    // Update UI immediately
    setHistory(prev => [...prev, userMsg]);
    setChatLog(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/triage/chat`, 
        {
          history: chatLog,
          userResponse: trimmedInput,
          demographics: demographics // Passing Age/Gender here
        },
        // FIX: Increased timeout to 45 seconds to prevent network errors on slow PCs
        { timeout: 45000 } 
      );

      if (data.success && data.data.bot_reply) {
        const botMsg = { role: "assistant", content: data.data.bot_reply };
        
        setHistory(prev => [...prev, botMsg]);
        setChatLog(prev => [...prev, botMsg]);

        // Update symptoms
        if (data.data.updated_symptoms) {
          setSymptoms(prev => ({ ...prev, ...data.data.updated_symptoms }));
        }
        
        // Update risk
        if (data.data.risk_level && data.data.risk_level !== "Unknown") {
          setRisk(data.data.risk_level);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMsg = { 
        role: "assistant", 
        content: "Sorry, connection issue. Please repeat that." 
      };
      setHistory(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Complete Assessment
  const handleFinalSubmit = async () => {
    if (loading || isComplete) return;
    
    setLoading(true);

    const generatingMsg = { 
      role: "assistant", 
      content: "⏳ Generating summary..." 
    };
    setHistory(prev => [...prev, generatingMsg]);

    try {
      const summaryPrompt = "SYSTEM_COMMAND: Generate summary";

      const { data } = await axios.post(
        `${backendUrl}/api/triage/chat`, 
        {
          history: chatLog,
          userResponse: summaryPrompt,
          demographics: demographics
        },
        // FIX: Increased timeout to 60 seconds (60000ms)
        // Summary generation takes longer than normal chat, so we need more time.
        { timeout: 60000 }
      );

      let finalSummary = "Assessment completed.";
      
      if (data.success && data.data.bot_reply) {
        finalSummary = data.data.bot_reply;
      }

      // Replace generating message with summary
      setHistory(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: `📋 Assessment Complete\n\n${finalSummary}`
        };
        return updated;
      });

      const structuredData = {
        demographics,
        riskScore: calculateRiskScore(risk, symptoms),
        riskLevel: risk,
        symptoms,
        conversationLog: chatLog,
        clinicalSummary: finalSummary,
        timestamp: new Date().toISOString(),
        language
      };

      console.log("📦 Data:", structuredData);

      setTimeout(() => {
        onSubmit(structuredData);
        setIsComplete(true);
      }, 2500);

    } catch (error) {
      console.error("Summary Error:", error);
      
      setHistory(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "⚠️ Summary failed. Proceeding with collected data."
        };
        return updated;
      });

      setTimeout(() => {
        onSubmit({
          demographics, 
          riskScore: 30, 
          riskLevel: risk || "Moderate",
          symptoms,
          conversationLog: chatLog,
          clinicalSummary: "Manual review required.", 
          timestamp: new Date().toISOString(),
          language 
        });
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  const calculateRiskScore = (riskLevel, symptoms) => {
    let baseScore = 0;
    
    if (riskLevel === "High") baseScore = 75;
    else if (riskLevel === "Moderate") baseScore = 45;
    else baseScore = 15;
    
    const symptomCount = Object.keys(symptoms).length;
    const adjustment = Math.min(symptomCount * 3, 20);
    
    return Math.min(baseScore + adjustment, 100);
  };

  const getRiskColor = () => {
    if (risk === "High") return "text-red-400 border-red-500/50 bg-red-500/10 animate-pulse";
    if (risk === "Moderate") return "text-orange-400 border-orange-500/50 bg-orange-500/10";
    return "text-green-400 border-green-500/50 bg-green-500/10";
  };

  // Registration Screen
  if (!isRegistered) {
    return (
      <div className="bg-[#0a0520]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col items-center justify-center h-[500px] relative p-8 text-center">
        <div className="mb-6 p-4 bg-blue-600/20 rounded-full border border-blue-500/30">
          <FileText size={40} className="text-blue-400" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">
          {language === "en" ? "Patient Registration" : "रोगी पंजीकरण"}
        </h2>
        <p className="text-white/40 text-sm mb-8 max-w-md">
          Stage 1: Symptom Collection & Risk Assessment
        </p>

        <form onSubmit={handleRegistration} className="w-full max-w-sm space-y-4">
          <input 
            type="text" 
            placeholder="Name (Optional)"
            value={demographics.name}
            onChange={e => setDemographics({...demographics, name: e.target.value})}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500"
          />
          <div className="flex gap-4">
            <input 
              type="number" 
              required
              min="1"
              max="120"
              placeholder="Age *"
              value={demographics.age}
              onChange={e => setDemographics({...demographics, age: e.target.value})}
              className="w-1/2 bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500"
            />
            <select 
              required
              value={demographics.gender}
              onChange={e => setDemographics({...demographics, gender: e.target.value})}
              className="w-1/2 bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="" className="bg-[#0d0333]">Gender *</option>
              <option value="Male" className="bg-[#0d0333]">Male</option>
              <option value="Female" className="bg-[#0d0333]">Female</option>
              <option value="Other" className="bg-[#0d0333]">Other</option>
            </select>
          </div>
          <button 
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.02] rounded-xl text-white font-bold uppercase tracking-widest shadow-lg transition-all"
          >
            Begin Assessment
          </button>
        </form>
      </div>
    );
  }

  // Chat Interface
  return (
    <div className="bg-[#0a0520]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col h-[650px]">
      
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white/[0.03] border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
            <Bot size={22} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white">
              Dr. Asteria ({demographics.age}/{demographics.gender.charAt(0)})
            </h3>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <p className="text-[10px] text-blue-200/50 uppercase tracking-widest font-bold">Online</p>
            </div>
          </div>
        </div>

        <div className={`px-4 py-2 rounded-full border flex items-center gap-2 ${getRiskColor()}`}>
          <Activity size={16} />
          <span className="text-xs font-black uppercase tracking-widest">
            Risk: {risk}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
      >
        {history.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
          >
            <span className="text-[10px] text-white/20 uppercase tracking-widest font-bold mb-1 px-1">
              {msg.role === "user" ? "You" : "Asteria AI"}
            </span>
            <div className={`max-w-[85%] px-6 py-4 text-sm font-medium leading-relaxed shadow-lg ${
              msg.role === "user" 
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl rounded-tr-none" 
                : "bg-white/10 border border-white/5 text-gray-100 rounded-2xl rounded-tl-none"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex flex-col items-start">
            <span className="text-[10px] text-white/20 uppercase tracking-widest font-bold mb-1 px-1">
              Asteria AI
            </span>
            <div className="px-6 py-4 bg-white/5 border border-white/5 rounded-2xl rounded-tl-none flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            </div>
          </div>
        )}

        {!isComplete && history.length >= 8 && (
          <div className="flex justify-center pt-4">
            <button 
              onClick={handleFinalSubmit} 
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-xl text-white font-bold uppercase tracking-widest text-xs shadow-lg transition-all hover:scale-105 disabled:opacity-50"
            >
              {loading ? "Generating..." : "✓ Complete Assessment"}
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-5 bg-[#0a0520] border-t border-white/10">
        <div className="flex items-center gap-3">
          <input 
            ref={inputRef}
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }} 
            disabled={loading || isComplete} 
            placeholder="Describe your symptoms..." 
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500 disabled:opacity-50" 
          />
          <button 
            onClick={handleSend} 
            disabled={!input.trim() || loading || isComplete} 
            className="p-3.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-white shadow-lg transition-all hover:scale-105 disabled:opacity-50"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
        
        <p className="text-[10px] text-white/20 mt-2 text-center">
          Stage 1: Symptom Collection Only • No Diagnosis
        </p>
      </div>
    </div>
  );
};

export default SymptomInvestigator;