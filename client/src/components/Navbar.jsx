import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";
import { User, LayoutDashboard, LogOut, RefreshCcw, ShieldCheck } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();

  const {
    userData,
    backendUrl,
    setUserData,
    setIsLoggedin,
    setIsLoggingOut,
    userMode,
    setUserMode
  } = useContext(AppContent);

  const sendVerificationOtp = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + "/api/auth/send-verify-otp");

      if (data.success) {
        navigate("/email-verify");
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const logout = async () => {
    try {
      setIsLoggingOut(true);
      setIsLoggedin(false);
      setUserData(null);
      setUserMode(null);
      localStorage.removeItem("asteria_mode");

      const { data } = await axios.post(
        `${backendUrl}/api/auth/logout`,
        {},
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("Logged out successfully!");
        navigate("/");
      } else {
        toast.error("Logout failed, please try again.");
      }
    } catch (error) {
      toast.error("Logout failed. Try again!");
      console.error(error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 absolute top-0 z-[100]">
      {/* Logo */}
      <button onClick={() => navigate("/")} className="hover:opacity-80 transition-opacity">
        <img src={assets.logo} alt="Asteria Logo" className="w-28 sm:w-32" />
      </button>

      {userData ? (
        <div className="flex items-center gap-6">
          {/* Mode Badge */}
          <div className="hidden sm:flex items-center gap-2">
            {userMode ? (
              <div className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 backdrop-blur-md border border-white/20 text-blue-300 shadow-xl">
                {userMode === "staff" ? "ASHA Health Staff" : "Patient Mode"}
              </div>
            ) : (
              <button
                onClick={() => navigate("/select-role")}
                className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white shadow-lg transition-all"
              >
                Select Role
              </button>
            )}
          </div>

          {/* Profile Dropdown Container */}
          <div className="relative group">
            <div className="w-10 h-10 flex justify-center items-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-700 text-white font-bold border border-white/20 shadow-lg cursor-pointer transform group-hover:scale-105 transition-all">
              {userData.name[0].toUpperCase()}
            </div>

            {/* Glassmorphic Dropdown Menu */}
            <div className="absolute right-0 top-full pt-4 hidden group-hover:block animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="w-64 bg-[#1b1f3b]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-2">
                
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-white/5 mb-2">
                  <p className="text-xs text-white/40 uppercase tracking-tighter">Connected Account</p>
                  <p className="text-sm font-bold truncate text-white">{userData.name}</p>
                </div>

                <ul className="space-y-1">
                  {/* Dashboard */}
                  <li onClick={() => navigate("/dashboard")} className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white rounded-xl cursor-pointer transition-all">
                    <LayoutDashboard size={16} className="text-blue-400" />
                    Patient Dashboard
                  </li>

                  {/* Profile */}
                  <li onClick={() => navigate("/profile")} className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white rounded-xl cursor-pointer transition-all">
                    <User size={16} className="text-purple-400" />
                    My Profile
                  </li>

                  {/* Role Switch */}
                  <li onClick={() => navigate("/select-role")} className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white rounded-xl cursor-pointer transition-all">
                    <RefreshCcw size={16} className="text-green-400" />
                    Switch Mode
                  </li>

                  {/* Verify Account */}
                  {!userData.isAccountVerified && (
                    <li onClick={sendVerificationOtp} className="flex items-center gap-3 px-4 py-2.5 text-sm text-orange-400 hover:bg-orange-500/10 rounded-xl cursor-pointer transition-all font-medium">
                      <ShieldCheck size={16} />
                      Verify Security
                    </li>
                  )}

                  {/* Logout */}
                  <li onClick={logout} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-xl cursor-pointer transition-all font-medium mt-2 border-t border-white/5 pt-3">
                    <LogOut size={16} />
                    Logout
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 border border-white/20 bg-white/10 backdrop-blur-md text-white rounded-full px-8 py-2.5 hover:bg-white hover:text-black transition-all font-medium text-sm shadow-xl"
        >
          Get Started <img src={assets.arrow_icon} alt="" className="w-3" />
        </button>
      )}
    </div>
  );
};

export default Navbar;