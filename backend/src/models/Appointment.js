import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: String,
      unique: true,
      required: true,
      default: () => 'APT-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900),
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor reference is required'],
      index: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient reference is required'],
      index: true,
    },
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    patientEmail: {
      type: String,
      required: [true, 'Patient email is required'],
      trim: true,
    },
    patientPhone: {
      type: String,
      required: [true, 'Patient phone is required'],
      trim: true,
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: [true, 'Appointment date is required'],
      index: true,
    },
    timeSlot: {
      type: String, // e.g., "09:00 - 09:30"
      required: [true, 'Time slot is required'],
    },
    slotStart: {
      type: String, // e.g., "09:00"
      required: true,
    },
    slotEnd: {
      type: String, // e.g., "09:30"
      required: true,
    },
    status: {
      type: String,
      enum: ['confirmed', 'completed', 'cancelled'],
      default: 'confirmed',
      index: true,
    },
    consultationFee: {
      type: Number,
      required: [true, 'Consultation fee is required'],
    },
    reason: {
      type: String,
      trim: true,
      default: 'General Consultation',
    },
    notes: {
      type: String,
      default: '',
    },
    cancelledAt: {
      type: Date,
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    cancellationReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// CRITICAL CONCURRENCY PROTECTION:
// Compound unique index ensuring that a doctor cannot be booked twice for the same date & time slot
// while the appointment is active ('confirmed' or 'pending').
// When an appointment is 'cancelled', the partial filter expression ignores it, making the slot available again!
appointmentSchema.index(
  { doctor: 1, date: 1, timeSlot: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['confirmed', 'pending'] } },
    name: 'unique_doctor_date_active_slot',
  }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
