import React from 'react';
import { Star, Clock, Calendar, MapPin, Award, CheckCircle2 } from 'lucide-react';

export const DoctorCard = ({ doctor, onBook, onSelectDoctor }) => {
  return (
    <div className="card card-hover" style={{
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      border: '1px solid var(--border-color)',
    }}>
      {/* Top Banner & Photo */}
      <div style={{
        position: 'relative',
        height: '140px',
        background: 'linear-gradient(135deg, #dbeafe 0%, #ede9fe 100%)',
      }}>
        {/* Rating Badge */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: '#ffffff',
          borderRadius: 'var(--radius-full)',
          padding: '4px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          boxShadow: 'var(--shadow-sm)',
          fontSize: '0.8rem',
          fontWeight: '700',
          color: '#d97706',
        }}>
          <Star size={14} fill="#f59e0b" color="#f59e0b" />
          {doctor.rating || '4.8'}
        </div>

        {/* Doctor Photo */}
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '20px',
          width: '84px',
          height: '84px',
          borderRadius: '20px',
          overflow: 'hidden',
          border: '4px solid #ffffff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          backgroundColor: '#ffffff',
        }}>
          <img
            src={doctor.profilePhoto}
            alt={doctor.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&q=80';
            }}
          />
        </div>
      </div>

      {/* Doctor Info Body */}
      <div style={{ padding: '40px 20px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
          <div>
            <span className="badge badge-purple" style={{ marginBottom: '6px' }}>
              {doctor.specialization}
            </span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-dark)' }}>
              {doctor.name}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {doctor.qualifications}
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px',
          padding: '12px',
          background: 'var(--bg-main)',
          borderRadius: 'var(--radius-md)',
          margin: '12px 0 16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={16} color="var(--primary)" />
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Experience</div>
              <div style={{ fontSize: '0.88rem', fontWeight: '700' }}>{doctor.experienceYears}+ Years</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} color="var(--accent-purple)" />
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Duration</div>
              <div style={{ fontSize: '0.88rem', fontWeight: '700' }}>{doctor.appointmentDuration} Mins</div>
            </div>
          </div>
        </div>

        {/* Availability & Location summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} color="var(--primary)" />
            <span>Available: {doctor.availableDays?.slice(0, 4).join(', ')}{doctor.availableDays?.length > 4 ? '...' : ''}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={14} color="var(--primary)" />
            <span>{doctor.hospitalRoom || 'Main OPD Consultation Wing'}</span>
          </div>
        </div>

        {/* Footer: Fee & Action */}
        <div style={{
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '16px',
        }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Consultation Fee</span>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary)' }}>
              ₹{doctor.consultationFee}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {onSelectDoctor && (
              <button
                onClick={() => onSelectDoctor(doctor)}
                className="btn btn-outline btn-sm"
              >
                Profile
              </button>
            )}
            <button
              onClick={() => onBook(doctor)}
              className="btn btn-primary btn-sm"
              style={{ fontWeight: '700' }}
            >
              Book Slot
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
