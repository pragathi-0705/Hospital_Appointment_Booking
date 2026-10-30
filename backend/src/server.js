import dotenv from 'dotenv';
dotenv.config();

import app from './index.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and then start listening
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` Hospital Appointment Booking System API`);
    console.log(` Running on: http://localhost:${PORT}`);
    console.log(` Health check: http://localhost:${PORT}/api/health`);
    console.log(` Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`====================================================`);
  });
};

startServer();
