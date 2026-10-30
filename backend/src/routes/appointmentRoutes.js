import express from 'express';
import {
  bookAppointment,
  getMyAppointments,
  getAppointmentById,
  cancelAppointment,
  getAllAppointments,
  updateAppointmentStatus,
} from '../controllers/appointmentController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Patient / Authenticated routes
router.post('/book', protect, bookAppointment);
router.get('/my-appointments', protect, getMyAppointments);
router.get('/:id', protect, getAppointmentById);
router.put('/:id/cancel', protect, cancelAppointment);

// Admin-only appointment management
router.get('/', protect, adminOnly, getAllAppointments);
router.put('/:id/status', protect, adminOnly, updateAppointmentStatus);

export default router;
