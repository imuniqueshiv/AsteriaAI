import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import EmailVerify from './pages/EmailVerify';
import ResetPassword from './pages/ResetPassword';
import Screening from "./pages/Screening";


import { ToastContainer} from 'react-toastify';

const App = () => {
  return (
    <div>
      <ToastContainer/>

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/email-verify' element={<EmailVerify />} />
        <Route path='/reset-password' element={<ResetPassword />} />
        <Route path="/screening" element={<Screening />} />

      </Routes>
    </div>
  );
}

export default App;