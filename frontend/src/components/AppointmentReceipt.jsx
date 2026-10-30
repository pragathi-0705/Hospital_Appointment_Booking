import React from 'react';
import { CheckCircle2, Calendar, Clock, User, Phone, MapPin, Printer, ArrowRight } from 'lucide-react';

export const AppointmentReceipt = ({ appointment, onClose, onViewAppointments }) => {
  if (!appointment) return null;

  const doctor = appointment.doctor || {};

  return (
    <div style={{ padding: '30px' }}>
      {/* Header Banner */}
      <div style={{
        textAlign: 'center',
        paddingBottom: '20px',
        borderBottom: '2px dashed var(--border-color)',
        marginBottom: '24px',
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--success-light)',
          color: 'var(--success)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px',
        }}>
          <CheckCircle2 size={36} />
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '4px' }}>
          Appointment Confirmed!
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Your appointment has been registered and confirmed in PulseCare Hospital's system.
        </p>

        {/* Unique Appointment ID Badge */}
        <div style={{
          display: 'inline-block',
          marginTop: '12px',
          background: 'var(--primary-light)',
          border: '1px solid #bfdbfe',
          padding: '6px 16px',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.9rem',
          fontWeight: '700',
          color: 'var(--primary)',
          letterSpacing: '0.04em',
        }}>
          Appointment ID: {appointment.appointmentId}
        </div>
      </div>

      {/* Details Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        background: 'var(--bg-main)',
        padding: '20px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        marginBottom: '24px',
      }}>
        {/* Doctor Info */}
        <div>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700' }}>
            Doctor & Specialization
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-dark)', marginTop: '2px' }}>
            {doctor.name || 'Specialist Doctor'}
          </div>
          <div style={{ fontSize: '0.84rem', color: 'var(--accent-purple)', fontWeight: '600' }}>
            {doctor.specialization} ({doctor.qualifications})
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
            <MapPin size={13} color="var(--primary)" /> {doctor.hospitalRoom || 'Main OPD Building'}
          </div>
        </div>

        {/* Date & Time Slot */}
        <div>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700' }}>
            Appointment Schedule
          </div>
          <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
            <Calendar size={16} color="var(--primary)" /> {appointment.date}
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
            <Clock size={16} color="var(--accent-purple)" /> {appointment.timeSlot}
          </div>
        </div>

        {/* Patient Details */}
        <div>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700' }}>
            Patient Information
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
            <User size={15} color="var(--primary)" /> {appointment.patientName}
          </div>
          <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
            <Phone size={14} /> {appointment.patientPhone}
          </div>
        </div>

        {/* Fee & Payment */}
        <div>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700' }}>
            Consultation Fee
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary)', marginTop: '2px' }}>
            ₹{appointment.consultationFee}
          </div>
          <span className="badge badge-success" style={{ marginTop: '4px' }}>
            Booking Confirmed
          </span>
        </div>
      </div>

      {/* Hospital Instructions */}
      <div style={{
        fontSize: '0.82rem',
        color: 'var(--text-muted)',
        background: 'var(--bg-subtle)',
        padding: '12px 16px',
        borderRadius: 'var(--radius-md)',
        marginBottom: '24px',
        borderLeft: '4px solid var(--primary)',
      }}>
        <strong>Hospital Visit Notice:</strong> Please report at the consultation desk 10 minutes prior to your time slot. Carry any previous diagnostic medical records. Cancellation is permitted up to 2 hours before the appointment.
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <button
          onClick={() => window.print()}
          className="btn btn-outline"
          style={{ gap: '8px' }}
        >
          <Printer size={16} /> Print Receipt
        </button>

        <div style={{ display: 'flex', gap: '10px' }}>
          {onViewAppointments && (
            <button
              onClick={onViewAppointments}
              className="btn btn-primary"
              style={{ gap: '6px' }}
            >
              My Appointments <ArrowRight size={16} />
            </button>
          )}
          <button
            onClick={onClose}
            className="btn btn-ghost"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
