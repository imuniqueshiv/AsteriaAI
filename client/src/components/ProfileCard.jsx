import React, { useContext } from "react";
import { AppContent } from "../context/AppContext";
import { LogOut, User, Edit3 } from "lucide-react";

const ProfileCard = ({ onEdit, onLogout }) => {
  const { userData, userMode } = useContext(AppContent);

  return (
    <div
      className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-xl 
      border border-white/20 rounded-2xl shadow-2xl p-8 text-white"
      style={{
        background:
          "linear-gradient(145deg, rgba(13,3,51,0.6), rgba(74,10,145,0.5))",
      }}
    >
      {/* Avatar */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-28 h-28 rounded-full bg-white/10 border border-white/30 
        flex items-center justify-center shadow-lg">
          <User className="w-14 h-14 text-white/80" />
        </div>

        {/* Name */}
        <h2 className="text-2xl font-bold mt-4">
          {userData?.name || "User Name"}
        </h2>

        {/* Email */}
        <p className="text-white/60 text-sm">{userData?.email}</p>

        {/* Role Badge */}
        <span
          className="mt-3 px-4 py-1 rounded-full text-sm font-semibold bg-purple-600/40 
          border border-purple-400/40 shadow"
        >
          {userMode === "staff" ? "Health Staff" : "Patient"}
        </span>
      </div>

      {/* Info Box */}
      <div className="bg-black/20 border border-white/10 rounded-xl p-4 mb-6">
        <p className="text-sm text-white/70 leading-relaxed">
          This profile is linked to your AsteriaAI account.  
          You can track your screening history, role-based actions, and personal settings here.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        {/* Edit Profile */}
        <button
          onClick={onEdit}
          className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 
          text-white font-semibold flex items-center justify-center gap-2 transition-all"
        >
          <Edit3 size={18} />
          Edit Profile
        </button>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 
          text-white font-semibold flex items-center justify-center gap-2 transition-all"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileCard;
