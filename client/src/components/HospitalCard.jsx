import React from "react";
import { MapPin, Navigation, Building2, WifiOff, Stethoscope } from "lucide-react";
import { getDistanceKm } from "../utils/distance";

const HospitalCard = ({ data, userLocation }) => {
  const { name, type, address, lat, lng, services = [] } = data;

  // Distance calculation
  const distance =
    userLocation && lat && lng
      ? getDistanceKm(userLocation.lat, userLocation.lng, lat, lng).toFixed(1)
      : null;

  // Type badge colors
  const typeColor = {
    PHC: "bg-green-900/40 text-green-300 border-green-700",
    CHC: "bg-yellow-900/40 text-yellow-300 border-yellow-700",
    "District Hospital": "bg-red-900/40 text-red-300 border-red-700",
    "TB Center": "bg-purple-900/40 text-purple-300 border-purple-700",
  }[type] || "bg-white/20 text-white border-white/30";

  // Online/offline state
  const isOnline = navigator.onLine;

  return (
    <div className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-lg transition-all hover:bg-white/20 hover:shadow-2xl">

      {/* HEADER ROW */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Building2 className="w-6 h-6 text-blue-300" />
          {name}
        </h3>

        {/* Type badge */}
        <span className={`px-3 py-1 text-sm rounded-full border ${typeColor}`}>
          {type}
        </span>
      </div>

      {/* Distance */}
      {distance && (
        <p className="text-white/70 text-sm flex items-center gap-2 mb-3">
          <Navigation className="w-4 h-4 text-blue-400" />
          {distance} km away
        </p>
      )}

      {/* Address */}
      <p className="text-white/60 text-sm flex items-start gap-2 mb-4 leading-relaxed">
        <MapPin className="w-4 h-4 text-red-400 flex-shrink-0" />
        {address}
      </p>

      {/* Services */}
      <div className="mb-4">
        <p className="text-white/60 text-xs mb-2">Available Services:</p>

        <div className="flex flex-wrap gap-2">
          {services.length > 0 ? (
            services.map((srv, idx) => (
              <span
                key={idx}
                className="px-3 py-1 text-xs rounded-full bg-black/20 border border-white/10 text-white"
              >
                {srv}
              </span>
            ))
          ) : (
            <span className="text-white/40 text-xs">No data available</span>
          )}
        </div>
      </div>

      {/* Offline badge */}
      {!isOnline && (
        <div className="flex items-center gap-2 mb-4 text-yellow-300 bg-yellow-900/20 border border-yellow-700 rounded-lg p-2 text-xs">
          <WifiOff className="w-4 h-4" />
          Offline Mode — Map & Directions Limited
        </div>
      )}

      {/* Action Button */}
      <button
        className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl font-medium transition-all 
          ${
            isOnline
              ? "bg-purple-600 hover:bg-purple-500 text-white"
              : "bg-gray-700 cursor-not-allowed text-gray-400"
          }`}
        onClick={() => {
          if (!isOnline) return; // block when offline
          window.open(
            `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
            "_blank"
          );
        }}
        disabled={!isOnline}
      >
        {isOnline ? (
          <>
            Get Directions
            <Navigation className="w-4 h-4" />
          </>
        ) : (
          <>
            Offline: Directions Unavailable
            <WifiOff className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
};

export default HospitalCard;
