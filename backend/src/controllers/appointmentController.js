import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import { generateDoctorSlots } from '../utils/slotGenerator.js';

// @desc    Book a new doctor appointment with strict concurrency protection
// @route   POST /api/appointments/book
// @access  Private (Patient/Admin)
export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, timeSlot, reason, notes, patientName, patientPhone } = req.body;

    // 1. Basic validation
    if (!doctorId || !date || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID, appointment date, and time slot are required.',
      });
    }

    // 2. Prevent past dates
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    if (date < todayStr) {
      return res.status(400).json({
        success: false,
        message: 'Appointments cannot be booked for past dates.',
      });
    }

    // 3. Find Doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor || !doctor.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile is inactive or not found.',
      });
    }

    // 4. Validate slot availability via slot generator rules (days of week, break time, leave, holidays)
    const existingActiveAppointments = await Appointment.find({
      doctor: doctor._id,
      date,
      status: { $in: ['confirmed', 'pending'] },
    }).select('timeSlot');

    const availabilityCheck = generateDoctorSlots(doctor, date, existingActiveAppointments);
    if (!availabilityCheck.isAvailable && availabilityCheck.reason) {
      return res.status(400).json({
        success: false,
        message: availabilityCheck.reason,
      });
    }

    // Check if the requested slot is in the generated available slots
    const requestedSlotObj = availabilityCheck.availableSlots.find(
      (s) => s.timeSlot === timeSlot || s.slotStart === timeSlot
    );

    if (!requestedSlotObj) {
      return res.status(409).json({
        success: false,
        message: 'Sorry, this time slot has just been booked or is not available. Please select another available time.',
      });
    }

    // Parse start and end times
    const [slotStartRaw, slotEndRaw] = timeSlot.split('-').map((s) => s.trim());
    const slotStart = slotStartRaw || requestedSlotObj.slotStart;
    const slotEnd = slotEndRaw || requestedSlotObj.slotEnd;

    // 5. ATOMIC / CONCURRENT CREATION WITH DATABASE CONSTRAINT
    // If another concurrent request sneaks in, MongoDB's unique compound index throws duplicate key error (code 11000)
    const appointment = await Appointment.create({
      doctor: doctor._id,
      patient: req.user._id,
      patientName: patientName || req.user.name,
      patientEmail: req.user.email,
      patientPhone: patientPhone || req.user.phone,
      date,
      timeSlot,
      slotStart,
      slotEnd,
      status: 'confirmed',
      consultationFee: doctor.consultationFee,
      reason: reason || 'General Consultation',
      notes: notes || '',
    });

    // Populate doctor details for the response receipt
    await appointment.populate('doctor', 'name specialization qualifications profilePhoto hospitalRoom phone');

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully!',
      appointment,
    });
  } catch (error) {
    // CRITICAL: Handle MongoDB unique compound index violation (Code 11000)
    // This happens when two patients attempt to book the exact same slot concurrently
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Sorry, this time slot has just been booked. Please select another available time.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'An error occurred while booking the appointment.',
      error: error.message,
    });
  }
};

// @desc    Get current patient's appointments
// @route   GET /api/appointments/my-appointments
// @access  Private (Patient/Admin)
export const getMyAppointments = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { patient: req.user._id };

    if (status && status !== 'all') {
      filter.status = status;
    }

    const appointments = await Appointment.find(filter)
      .populate('doctor', 'name specialization qualifications profilePhoto consultationFee hospitalRoom')
      .sort({ date: -1, slotStart: -1 });

    // Auto-update past confirmed appointments to completed if the date/time has passed
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    for (let apt of appointments) {
      if (apt.status === 'confirmed') {
        const isPastDate = apt.date < todayStr;
        const isTodayPastSlot = apt.date === todayStr && apt.slotEnd && apt.slotEnd <= currentTimeStr;
        if (isPastDate || isTodayPastSlot) {
          apt.status = 'completed';
          await Appointment.updateOne({ _id: apt._id }, { $set: { status: 'completed' } });
        }
      }
    }

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve appointments.',
      error: error.message,
    });
  }
};

// @desc    Get single appointment details
// @route   GET /api/appointments/:id
// @access  Private (Patient or Admin)
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate(
      'doctor',
      'name specialization qualifications profilePhoto consultationFee hospitalRoom phone email'
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    // Ensure patients can only view their own appointments
    if (req.user.role !== 'admin' && appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to view this appointment.',
      });
    }

    res.status(200).json({
      success: true,
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve appointment.',
      error: error.message,
    });
  }
};

// @desc    Cancel an appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private (Patient who owns the appointment or Admin)
export const cancelAppointment = async (req, res) => {
  try {
    const { cancellationReason } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    // Check authorization: must be owner or admin
    if (req.user.role !== 'admin' && appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You cannot cancel another patient’s appointment.',
      });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This appointment is already cancelled.',
      });
    }

    // Update status to cancelled
    appointment.status = 'cancelled';
    appointment.cancelledAt = new Date();
    appointment.cancelledBy = req.user._id;
    appointment.cancellationReason = cancellationReason || 'Cancelled by user';

    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully. The time slot is now available again.',
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to cancel appointment.',
      error: error.message,
    });
  }
};

// @desc    Get all appointments (Admin only)
// @route   GET /api/appointments
// @access  Private (Admin)
export const getAllAppointments = async (req, res) => {
  try {
    const { doctorId, status, date, search } = req.query;
    const filter = {};

    if (doctorId) filter.doctor = doctorId;
    if (status && status !== 'all') filter.status = status;
    if (date) filter.date = date;

    if (search) {
      filter.$or = [
        { patientName: { $regex: search, $options: 'i' } },
        { patientEmail: { $regex: search, $options: 'i' } },
        { appointmentId: { $regex: search, $options: 'i' } },
      ];
    }

    const appointments = await Appointment.find(filter)
      .populate('doctor', 'name specialization qualifications profilePhoto consultationFee')
      .populate('patient', 'name email phone')
      .sort({ date: -1, slotStart: -1 });

    // Auto-update past confirmed appointments to completed if the date/time has passed
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    for (let apt of appointments) {
      if (apt.status === 'confirmed') {
        const isPastDate = apt.date < todayStr;
        const isTodayPastSlot = apt.date === todayStr && apt.slotEnd && apt.slotEnd <= currentTimeStr;
        if (isPastDate || isTodayPastSlot) {
          apt.status = 'completed';
          await Appointment.updateOne({ _id: apt._id }, { $set: { status: 'completed' } });
        }
      }
    }

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve appointments list.',
      error: error.message,
    });
  }
};

// @desc    Update appointment status or reschedule (Admin only)
// @route   PUT /api/appointments/:id/status
// @access  Private (Admin)
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, date, timeSlot } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    if (status) appointment.status = status;

    // If rescheduling to a new date/slot
    if (date && timeSlot && (date !== appointment.date || timeSlot !== appointment.timeSlot)) {
      const [slotStartRaw, slotEndRaw] = timeSlot.split('-').map((s) => s.trim());
      appointment.date = date;
      appointment.timeSlot = timeSlot;
      appointment.slotStart = slotStartRaw || timeSlot;
      appointment.slotEnd = slotEndRaw || timeSlot;
    }

    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully.',
      appointment,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Target time slot is already booked for this doctor.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update appointment.',
      error: error.message,
    });
  }
};
