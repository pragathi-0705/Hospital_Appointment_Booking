import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);

    // Ensure models are registered and indexes are created
    // This creates the unique compound index for concurrency protection
    await import('../models/Appointment.js');
    await import('../models/Doctor.js');
    await import('../models/User.js');
    await mongoose.connection.syncIndexes();
    console.log('[Database] Mongoose indexes synchronized successfully.');
  } catch (error) {
    console.error(`[Database Error] ${error.message}`);
    // Do not terminate process in dev so user can inspect or reconnect
    console.warn('[Database] Continuing server start. Please ensure MongoDB is running.');
  }
};

export default connectDB;
