import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
  {
    doctorId: {
      type: String,
      unique: true,
      required: true,
      default: () => 'DOC-' + Math.floor(1000 + Math.random() * 9000),
    },
    name: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Doctor email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Doctor contact phone is required'],
      trim: true,
    },
    profilePhoto: {
      type: String,
      default: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      enum: [
        'Cardiology',
        'Dermatology',
        'Orthopedics',
        'Pediatrics',
        'Neurology',
        'General Medicine',
        'Gynecology',
        'Ophthalmology',
        'ENT',
      ],
    },
    qualifications: {
      type: String,
      required: [true, 'Qualifications are required'],
      default: 'MBBS, MD',
    },
    experienceYears: {
      type: Number,
      required: [true, 'Experience in years is required'],
      min: [0, 'Experience cannot be negative'],
    },
    consultationFee: {
      type: Number,
      required: [true, 'Consultation fee is required'],
      min: [0, 'Fee cannot be negative'],
    },
    availableDays: {
      type: [String],
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
    dailyWorkingHours: {
      start: {
        type: String,
        default: '09:00', // 24-hr format HH:mm
      },
      end: {
        type: String,
        default: '17:00', // 24-hr format HH:mm
      },
    },
    appointmentDuration: {
      type: Number,
      enum: [15, 30],
      default: 30, // in minutes
    },
    breakTimes: [
      {
        start: { type: String, default: '13:00' },
        end: { type: String, default: '14:00' },
        label: { type: String, default: 'Lunch Break' },
      },
    ],
    leaveDates: {
      type: [String], // Format: YYYY-MM-DD
      default: [],
    },
    holidays: {
      type: [String], // Format: YYYY-MM-DD
      default: [],
    },
    about: {
      type: String,
      default: 'Dedicated healthcare specialist committed to exceptional patient care and clinical excellence.',
    },
    hospitalRoom: {
      type: String,
      default: 'Room 304, Consultation Wing B',
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;
