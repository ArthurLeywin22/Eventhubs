import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/profileController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Student / Authenticated profile routes
router.get('/profile', requireAuth, getProfile);
router.put('/profile', requireAuth, updateProfile);

export default router;
