import express from 'express';
import { chatWithTriageAI } from '../controllers/aiTriageController.js';

const triageRouter = express.Router();

// The Frontend calls "/api/triage/chat", so here we just define "/chat"
triageRouter.post('/chat', chatWithTriageAI);

export default triageRouter;