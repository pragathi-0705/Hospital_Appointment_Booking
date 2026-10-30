import React, { useState } from 'react';
import { SlotPicker } from '../components/SlotPicker.jsx';
import {
  ArrowLeft,
  Star,
  Clock,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Award,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const DoctorDetailsPage = ({
  doctor,
  onBack,
  onBookSlot,
}) => {
  const getDefaultDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const [selectedDate, setSelectedDate] = useState(getDefaultDate());
  const [selectedSlot, setSelectedSlot] = useState('');

  if (!doctor) return null;

  return (
    <div className="container" style={{ padding: '30px 20px 60px' }}>
      {/* Back Link */}
      <button
        onClick={onBack}
        className="btn btn-ghost btn-sm"
        style={{ marginBottom: '20px', padding: '6px 12px' }}
      >
        <ArrowLeft size={16} /> Back to Doctor Directory
      </button>

      {/* Main Grid: Left Doctor Profile, Right Booking & Availability */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '30px',
        alignItems: 'start',
      }}>
        {/* Doctor Information Card */}
        <div className="card" style={{ padding: '30px', border: '1px solid var(--border-color)' }}>
          {/* Header */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', alignItems: 'center' }}>
            <img
              src={doctor.profilePhoto}
              alt={doctor.name}
              style={{
                width: '96px',
                height: '96px',
                borderRadius: '24px',
                objectFit: 'cover',
                border: '3px solid #bfdbfe',
                boxShadow: 'var(--shadow-md)',
              }}
            />
            <div>
              <span className="badge badge-purple" style={{ marginBottom: '6px' }}>
                {doctor.specialization}
              </span>
              <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-dark)', lineHeight: 1.2 }}>
                {doctor.name}
              </h1>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {doctor.qualifications}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', color: '#d97706', fontWeight: '700', fontSize: '0.85rem' }}>
                <Star size={16} fill="#f59e0b" color="#f59e0b" />
                <span>{doctor.rating} Rating (Verified Patients)</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            padding: '16px',
            backgroundColor: 'var(--bg-main)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '24px',
            textAlign: 'center',
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Experience</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-dark)' }}>
                {doctor.experienceYears} Years
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Duration</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-dark)' }}>
                {doctor.appointmentDuration} Mins
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fee</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary)' }}>
                ₹{doctor.consultationFee}
              </div>
            </div>
          </div>

          {/* About / Bio */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '8px' }}>About Doctor</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              {doctor.about}
            </p>
          </div>

          {/* Schedule & Hospital Location */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <Calendar size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ display: 'block', color: 'var(--text-dark)' }}>Consultation Days:</strong>
                <span style={{ color: 'var(--text-muted)' }}>{doctor.availableDays?.join(', ')}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <Clock size={18} color="var(--accent-purple)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ display: 'block', color: 'var(--text-dark)' }}>Working Hours:</strong>
                <span style={{ color: 'var(--text-muted)' }}>
                  {doctor.dailyWorkingHours?.start} - {doctor.dailyWorkingHours?.end} (Break: {doctor.breakTimes?.[0]?.start} - {doctor.breakTimes?.[0]?.end})
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <MapPin size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ display: 'block', color: 'var(--text-dark)' }}>OPD Location:</strong>
                <span style={{ color: 'var(--text-muted)' }}>{doctor.hospitalRoom}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Schedule & Booking Card */}
        <div className="card" style={{ padding: '30px', border: '1px solid var(--border-color)' }}>
          <div style={{ marginBottom: '20px' }}>
            <span className="badge badge-purple" style={{ marginBottom: '6px' }}>
              Instant Booking
            </span>
            <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-dark)' }}>
              Check Available Slots & Book
            </h2>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
              Select a date to view Dr. {doctor.name}'s real-time schedule. Booked slots are hidden or excluded automatically.
            </p>
          </div>

          <SlotPicker
            doctor={doctor}
            selectedDate={selectedDate}
            onDateChange={(d) => {
              setSelectedDate(d);
              setSelectedSlot('');
            }}
            selectedSlot={selectedSlot}
            onSlotSelect={(s) => setSelectedSlot(s)}
          />

          {/* Action to proceed */}
          <div style={{
            marginTop: '30px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Selected Slot:</div>
              <div style={{ fontSize: '0.95rem', fontWeight: '800', color: selectedSlot ? 'var(--primary)' : 'var(--text-light)' }}>
                {selectedSlot ? `${selectedDate} (${selectedSlot})` : 'No slot chosen yet'}
              </div>
            </div>

            <button
              onClick={() => onBookSlot(doctor, selectedDate, selectedSlot)}
              disabled={!selectedSlot}
              className="btn btn-primary"
              style={{ padding: '12px 28px', fontWeight: '700' }}
            >
              Proceed to Book
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
