import express from "express";
import { saveReport, getHistory } from "../controllers/reportController.js";
import { protect } from "../middleware/userAuth.js";

const router = express.Router();

router.post("/save-report", protect, saveReport);
router.get("/history", protect, getHistory);

export default router;
