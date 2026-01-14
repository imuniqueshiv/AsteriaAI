import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HospitalCard from "../components/HospitalCard";
import { getDistanceKm } from "../utils/distance";

// NEW — Offline DB utilities
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

  // -------------------------------------------------------
  // 🔵 LOAD HOSPITAL DATA (ONLINE → OFFLINE)
  // -------------------------------------------------------
  const loadHospitals = async () => {
    try {
      let data = [];

      if (navigator.onLine) {
        // Try loading from JSON (online)
        const res = await fetch("/data/hospitals.json");
        data = await res.json();

        // Save this list offline for future use
        await saveOfflineHospitals(data);
      } else {
        // Fallback to IndexedDB offline storage
        data = await getOfflineHospitals();
      }

      setHospitals(data);
      setFilteredHospitals(data);

    } catch (err) {
      console.error("Failed to load hospitals:", err);

      // If JSON fails, load offline DB
      const offlineData = await getOfflineHospitals();
      setHospitals(offlineData);
      setFilteredHospitals(offlineData);
    }
  };

  // -------------------------------------------------------
  // 📍 GET USER LOCATION
  // -------------------------------------------------------
  const detectLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => console.log("Location denied:", err)
    );
  };

  // -------------------------------------------------------
  // 📌 SORT BY DISTANCE
  // -------------------------------------------------------
  const sortByDistance = (data) => {
    if (!userLocation) return data;

    return data
      .map((h) => ({
        ...h,
        distance: getDistanceKm(
          userLocation.lat,
          userLocation.lng,
          h.lat,
          h.lng
        ),
      }))
      .sort((a, b) => a.distance - b.distance);
  };

  // -------------------------------------------------------
  // 🎛 FILTER HOSPITALS
  // -------------------------------------------------------
  const handleFilter = (type) => {
    setFilterType(type);

    let base = hospitals;

    if (type !== "all") {
      base = hospitals.filter((h) => h.type === type);
    }

    setFilteredHospitals(sortByDistance(base));
  };

  // -------------------------------------------------------
  // 🔄 WATCH ONLINE/OFFLINE STATE
  // -------------------------------------------------------
  useEffect(() => {
    const updateStatus = () => setIsOnline(navigator.onLine);

    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  // -------------------------------------------------------
  // 🚀 FIRST LOAD
  // -------------------------------------------------------
  useEffect(() => {
    const init = async () => {
      await loadHospitals();
      detectLocation();
      setLoading(false);
    };
    init();
  }, []);

  // -------------------------------------------------------
  // 📌 RE-SORT WHEN LOCATION UPDATES
  // -------------------------------------------------------
  useEffect(() => {
    if (hospitals.length > 0) {
      setFilteredHospitals(sortByDistance(hospitals));
    }
  }, [userLocation]);

  // -------------------------------------------------------
  // RENDER UI
  // -------------------------------------------------------
  return (
    <div
      className="flex flex-col min-h-screen w-full text-white"
      style={{ background: "linear-gradient(180deg, #0d0333, #4a0a91)" }}
    >
      <Navbar />

      {/* HEADER */}
      <div className="w-full text-center mt-32 px-6">
        <h1 className="text-3xl md:text-4xl font-bold">Nearby Hospitals & Clinics</h1>

        <p className="text-white/70 mt-3 text-lg max-w-2xl mx-auto">
          Offline-ready list of PHC, CHC, District Hospitals, and TB centers near you.
        </p>

        <div className="w-24 h-1 bg-blue-400/50 mx-auto mt-5 rounded-full"></div>

        {!isOnline && (
          <p className="text-yellow-300 text-sm mt-3">
            ⚠ You are offline. Showing saved hospitals.
          </p>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 px-6 py-10 max-w-6xl mx-auto w-full">

        {/* FILTER BUTTONS */}
        <div className="flex flex-wrap gap-4 justify-center mb-10">
          {["all", "PHC", "CHC", "District Hospital", "TB Center"].map((type) => (
            <button
              key={type}
              onClick={() => handleFilter(type)}
              className={`px-5 py-2 rounded-full text-sm font-semibold border ${
                filterType === type
                  ? "bg-white text-black shadow-lg"
                  : "border-white/40 text-white hover:bg-white/10"
              } transition-all`}
            >
              {type === "all" ? "All" : type}
            </button>
          ))}
        </div>

        {/* LOADING */}
        {loading && (
          <p className="text-center text-white/60 text-lg">Loading hospitals...</p>
        )}

        {/* HOSPITAL LIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredHospitals.map((h) => (
            <HospitalCard key={h.id} data={h} userLocation={userLocation} />
          ))}
        </div>

        {/* NO RESULTS */}
        {!loading && filteredHospitals.length === 0 && (
          <p className="text-center text-red-300 mt-6">
            No hospitals found for this filter.
          </p>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default HospitalFinder;
