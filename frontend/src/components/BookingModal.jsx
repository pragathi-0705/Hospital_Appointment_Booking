import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { appointmentApi } from '../api/api.js';
import { SlotPicker } from './SlotPicker.jsx';
import { AppointmentReceipt } from './AppointmentReceipt.jsx';
import { X, Calendar, Clock, DollarSign, AlertCircle, ShieldAlert, CheckCircle, UserCheck } from 'lucide-react';

export const BookingModal = ({
  doctor,
  initialDate,
  initialSlot,
  onClose,
  onBookingSuccess,
  onNavigateLogin,
  onViewAppointments,
}) => {
  const { user, isAuthenticated } = useAuth();

  // Helper: Default to tomorrow or today
  const getDefaultDate = () => {
    if (initialDate) return initialDate;
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const [selectedDate, setSelectedDate] = useState(getDefaultDate());
  const [selectedSlot, setSelectedSlot] = useState(initialSlot || '');
  const [patientName, setPatientName] = useState(user?.name || '');
  const [patientPhone, setPatientPhone] = useState(user?.phone || '');
  const [reason, setReason] = useState('General Consultation');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);

  if (!doctor) return null;

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isAuthenticated) {
      setErrorMsg('Please log in or register an account before booking an appointment.');
      return;
    }

    if (!selectedDate) {
      setErrorMsg('Please select an appointment date.');
      return;
    }

    if (!selectedSlot) {
      setErrorMsg('Please select an available time slot.');
      return;
    }

    if (!patientName.trim()) {
      setErrorMsg('Patient name is required.');
      return;
    }

    if (!patientPhone.trim()) {
      setErrorMsg('Patient contact phone is required.');
      return;
    }

    setLoading(true);
    try {
      const res = await appointmentApi.book({
        doctorId: doctor._id,
        date: selectedDate,
        timeSlot: selectedSlot,
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        reason: reason.trim(),
        notes: notes.trim(),
      });

      if (res.success && res.appointment) {
        setConfirmedAppointment(res.appointment);
        onBookingSuccess?.(res.appointment);
      }
    } catch (err) {
      // REQUIREMENT 5: Double booking / concurrency handling
      const message =
        err.data?.message ||
        err.message ||
        'Sorry, this time slot has just been booked. Please select another available time.';

      setErrorMsg(message);

      // Force slot picker to re-query latest slots from backend so the booked slot immediately disappears!
      setRefreshTrigger((prev) => prev + 1);
      setSelectedSlot('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* If confirmed, show receipt */}
        {confirmedAppointment ? (
          <AppointmentReceipt
            appointment={confirmedAppointment}
            onClose={onClose}
            onViewAppointments={onViewAppointments}
          />
        ) : (
          <div>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-color)',
            }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-dark)' }}>
                  Book Doctor Appointment
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  PulseCare Medical Center Online OPD Booking
                </p>
              </div>
              <button onClick={onClose} className="btn btn-ghost" style={{ padding: '8px' }}>
                <X size={20} />
              </button>
            </div>

            {/* Doctor Summary Banner */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '16px 24px',
              backgroundColor: 'var(--bg-main)',
              borderBottom: '1px solid var(--border-color)',
            }}>
              <img
                src={doctor.profilePhoto}
                alt={doctor.name}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  objectFit: 'cover',
                  border: '2px solid #ffffff',
                  boxShadow: 'var(--shadow-sm)',
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: '800' }}>{doctor.name}</h4>
                  <span className="badge badge-purple" style={{ fontSize: '0.75rem' }}>
                    {doctor.specialization}
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {doctor.qualifications} &bull; {doctor.hospitalRoom}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Fee</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)' }}>
                  ₹{doctor.consultationFee}
                </div>
              </div>
            </div>

            {/* Form & Slot Picker */}
            <form onSubmit={handleBookingSubmit} style={{ padding: '24px' }}>
              {/* Not Logged In Warning Banner */}
              {!isAuthenticated && (
                <div className="alert alert-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldAlert size={20} />
                    <span>Please log in to finalize your booking.</span>
                  </div>
                  <button
                    type="button"
                    onClick={onNavigateLogin}
                    className="btn btn-primary btn-sm"
                  >
                    Log In
                  </button>
                </div>
              )}

              {/* Error / Conflict Alert */}
              {errorMsg && (
                <div className="alert alert-error" style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontWeight: '700' }}>Booking Notice</div>
                    <div>{errorMsg}</div>
                  </div>
                </div>
              )}

              {/* Slot Picker Component */}
              <SlotPicker
                doctor={doctor}
                selectedDate={selectedDate}
                onDateChange={(d) => {
                  setSelectedDate(d);
                  setSelectedSlot('');
                }}
                selectedSlot={selectedSlot}
                onSlotSelect={(s) => setSelectedSlot(s)}
                refreshTrigger={refreshTrigger}
              />

              {/* Patient Details Sub-form */}
              <div style={{
                marginTop: '24px',
                paddingTop: '20px',
                borderTop: '1px solid var(--border-color)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '16px',
              }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Patient Full Name *</label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="form-input"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="form-input"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Consultation Reason</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="form-select"
                  >
                    <option value="General Consultation">General Consultation</option>
                    <option value="Follow-up Visit">Follow-up Visit</option>
                    <option value="Chest Pain / Heart Checkup">Chest Pain / Heart Checkup</option>
                    <option value="Skin Rash / Acne Assessment">Skin Rash / Acne Assessment</option>
                    <option value="Joint / Back Pain Consultation">Joint / Back Pain Consultation</option>
                    <option value="Child Wellness & Fever">Child Wellness & Fever</option>
                    <option value="Headache & Neurological Query">Headache & Neurological Query</option>
                    <option value="Second Opinion">Second Opinion</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Additional Symptoms / Notes (Optional)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Brief description of symptoms..."
                    className="form-input"
                  />
                </div>
              </div>

              {/* Summary & Submit Button */}
              <div style={{
                marginTop: '24px',
                paddingTop: '20px',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '14px',
              }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Selected Time Slot:
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '800', color: selectedSlot ? 'var(--primary)' : 'var(--text-light)' }}>
                    {selectedSlot ? `${selectedDate} (${selectedSlot})` : 'Please pick a slot above'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={onClose} className="btn btn-ghost">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !selectedSlot || !isAuthenticated}
                    className="btn btn-primary"
                    style={{ padding: '10px 24px', fontWeight: '700' }}
                  >
                    {loading ? 'Confirming with Database...' : 'Confirm Appointment'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
