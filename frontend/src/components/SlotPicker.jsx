import React, { useState, useEffect } from 'react';
import { doctorApi } from '../api/api.js';
import { Calendar as CalendarIcon, Clock, AlertCircle, Check, Coffee } from 'lucide-react';

export const SlotPicker = ({
  doctor,
  selectedDate,
  onDateChange,
  selectedSlot,
  onSlotSelect,
  refreshTrigger = 0,
}) => {
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper: Format today to YYYY-MM-DD
  const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // Helper: Quick date shortcut options
  const getQuickDates = () => {
    const list = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const str = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
      const label = `${dayName}, ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      list.push({ dateStr: str, label });
    }
    return list;
  };

  const quickDates = getQuickDates();

  useEffect(() => {
    if (!doctor?._id || !selectedDate) return;

    let isMounted = true;
    const fetchAvailability = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await doctorApi.getAvailability(doctor._id, selectedDate);
        if (isMounted) {
          if (res.success && res.data) {
            setAvailability(res.data);
          } else {
            setError(res.message || 'Could not fetch slots.');
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Error loading doctor availability.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAvailability();

    return () => {
      isMounted = false;
    };
  }, [doctor?._id, selectedDate, refreshTrigger]);

  const todayStr = getTodayStr();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Date Selection Section */}
      <div>
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CalendarIcon size={16} color="var(--primary)" />
          <span>Select Appointment Date</span>
        </label>

        {/* Quick Date Chips */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '10px',
          marginBottom: '10px',
        }}>
          {quickDates.map((q) => {
            const isSelected = selectedDate === q.dateStr;
            return (
              <button
                key={q.dateStr}
                type="button"
                onClick={() => onDateChange(q.dateStr)}
                className={`btn ${isSelected ? 'btn-primary' : 'btn-outline'}`}
                style={{
                  fontSize: '0.82rem',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  whiteSpace: 'nowrap',
                }}
              >
                {q.label}
              </button>
            );
          })}
        </div>

        {/* Custom Date Input (prevents past dates with min={todayStr}) */}
        <div style={{ position: 'relative' }}>
          <input
            type="date"
            min={todayStr}
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="form-input"
            style={{ fontWeight: '600' }}
          />
        </div>
      </div>

      {/* Slots Section */}
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
        }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
            <Clock size={16} color="var(--accent-purple)" />
            <span>Available Time Slots ({doctor?.appointmentDuration || 30} mins)</span>
          </label>

          {availability && (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {availability.availableCount} of {availability.totalSlots} slots available
            </span>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{
            padding: '30px',
            textAlign: 'center',
            background: 'var(--bg-main)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              border: '3px solid #bfdbfe',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 10px',
            }} />
            Checking Dr. {doctor?.name}'s real-time schedule...
          </div>
        )}

        {/* Non-working / Leave / Holiday Reason */}
        {!loading && availability && !availability.isAvailable && availability.reason && (
          <div className="alert alert-info" style={{ marginTop: '6px' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: '700' }}>Doctor Unavailable on {selectedDate}</div>
              <div style={{ fontSize: '0.84rem' }}>{availability.reason}</div>
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Slots Grid */}
        {!loading && availability && availability.allSlots && availability.allSlots.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))',
            gap: '10px',
            marginTop: '8px',
          }}>
            {availability.allSlots.map((slot) => {
              const isSelected = selectedSlot === slot.timeSlot;

              if (slot.isBreak) {
                return (
                  <div
                    key={slot.timeSlot}
                    title={`${slot.breakReason || 'Break Time'} (${slot.displayLabel})`}
                    style={{
                      padding: '10px 8px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px dashed #cbd5e1',
                      color: 'var(--text-light)',
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      cursor: 'not-allowed',
                      userSelect: 'none',
                    }}
                  >
                    <Coffee size={13} /> {slot.breakReason || 'Break'}
                  </div>
                );
              }

              if (slot.isBooked) {
                return (
                  <div
                    key={slot.timeSlot}
                    title="This time slot is already booked"
                    style={{
                      padding: '10px 8px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                      color: '#ef4444',
                      fontSize: '0.8rem',
                      textAlign: 'center',
                      cursor: 'not-allowed',
                      userSelect: 'none',
                      opacity: 0.7,
                      textDecoration: 'line-through',
                    }}
                  >
                    {slot.displayLabel.split(' - ')[0]} (Booked)
                  </div>
                );
              }

              if (slot.isPastSlot) {
                return (
                  <div
                    key={slot.timeSlot}
                    title="This time has passed for today"
                    style={{
                      padding: '10px 8px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-main)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-light)',
                      fontSize: '0.8rem',
                      textAlign: 'center',
                      cursor: 'not-allowed',
                      opacity: 0.5,
                    }}
                  >
                    {slot.displayLabel.split(' - ')[0]} (Past)
                  </div>
                );
              }

              // Available slot
              return (
                <button
                  key={slot.timeSlot}
                  type="button"
                  onClick={() => onSlotSelect(slot.timeSlot)}
                  style={{
                    padding: '10px 8px',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected ? '2px solid var(--primary)' : '1px solid #bfdbfe',
                    backgroundColor: isSelected ? 'var(--primary)' : 'var(--primary-light)',
                    color: isSelected ? '#ffffff' : 'var(--primary)',
                    fontWeight: isSelected ? '700' : '600',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    transition: 'var(--transition)',
                    boxShadow: isSelected ? '0 2px 8px rgba(37,99,235,0.3)' : 'none',
                  }}
                >
                  {isSelected && <Check size={14} />}
                  {slot.displayLabel}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '14px',
        fontSize: '0.76rem',
        color: 'var(--text-muted)',
        borderTop: '1px solid var(--border-color)',
        paddingTop: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--primary-light)', border: '1px solid #bfdbfe' }} />
          <span>Available</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--primary)' }} />
          <span>Selected</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#fef2f2', border: '1px solid #fecaca' }} />
          <span>Booked (Unavailable)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--bg-subtle)', border: '1px dashed #cbd5e1' }} />
          <span>Break / Lunch</span>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
