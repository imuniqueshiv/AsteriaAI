import axios from "axios";
import React, { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const AppContent = createContext();

export const AppContextProvider = (props) => {

  axios.defaults.withCredentials = true;

  // ✅ UPDATED: Changed localhost to your specific IP address
  // This allows your phone to talk to the laptop.
  // const backendUrl = "http://10.83.76.145:4000";
  // ✅ NEW (Localhost - Works on any WiFi for the laptop)
  // const backendUrl = "http://localhost:4000";
  // const backendUrl = "http://10.164.5.145:4000";
  const backendUrl = "http://172.21.154.145:4000";
  // ✅ NEW (Hotspot IP)
  // const backendUrl = "http://172.20.10.2:4000";

  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Mode
  const [userMode, setUserMode] = useState(
    localStorage.getItem("userMode") || null
  );

  const updateUserMode = (mode) => {
    setUserMode(mode);
    localStorage.setItem("userMode", mode);
  };

  // History
  const [userHistory, setUserHistory] = useState([]);

  // Fetch user history
  const fetchUserHistory = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/report/history`, {
        withCredentials: true,
      });

      if (data.success) {
        setUserHistory(data.reports);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch history");
    }
  };

  // AUTH CHECK
  const getAuthState = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/auth/is-auth`, {
        withCredentials: true,
      });

      if (data.success) {
        setIsLoggedin(true);
        getUserData();
        fetchUserHistory(); 
      } else {
        setIsLoggedin(false);
      }
    } catch (error) {
      if (!isLoggingOut) {
        console.log("Auth state failed:", error);
      }
      setIsLoggedin(false);
    }
  };

  // USER DATA
  const getUserData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/data`, {
        withCredentials: true,
      });

      if (data.success) {
        setUserData(data.userData);
      } else {
        toast.error(data.message || "Failed to fetch user data");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    getAuthState();
  }, []);

  const value = {
    backendUrl,
    isLoggedin,
    setIsLoggedin,
    userData,
    setUserData,
    getUserData,
    setIsLoggingOut,

    userMode,
    setUserMode: updateUserMode,

    userHistory,
    // fetchUserHistory,
  };

  return (
    <AppContent.Provider value={value}>
      {props.children}
    </AppContent.Provider>
  );
};