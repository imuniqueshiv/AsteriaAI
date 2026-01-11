import React from 'react'
import Navbar from '../components/Navbar'
import Header from '../components/Header'
import Footer from '../components/Footer'

const Home = () => {
  return (
    <div
      className="flex flex-col min-h-screen w-full"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(13,3,51,0.85), rgba(74,10,145,0.85)), url('/bg_img.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      <Navbar />
      <Header />
      <Footer />
    </div>
  )
}

export default Home
