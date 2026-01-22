import React, { useContext } from "react";
import { AppContent } from "../context/AppContext";
import { Mail, Calendar, MapPin, Award, CheckCircle2, AlertCircle } from "lucide-react";

const ProfileCard = () => {
  const { userData, userMode } = useContext(AppContent);

  if (!userData) return null;

  return (
    <div className="w-full bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl overflow-hidden relative group">
      {/* Decorative Gradient Glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] group-hover:bg-blue-500/30 transition-all duration-700"></div>

      <div className="flex flex-col md:flex-row gap-10 items-center md:items-start relative z-10">
        
        {/* Profile Avatar & Role Badge */}
        <div className="relative">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center text-5xl md:text-6xl font-black border-4 border-white/10 shadow-2xl">
            {userData.name[0].toUpperCase()}
          </div>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white text-[#0d0333] text-[10px] font-black uppercase tracking-widest rounded-full shadow-xl whitespace-nowrap">
            {userMode === "staff" ? "Clinical Staff" : "Patient Account"}
          </div>
        </div>

        {/* Info Content */}
        <div className="flex-1 space-y-8 w-full">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-3xl md:text-4xl font-black">{userData.name}</h2>
              {userData.isAccountVerified ? (
                <CheckCircle2 className="text-green-400" size={24} />
              ) : (
                <AlertCircle className="text-orange-400" size={24} />
              )}
            </div>
            <p className="text-white/40 font-mono text-sm tracking-tighter uppercase">ID: {userData._id.slice(-12)}</p>
          </div>

          {/* Data Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-white/10">
            <div className="flex items-center gap-4 group/item">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 group-hover/item:border-blue-500/50 transition-colors">
                <Mail size={20} className="text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">Email Address</p>
                <p className="text-sm font-medium">{userData.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 group/item">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 group-hover/item:border-purple-500/50 transition-colors">
                <MapPin size={20} className="text-purple-400" />
              </div>
              <div>
                <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">Current Region</p>
                <p className="text-sm font-medium">Bhopal, Madhya Pradesh</p>
              </div>
            </div>

            <div className="flex items-center gap-4 group/item">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 group-hover/item:border-green-500/50 transition-colors">
                <Calendar size={20} className="text-green-400" />
              </div>
              <div>
                <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">Registration Date</p>
                <p className="text-sm font-medium">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 group/item">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 group-hover/item:border-orange-500/50 transition-colors">
                <Award size={20} className="text-orange-400" />
              </div>
              <div>
                <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">Trust Rating</p>
                <p className="text-sm font-medium">Standard Patient</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;