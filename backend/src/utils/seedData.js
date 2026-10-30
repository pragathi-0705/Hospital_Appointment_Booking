import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';

const sampleDoctors = [
  {
    doctorId: 'DOC-1001',
    name: 'Dr. Ravi Sharma',
    email: 'ravi.sharma@hospital.com',
    phone: '+91 98765 43210',
    profilePhoto: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500&auto=format&fit=crop&q=80',
    specialization: 'Cardiology',
    qualifications: 'MBBS, MD (Medicine), DM (Cardiology), FACC',
    experienceYears: 14,
    consultationFee: 800,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    dailyWorkingHours: { start: '09:00', end: '17:00' },
    appointmentDuration: 30,
    breakTimes: [
      { start: '13:00', end: '14:00', label: 'Lunch & Ward Rounds' },
    ],
    leaveDates: ['2026-11-15'],
    holidays: ['2026-12-25'],
    about: 'Chief Cardiologist with extensive expertise in interventional cardiology, echocardiography, cardiac failure management, and preventive heart care.',
    hospitalRoom: 'Cardio OPD 102, West Wing',
    rating: 4.9,
    isActive: true,
  },
  {
    doctorId: 'DOC-1002',
    name: 'Dr. Priya Patel',
    email: 'priya.patel@hospital.com',
    phone: '+91 98765 43211',
    profilePhoto: 'https://images.unsplash.com/photo-1594824813583-e1d53e204c3e?w=500&auto=format&fit=crop&q=80',
    specialization: 'Dermatology',
    qualifications: 'MBBS, MD (Dermatology, Venereology & Leprosy)',
    experienceYears: 9,
    consultationFee: 600,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    dailyWorkingHours: { start: '10:00', end: '16:00' },
    appointmentDuration: 15,
    breakTimes: [
      { start: '13:00', end: '13:30', label: 'Lunch Break' },
    ],
    leaveDates: [],
    holidays: ['2026-12-25'],
    about: 'Consultant Dermatologist focusing on clinical dermatology, pediatric skin conditions, acne management, and modern laser therapies.',
    hospitalRoom: 'Derma Suite 204, East Wing',
    rating: 4.8,
    isActive: true,
  },
  {
    doctorId: 'DOC-1003',
    name: 'Dr. Rajesh Sundaram',
    email: 'rajesh.sundaram@hospital.com',
    phone: '+91 98765 43212',
    profilePhoto: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=500&auto=format&fit=crop&q=80',
    specialization: 'Orthopedics',
    qualifications: 'MBBS, MS (Orthopedics), M.Ch Ortho (UK)',
    experienceYears: 16,
    consultationFee: 900,
    availableDays: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    dailyWorkingHours: { start: '09:00', end: '16:30' },
    appointmentDuration: 30,
    breakTimes: [
      { start: '12:30', end: '13:30', label: 'Surgical Rounds & Lunch' },
    ],
    leaveDates: ['2026-11-20'],
    holidays: ['2026-12-25'],
    about: 'Senior Joint Replacement and Arthroscopy Surgeon specializing in knee & hip reconstruction, sports injuries, and trauma rehabilitation.',
    hospitalRoom: 'Ortho OPD 301, North Wing',
    rating: 4.9,
    isActive: true,
  },
  {
    doctorId: 'DOC-1004',
    name: 'Dr. Ananya Mukherjee',
    email: 'ananya.m@hospital.com',
    phone: '+91 98765 43213',
    profilePhoto: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&auto=format&fit=crop&q=80',
    specialization: 'Pediatrics',
    qualifications: 'MBBS, DCH, MD (Pediatrics), FIAP',
    experienceYears: 8,
    consultationFee: 500,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    dailyWorkingHours: { start: '09:30', end: '17:30' },
    appointmentDuration: 15,
    breakTimes: [
      { start: '13:00', end: '14:00', label: 'Lunch Break' },
    ],
    leaveDates: [],
    holidays: ['2026-12-25'],
    about: 'Compassionate Pediatrician dedicated to neonatal care, child developmental assessments, vaccination, and pediatric nutrition guidance.',
    hospitalRoom: 'Child Care Clinic 105, Ground Floor',
    rating: 4.9,
    isActive: true,
  },
  {
    doctorId: 'DOC-1005',
    name: 'Dr. Vikramaditya Rao',
    email: 'vikram.rao@hospital.com',
    phone: '+91 98765 43214',
    profilePhoto: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=500&auto=format&fit=crop&q=80',
    specialization: 'Neurology',
    qualifications: 'MBBS, MD (Medicine), DM (Neurology)',
    experienceYears: 18,
    consultationFee: 1200,
    availableDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
    dailyWorkingHours: { start: '10:00', end: '17:00' },
    appointmentDuration: 30,
    breakTimes: [
      { start: '13:00', end: '14:00', label: 'Lunch Break' },
    ],
    leaveDates: [],
    holidays: ['2026-12-25'],
    about: 'Renowned Neurologist with expertise in stroke management, epilepsy, Parkinson’s disease, migraines, and neuromuscular disorders.',
    hospitalRoom: 'Neuro Center 402, Block C',
    rating: 4.9,
    isActive: true,
  },
  {
    doctorId: 'DOC-1006',
    name: 'Dr. Sunita Kulkarni',
    email: 'sunita.kulkarni@hospital.com',
    phone: '+91 98765 43215',
    profilePhoto: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=500&auto=format&fit=crop&q=80',
    specialization: 'General Medicine',
    qualifications: 'MBBS, DNB (Family Medicine), Dip. Diabetology',
    experienceYears: 11,
    consultationFee: 450,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    dailyWorkingHours: { start: '08:30', end: '16:00' },
    appointmentDuration: 15,
    breakTimes: [
      { start: '12:30', end: '13:30', label: 'Lunch Break' },
    ],
    leaveDates: [],
    holidays: [],
    about: 'Holistic Primary Care physician specializing in lifestyle disease reversal, diabetes care, hypertension, and preventive family medicine.',
    hospitalRoom: 'General Clinic 101, Ground Floor',
    rating: 4.8,
    isActive: true,
  },
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital_booking_db';
    console.log(`Connecting to MongoDB at: ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    console.log('Clearing existing records...');
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Appointment.deleteMany({});

    console.log('Creating Admin Account...');
    const adminUser = await User.create({
      name: 'Pragathi Cipurapu (Admin)',
      email: 'cipurapupragathi@gmail.com',
      phone: '+91 90000 00001',
      password: 'pragathi',
      role: 'admin',
    });

    console.log('Creating Sample Patient Account...');
    const patientUser = await User.create({
      name: 'John Doe',
      email: 'patient@example.com',
      phone: '+91 90000 00002',
      password: 'PatientPassword123',
      role: 'patient',
    });

    console.log('Inserting Sample Doctors...');
    const createdDoctors = await Doctor.insertMany(sampleDoctors);

    // Create 1 sample confirmed appointment for testing slot deduction
    const targetDoctor = createdDoctors[0]; // Dr. Ravi Sharma
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    // Find next valid working day (not Sunday for Dr. Ravi)
    if (tomorrow.getDay() === 0) {
      tomorrow.setDate(tomorrow.getDate() + 1);
    }
    const targetDateStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

    console.log(`Creating a sample confirmed booking for Dr. Ravi on ${targetDateStr} at 10:00 - 10:30...`);
    await Appointment.create({
      doctor: targetDoctor._id,
      patient: patientUser._id,
      patientName: patientUser.name,
      patientEmail: patientUser.email,
      patientPhone: patientUser.phone,
      date: targetDateStr,
      timeSlot: '10:00 - 10:30',
      slotStart: '10:00',
      slotEnd: '10:30',
      status: 'confirmed',
      consultationFee: targetDoctor.consultationFee,
      reason: 'Routine Cardio Checkup',
      notes: 'Sample pre-booked appointment to verify slot exclusion.',
    });

    // Make sure indexes are built
    await mongoose.connection.syncIndexes();

    console.log('===========================================================');
    console.log(' DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('===========================================================');
    console.log(` Admin Login:`);
    console.log(`   Email:    cipurapupragathi@gmail.com`);
    console.log(`   Password: pragathi`);
    console.log(` Patient Login:`);
    console.log(`   Email:    patient@example.com`);
    console.log(`   Password: PatientPassword123`);
    console.log(` Total Doctors Seeded: ${createdDoctors.length}`);
    console.log('===========================================================');

    process.exit(0);
  } catch (err) {
    console.error('Error during seeding:', err);
    process.exit(1);
  }
};

seedDB();
