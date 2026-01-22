import React, { useEffect, useState, useContext } from "react";
import { AppContent } from "../context/AppContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HistoryCard from "../components/HistoryCard";
import { ClipboardList, ShieldCheck, Info } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

const Dashboard = () => {
  const { backendUrl } = useContext(AppContent);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // ------------------------------------------------------------------
  // FETCH ALL HISTORY
  // ------------------------------------------------------------------
  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${backendUrl}/api/report/history`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setHistory(data.reports);
    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // DELETE REPORT (MEMORY MANAGEMENT)
  // ------------------------------------------------------------------
  const handleDeleteReport = async (reportId) => {
    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/report/delete/${reportId}`,
        { withCredentials: true }
      );

      if (data.success) {
        // Optimistically update UI by removing the deleted item from state
        setHistory((prev) => prev.filter((item) => item._id !== reportId));
        toast.success("Assessment record cleared successfully");
      } else {
        toast.error(data.message || "Failed to delete record");
      }
    } catch (error) {
      console.error("Delete Error:", error);
      toast.error(error.response?.data?.message || "Server error during deletion");
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div
      className="flex flex-col min-h-screen text-white"
      style={{ background: "linear-gradient(180deg, #0d0333, #4a0a91)" }}
    >
      <Navbar />

      {/* Page Header - Triage Intelligence Theme */}
      <div className="w-full text-center mt-32 px-6">
        <div className="flex justify-center mb-4">
          <div className="bg-blue-500/20 p-3 rounded-2xl border border-blue-400/30">
            <ClipboardList className="w-8 h-8 text-blue-300" />
          </div>
        </div>
        
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          Patient Screening Dashboard
        </h1>

        <p className="text-white/60 mt-4 text-lg max-w-2xl mx-auto leading-relaxed">
          Manage Stage 3 triage data. Access secure offline-ready reports, urgent referral summaries, and AI-assisted clinical follow-ups.
        </p>

        <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-600 mx-auto mt-6 rounded-full shadow-[0_0_15px_rgba(96,165,250,0.5)]" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 px-6 py-10 max-w-5xl mx-auto w-full">
        
        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : (
          <>
            {/* If no history */}
            {history.length === 0 ? (
              <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-12 text-center mt-10 shadow-2xl">
                <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                   <Info className="w-8 h-8 text-white/30" />
                </div>
                <h3 className="text-2xl font-bold mb-3">No Triage Records Found</h3>
                <p className="text-white/50 max-w-md mx-auto mb-8">
                  No multi-stage screenings have been performed on this device yet.
                </p>
                <button 
                  onClick={() => window.location.href = '/screening'}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/30"
                >
                  Start First Screening
                </button>
              </div>
            ) : (
              <div className="mt-6 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                <div className="flex items-center justify-between px-2">
                   <h2 className="text-xl font-bold flex items-center gap-2">
                     <ShieldCheck className="w-5 h-5 text-green-400" />
                     Recent Assessments
                   </h2>
                   <span className="text-xs uppercase tracking-widest text-white/40 font-bold">
                     Total Records: {history.length}
                   </span>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {history.map((item) => (
                    <HistoryCard 
                      key={item._id} 
                      data={item} 
                      onDelete={handleDeleteReport} 
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;