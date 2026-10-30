import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { appointmentApi } from '../api/api.js';
import { AppointmentReceipt } from '../components/AppointmentReceipt.jsx';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Printer,
  ChevronRight,
  ShieldCheck,
  Stethoscope,
  Trash2,
  AlertTriangle
} from 'lucide-react';

export const PatientDashboard = ({ onNavigate, onBookNew }) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'completed', 'cancelled', 'all'
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [cancelModalAppointment, setCancelModalAppointment] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('Personal reasons / schedule conflict');
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentApi.getMyAppointments('all');
      if (res.success) {
        setAppointments(res.appointments || []);
      }
    } catch (err) {
      console.error('Error fetching patient appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancelConfirm = async () => {
    if (!cancelModalAppointment) return;
    setActionLoading(true);
    try {
      const res = await appointmentApi.cancel(cancelModalAppointment._id, cancellationReason);
      if (res.success) {
        setMessage({ type: 'success', text: 'Appointment cancelled successfully. The slot is now freed up for others.' });
        setCancelModalAppointment(null);
        fetchAppointments();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to cancel appointment.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Filter based on active tab
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const isAppointmentCompleted = (apt) => {
    if (apt.status === 'completed') return true;
    if (apt.status === 'confirmed') {
      const isPastDate = apt.date < todayStr;
      const isTodayPastSlot = apt.date === todayStr && apt.slotEnd && apt.slotEnd <= currentTimeStr;
      return isPastDate || isTodayPastSlot;
    }
    return false;
  };

  const isAppointmentUpcoming = (apt) => {
    if (apt.status !== 'confirmed') return false;
    if (apt.date > todayStr) return true;
    if (apt.date === todayStr) {
      return !apt.slotEnd || apt.slotEnd > currentTimeStr;
    }
    return false;
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'cancelled') return apt.status === 'cancelled';
    if (activeTab === 'completed') return isAppointmentCompleted(apt);
    if (activeTab === 'upcoming') return isAppointmentUpcoming(apt);
    return true;
  });

  const upcomingCount = appointments.filter(isAppointmentUpcoming).length;
  const completedCount = appointments.filter(isAppointmentCompleted).length;
  const cancelledCount = appointments.filter((a) => a.status === 'cancelled').length;

  return (
    <div className="container" style={{ padding: '40px 20px 60px' }}>
      {/* Dashboard Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <span className="badge badge-purple" style={{ marginBottom: '6px' }}>
            Patient Portal
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-dark)' }}>
            Welcome, {user?.name}
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            View and manage your consultation appointments with hospital specialists.
          </p>
        </div>

        <button
          onClick={onBookNew}
          className="btn btn-primary"
          style={{ padding: '10px 22px', fontWeight: '700' }}
        >
          <Stethoscope size={18} /> Book New Appointment
        </button>
      </div>

      {/* Alert Banner if any */}
      {message && (
        <div className={`alert alert-${message.type}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="btn btn-ghost btn-sm" style={{ padding: '2px 8px' }}>
            &times;
          </button>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '12px',
        marginBottom: '24px',
        overflowX: 'auto',
      }}>
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`btn ${activeTab === 'upcoming' ? 'btn-primary' : 'btn-outline'}`}
          style={{ borderRadius: 'var(--radius-full)', padding: '8px 18px', fontSize: '0.88rem' }}
        >
          Upcoming ({upcomingCount})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`btn ${activeTab === 'completed' ? 'btn-primary' : 'btn-outline'}`}
          style={{ borderRadius: 'var(--radius-full)', padding: '8px 18px', fontSize: '0.88rem' }}
        >
          Completed ({completedCount})
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`btn ${activeTab === 'cancelled' ? 'btn-primary' : 'btn-outline'}`}
          style={{ borderRadius: 'var(--radius-full)', padding: '8px 18px', fontSize: '0.88rem' }}
        >
          Cancelled ({cancelledCount})
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-outline'}`}
          style={{ borderRadius: 'var(--radius-full)', padding: '8px 18px', fontSize: '0.88rem' }}
        >
          All Appointments ({appointments.length})
        </button>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div style={{ padding: '50px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid #bfdbfe',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p>Loading your appointments...</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="card" style={{
          padding: '60px 20px',
          textAlign: 'center',
          maxWidth: '520px',
          margin: '30px auto',
        }}>
          <Calendar size={44} color="var(--text-light)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '8px' }}>
            No {activeTab} appointments found
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            {activeTab === 'upcoming'
              ? 'You do not have any upcoming appointments scheduled right now.'
              : `There are no ${activeTab} appointments in your records.`}
          </p>
          <button onClick={onBookNew} className="btn btn-primary btn-sm">
            Find Doctors & Book
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredAppointments.map((apt) => {
            const doc = apt.doctor || {};
            const isCompleted = isAppointmentCompleted(apt);
            const isCancelled = apt.status === 'cancelled';
            const isConfirmed = !isCompleted && !isCancelled && apt.status === 'confirmed';

            return (
              <div
                key={apt._id}
                className="card"
                style={{
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '18px',
                  borderLeft: `5px solid ${isConfirmed ? 'var(--primary)' : isCompleted ? 'var(--success)' : 'var(--danger)'}`,
                }}
              >
                {/* Doctor & Appointment info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '280px' }}>
                  <img
                    src={doc.profilePhoto}
                    alt={doc.name}
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '16px',
                      objectFit: 'cover',
                      border: '2px solid var(--border-color)',
                    }}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&q=80';
                    }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-dark)' }}>
                        {doc.name || 'Hospital Doctor'}
                      </h3>
                      <span className="badge badge-purple" style={{ fontSize: '0.72rem' }}>
                        {doc.specialization}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Appointment ID: <strong>{apt.appointmentId}</strong>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <MapPin size={13} color="var(--primary)" /> {doc.hospitalRoom || 'Main OPD Building'}
                    </div>
                  </div>
                </div>

                {/* Schedule info */}
                <div style={{ minWidth: '180px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-dark)' }}>
                    <Calendar size={16} color="var(--primary)" /> {apt.date}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: '700', color: 'var(--accent-purple)', marginTop: '4px' }}>
                    <Clock size={16} /> {apt.timeSlot}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Reason: {apt.reason || 'General Consultation'}
                  </div>
                </div>

                {/* Status & Fee */}
                <div>
                  <div style={{ marginBottom: '6px' }}>
                    {isConfirmed && <span className="badge badge-blue">Confirmed</span>}
                    {isCompleted && <span className="badge badge-success">Completed</span>}
                    {isCancelled && <span className="badge badge-danger">Cancelled</span>}
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--primary)' }}>
                    ₹{apt.consultationFee}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => setSelectedReceipt(apt)}
                    className="btn btn-outline btn-sm"
                    title="View & Print Official Receipt"
                  >
                    <Printer size={15} /> Receipt
                  </button>

                  {isConfirmed && (
                    <button
                      onClick={() => setCancelModalAppointment(apt)}
                      className="btn btn-danger-outline btn-sm"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancelModalAppointment && (
        <div className="modal-overlay" onClick={() => setCancelModalAppointment(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', padding: '28px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'var(--danger-light)',
              color: 'var(--danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}>
              <AlertTriangle size={26} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '8px' }}>
              Cancel Appointment?
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Are you sure you want to cancel your appointment with <strong>{cancelModalAppointment.doctor?.name}</strong> on <strong>{cancelModalAppointment.date} ({cancelModalAppointment.timeSlot})</strong>?
              Once cancelled, this time slot will be made available for other patients immediately.
            </p>

            <div className="form-group">
              <label className="form-label">Reason for Cancellation (Optional)</label>
              <select
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="form-select"
              >
                <option value="Personal schedule conflict">Personal schedule conflict</option>
                <option value="Health improved / recovered">Health improved / recovered</option>
                <option value="Booking error / wrong date">Booking error / wrong date</option>
                <option value="Rescheduling with another doctor">Rescheduling with another doctor</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => setCancelModalAppointment(null)}
                className="btn btn-ghost"
              >
                Keep Appointment
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleCancelConfirm}
                className="btn btn-danger"
              >
                {actionLoading ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {selectedReceipt && (
        <div className="modal-overlay" onClick={() => setSelectedReceipt(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <AppointmentReceipt
              appointment={selectedReceipt}
              onClose={() => setSelectedReceipt(null)}
            />
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
