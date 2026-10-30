import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import { generateDoctorSlots, getDayName } from '../utils/slotGenerator.js';

// @desc    Get all active doctors with optional search & filter
// @route   GET /api/doctors
// @access  Public
export const getAllDoctors = async (req, res) => {
  try {
    const { specialization, search, date } = req.query;
    const filter = { isActive: true };

    if (specialization && specialization !== 'All') {
      filter.specialization = specialization;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
        { qualifications: { $regex: search, $options: 'i' } },
      ];
    }

    let doctors = await Doctor.find(filter).sort({ rating: -1, name: 1 });

    // If date is provided, filter doctors who work on that day of week and are not on leave
    if (date) {
      const dayName = getDayName(date);
      doctors = doctors.filter((doc) => {
        const worksOnDay = doc.availableDays.includes(dayName);
        const onLeave = doc.leaveDates && doc.leaveDates.includes(date);
        const holiday = doc.holidays && doc.holidays.includes(date);
        return worksOnDay && !onLeave && !holiday;
      });
    }

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve doctors list.',
      error: error.message,
    });
  }
};

// @desc    Get single doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found.',
      });
    }

    res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve doctor profile.',
      error: error.message,
    });
  }
};

// @desc    Get real-time doctor availability and slots for a specific date
// @route   GET /api/doctors/:id/availability?date=YYYY-MM-DD
// @access  Public
export const getDoctorAvailability = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter "date" (YYYY-MM-DD) is required.',
      });
    }

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor || !doctor.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile is not active or available.',
      });
    }

    // Fetch active bookings for this doctor on this specific date
    // Note: Cancelled appointments are intentionally EXCLUDED so their slots become available!
    const activeAppointments = await Appointment.find({
      doctor: doctor._id,
      date,
      status: { $in: ['confirmed', 'pending'] },
    }).select('timeSlot slotStart slotEnd status');

    // Generate dynamic slots based on schedule, breaks, working hours, and bookings
    const slotData = generateDoctorSlots(doctor, date, activeAppointments);

    res.status(200).json({
      success: true,
      data: slotData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to calculate doctor slot availability.',
      error: error.message,
    });
  }
};

// @desc    Get specializations list with count
// @route   GET /api/doctors/meta/specializations
// @access  Public
export const getSpecializations = async (req, res) => {
  try {
    const specs = await Doctor.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$specialization', count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      specializations: specs.map((s) => ({ name: s._id, count: s.count })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve specializations.',
      error: error.message,
    });
  }
};

// @desc    Create new doctor profile (Admin only)
// @route   POST /api/doctors
// @access  Private (Admin)
export const createDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      profilePhoto,
      specialization,
      qualifications,
      experienceYears,
      consultationFee,
      availableDays,
      dailyWorkingHours,
      appointmentDuration,
      breakTimes,
      about,
      hospitalRoom,
    } = req.body;

    // Check duplicate doctor email
    const existing = await Doctor.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A doctor with this email is already registered.',
      });
    }

    const doctor = await Doctor.create({
      name,
      email: email.toLowerCase(),
      phone,
      profilePhoto: profilePhoto || undefined,
      specialization,
      qualifications,
      experienceYears,
      consultationFee,
      availableDays: availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      dailyWorkingHours: dailyWorkingHours || { start: '09:00', end: '17:00' },
      appointmentDuration: appointmentDuration || 30,
      breakTimes: breakTimes || [{ start: '13:00', end: '14:00', label: 'Lunch Break' }],
      about,
      hospitalRoom,
    });

    res.status(201).json({
      success: true,
      message: 'Doctor profile created successfully.',
      doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create doctor.',
      error: error.message,
    });
  }
};

// @desc    Update doctor profile (Admin only)
// @route   PUT /api/doctors/:id
// @access  Private (Admin)
export const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Doctor profile updated successfully.',
      doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update doctor profile.',
      error: error.message,
    });
  }
};

// @desc    Delete doctor profile (Admin only)
// @route   DELETE /api/doctors/:id
// @access  Private (Admin)
export const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Doctor deleted successfully.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete doctor.',
      error: error.message,
    });
  }
};

// @desc    Add leave date or holiday for a doctor (Admin only)
// @route   POST /api/doctors/:id/leave
// @access  Private (Admin)
export const addDoctorLeave = async (req, res) => {
  try {
    const { date, isHoliday } = req.body;
    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required (YYYY-MM-DD).' });
    }

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    const field = isHoliday ? 'holidays' : 'leaveDates';
    if (!doctor[field].includes(date)) {
      doctor[field].push(date);
      await doctor.save();
    }

    res.status(200).json({
      success: true,
      message: `${isHoliday ? 'Holiday' : 'Leave date'} added successfully.`,
      doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add leave date.',
      error: error.message,
    });
  }
};

// @desc    Remove leave date or holiday for a doctor (Admin only)
// @route   DELETE /api/doctors/:id/leave
// @access  Private (Admin)
export const removeDoctorLeave = async (req, res) => {
  try {
    const { date, isHoliday } = req.body;
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    const field = isHoliday ? 'holidays' : 'leaveDates';
    doctor[field] = doctor[field].filter((d) => d !== date);
    await doctor.save();

    res.status(200).json({
      success: true,
      message: `${isHoliday ? 'Holiday' : 'Leave date'} removed successfully.`,
      doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to remove leave date.',
      error: error.message,
    });
  }
};
