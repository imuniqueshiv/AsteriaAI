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

  // NEW: Role Mode
  const [userMode, setUserMode] = useState(
    localStorage.getItem("userMode") || null
  );

  const updateUserMode = (mode) => {
    setUserMode(mode);
    localStorage.setItem("userMode", mode);
  };

  // NEW: User History
  const [userHistory, setUserHistory] = useState([]);

  // Fetch Screening History
  const fetchUserHistory = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/report/history`);
      if (data.success) {
        setUserHistory(data.reports);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch user history");
    }
  };

  // AUTH CHECK
  const getAuthState = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/auth/is-auth`);

      if (data.success) {
        setIsLoggedin(true);
        getUserData();
        fetchUserHistory(); // NEW: load history when user logs in
      } else {
        setIsLoggedin(false);
      }
    } catch (error) {
      if (!isLoggingOut) {
        toast.error("Not Authorized. Please login again.");
      }
      setIsLoggedin(false);
    }
  };

  // GET USER DATA
  const getUserData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/data`);

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

    // NEW VALUES
    userMode,
    setUserMode: updateUserMode,

    // NEW HISTORY VALUES
    userHistory,
    fetchUserHistory,
  };

  return (
    <AppContent.Provider value={value}>
      {props.children}
    </AppContent.Provider>
  );
};
