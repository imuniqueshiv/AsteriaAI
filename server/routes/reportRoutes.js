import express from "express";
import userAuth from "../middleware/userAuth.js";
import { 
  saveReport, 
  getHistory, 
  deleteReport,
  getReportById // Import the new controller function
} from "../controllers/reportController.js";

const router = express.Router();

/**
 * @route   POST /api/report/save-report
 * @access  Private
 */
router.post("/save-report", userAuth, saveReport);

/**
 * @route   GET /api/report/history
 * @access  Private
 */
router.get("/history", userAuth, getHistory);

/**
 * @route   GET /api/report/:id
 * @desc    Fetches a single report by its ID for the Detail View
 * @access  Private
 */
router.get("/:id", userAuth, getReportById);

/**
 * @route   DELETE /api/report/delete/:id
 * @access  Private
 */
router.delete("/delete/:id", userAuth, deleteReport);

export default router;