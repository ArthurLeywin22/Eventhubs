import { Router } from 'express';
import { handleAIAssistant, handleConfigureKey, handleGetStatus } from '../controllers/aiController.js';

const router = Router();

// Assistant chat endpoint
router.post('/assistant', handleAIAssistant);

// Live Gemini API Key configuration & status
router.post('/configure-key', handleConfigureKey);
router.get('/status', handleGetStatus);

export default router;
