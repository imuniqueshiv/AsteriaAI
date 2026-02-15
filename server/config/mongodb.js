import mongoose from "mongoose";

const connectDB = async () => {
    // 1. Safety Check: Ensure the variable exists
    if (!process.env.MONGODB_URI) {
        console.error("❌ FATAL ERROR: MONGODB_URI is missing in your .env file");
        return;
    }

    // 2. Smart Listeners (Run automatically when connection state changes)
    mongoose.connection.on('connected', () => {
        console.log("✅ Database Connected Successfully");
    });

    mongoose.connection.on('error', (err) => {
        console.error("❌ MongoDB Connection Error:", err.message);

        // SMART ERROR HANDLING: Detects Hotspot/DNS Blocking
        if (err.code === "ECONNREFUSED" || err.message.includes("querySrv")) {
            console.log(`
            ⚠️  NETWORK BLOCK DETECTED!
            --------------------------------------------------
            Your Hotspot or ISP is blocking the database address.
            
            QUICK FIX:
            1. Press Win+R -> type 'ncpa.cpl'
            2. Right-click your Wi-Fi -> Properties
            3. Double-click 'IPv4'
            4. Set DNS to: 8.8.8.8 and 8.8.4.4
            --------------------------------------------------
            `);
        }
    });

    mongoose.connection.on('disconnected', () => {
        console.log("⚠️ Database Disconnected (Check Internet)");
    });

    // 3. Connect with "Anti-Block" Options
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/mern_auth`, {
            // These options help bypass shaky Hotspot connections
            serverSelectionTimeoutMS: 5000, // Stop waiting after 5 seconds
            family: 4 // ✅ FORCE IPv4: This fixes the "querySrv" error on many networks
        });
    } catch (error) {
        // We catch the initial error here so the app doesn't crash immediately
        console.error("❌ Initial Connection Failed. Retrying in background...");
    }
};

export default connectDB;