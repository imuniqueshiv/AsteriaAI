import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ArrowLeft, FileDown, Activity } from "lucide-react";

const ReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContent);

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch report data
  const fetchReport = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/report/${id}`, {
        credentials: "include",
      });
      const data = await response.json();

      if (data.success) {
        setReport(data.report);
      }
    } catch (error) {
      console.error("Error fetching report:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-white text-lg">
        Loading report...
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex justify-center items-center text-white text-lg">
        Report not found.
      </div>
    );
  }

  const {
    xrayImage,
    riskLevel,
    confidence,
    symptomsSummary,
    mcqResponses,
    timestamp,
  } = report;

  const formattedDate = new Date(timestamp).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Risk color styling
  const getRiskBadgeStyle = () => {
    if (riskLevel.includes("High"))
      return "text-red-300 bg-red-900/30 border-red-700";
    if (riskLevel.includes("Moderate"))
      return "text-yellow-300 bg-yellow-900/30 border-yellow-700";
    return "text-green-300 bg-green-900/30 border-green-700";
  };

  return (
    <div
      className="min-h-screen flex flex-col text-white"
      style={{ background: "linear-gradient(180deg, #0d0333, #4a0a91)" }}
    >
      <Navbar />

      {/* Page Header */}
      <div className="max-w-5xl mx-auto text-center mt-32 mb-10 px-6">
        <h1 className="text-3xl md:text-4xl font-bold flex items-center justify-center gap-2">
          <Activity className="w-7 h-7 text-purple-300" />
          Screening Report
        </h1>

        <p className="text-white/60 mt-2">{formattedDate}</p>

        {/* Risk Badge */}
        <div
          className={`inline-block mt-4 px-5 py-2 rounded-full border text-lg font-semibold ${getRiskBadgeStyle()}`}
        >
          {riskLevel} — {confidence}
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-6 inline-flex items-center gap-2 text-white/80 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Dashboard
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 mb-20">

        {/* X-ray Section */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl">
          <h3 className="text-xl font-semibold mb-4">Chest X-ray & Heatmap</h3>

          <div className="w-full bg-black/40 rounded-xl border border-white/20 p-4">
            <img
              src={xrayImage}
              alt="X-ray"
              className="w-full h-auto rounded-lg object-contain shadow-lg"
            />
          </div>

          <p className="text-xs text-white/50 mt-3">
            * Heatmap highlights areas of abnormality based on AI analysis.
          </p>
        </div>

        {/* Symptoms & Follow-up Section */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl flex flex-col">

          <h3 className="text-xl font-semibold mb-4">Symptoms Summary</h3>

          <div className="bg-black/30 border border-white/10 rounded-lg p-4 text-sm text-white/80 min-h-[100px]">
            {symptomsSummary || "No summary provided"}
          </div>

          {/* MCQ Breakdown (if exists) */}
          {mcqResponses && (
            <div className="mt-4 text-sm text-white/70">
              <h4 className="text-lg font-semibold mb-2">MCQ Responses</h4>
              <ul className="list-disc ml-5 space-y-1">
                {Object.entries(mcqResponses).map(([key, value]) => (
                  <li key={key}>
                    {key}: <span className="text-white">{value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Follow-up Advice */}
          <h3 className="text-xl font-semibold mt-8 mb-3">Follow-up Advice</h3>

          {riskLevel === "High Risk" && (
            <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-lg p-4 text-sm">
              Immediate referral recommended. Visit nearest PHC or district hospital urgently.
            </div>
          )}

          {riskLevel === "Moderate Risk" && (
            <div className="bg-yellow-900/30 border border-yellow-700 text-yellow-300 rounded-lg p-4 text-sm">
              Monitor symptoms for 48 hours. Seek medical attention if worsening.
            </div>
          )}

          {riskLevel === "Low Risk" && (
            <div className="bg-green-900/30 border border-green-700 text-green-300 rounded-lg p-4 text-sm">
              Low concern. Maintain routine observation and hydration.
            </div>
          )}

          {/* Auto Hospital Finder for High Risk */}
          {riskLevel === "High Risk" && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-2">Nearby Hospitals</h3>
              <iframe
                src="/hospital-finder"
                className="w-full h-[400px] rounded-xl border border-white/20"
              ></iframe>
            </div>
          )}

          {/* PDF Download Button */}
          <button
            onClick={() => (window.location.href = `${backendUrl}/api/report/pdf/${id}`)}
            className="mt-auto bg-purple-600 hover:bg-purple-500 text-white font-medium px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <FileDown className="w-5 h-5" />
            Download PDF Report
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ReportDetails;
