# PulseCare+ Hospital Appointment Booking System

A modern, responsive, full-stack Hospital Appointment Booking System built with **React (Vite)**, **Node.js**, **Express.js**, and **MongoDB (Mongoose)**.

The system features real-time dynamic doctor slot scheduling, zero-wait patient bookings, strict database-level concurrency protection to prevent double bookings, patient dashboards, receipt generation, and a comprehensive hospital administrative portal.

---

## 🏥 Key Features

1. **Doctor Management & Scheduling:**
   - Multi-specialization directory: Cardiology, Dermatology, Orthopedics, Pediatrics, Neurology, General Medicine, and more.
   - Doctor profiles include qualifications, experience, consultation fees, custom slot durations (15 or 30 minutes), OPD room numbers, and working hours.
   - Automated exclusion of lunch breaks, official holidays, leaves, and non-working days.

2. **Real-Time Dynamic Slot Calculation:**
   - Evaluates slot availability on-the-fly for any selected date.
   - Prevents booking in the past.
   - Immediately hides or disables booked slots.

3. **Critical Concurrency Protection (Zero Double-Booking):**
   - Enforced by a compound unique index in MongoDB:
     `{ doctor: 1, date: 1, timeSlot: 1 }` with `partialFilterExpression: { status: { $in: ['confirmed', 'pending'] } }`.
   - Guaranteed atomic operation at the database engine level. If two patients attempt to book the exact same slot simultaneously, exactly one succeeds; the second receives an instant HTTP 409 conflict:
     > *"Sorry, this time slot has just been booked. Please select another available time."*

4. **Appointment Cancellation & Slot Reclaiming:**
   - Patients can cancel their eligible appointments.
   - Status updates to `cancelled` and the partial index immediately re-exposes the slot for new patient bookings.
   - Unauthorized cancellation attempts by other patients are blocked.

5. **Printable / Downloadable Receipts:**
   - Confirmed appointments generate an official hospital receipt with a unique alphanumeric Appointment ID, doctor details, date, time slot, and consultation fee breakdown.

6. **Admin Dashboard:**
   - Add, edit, and deactivate doctor profiles.
   - Configure working hours, appointment slot durations, and fees.
   - Add individual doctor leaves or hospital-wide holidays.
   - View, search, and manage all appointments hospital-wide.

---

## 📁 Project Architecture & Folder Structure

