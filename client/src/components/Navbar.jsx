import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";

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
    <div className="w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 absolute top-0 z-50">
      <button onClick={() => navigate("/")}>
        <img src={assets.logo} alt="logo" className="w-28 sm:w-32" />
      </button>

      {userData ? (
        <div className="flex items-center gap-6">

          {/* Mode Label */}
          <div className="hidden sm:flex flex-col items-end mr-3">
            {userMode ? (
              <span className="px-4 py-1 rounded-full text-sm bg-white/20 text-white shadow">
                {userMode === "staff" ? "Health Staff" : "Patient"}
              </span>
            ) : (
              <button
                onClick={() => navigate("/select-role")}
                className="px-4 py-1 rounded-full text-sm bg-blue-500 hover:bg-blue-600 text-white shadow"
              >
                Select Role
              </button>
            )}
          </div>

          {/* Profile Icon */}
          <div className="w-8 h-8 flex justify-center items-center rounded-full bg-black text-white relative group cursor-pointer">
            {userData.name[0].toUpperCase()}

            {/* Dropdown */}
            <div className="absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-10">
              <ul className="m-0 p-2 bg-gray-100 text-sm rounded shadow">

                {/* Verify email */}
                {!userData.isAccountVerified && (
                  <li
                    onClick={sendVerificationOtp}
                    className="py-1 px-2 hover:bg-gray-200 cursor-pointer"
                  >
                    Verify Email
                  </li>
                )}
                {/* Profile link (NEW) */}
                <li
                  onClick={() => navigate("/profile")}
                  className="py-1 px-2 hover:bg-gray-200 cursor-pointer"
                >
                  Profile
                </li>
                {/* Dashboard link (NEW) */}
                <li
                  onClick={() => navigate("/dashboard")}
                  className="py-1 px-2 hover:bg-gray-200 cursor-pointer"
                >
                  Dashboard
                </li>

                {/* Change Role */}
                <li
                  onClick={() => navigate("/select-role")}
                  className="py-1 px-2 hover:bg-gray-200 cursor-pointer"
                >
                  Change Role
                </li>

                {/* Logout */}
                <li
                  onClick={logout}
                  className="py-1 px-2 hover:bg-gray-200 cursor-pointer pr-10"
                >
                  Logout
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 border border-gray-300 bg-white/10 text-white rounded-full px-6 py-2 hover:bg-white hover:text-black transition-all"
        >
          Login <img src={assets.arrow_icon} alt="" />
        </button>
      )}
    </div>
  );
};

export default Navbar;
