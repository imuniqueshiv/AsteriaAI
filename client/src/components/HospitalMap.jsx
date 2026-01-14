import React, { useEffect } from "react";
import L from "leaflet";

const HospitalMap = ({ userLocation, hospitals }) => {
  useEffect(() => {
    // Initialize map only once
    const map = L.map("hospitalMap", {
      center: [23.2599, 77.4126], // default (Bhopal)
      zoom: 10,
      zoomControl: false,
    });

    // Try loading online tiles first
    const onlineTiles = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      { maxZoom: 19 }
    );

    // Offline fallback tile source (pre-cached or local)
    const offlineTiles = L.tileLayer("/offline_tiles/{z}/{x}/{y}.png", {
      maxZoom: 19,
      errorTileUrl: "/offline_tiles/offline.png",
    });

    // Load online tiles but fallback if blocked/offline
    onlineTiles.addTo(map).on("tileerror", () => {
      console.warn("Online tiles failed — switching to offline map.");
      map.removeLayer(onlineTiles);
      offlineTiles.addTo(map);
    });

    // If user location available, show marker
    if (userLocation) {
      L.marker([userLocation.lat, userLocation.lng], {
        icon: L.divIcon({
          className: "user-marker",
          html: `<div style="
            width:18px;height:18px;
            background:#00d4ff;
            border:3px solid white;
            border-radius:50%;
            box-shadow:0 0 10px #00d4ff;
          "></div>`,
        }),
      })
        .addTo(map)
        .bindPopup("You are here")
        .openPopup();

      // Center on user
      map.setView([userLocation.lat, userLocation.lng], 12);
    }

    // Add hospital markers
    hospitals.forEach((h) => {
      L.marker([h.lat, h.lng], {
        icon: L.divIcon({
          className: "hospital-marker",
          html: `<div style="
            width:18px;height:18px;
            background:#ff4d6d;
            border:3px solid white;
            border-radius:50%;
            box-shadow:0 0 10px #ff4d6d;
          "></div>`,
        }),
      })
        .addTo(map)
        .bindPopup(`<b>${h.name}</b><br>${h.type}<br>${h.address}`);
    });

    return () => {
      map.remove();
    };
  }, [userLocation, hospitals]);

  return (
    <div className="w-full h-[350px] md:h-[450px] rounded-2xl overflow-hidden border border-white/20 shadow-xl mt-8">
      <div id="hospitalMap" className="w-full h-full"></div>
    </div>
  );
};

export default HospitalMap;
