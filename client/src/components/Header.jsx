import React, { useContext, useState } from 'react';
import { assets } from '../assets/assets';
import { AppContent } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { userData, isLoggedin, setUserMode } = useContext(AppContent);
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  // --------------------------
  // Guest Mode Start
  // --------------------------
  const handleGuestStart = () => {
    navigate('/screening?guest=true');
  };

  // --------------------------
  // After Login Start Options
  // --------------------------
  const handleRoleSelect = (role) => {
    // role = "patient" or "staff"

    // Save role in context + localStorage
    setUserMode(role);
    localStorage.setItem("asteria_mode", role);

    // Navigate to screening
    navigate('/screening');
  };

  return (
    <div
      className="flex flex-col items-center justify-center w-full min-h-screen px-4 text-center text-white"
      style={{
        backgroundImage:
          "linear-gradient(180deg, rgba(13,3,51,0.85), rgba(74,10,145,0.85)), url('/bg_img.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        paddingTop: "120px",
        paddingBottom: "120px"
      }}
    >

      {/* ---- Hero Badge ---- */}
      <div className="w-full max-w-5xl mb-14 flex flex-col items-center gap-4 text-center">
        <img
          src={assets.lifeline}
          alt="lifeline"
          className="w-12 h-12 mb-2 opacity-90 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
        />

        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-blue-400">
            Offline-First. Intelligent Health Triage.
          </span>

          <br className="md:hidden" />
          <span className="block text-xl md:text-3xl mt-2 font-medium text-white/80">
            Empowering Underserved Communities
          </span>
        </h2>
      </div>

      {/* Dynamic Greeting */}
      <h1 className="text-xl sm:text-3xl font-medium mb-2">
        Hey{userData ? ` ${userData.name}` : ''}!
      </h1>

      {/* Title */}
      <h2 className="text-3xl sm:text-5xl font-semibold mb-4 max-w-4xl">
        Multi-Stage Health Screening & Risk Assessment
      </h2>

      {/* Subtitle */}
      <p className="mb-8 max-w-2xl text-lg opacity-90 leading-relaxed">
        Understand your health risk early. Start with symptom-only logic and escalate to AI-powered X-ray analysis only when necessary — designed to guide patients and ASHA workers to the right care at the right time.
      </p>

      {/* Start Screening Dropdown */}
      <div className="relative">
        <button
          onClick={toggleDropdown}
          className="border border-white rounded-full px-8 py-2.5 hover:bg-white hover:text-black transition-all text-lg flex items-center gap-2"
        >
          Begin Screening ▾
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute mt-2 w-56 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg py-2 z-50">

            {/* BEFORE LOGIN OPTIONS */}
            {!isLoggedin ? (
              <>
                <button
                  onClick={handleGuestStart}
                  className="block w-full text-left px-4 py-2 hover:bg-white/20 transition-all text-sm"
                >
                  Guest Mode
                </button>

                <button
                  onClick={() => navigate('/login')}
                  className="block w-full text-left px-4 py-2 hover:bg-white/20 transition-all text-sm"
                >
                  Login / Sign Up
                </button>
              </>
            ) : (
              // AFTER LOGIN OPTIONS
              <>
                <button
                  onClick={() => handleRoleSelect('staff')}
                  className="block w-full text-left px-4 py-2 hover:bg-white/20 transition-all text-sm"
                >
                  Health Worker (ASHA) Mode
                </button>

                <button
                  onClick={() => handleRoleSelect('patient')}
                  className="block w-full text-left px-4 py-2 hover:bg-white/20 transition-all text-sm"
                >
                  Individual Patient Mode
                </button>
              </>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export default Header;