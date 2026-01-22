import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import EmailVerify from './pages/EmailVerify';
import ResetPassword from './pages/ResetPassword';
import Screening from "./pages/Screening";
import RoleSelection from "./pages/RoleSelection";  // ✅ NEW PAGE
import Dashboard from './pages/Dashboard';
import ReportDetails from './pages/ReportDetails';
import HospitalFinder from './pages/HospitalFinder';
import Profile from './pages/Profile';
import { ToastContainer } from 'react-toastify';


const App = () => {
  return (
    <div>
      <ToastContainer />

      <Routes>

        {/* HOME */}
        <Route path='/' element={<Home />} />

        {/* LOGIN + AUTH */}
        <Route path='/login' element={<Login />} />
        <Route path='/email-verify' element={<EmailVerify />} />
        <Route path='/reset-password' element={<ResetPassword />} />

        {/* NEW ROLE SELECTION PAGE */}
        <Route path='/select-role' element={<RoleSelection />} />

        {/* SCREENING PAGE */}
        <Route path='/screening' element={<Screening />} />

        {/* Dashboard Page */}
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/report-details/:id' element={<ReportDetails />} />
        {/* Report Details Page */}
        <Route path='/report-details' element={<ReportDetails />} />

        {/* HospitalFinder Page */}
        <Route path='/hospital-finder' element={<HospitalFinder />} />
        
        {/* Profile Page */}
        <Route path='/profile' element={<Profile />} />
      </Routes>
    </div>
  );
}

export default App;