```
hospital-booking-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # MongoDB connection & index synchronization
│   │   ├── controllers/
│   │   │   ├── authController.js     # Patient & Admin authentication
│   │   │   ├── doctorController.js   # Doctors, schedules, leaves & specializations
│   │   │   ├── appointmentController.js # Concurrency-safe booking & cancellations
│   │   │   └── adminController.js    # Metric stats and hospital reports
│   │   ├── middleware/
│   │   │   └── authMiddleware.js     # JWT token verification & role protection
│   │   ├── models/
│   │   │   ├── User.js               # User accounts (patient & admin)
│   │   │   ├── Doctor.js             # Doctor profiles & shift settings
│   │   │   └── Appointment.js        # Appointment model with partial unique compound index
│   │   ├── utils/
│   │   │   ├── slotGenerator.js      # Working hours, break times, duration calculator
│   │   │   └── seedData.js           # Sample doctors, admin & patient demo records
│   │   ├── index.js                  # Express application setup & middleware
│   │   └── server.js                 # HTTP server bootstrap
│   ├── .env.example                  # Environment configuration template
│   ├── .env                          # Local environment variables
│   ├── package.json
│   └── test-concurrency.js           # Automated simultaneous duplicate booking test
├── frontend/
│   ├── public/
│   │   └── hospital-cross.svg        # Medical favicon
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js                # API client with JWT bearer interceptors
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Global authentication state management
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Responsive medical navigation
│   │   │   ├── Footer.jsx            # Hospital footer & 24/7 hotline info
│   │   │   ├── DoctorCard.jsx        # Doctor profile presentation card
│   │   │   ├── SpecializationFilter.jsx # Specialization selector pills
│   │   │   ├── SlotPicker.jsx        # Date selector & interactive slot matrix
│   │   │   ├── BookingModal.jsx      # Concurrency-safe booking modal & conflict handler
│   │   │   └── AppointmentReceipt.jsx# Printable confirmation receipt
│   │   ├── pages/
│   │   │   ├── HomePage.jsx          # Landing page, hero, quick search, statistics
│   │   │   ├── DoctorsPage.jsx       # Doctor directory with multi-filter
│   │   │   ├── DoctorDetailsPage.jsx # Doctor detail page with embedded schedule
│   │   │   ├── LoginPage.jsx         # Sign in with 1-click Demo logins
│   │   │   ├── RegisterPage.jsx      # Patient registration with validation
│   │   │   ├── PatientDashboard.jsx  # Personal appointments & cancellation
│   │   │   └── AdminDashboard.jsx    # Hospital admin control center
│   │   ├── styles/
│   │   │   └── index.css             # Medical design tokens (blue & pastel purple)
│   │   ├── App.jsx                   # Main layout and routing
│   │   └── main.jsx                  # React DOM root entry
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 🔐 Database Concurrency & Double-Booking Prevention

### The Race Condition Problem
When two patients (Patient A and Patient B) attempt to book the same doctor at 10:00 AM on the same date at the exact same moment, traditional check-then-insert queries often suffer from race conditions: both checks pass, leading to two confirmed appointments for one slot.

### The Solution Implemented
1. **Application Layer Pre-Check:**
   `appointmentController.js` performs validation against doctor working hours, break periods, past times, and current bookings.

2. **Database Engine Compound Unique Constraint:**
   In `backend/src/models/Appointment.js`:
   ```javascript
   appointmentSchema.index(
     { doctor: 1, date: 1, timeSlot: 1 },
     {
       unique: true,
       partialFilterExpression: { status: { $in: ['confirmed', 'pending'] } },
       name: 'unique_doctor_date_active_slot'
     }
   );
   ```

3. **Handling Duplicate Key Error (Code 11000):**
   ```javascript
   try {
     const appointment = await Appointment.create({ ... });
     return res.status(201).json({ success: true, appointment });
   } catch (error) {
     if (error.code === 11000) {
       return res.status(409).json({
         success: false,
         message: 'Sorry, this time slot has just been booked. Please select another available time.'
       });
     }
     throw error;
   }
   ```

4. **Slot Recycling on Cancellation:**
   When an appointment is cancelled, its status changes to `'cancelled'`. The partial filter expression excludes it from the unique index, allowing the exact slot to be booked again immediately.

---

## 🛠️ Installation & Setup (Windows PowerShell)

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** running locally on port `27017` (or MongoDB Atlas connection string)

### Step 1: Install Backend Dependencies
Open PowerShell and navigate to the backend directory:
```powershell
cd C:\Users\praga\.gemini\antigravity\scratch\hospital-booking-system\backend
npm install
```

### Step 2: Configure Environment Variables
A `.env` file is pre-configured with default settings:
```ini
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/hospital_booking_db
JWT_SECRET=super_secure_hospital_jwt_secret_key_2026_xyz
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### Step 3: Seed Database with Sample Records
Populate sample doctors, admin, and patient accounts:
```powershell
npm run seed
```

Output:
```text
===========================================================
 DATABASE SEEDING COMPLETED SUCCESSFULLY!
===========================================================
 Admin Login (URL: http://localhost:5173/admin):
   Email:    cipurapupragathi@gmail.com
   Password: pragathi
 Patient Login (URL: http://localhost:5173):
   Email:    patient@example.com
   Password: PatientPassword123
 Total Doctors Seeded: 6
===========================================================
```

### Step 4: Install Frontend Dependencies
Open a second PowerShell window and navigate to the frontend directory:
```powershell
cd C:\Users\praga\.gemini\antigravity\scratch\hospital-booking-system\frontend
npm install
```

---

## 🚀 Running the Project in VS Code

### Terminal 1: Start Backend API
```powershell
cd C:\Users\praga\.gemini\antigravity\scratch\hospital-booking-system\backend
npm start
```
The backend starts on `http://localhost:5000`.
Health check: `http://localhost:5000/api/health`.

### Terminal 2: Start Frontend Development Server
```powershell
cd C:\Users\praga\.gemini\antigravity\scratch\hospital-booking-system\frontend
npm run dev
```
Open your browser and navigate to:
`http://localhost:5173`

---

## 🧪 Testing Verification Scenarios

Run the following test scenarios to verify system functionality:

