import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import Navbar from "../components/Navbar";

const RoleSelection = () => {
  const navigate = useNavigate();
  const { setUserMode } = useContext(AppContent);

  // Role Selection Handler
  const handleSelect = (mode) => {
    setUserMode(mode);           // Save role in context + localStorage
    navigate("/screening");      // Redirect to screening page
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col text-white"
      style={{
        background: "linear-gradient(180deg, #0d0333, #4a0a91)",
      }}
    >
      {/* Navbar */}
      <Navbar />

      {/* Title Section */}
      <div className="text-center mt-28 px-4">
        <h1 className="text-3xl md:text-4xl font-bold">Select Your Role</h1>
        <p className="text-white/70 mt-3 max-w-xl mx-auto text-lg">
          Choose whether you are Health Staff or a Patient.  
          This helps personalize your experience and data workflow.
        </p>
      </div>

      {/* Role Options */}
      <div className="flex flex-col md:flex-row justify-center gap-10 md:gap-20 mt-14 px-4">

        {/* Health Staff Option */}
        <div
          onClick={() => handleSelect("staff")}
          className="flex flex-col items-center cursor-pointer group"
        >
          <div className="w-44 h-44 md:w-52 md:h-52 rounded-full bg-white/10 border border-white/20 flex items-center justify-center transition-all group-hover:bg-white/20 group-hover:scale-105">
            <svg
              width="90"
              height="90"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-80"
            >
              <circle cx="12" cy="7" r="4"></circle>
              <path d="M5.5 21c0-4 3-7 6.5-7s6.5 3 6.5 7"></path>
            </svg>
          </div>

          <div className="mt-4 bg-white/10 border border-white/20 rounded-xl px-8 py-3 text-center text-lg font-semibold group-hover:bg-white/20 transition-all">
            Health Staff
          </div>
        </div>

        {/* Patient Option */}
        <div
          onClick={() => handleSelect("patient")}
          className="flex flex-col items-center cursor-pointer group"
        >
          <div className="w-44 h-44 md:w-52 md:h-52 rounded-full bg-white/10 border border-white/20 flex items-center justify-center transition-all group-hover:bg-white/20 group-hover:scale-105">
            <svg
              width="90"
              height="90"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-80"
            >
              <circle cx="12" cy="7" r="4"></circle>
              <path d="M5.5 21c0-4 3-7 6.5-7s6.5 3 6.5 7"></path>
            </svg>
          </div>

          <div className="mt-4 bg-white/10 border border-white/20 rounded-xl px-8 py-3 text-center text-lg font-semibold group-hover:bg-white/20 transition-all">
            Patient
          </div>
        </div>

      </div>
    </div>
  );
};

export default RoleSelection;
