import React from 'react';
import { Activity, Phone, Mail, MapPin, Clock, ShieldCheck } from 'lucide-react';

export const Footer = ({ onNavigate }) => {
  return (
    <footer style={{
      backgroundColor: '#ffffff',
      borderTop: '1px solid var(--border-color)',
      marginTop: '60px',
      padding: '50px 0 24px',
      color: 'var(--text-muted)',
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '36px',
          marginBottom: '40px',
        }}>
          {/* Brand & Mission */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent-purple) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}>
                <Activity size={20} />
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-dark)' }}>
                PulseCare<span style={{ color: 'var(--primary)' }}>+</span>
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '16px' }}>
              Premier multispecialty healthcare hospital providing seamless appointment scheduling, top-tier medical specialists, and compassionate patient care.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '600', fontSize: '0.88rem' }}>
              <ShieldCheck size={18} /> NABH Accredited & Certified
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: 'var(--text-dark)', fontWeight: '700', marginBottom: '16px', fontSize: '1rem' }}>
              Quick Navigation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
              <li>
                <a href="#home" onClick={(e) => { e.preventDefault(); onNavigate?.('home'); }} style={{ cursor: 'pointer' }}>
                  Hospital Home
                </a>
              </li>
              <li>
                <a href="#doctors" onClick={(e) => { e.preventDefault(); onNavigate?.('doctors'); }} style={{ cursor: 'pointer' }}>
                  Find Doctors & Specialists
                </a>
              </li>
              <li>
                <a href="#appointments" onClick={(e) => { e.preventDefault(); onNavigate?.('patient-dashboard'); }} style={{ cursor: 'pointer' }}>
                  Manage Appointments
                </a>
              </li>
            </ul>
          </div>

          {/* Specializations */}
          <div>
            <h4 style={{ color: 'var(--text-dark)', fontWeight: '700', marginBottom: '16px', fontSize: '1rem' }}>
              Key Specializations
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {['Cardiology', 'Dermatology', 'Orthopedics', 'Pediatrics', 'Neurology', 'General Medicine'].map((s) => (
                <span key={s} className="badge badge-purple" style={{ fontSize: '0.78rem' }}>
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Emergency & Helpline */}
          <div>
            <h4 style={{ color: 'var(--text-dark)', fontWeight: '700', marginBottom: '16px', fontSize: '1rem' }}>
              Hospital Contact & Helpline
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem' }}>
              <div style={{
                background: 'var(--danger-light)',
                border: '1px solid #fecaca',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                color: '#991b1b',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontWeight: '700',
              }}>
                <Phone size={18} /> 24/7 Emergency: 1800-PULSE-CARE
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} color="var(--primary)" /> 450 Health Avenue, Medical City
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={16} color="var(--primary)" /> appointments@pulsecare.hospital
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color="var(--primary)" /> OPD Timings: Mon - Sat 08:00 - 20:00
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.82rem',
        }}>
          <div>
            &copy; {new Date().getFullYear()} PulseCare Medical Center. All rights reserved. Concurrency-Safe Hospital System.
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>Privacy Policy</span>
            <span>Terms of Healthcare Service</span>
            <span>Cancellation Rules</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
