import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken"; 

// Middleware & Controllers
import { analyzeXray } from "../controllers/xrayController.js"; 
import { saveScreening } from "../controllers/screeningController.js";
import { symptomCheck } from "../controllers/symptomController.js";

const router = express.Router();

// ============================================================
// 1. CONFIGURATION: Storage & Limits
// ============================================================

const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, "image_" + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB Limit
});

// ============================================================
// 2. THE DYNAMIC "SMART GUARD" (Fixed)
// ============================================================

const optionalAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies;

        // ✅ FIX: Save to 'req.userId' (Safe) instead of 'req.body.userId' (Unsafe)
        if (!token) {
            req.userId = null; 
            return next();
        }

        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
        
        if (tokenDecode.id) {
            req.userId = tokenDecode.id; 
        } else {
            req.userId = null;
        }
        next();

    } catch (error) {
        req.userId = null;
        next();
    }
};

// ============================================================
// 3. ROUTES
// ============================================================

/**
 * AI X-ray Analysis
 */
router.post("/analyze", optionalAuth, (req, res, next) => {
    console.log(`🔔 Doorman: X-Ray Request from ${req.userId ? "Doctor" : "Guest"}`);

    // Run Multer (File Upload)
    const uploadSingle = upload.single("xray");

    uploadSingle(req, res, (err) => {
      if (err) {
        console.error("❌ Upload Error (Multer):", err);
        return res.status(400).json({ success: false, message: err.message });
      }
      
      // ✅ FIX: Now that Multer is done, 'req.body' exists.
      // We move the ID into req.body so the Controller can find it.
      if (req.userId) {
          req.body.userId = req.userId;
      }

      console.log("✅ File Uploaded. Sending to AI...");
      next();
    });
  }, 
  analyzeXray
);

/**
 * Full Screening & Triage
 */
router.post("/save-screening", optionalAuth, saveScreening);

/**
 * Legacy Check
 */
router.post("/symptom-check", optionalAuth, symptomCheck);

export default router;