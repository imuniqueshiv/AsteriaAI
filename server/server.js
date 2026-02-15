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
import triageRouter from './routes/triageRoutes.js';

// ESM __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 4000;

// 1. Connect to MongoDB
connectDB();

// 2. Start Offline Sync Service (Hackathon Feature)
startSyncService(5); 

// ✅ TRAFFIC CAM: See exactly who is connecting
app.use((req, res, next) => {
  console.log(`📡 Incoming Request: ${req.method} ${req.url} from ${req.ip}`);
  next();
});

// 3. Middlewares
// ✅ UPDATED: Increased to 50mb to allow High-Res Phone Camera uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// 4. CORS Configuration
app.use(
  cors({
    origin: true, // Allow connections from Phone IP
    credentials: true,
  })
);

// 5. Static Folder for Uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 6. API Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/screen", screeningRoutes); 
app.use("/api/report", reportRoutes);
app.use('/api/triage', triageRouter);

// 7. Root Test Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Asteria AI Backend is Live",
    environment: process.env.NODE_ENV || "development"
  });
});

// 8. Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Server Error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong on the server!",
    error: err.message
  });
});

// 9. Start Server
app.listen(port, "0.0.0.0", () => {
  console.log(`
  🚀 Asteria AI Main Server Running
  ---------------------------------
  Port: ${port} (Network Access Enabled)
  ML Directory: ${path.join(__dirname, "ml")}
  ---------------------------------
  `);
});