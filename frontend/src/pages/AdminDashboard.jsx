import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { adminApi, doctorApi, appointmentApi } from '../api/api.js';
import {
  Users,
  Calendar,
  CheckCircle2,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  ShieldCheck,
  Search,
  Clock,
  MapPin,
  CalendarDays,
  AlertCircle,
  X,
  RefreshCw,
  Award
} from 'lucide-react';

export const AdminDashboard = ({ onNavigate }) => {
  const { user, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState('doctors'); // 'doctors' or 'appointments'
  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  // Doctor Form Modal
  const [doctorModalOpen, setDoctorModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    email: '',
    phone: '',
    profilePhoto: '',
    specialization: 'Cardiology',
    qualifications: 'MBBS, MD',
    experienceYears: 10,
    consultationFee: 750,
    appointmentDuration: 30,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    dailyWorkingHours: { start: '09:00', end: '17:00' },
    breakTimes: [{ start: '13:00', end: '14:00', label: 'Lunch Break' }],
    about: '',
    hospitalRoom: 'Consultation Wing, Room 101',
  });

  // Leave / Holiday Modal
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [selectedDoctorForLeave, setSelectedDoctorForLeave] = useState(null);
  const [leaveDate, setLeaveDate] = useState('');
  const [isHospitalHoliday, setIsHospitalHoliday] = useState(false);

  // Appointments Filter
  const [appointmentFilter, setAppointmentFilter] = useState({
    status: 'all',
    search: '',
    date: '',
  });

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, docsRes, aptsRes] = await Promise.all([
        adminApi.getStats(),
        doctorApi.getAll(),
        appointmentApi.getAllAdmin(appointmentFilter),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (docsRes.success) setDoctors(docsRes.doctors || []);
      if (aptsRes.success) setAppointments(aptsRes.appointments || []);
    } catch (err) {
      console.error('Error loading admin data:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to load administrative records.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin, appointmentFilter]);

  if (!isAdmin) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '480px', margin: '0 auto', padding: '40px' }}>
          <AlertCircle size={48} color="var(--danger)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '8px' }}>
            Access Restricted
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            You must be logged in as a Hospital Administrator to view this portal.
          </p>
          <button onClick={() => onNavigate('login')} className="btn btn-primary">
            Go to Admin Login
          </button>
        </div>
      </div>
    );
  }

  // Handle Doctor Add / Edit Submit
  const handleDoctorSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDoctor) {
        await doctorApi.updateDoctor(editingDoctor._id, doctorForm);
        setMessage({ type: 'success', text: `Dr. ${doctorForm.name} updated successfully.` });
      } else {
        await doctorApi.createDoctor(doctorForm);
        setMessage({ type: 'success', text: `Dr. ${doctorForm.name} created successfully.` });
      }
      setDoctorModalOpen(false);
      setEditingDoctor(null);
      fetchAdminData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Doctor save operation failed.' });
    }
  };

  // Open Edit Doctor
  const handleEditDoctor = (doc) => {
    setEditingDoctor(doc);
    setDoctorForm({
      name: doc.name,
      email: doc.email,
      phone: doc.phone,
      profilePhoto: doc.profilePhoto,
      specialization: doc.specialization,
      qualifications: doc.qualifications,
      experienceYears: doc.experienceYears,
      consultationFee: doc.consultationFee,
      appointmentDuration: doc.appointmentDuration,
      availableDays: doc.availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      dailyWorkingHours: doc.dailyWorkingHours || { start: '09:00', end: '17:00' },
      breakTimes: doc.breakTimes || [{ start: '13:00', end: '14:00', label: 'Lunch Break' }],
      about: doc.about || '',
      hospitalRoom: doc.hospitalRoom || 'Consultation Wing',
    });
    setDoctorModalOpen(true);
  };

  // Delete Doctor
  const handleDeleteDoctor = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove Dr. ${name}?`)) return;
    try {
      await doctorApi.deleteDoctor(id);
      setMessage({ type: 'success', text: `Dr. ${name} removed.` });
      fetchAdminData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete doctor.' });
    }
  };

  // Handle Add Leave
  const handleAddLeaveSubmit = async (e) => {
    e.preventDefault();
    if (!leaveDate || !selectedDoctorForLeave) return;
    try {
      await doctorApi.addLeave(selectedDoctorForLeave._id, {
        date: leaveDate,
        isHoliday: isHospitalHoliday,
      });
      setMessage({
        type: 'success',
        text: `Marked ${leaveDate} as ${isHospitalHoliday ? 'Holiday' : 'Leave'} for Dr. ${selectedDoctorForLeave.name}. Slots on this day are now blocked!`,
      });
      setLeaveModalOpen(false);
      setLeaveDate('');
      fetchAdminData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to add leave date.' });
    }
  };

  // Update Appointment Status
  const handleStatusChange = async (aptId, newStatus) => {
    try {
      await appointmentApi.updateStatus(aptId, { status: newStatus });
      setMessage({ type: 'success', text: `Appointment marked as ${newStatus}.` });
      fetchAdminData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Status update failed.' });
    }
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="container" style={{ padding: '40px 20px 80px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <span className="badge badge-purple" style={{ marginBottom: '6px' }}>
            <ShieldCheck size={14} /> Hospital Administration
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-dark)' }}>
            Admin Control Center
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Manage medical doctors, adjust schedules and holidays, review hospital-wide bookings.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="btn btn-outline btn-sm"
          style={{ gap: '6px' }}
        >
          <RefreshCw size={15} /> Refresh Data
        </button>
      </div>

      {/* Alert Banner */}
      {message && (
        <div className={`alert alert-${message.type}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="btn btn-ghost btn-sm" style={{ padding: '2px 8px' }}>
            &times;
          </button>
        </div>
      )}

      {/* Metrics Cards */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}>
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>TOTAL DOCTORS</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary)', marginTop: '4px' }}>
              {stats.totalDoctors}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--success)' }}>
              {stats.activeDoctors} Active & Consulting
            </div>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>TOTAL PATIENTS</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--accent-purple)', marginTop: '4px' }}>
              {stats.totalPatients}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Registered accounts
            </div>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>UPCOMING APPOINTMENTS</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0284c7', marginTop: '4px' }}>
              {stats.upcomingCount}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Out of {stats.totalAppointments} total
            </div>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>ESTIMATED REVENUE</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--success)', marginTop: '4px' }}>
              ₹{stats.totalRevenue?.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              From confirmed OPD visits
            </div>
          </div>
        </div>
      )}

      {/* Main Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '24px',
      }}>
        <button
          onClick={() => setActiveTab('doctors')}
          className={`btn ${activeTab === 'doctors' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', padding: '10px 20px' }}
        >
          Doctors & Schedules ({doctors.length})
        </button>
        <button
          onClick={() => setActiveTab('appointments')}
          className={`btn ${activeTab === 'appointments' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', padding: '10px 20px' }}
        >
          Hospital Appointments ({appointments.length})
        </button>
      </div>

      {/* Tab 1: Doctors Management */}
      {activeTab === 'doctors' && (
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>
              Registered Medical Specialists
            </h2>
            <button
              onClick={() => {
                setEditingDoctor(null);
                setDoctorForm({
                  name: '',
                  email: '',
                  phone: '',
                  profilePhoto: '',
                  specialization: 'Cardiology',
                  qualifications: 'MBBS, MD',
                  experienceYears: 10,
                  consultationFee: 750,
                  appointmentDuration: 30,
                  availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                  dailyWorkingHours: { start: '09:00', end: '17:00' },
                  breakTimes: [{ start: '13:00', end: '14:00', label: 'Lunch Break' }],
                  about: '',
                  hospitalRoom: 'Consultation Wing, Room 101',
                });
                setDoctorModalOpen(true);
              }}
              className="btn btn-primary btn-sm"
              style={{ fontWeight: '700' }}
            >
              <Plus size={16} /> Add New Doctor Profile
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--border-color)',
            }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-main)', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>DOCTOR</th>
                  <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>SPECIALIZATION</th>
                  <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>FEE / DURATION</th>
                  <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>WORKING HOURS</th>
                  <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>LEAVES / HOLIDAYS</th>
                  <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doc) => (
                  <tr key={doc._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    {/* Doctor Info */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={doc.profilePhoto}
                          alt={doc.name}
                          style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: '700', color: 'var(--text-dark)' }}>{doc.name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{doc.doctorId} &bull; {doc.qualifications}</div>
                        </div>
                      </div>
                    </td>

                    {/* Specialization */}
                    <td style={{ padding: '14px 16px' }}>
                      <span className="badge badge-purple">{doc.specialization}</span>
                    </td>

                    {/* Fee / Duration */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: '700', color: 'var(--primary)' }}>₹{doc.consultationFee}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{doc.appointmentDuration} Mins slot</div>
                    </td>

                    {/* Working Hours */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: '0.86rem', fontWeight: '600' }}>
                        {doc.dailyWorkingHours?.start} - {doc.dailyWorkingHours?.end}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        {doc.availableDays?.length} days/week
                      </div>
                    </td>

                    {/* Leaves & Holidays */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {doc.leaveDates?.length > 0 ? `${doc.leaveDates.length} Leave date(s)` : 'No leaves recorded'}
                      </div>
                      <button
                        onClick={() => {
                          setSelectedDoctorForLeave(doc);
                          setLeaveModalOpen(true);
                        }}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '4px 8px', fontSize: '0.75rem', marginTop: '4px' }}
                      >
                        <CalendarDays size={12} /> Add Leave / Holiday
                      </button>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => handleEditDoctor(doc)}
                          className="btn btn-ghost btn-sm"
                          title="Edit profile & schedule"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteDoctor(doc._id, doc.name)}
                          className="btn btn-danger-outline btn-sm"
                          title="Delete doctor"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: All Appointments Management */}
      {activeTab === 'appointments' && (
        <div>
          {/* Filters Bar */}
          <div className="card" style={{ padding: '16px', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search patient, doctor, or ID..."
                value={appointmentFilter.search}
                onChange={(e) => setAppointmentFilter({ ...appointmentFilter, search: e.target.value })}
                className="form-input"
                style={{ paddingLeft: '34px', margin: 0, fontSize: '0.88rem' }}
              />
            </div>

            <select
              value={appointmentFilter.status}
              onChange={(e) => setAppointmentFilter({ ...appointmentFilter, status: e.target.value })}
              className="form-select"
              style={{ width: '160px', margin: 0, fontSize: '0.88rem' }}
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <input
              type="date"
              value={appointmentFilter.date}
              onChange={(e) => setAppointmentFilter({ ...appointmentFilter, date: e.target.value })}
              className="form-input"
              style={{ width: '160px', margin: 0, fontSize: '0.88rem' }}
            />
          </div>

          {/* Appointments Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--border-color)',
            }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-main)', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>APPT ID</th>
                  <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>PATIENT</th>
                  <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>DOCTOR</th>
                  <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>SCHEDULE</th>
                  <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>FEE</th>
                  <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>STATUS</th>
                  <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => (
                  <tr key={apt._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: '700', fontSize: '0.84rem' }}>
                      {apt.appointmentId}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: '700' }}>{apt.patientName}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{apt.patientPhone}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: '700' }}>{apt.doctor?.name || 'Doctor'}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--accent-purple)' }}>{apt.doctor?.specialization}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: '600' }}>{apt.date}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: '700' }}>{apt.timeSlot}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: '700' }}>
                      ₹{apt.consultationFee}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {apt.status === 'confirmed' && (
                        apt.date < new Date().toISOString().split('T')[0] ? (
                          <span className="badge badge-success">Completed</span>
                        ) : (
                          <span className="badge badge-blue">Confirmed</span>
                        )
                      )}
                      {apt.status === 'completed' && <span className="badge badge-success">Completed</span>}
                      {apt.status === 'cancelled' && <span className="badge badge-danger">Cancelled</span>}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      {apt.status === 'confirmed' && (
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            onClick={() => handleStatusChange(apt._id, 'completed')}
                            className="btn btn-outline btn-sm"
                            title="Mark appointment as completed"
                          >
                            <CheckCircle2 size={14} color="var(--success)" /> Complete
                          </button>
                          <button
                            onClick={() => handleStatusChange(apt._id, 'cancelled')}
                            className="btn btn-danger-outline btn-sm"
                            title="Cancel appointment"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Doctor Modal */}
      {doctorModalOpen && (
        <div className="modal-overlay" onClick={() => setDoctorModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800' }}>
                {editingDoctor ? 'Edit Doctor Profile' : 'Add New Doctor Profile'}
              </h3>
              <button onClick={() => setDoctorModalOpen(false)} className="btn btn-ghost" style={{ padding: '6px' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleDoctorSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Doctor Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Ramesh Kumar"
                    value={doctorForm.name}
                    onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="doctor@hospital.com"
                    value={doctorForm.email}
                    onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={doctorForm.phone}
                    onChange={(e) => setDoctorForm({ ...doctorForm, phone: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Specialization *</label>
                  <select
                    value={doctorForm.specialization}
                    onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })}
                    className="form-select"
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Neurology">Neurology</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Gynecology">Gynecology</option>
                    <option value="Ophthalmology">Ophthalmology</option>
                    <option value="ENT">ENT</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Qualifications *</label>
                  <input
                    type="text"
                    required
                    placeholder="MBBS, MD, DM"
                    value={doctorForm.qualifications}
                    onChange={(e) => setDoctorForm({ ...doctorForm, qualifications: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Experience (Years) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={doctorForm.experienceYears}
                    onChange={(e) => setDoctorForm({ ...doctorForm, experienceYears: Number(e.target.value) })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Consultation Fee (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={doctorForm.consultationFee}
                    onChange={(e) => setDoctorForm({ ...doctorForm, consultationFee: Number(e.target.value) })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Appointment Slot Duration *</label>
                  <select
                    value={doctorForm.appointmentDuration}
                    onChange={(e) => setDoctorForm({ ...doctorForm, appointmentDuration: Number(e.target.value) })}
                    className="form-select"
                  >
                    <option value={15}>15 Minutes per Slot</option>
                    <option value={30}>30 Minutes per Slot</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Work Shift Start (HH:MM)</label>
                  <input
                    type="time"
                    value={doctorForm.dailyWorkingHours.start}
                    onChange={(e) => setDoctorForm({
                      ...doctorForm,
                      dailyWorkingHours: { ...doctorForm.dailyWorkingHours, start: e.target.value },
                    })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Work Shift End (HH:MM)</label>
                  <input
                    type="time"
                    value={doctorForm.dailyWorkingHours.end}
                    onChange={(e) => setDoctorForm({
                      ...doctorForm,
                      dailyWorkingHours: { ...doctorForm.dailyWorkingHours, end: e.target.value },
                    })}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Available Days Checkboxes */}
              <div style={{ marginTop: '16px' }}>
                <label className="form-label">Available Days of the Week</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {daysOfWeek.map((day) => {
                    const checked = doctorForm.availableDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          const updated = checked
                            ? doctorForm.availableDays.filter((d) => d !== day)
                            : [...doctorForm.availableDays, day];
                          setDoctorForm({ ...doctorForm, availableDays: updated });
                        }}
                        className={`btn ${checked ? 'btn-primary' : 'btn-outline'} btn-sm`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button type="button" onClick={() => setDoctorModalOpen(false)} className="btn btn-ghost">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>
                  {editingDoctor ? 'Save Changes' : 'Create Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leave & Holiday Modal */}
      {leaveModalOpen && selectedDoctorForLeave && (
        <div className="modal-overlay" onClick={() => setLeaveModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>
                Manage Leave / Holiday
              </h3>
              <button onClick={() => setLeaveModalOpen(false)} className="btn btn-ghost" style={{ padding: '6px' }}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Add a leave date for <strong>Dr. {selectedDoctorForLeave.name}</strong>. On this date, all appointment slots will be blocked from patient booking.
            </p>

            <form onSubmit={handleAddLeaveSubmit}>
              <div className="form-group">
                <label className="form-label">Select Date (YYYY-MM-DD)</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={leaveDate}
                  onChange={(e) => setLeaveDate(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <input
                  type="checkbox"
                  id="isHol"
                  checked={isHospitalHoliday}
                  onChange={(e) => setIsHospitalHoliday(e.target.checked)}
                />
                <label htmlFor="isHol" style={{ fontSize: '0.88rem', fontWeight: '600' }}>
                  Hospital-wide Holiday (rather than individual leave)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setLeaveModalOpen(false)} className="btn btn-ghost">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Leave Date
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
