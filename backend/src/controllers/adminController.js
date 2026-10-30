import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';

// @desc    Get Admin summary dashboard metrics
// @route   GET /api/admin/stats
// @access  Private (Admin)
export const getAdminStats = async (req, res) => {
  try {
    const totalDoctors = await Doctor.countDocuments();
    const activeDoctors = await Doctor.countDocuments({ isActive: true });
    const totalPatients = await User.countDocuments({ role: 'patient' });

    const totalAppointments = await Appointment.countDocuments();
    const confirmedAppointments = await Appointment.countDocuments({ status: 'confirmed' });
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    const cancelledAppointments = await Appointment.countDocuments({ status: 'cancelled' });

    // Calculate total revenue from confirmed & completed appointments
    const revenueAgg = await Appointment.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] } } },
      { $group: { _id: null, totalRevenue: { $sum: '$consultationFee' } } },
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    // Upcoming appointments count (confirmed with date >= today)
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const upcomingCount = await Appointment.countDocuments({
      status: 'confirmed',
      date: { $gte: todayStr },
    });

    // Recent 5 bookings
    const recentAppointments = await Appointment.find()
      .populate('doctor', 'name specialization profilePhoto')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalDoctors,
        activeDoctors,
        totalPatients,
        totalAppointments,
        confirmedAppointments,
        completedAppointments,
        cancelledAppointments,
        upcomingCount,
        totalRevenue,
      },
      recentAppointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin stats.',
      error: error.message,
    });
  }
};