### 1. Patient Registration and Login
- Click **Register** in the top navigation.
- Enter full name, email, phone number, and password.
- Verify live validation and redirection to the Patient Dashboard.
- Alternatively, on the **Login** page, click **Demo Patient** for instant 1-click access.

### 2. Doctor Directory & Scheduling
- Navigate to **Find Doctors**.
- Filter by **Cardiology**, **Dermatology**, **Orthopedics**, **Pediatrics**, **Neurology**, or **General Medicine**.
- Select a doctor to view their profile, qualifications, consultation fee, and duration (15 or 30 mins).

### 3. Date Selection & Dynamic Slots
- Select a date on the calendar.
- Verify that Sunday slots are disabled for doctors who do not work on Sundays.
- Verify that lunch break hours (e.g., 13:00 - 14:00) are flagged as **Break**.
- Verify that past dates cannot be selected (`min={today}`).

### 4. Slot Deduction Upon Booking
- Book an available slot (e.g., Tomorrow at 11:00 AM) with Dr. Ravi Sharma.
- Complete the booking and view the confirmed **Appointment Receipt**.
- Return to Dr. Ravi Sharma's schedule for that same date: notice that 11:00 AM is now marked as **Booked** and disabled.

### 5. Double-Booking Prevention (Different Patients)
- Open a private/incognito browser window.
- Log in as another patient.
- Attempt to book the same slot for the same doctor and date.
- Observe that the slot is already marked as booked.

### 6. Automated Concurrency Stress Test
Run the concurrency simulation test in PowerShell:
```powershell
cd C:\Users\praga\.gemini\antigravity\scratch\hospital-booking-system\backend
npm run test:concurrency
```
This test dispatches two simultaneous booking requests via `Promise.all` for the same doctor, date, and slot.
**Result:** Exactly one request succeeds with HTTP 201; the other receives HTTP 409 with:
> *"Sorry, this time slot has just been booked. Please select another available time."*

### 7. Slot Reclaiming on Cancellation
- In the Patient Dashboard, navigate to **Upcoming** appointments.
- Click **Cancel** on a confirmed booking and confirm.
- Check Dr. Ravi Sharma's availability for that date: the cancelled time slot is immediately available for new bookings.

### 8. Patient Privacy Protection
- As a patient, try viewing another patient's appointment:
  `GET /api/appointments/:id` returns `HTTP 403 Forbidden` if the logged-in user is not the appointment owner or an administrator.

### 9. Admin Portal Privileges
- Navigate to `http://localhost:5173/admin`.
- Log in with Pragathi's admin credentials:
  - Email: `cipurapupragathi@gmail.com`
  - Password: `pragathi`
- Access the **Admin Control Center**.
- Add a new doctor profile or edit an existing doctor's working hours.
- Click **Add Leave / Holiday** to block out a date. Verify that all slots for that doctor on that date are instantly blocked.
- Review and filter all hospital appointments across all doctors.

---

## 📡 REST API Reference Summary

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new patient account |
| `POST` | `/api/auth/login` | Public | Login with email and password |
| `GET` | `/api/auth/me` | Private | Get authenticated user profile |
| `GET` | `/api/doctors` | Public | Get doctors list (supports `specialization`, `search`, `date`) |
| `GET` | `/api/doctors/:id` | Public | Get doctor profile details |
| `GET` | `/api/doctors/:id/availability?date=YYYY-MM-DD` | Public | Get dynamic available slots for a date |
| `GET` | `/api/doctors/meta/specializations` | Public | List specializations with doctor counts |
| `POST` | `/api/doctors` | Admin | Add new doctor profile |
| `PUT` | `/api/doctors/:id` | Admin | Update doctor profile and hours |
| `DELETE` | `/api/doctors/:id` | Admin | Remove doctor profile |
| `POST` | `/api/doctors/:id/leave` | Admin | Add leave date or hospital holiday |
| `POST` | `/api/appointments/book` | Private | Book appointment with concurrency protection |
| `GET` | `/api/appointments/my-appointments` | Private | Get current patient's appointments |
| `GET` | `/api/appointments/:id` | Private | Get appointment receipt details |
| `PUT` | `/api/appointments/:id/cancel` | Private | Cancel appointment and free up slot |
| `GET` | `/api/appointments` | Admin | Get all appointments across hospital |
| `PUT` | `/api/appointments/:id/status` | Admin | Update status or reschedule |
| `GET` | `/api/admin/stats` | Admin | Hospital administrative summary metrics |
