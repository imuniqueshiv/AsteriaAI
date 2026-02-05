import React from "react";
import { MapPin, Navigation, Building2, WifiOff, ClipboardList, ShieldCheck, ExternalLink } from "lucide-react";
import { getDistanceKm } from "../utils/distance";

const HospitalCard = ({ data, userLocation }) => {
  const { name, type, address, lat, lng, services = [] } = data;

  // TRIAGE PROXIMITY LOGIC
  const distance =
    userLocation && lat && lng
      ? getDistanceKm(userLocation.lat, userLocation.lng, lat, lng).toFixed(1)
      : null;

  const typeColor = {
    PHC: "bg-green-900/40 text-green-300 border-green-700",
    CHC: "bg-yellow-900/40 text-yellow-300 border-yellow-700",
    "District Hospital": "bg-red-900/40 text-red-300 border-red-700",
    "TB Center": "bg-purple-900/40 text-purple-300 border-purple-700",
  }[type] || "bg-white/10 text-white border-white/20";

  const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

  return (
    <div className="w-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 shadow-xl transition-all hover:bg-white/10 hover:border-blue-500/30 group">
      
      <div className="flex items-start justify-between mb-4">
        <div className="flex gap-4">
          <div className="bg-blue-600/20 p-3 rounded-2xl border border-blue-500/20 group-hover:scale-110 transition-transform">
            <Building2 className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white leading-tight mb-1">{name}</h3>
            <span className={`px-3 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-full border ${typeColor}`}>
              {type}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {distance && (
          <div className="flex items-center gap-3 text-blue-300 text-sm font-bold bg-blue-500/10 w-fit px-3 py-1 rounded-lg border border-blue-500/20">
            <Navigation size={14} className="fill-current" />
            {distance} KM FROM TRIAGE POINT
          </div>
        )}
        <div className="flex items-start gap-3 text-white/60 text-xs leading-relaxed">
          <MapPin size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="line-clamp-2">{address}</p>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-[10px] uppercase font-black text-white/30 tracking-[0.2em] mb-3">Referral Services</p>
        <div className="flex flex-wrap gap-2">
          {services.length > 0 ? (
            services.map((srv, idx) => (
              <span
                key={idx}
                className="px-3 py-1 text-[10px] font-bold rounded-lg bg-white/5 border border-white/10 text-white/80"
              >
                {srv}
              </span>
            ))
          ) : (
            <span className="text-white/20 text-[10px] font-bold uppercase italic">
              General Clinical Support
            </span>
          )}
        </div>
      </div>

      {!isOnline && (
        <div className="flex items-center gap-2 mb-6 text-orange-300 bg-orange-900/20 border border-orange-700/50 rounded-xl p-3 text-[10px] font-bold uppercase tracking-widest animate-pulse">
          <WifiOff size={16} />
          Offline Mode: Using Local Clinical Directory
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => alert("Generating Stage 3 Referral Summary Note for " + name)}
          className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-lg active:scale-95"
        >
          <ClipboardList size={14} /> Referral Note
        </button>

        <button
          disabled={!isOnline}
          onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank")}
          className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95
            ${isOnline 
              ? "bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow-blue-900/20" 
              : "bg-white/5 text-white/20 border border-white/5 cursor-not-allowed"
            }`}
        >
          {isOnline ? (<>Navigate <ExternalLink size={14} /></>) : "No Map Data"}
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <ShieldCheck size={12} className="text-green-400" />
        <span className="text-[9px] font-bold text-white/30 uppercase tracking-tighter">
          Verified Clinical Facility
        </span>
      </div>
    </div>
  );
};

export default HospitalCard;
