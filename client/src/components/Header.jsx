import React, { useContext } from 'react';
import { assets } from '../assets/assets';
import { AppContent } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const { userData, isLoggedin } = useContext(AppContent);
    const navigate = useNavigate();

    const handleStartScreening = () => {
        if (!isLoggedin) {
            navigate('/login');     // Not logged in → Go to Login
        } else {
            navigate('/screening'); // Logged in → Go to Screening
        }
    };

    return (
        <div
            className='flex flex-col items-center justify-center w-full min-h-screen px-4 text-center text-white'
            style={{
                backgroundImage:
                    "linear-gradient(180deg, rgba(13,3,51,0.85), rgba(74,10,145,0.85)), url('/bg_img.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                paddingTop: "120px",
                paddingBottom: "120px"
            }}
        >
            {/* ---- Hero Badge ---- */}
            <div className="w-full max-w-5xl mb-14 flex flex-col items-center gap-4 text-center">
                <img
                    src={assets.lifeline}
                    alt="lifeline"
                    className="w-12 h-12 mb-2 opacity-90 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                />

                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-blue-400">
                        Offline-first. AI-powered Diagnostics.
                    </span>
                    <br className="md:hidden" />
                    <span className="block text-xl md:text-3xl mt-2 font-medium text-white/80">
                        Transforming Rural Healthcare Delivery
                    </span>
                </h2>
            </div>

            {/* Dynamic Greeting */}
            <h1 className='text-xl sm:text-3xl font-medium mb-2'>
                Hey{userData ? ` ${userData.name}` : ''}!
            </h1>

            {/* Title */}
            <h2 className='text-3xl sm:text-5xl font-semibold mb-4'>
                Chest X-ray Screening for Rural Communities
            </h2>

            {/* Subtitle */}
            <p className='mb-8 max-w-md text-lg opacity-90 leading-relaxed'>
                Accurate, offline assessment for TB and pneumonia — built for ASHA workers and low-resource clinics.
            </p>

            {/* Start Screening Button */}
            <button
                onClick={handleStartScreening}
                className='border border-white rounded-full px-8 py-2.5 hover:bg-white hover:text-black transition-all text-lg'
            >
                Start Screening
            </button>
        </div>
    );
};

export default Header;
