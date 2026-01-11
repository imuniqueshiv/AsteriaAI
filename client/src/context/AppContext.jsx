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

  // ✅ Function to get authentication state
  const getAuthState = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/auth/is-auth`, {
        withCredentials: true,
      });

      if (data.success) {
        setIsLoggedin(true);
        getUserData();
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

  // ✅ Function to fetch user data
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

  // ✅ Run only once when the app mounts
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
    setIsLoggingOut, // expose for logout handling
  };

  return (
    <AppContent.Provider value={value}>
      {props.children}
    </AppContent.Provider>
  );
};
