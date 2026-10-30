import express from 'express';
import {
  getAllDoctors,
  getDoctorById,
  getDoctorAvailability,
  getSpecializations,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  addDoctorLeave,
  removeDoctorLeave,
} from '../controllers/doctorController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllDoctors);
router.get('/meta/specializations', getSpecializations);
router.get('/:id', getDoctorById);
router.get('/:id/availability', getDoctorAvailability);

// Admin-protected routes
router.post('/', protect, adminOnly, createDoctor);
router.put('/:id', protect, adminOnly, updateDoctor);
router.delete('/:id', protect, adminOnly, deleteDoctor);
router.post('/:id/leave', protect, adminOnly, addDoctorLeave);
router.delete('/:id/leave', protect, adminOnly, removeDoctorLeave);

export default router;
