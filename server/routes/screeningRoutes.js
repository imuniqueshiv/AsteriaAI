import express from "express";
import userAuth from "../middleware/userAuth.js";
import { analyzeXray } from "../controllers/xrayController.js"; // Import this!
import { saveScreening } from "../controllers/screeningController.js";
import { symptomCheck } from "../controllers/symptomController.js";
import upload from "../middleware/multer.js"; // Ensure this path is correct for your multer config

const router = express.Router();

/**
 * AI X-ray Analysis (The route your frontend is looking for)
 * URL: http://localhost:4000/api/screen/analyze
 */
router.post("/analyze", userAuth, upload.single("xray"), analyzeXray);

/**
 * Full screening (CNN + Symptoms + Fusion)
 */
router.post("/save", userAuth, saveScreening);

/**
 * Symptom-only screening
 */
router.post("/symptom-check", userAuth, symptomCheck);

export default router;