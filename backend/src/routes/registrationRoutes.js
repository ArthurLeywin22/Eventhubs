import { Router } from 'express';
import {
  registerForEvent,
  cancelRegistration,
  getMyRegisteredEvents,
} from '../controllers/registrationController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Student authenticated routes
router.post('/events/:id/register', requireAuth, registerForEvent);
router.delete('/events/:id/register', requireAuth, cancelRegistration);
router.get('/my-events', requireAuth, getMyRegisteredEvents);

export default router;
