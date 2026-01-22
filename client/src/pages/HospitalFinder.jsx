import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HospitalCard from "../components/HospitalCard";
import { getDistanceKm } from "../utils/distance";
import { MapPin, SignalLow, SignalHigh, Navigation } from "lucide-react";

// Offline DB utilities for Stage 3 persistence
import {
  saveOfflineHospitals,
  getOfflineHospitals,
} from "../utils/offlineDB";

const HospitalFinder = () => {
  const [hospitals, setHospitals] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // 🔵 LOAD HOSPITAL DATA (OFFLINE-FIRST LOGIC)
  const loadHospitals = async () => {
    try {
      let data = [];
      if (navigator.onLine) {
        // Fetch centralized clinical directory
        const res = await fetch("/data/hospitals.json");
        data = await res.json();
        // Sync to local IndexedDB for Stage 3 offline availability
        await saveOfflineHospitals(data);
      } else {
        // Fallback to local clinical directory
        data = await getOfflineHospitals();
      }
      setHospitals(data);
      setFilteredHospitals(data);
    } catch (err) {
      console.error("Clinical Directory Load Failed:", err);
      const offlineData = await getOfflineHospitals();
      setHospitals(offlineData);
      setFilteredHospitals(offlineData);
    }
  };

  // 📍 GEOLOCATION FOR TRIAGE PROXIMITY
  const detectLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => console.warn("Location access denied for triage sorting.")
    );
  };

  const sortByDistance = (data) => {
    if (!userLocation) return data;
    return data
      .map((h) => ({
        ...h,
        distance: getDistanceKm(userLocation.lat, userLocation.lng, h.lat, h.lng),
      }))
      .sort((a, b) => a.distance - b.distance);
  };

  const handleFilter = (type) => {
    setFilterType(type);
    let base = hospitals;
    if (type !== "all") {
      base = hospitals.filter((h) => h.type === type);
    }
    setFilteredHospitals(sortByDistance(base));
  };

  useEffect(() => {
    const updateStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  useEffect(() => {
    const init = async () => {
      await loadHospitals();
      detectLocation();
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (hospitals.length > 0) {
      setFilteredHospitals(sortByDistance(hospitals));
    }
  }, [userLocation]);

  return (
    <div className="flex flex-col min-h-screen w-full text-white" style={{ background: "linear-gradient(180deg, #0d0333, #4a0a91)" }}>
      <Navbar />

      <div className="w-full text-center mt-32 px-6">
        <div className="flex justify-center mb-4">
           <div className="bg-blue-500/10 p-3 rounded-2xl border border-blue-400/20">
              <Navigation className="text-blue-400 w-8 h-8 animate-pulse" />
           </div>
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight">Clinical Referral Directory</h1>
        <p className="text-white/60 mt-4 text-lg max-w-2xl mx-auto leading-relaxed">
          Stage 3: Referral Intelligence. Access an offline-ready network of PHCs, CHCs, and specialized TB centers based on your triage risk level.
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-500 mx-auto mt-6 rounded-full" />

        <div className="mt-6 flex justify-center">
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${
            isOnline ? "bg-green-500/10 border-green-500/50 text-green-400" : "bg-orange-500/10 border-orange-500/50 text-orange-400"
          }`}>
            {isOnline ? <SignalHigh size={14} /> : <SignalLow size={14} />}
            {isOnline ? "Cloud Sync Active" : "Offline Referral Mode"}
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-10 max-w-6xl mx-auto w-full">
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {["all", "PHC", "CHC", "District Hospital", "TB Center"].map((type) => (
            <button
              key={type}
              onClick={() => handleFilter(type)}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all ${
                filterType === type
                  ? "bg-blue-600 border-blue-400 text-white shadow-lg scale-105"
                  : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
              }`}
            >
              {type === "all" ? "Full Network" : type}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
             <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
             <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em]">Locating Nearest Facilities...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {filteredHospitals.map((h) => (
              <HospitalCard key={h.id || h._id} data={h} userLocation={userLocation} />
            ))}
          </div>
        )}

        {!loading && filteredHospitals.length === 0 && (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center">
             <MapPin className="w-12 h-12 text-white/20 mx-auto mb-4" />
             <p className="text-white/60 font-medium">No medical facilities found in your local directory for this category.</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default HospitalFinder;