import axios from "axios";
import React, { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const AppContent = createContext();

export const AppContextProvider = (props) => {

  axios.defaults.withCredentials = true;

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

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
