import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from '../models/User.js';

const setupAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital_booking_db';
    console.log(`Connecting to MongoDB at: ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    const adminEmail = 'cipurapupragathi@gmail.com';
    const adminPassword = 'pragathi';

    // Remove any old generic admin account
    await User.deleteOne({ email: 'admin@hospital.com' });

    // Check if Pragathi admin account already exists
    let admin = await User.findOne({ email: adminEmail });

    if (admin) {
      console.log(`Updating existing admin account for ${adminEmail}...`);
      admin.name = 'Pragathi Cipurapu (Admin)';
      admin.password = adminPassword; // Pre-save hook will hash it with bcrypt
      admin.role = 'admin';
      await admin.save();
    } else {
      console.log(`Creating new admin account for ${adminEmail}...`);
      admin = await User.create({
        name: 'Pragathi Cipurapu (Admin)',
        email: adminEmail,
        phone: '+91 98765 00001',
        password: adminPassword,
        role: 'admin',
      });
    }

    console.log('===========================================================');
    console.log(' ADMIN ACCOUNT CONFIGURED SUCCESSFULLY!');
    console.log('===========================================================');
    console.log(` Name:     ${admin.name}`);
    console.log(` Email:    ${admin.email}`);
    console.log(` Password: ${adminPassword}`);
    console.log(` Role:     ${admin.role}`);
    console.log('===========================================================');

    process.exit(0);
  } catch (err) {
    console.error('Error configuring admin account:', err);
    process.exit(1);
  }
};

setupAdmin();
