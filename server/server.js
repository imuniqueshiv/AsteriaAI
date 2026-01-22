import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

// Database & Services
import connectDB from "./config/mongodb.js";
import { startSyncService } from "./sync/syncService.js";

// Route Imports
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import screeningRoutes from "./routes/screeningRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

// ESM __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 4000;

// 1. Connect to MongoDB
connectDB();

// 2. Start Offline Sync Service (Hackathon Feature)
startSyncService(5); 

// 3. Middlewares
// IMPORTANT: Limit increased to 10mb to allow for Dual-View Base64 image transfers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// 4. CORS Configuration
app.use(
  cors({
    origin: "http://localhost:5173", // Your React/Vite port
    credentials: true,
  })
);

// 5. Static Folder for Uploads (Optional but good for debugging)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 6. API Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/screen", screeningRoutes); // This is where analyzeXray should live
app.use("/api/report", reportRoutes);

// 7. Root Test Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Asteria AI Backend is Live",
    environment: process.env.NODE_ENV || "development"
  });
});

// 8. Global Error Handler (Prevents the 500 error from crashing the whole server)
app.use((err, req, res, next) => {
  console.error("Global Server Error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong on the server!",
    error: err.message
  });
});

// 9. Start Server
app.listen(port, () => {
  console.log(`
  🚀 Asteria AI Main Server Running
  ---------------------------------
  Port: ${port}
  ML Directory: ${path.join(__dirname, "ml")}
  ---------------------------------
  `);
});