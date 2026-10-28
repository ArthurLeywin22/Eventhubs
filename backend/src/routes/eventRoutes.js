import { Router } from 'express';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/eventController.js';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';

const router = Router();

// Public / Guest accessible routes
router.get('/', getEvents);
router.get('/:id', optionalAuth, getEventById);

// Admin-protected routes
router.post('/', requireAuth, requireAdmin, createEvent);
router.put('/:id', requireAuth, requireAdmin, updateEvent);
router.delete('/:id', requireAuth, requireAdmin, deleteEvent);

export default router;
