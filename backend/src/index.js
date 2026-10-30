import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow frontend dev server and any local client
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Hospital Appointment Booking System API',
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Error Handler]:', err.stack || err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

export default app;
