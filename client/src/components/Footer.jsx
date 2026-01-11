import React from "react";

const Footer = () => {
  return (
    <footer
      className="w-full mt-16 py-6 border-t border-white/10 text-center text-white/70"
      style={{
        background: "linear-gradient(180deg, #4a0a91, #0d0333)",
      }}
    >
      <div className="max-w-5xl mx-auto px-6">
        
        <p className="text-sm mb-2">
          🩺 <span className="text-white">AsteriaAI</span> — Offline-First AI Health Assistant
        </p>

        <p className="text-xs text-white/40">
          © {new Date().getFullYear()} Hypercetamol Team | Version 1.0.0
        </p>

      </div>
    </footer>
  );
};

export default Footer;
