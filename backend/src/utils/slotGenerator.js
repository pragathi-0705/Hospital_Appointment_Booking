/**
 * Utility functions for generating and validating doctor appointment slots.
 */

// Format HH:MM (24h) to "hh:mm AM/PM"
export const formatTo12Hour = (time24) => {
  const [hourStr, minuteStr] = time24.split(':');
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr || '00';
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  hour = hour ? hour : 12; // '0' should be '12'
  const hourFormatted = hour < 10 ? `0${hour}` : `${hour}`;
  return `${hourFormatted}:${minute} ${ampm}`;
};

// Convert "HH:MM" to minutes from midnight
export const timeToMinutes = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

// Convert minutes from midnight to "HH:MM" (24h)
export const minutesToTime = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const pad = (n) => (n < 10 ? '0' + n : '' + n);
  return `${pad(h)}:${pad(m)}`;
};

// Get Day name from YYYY-MM-DD
export const getDayName = (dateStr) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  // Month is 0-indexed in JS Date
  const dateObj = new Date(year, month - 1, day);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dateObj.getDay()];
};

// Check if two time ranges overlap: [startA, endA] and [startB, endB]
export const isOverlapping = (startA, endA, startB, endB) => {
  const sA = timeToMinutes(startA);
  const eA = timeToMinutes(endA);
  const sB = timeToMinutes(startB);
  const eB = timeToMinutes(endB);
  return Math.max(sA, sB) < Math.min(eA, eB);
};

/**
 * Generate slots for a doctor on a specific date, filtering booked slots, breaks, and past times.
 *
 * @param {Object} doctor Doctor document
 * @param {String} dateStr YYYY-MM-DD
 * @param {Array} bookedAppointments Array of active appointments for this doctor on dateStr
 * @returns {Object} { isAvailable, reason, availableSlots, allSlots, stats }
 */
export const generateDoctorSlots = (doctor, dateStr, bookedAppointments = []) => {
  // Validate doctor object
  if (!doctor || !doctor.dailyWorkingHours) {
    return {
      isAvailable: false,
      reason: 'Doctor schedule configuration is incomplete.',
      availableSlots: [],
      allSlots: [],
    };
  }

  // 1. Check if date is in the past
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  if (dateStr < todayStr) {
    return {
      isAvailable: false,
      isPastDate: true,
      reason: 'Appointments cannot be booked for past dates.',
      availableSlots: [],
      allSlots: [],
    };
  }

  // 2. Check Day of Week
  const dayName = getDayName(dateStr);
  if (!doctor.availableDays || !doctor.availableDays.includes(dayName)) {
    return {
      isAvailable: false,
      isNonWorkingDay: true,
      reason: `Dr. ${doctor.name} does not consult on ${dayName}s.`,
      availableSlots: [],
      allSlots: [],
    };
  }

  // 3. Check Leaves & Holidays
  if (doctor.leaveDates && doctor.leaveDates.includes(dateStr)) {
    return {
      isAvailable: false,
      isOnLeave: true,
      reason: `Dr. ${doctor.name} is on leave on ${dateStr}.`,
      availableSlots: [],
      allSlots: [],
    };
  }

  if (doctor.holidays && doctor.holidays.includes(dateStr)) {
    return {
      isAvailable: false,
      isHoliday: true,
      reason: `Hospital holiday / off-day on ${dateStr}.`,
      availableSlots: [],
      allSlots: [],
    };
  }

  // 4. Generate discrete time intervals
  const duration = doctor.appointmentDuration || 30; // 15 or 30 minutes
  const workStartMin = timeToMinutes(doctor.dailyWorkingHours.start || '09:00');
  const workEndMin = timeToMinutes(doctor.dailyWorkingHours.end || '17:00');

  // Booked slot times set for fast lookup
  const bookedSlotsSet = new Set(
    bookedAppointments.map((apt) => apt.timeSlot)
  );

  const allSlots = [];
  const currentMinutesNow = now.getHours() * 60 + now.getMinutes();
  const isToday = dateStr === todayStr;

  for (let startMin = workStartMin; startMin + duration <= workEndMin; startMin += duration) {
    const endMin = startMin + duration;
    const start24 = minutesToTime(startMin);
    const end24 = minutesToTime(endMin);
    const slotKey = `${start24} - ${end24}`;
    const displayLabel = `${formatTo12Hour(start24)} - ${formatTo12Hour(end24)}`;

    // Check if slot overlaps with any break times (e.g. lunch 13:00 - 14:00)
    let isBreak = false;
    let breakReason = '';
    if (doctor.breakTimes && doctor.breakTimes.length > 0) {
      for (const brk of doctor.breakTimes) {
        if (isOverlapping(start24, end24, brk.start, brk.end)) {
          isBreak = true;
          breakReason = brk.label || 'Break Time';
          break;
        }
      }
    }

    // Check if slot is already in the past today (buffer by 5 minutes)
    const isPastSlot = isToday && startMin <= currentMinutesNow + 5;

    // Check if booked
    const isBooked = bookedSlotsSet.has(slotKey) || bookedSlotsSet.has(start24);

    const isAvailable = !isBreak && !isPastSlot && !isBooked;

    allSlots.push({
      timeSlot: slotKey,
      displayLabel,
      slotStart: start24,
      slotEnd: end24,
      isAvailable,
      isBooked,
      isBreak,
      breakReason,
      isPastSlot,
    });
  }

  const availableSlots = allSlots.filter((s) => s.isAvailable);

  return {
    isAvailable: availableSlots.length > 0,
    date: dateStr,
    dayName,
    doctor: {
      id: doctor._id,
      name: doctor.name,
      specialization: doctor.specialization,
      fee: doctor.consultationFee,
      duration,
    },
    totalSlots: allSlots.length,
    availableCount: availableSlots.length,
    bookedCount: allSlots.filter((s) => s.isBooked).length,
    availableSlots,
    allSlots,
  };
};
