import React, { useContext } from "react";
import Navbar from "../components/Navbar";
import ProfileCard from "../components/ProfileCard";
import Footer from "../components/Footer";
import { AppContent } from "../context/AppContext";
import { ShieldCheck, UserCircle, Settings } from "lucide-react";

const Profile = () => {
  const { userData } = useContext(AppContent);

  return (
    <div className="min-h-screen flex flex-col text-white" style={{ background: "linear-gradient(180deg, #0d0333, #4a0a91)" }}>
      <Navbar />

      <main className="flex-1 pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div>
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <ShieldCheck size={20} className="animate-pulse" />
                <span className="text-xs font-black uppercase tracking-[0.3em]">Verified Health Profile</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight">Account Overview</h1>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="text-right hidden md:block">
                  <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">System Status</p>
                  <p className="text-green-400 text-sm font-bold">Encrypted & Active</p>
               </div>
               <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
                  <Settings className="text-white/60 hover:rotate-90 transition-all cursor-pointer" size={24} />
               </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="grid grid-cols-1 gap-8">
            <ProfileCard />
            
            {/* Security Notice */}
            <div className="bg-blue-900/20 border border-blue-500/20 rounded-3xl p-6 flex items-start gap-4 shadow-xl">
               <div className="bg-blue-500/20 p-2 rounded-lg">
                  <UserCircle className="text-blue-400" size={24} />
               </div>
               <div>
                  <h3 className="font-bold text-sm text-blue-100">Data Privacy & Security</h3>
                  <p className="text-xs text-white/50 leading-relaxed mt-1">
                    Your health screening data is stored locally for offline access and synced with secure cloud encryption only when an active internet connection is detected. Asteria AI complies with standard clinical data handling protocols.
                  </p>
               </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;