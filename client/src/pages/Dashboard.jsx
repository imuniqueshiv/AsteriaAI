import React, { useEffect, useState, useContext } from "react";
import { AppContent } from "../context/AppContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HistoryCard from "../components/HistoryCard";

const Dashboard = () => {
  const { backendUrl, userData } = useContext(AppContent);
  const [history, setHistory] = useState([]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/report/history`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setHistory(data.reports);
    } catch (error) {
      console.log(error);
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
      {/* Navbar */}
      <Navbar />

      {/* Page Header */}
      <div className="w-full text-center mt-32 px-6">
        <h1 className="text-3xl md:text-4xl font-bold">
          Your Screening History
        </h1>

        <p className="text-white/70 mt-3 text-lg max-w-2xl mx-auto">
          All AI assessments are saved securely. View past reports, check follow-ups, or download PDFs.
        </p>

        <div className="w-24 h-1 bg-blue-400/50 mx-auto mt-4 rounded-full" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 px-6 py-10 max-w-5xl mx-auto w-full">
        {/* If no history */}
        {history.length === 0 && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 text-center mt-10 shadow-xl">
            <h3 className="text-xl font-semibold mb-2">No Reports Found</h3>
            <p className="text-white/60">
              You have not completed any screenings yet.
              <br />
              Start your first screening from the home page.
            </p>
          </div>
        )}

        {/* History Cards */}
        <div className="mt-10 grid grid-cols-1 gap-6">
          {history.map((item, index) => (
            <HistoryCard key={index} data={item} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Dashboard;
