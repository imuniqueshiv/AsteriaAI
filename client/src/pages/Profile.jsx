import React, { useContext } from "react";
import Navbar from "../components/Navbar";
import ProfileCard from "../components/ProfileCard";
import { AppContent } from "../context/AppContext";

const Profile = () => {
  const { setIsLoggedin, setUserData } = useContext(AppContent);

  const handleEdit = () => {
    console.log("Edit Profile clicked");
  };

  const handleLogout = () => {
    setIsLoggedin(false);
    setUserData(null);
  };

  return (
    <div className="min-h-screen text-white bg-gradient-to-b from-[#0d0333] to-[#4a0a91]">
      <Navbar />

      <div className="pt-32 px-6">
        <ProfileCard onEdit={handleEdit} onLogout={handleLogout} />
      </div>
    </div>
  );
};

export default Profile;
