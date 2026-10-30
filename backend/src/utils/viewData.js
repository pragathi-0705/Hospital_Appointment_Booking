import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';

const viewData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital_booking_db';
    console.log(`Connecting to database at ${mongoUri}...`);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });

    console.log('\n================================================================');
    console.log('              HOSPITAL DATABASE RECORDS VIEWER                  ');
    console.log('================================================================\n');

    // 1. USERS & PATIENTS
    const users = await User.find().select('name email phone role createdAt');
    console.log(`--- [1] REGISTERED USERS & PATIENTS (${users.length} Records) ---`);
    if (users.length === 0) {
      console.log('No users found in database.');
    } else {
      console.table(
        users.map((u) => ({
          'ID': u._id.toString().slice(-6),
          'Full Name': u.name,
          'Email': u.email,
          'Phone': u.phone,
          'Role': u.role.toUpperCase(),
        }))
      );
    }

    // 2. DOCTORS
    const doctors = await Doctor.find().select('name specialization consultationFee appointmentDuration dailyWorkingHours availableDays');
    console.log(`\n--- [2] DOCTOR PROFILES & SCHEDULES (${doctors.length} Records) ---`);
    if (doctors.length === 0) {
      console.log('No doctors found in database.');
    } else {
      console.table(
        doctors.map((d) => ({
          'Doctor Name': d.name,
          'Specialization': d.specialization,
          'Fee': `₹${d.consultationFee}`,
          'Duration': `${d.appointmentDuration}m`,
          'Shift': `${d.dailyWorkingHours?.start} - ${d.dailyWorkingHours?.end}`,
          'Days': `${d.availableDays?.length} days/week`,
        }))
      );
    }

    // 3. APPOINTMENTS
    const appointments = await Appointment.find().populate('doctor', 'name specialization');
    console.log(`\n--- [3] BOOKED APPOINTMENTS (${appointments.length} Records) ---`);
    if (appointments.length === 0) {
      console.log('No appointments booked yet.');
    } else {
      console.table(
        appointments.map((a) => ({
          'Appt ID': a.appointmentId,
          'Patient Name': a.patientName,
          'Doctor': a.doctor?.name || 'Unknown',
          'Date': a.date,
          'Time Slot': a.timeSlot,
          'Fee': `₹${a.consultationFee}`,
          'Status': a.status.toUpperCase(),
        }))
      );
    }

    console.log('\n================================================================');
    console.log(' Database URI: ' + mongoUri);
    console.log(' Database Name: hospital_booking_db');
    console.log('================================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('\nError connecting to database:', err.message);
    console.log('\nTip: Make sure MongoDB is running with: net start MongoDB');
    process.exit(1);
  }
};

viewData();
