import { Router } from 'express';
import {
  getAdminDashboardStats,
  getEventRegistrations,
} from '../controllers/registrationController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';

const router = Router();

// All routes here strictly require admin role
router.use(requireAuth, requireAdmin);

router.get('/dashboard', getAdminDashboardStats);
router.get('/events/:id/registrations', getEventRegistrations);

export default router;
