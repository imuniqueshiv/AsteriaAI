import express from "express";
import userAuth from "../middleware/userAuth.js";
import { analyzeXray } from "../controllers/xrayController.js"; 
import { saveScreening } from "../controllers/screeningController.js";
import { symptomCheck } from "../controllers/symptomController.js";
import upload from "../middleware/multer.js"; 

const router = express.Router();

/**
 * AI X-ray Analysis (Stage 2 Standalone)
 * URL: http://localhost:4000/api/screen/analyze
 */
router.post("/analyze", userAuth, upload.single("xray"), analyzeXray);

/**
 * Full Screening & Triage (Chat + Fusion + Optional X-Ray)
 * URL: http://localhost:4000/api/screen/save-screening
 * This handles the new "Run Triage Assessment" button.
 */
router.post("/save-screening", userAuth, saveScreening);

/**
 * Legacy Symptom Check (Optional/Backup)
 */
router.post("/symptom-check", userAuth, symptomCheck);

export default router;