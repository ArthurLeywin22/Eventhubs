import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import eventRoutes from './routes/eventRoutes.js';
import registrationRoutes from './routes/registrationRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allows requests from React/Vite development server
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    message: 'EventHub backend is running',
    timestamp: new Date().toISOString(),
    status: 'healthy',
  });
});

// Mount modular API routes
app.use('/api/events', eventRoutes);
app.use('/api', registrationRoutes);
app.use('/api', profileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);

// Fallback 404 & Centralized Error Handler
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 EventHub Backend Server is active!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
  console.log(`===============================================`);
});

export default app;
