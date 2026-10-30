import React, { useState, useEffect } from 'react';
import { doctorApi } from '../api/api.js';
import { SpecializationFilter } from '../components/SpecializationFilter.jsx';
import { DoctorCard } from '../components/DoctorCard.jsx';
import {
  Search,
  Calendar,
  ShieldCheck,
  Clock,
  HeartHandshake,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Users,
  Award,
  PhoneCall
} from 'lucide-react';

export const HomePage = ({ onNavigate, onBookDoctor, onSelectDoctor }) => {
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [selectedSpec, setSelectedSpec] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [docsRes, specsRes] = await Promise.all([
          doctorApi.getAll(),
          doctorApi.getSpecializations(),
        ]);
        if (docsRes.success) setDoctors(docsRes.doctors || []);
        if (specsRes.success) setSpecializations(specsRes.specializations || []);
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onNavigate('doctors', { specialization: selectedSpec, search: searchQuery, date: selectedDate });
  };

  const filteredFeaturedDoctors = doctors
    .filter((doc) => selectedSpec === 'All' || doc.specialization === selectedSpec)
    .slice(0, 3);

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #eff6ff 0%, #f5f3ff 60%, #ffffff 100%)',
        borderBottom: '1px solid var(--border-color)',
        padding: '60px 0 70px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle decorative background circles */}
        <div style={{
          position: 'absolute',
          top: '-80px',
          right: '-80px',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'rgba(124, 58, 237, 0.06)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-60px',
          left: '-60px',
          width: '260px',
          height: '260px',
          borderRadius: '50%',
          background: 'rgba(37, 99, 235, 0.05)',
          pointerEvents: 'none',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center' }}>
            {/* Accreditation Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#ffffff',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid #bfdbfe',
              boxShadow: 'var(--shadow-sm)',
              fontSize: '0.82rem',
              fontWeight: '700',
              color: 'var(--primary)',
              marginBottom: '20px',
            }}>
              <ShieldCheck size={16} /> NABH Accredited Multispecialty Hospital
            </div>

            {/* Headline */}
            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 3.2rem)',
              fontWeight: '800',
              lineHeight: 1.15,
              color: 'var(--text-dark)',
              letterSpacing: '-0.025em',
              marginBottom: '18px',
            }}>
              Consult Leading Doctors with <span style={{
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent-purple) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>Guaranteed Zero Wait</span>
            </h1>

            <p style={{
              fontSize: 'clamp(1rem, 2vw, 1.15rem)',
              color: 'var(--text-muted)',
              marginBottom: '32px',
              lineHeight: 1.6,
            }}>
              Select verified specialists, view verified real-time availability slots, and book your appointment with instant concurrency-safe confirmation.
            </p>

            {/* Quick Search Card */}
            <form onSubmit={handleSearchSubmit} className="card" style={{
              padding: '16px',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr)) auto',
              gap: '12px',
              alignItems: 'center',
              backgroundColor: '#ffffff',
            }}>
              {/* Doctor Search Input */}
              <div style={{ position: 'relative' }}>
                <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Doctor name, symptom..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '38px', margin: 0 }}
                />
              </div>

              {/* Specialization Select */}
              <div>
                <select
                  value={selectedSpec}
                  onChange={(e) => setSelectedSpec(e.target.value)}
                  className="form-select"
                  style={{ margin: 0 }}
                >
                  <option value="All">All Specializations</option>
                  {specializations.map((s) => (
                    <option key={s.name} value={s.name}>
                      {s.name} ({s.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Input */}
              <div style={{ position: 'relative' }}>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="form-input"
                  style={{ margin: 0 }}
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '12px 24px', fontWeight: '700', height: '100%' }}
              >
                Search Slots <ArrowRight size={16} />
              </button>
            </form>

            {/* Trust Highlights */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '24px',
              marginTop: '28px',
              fontSize: '0.86rem',
              color: 'var(--text-muted)',
              fontWeight: '600',
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} color="var(--success)" /> 100% Concurrency Safe
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} color="var(--success)" /> Verified Top Doctors
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} color="var(--success)" /> Instant Receipt & SMS/Email
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Hospital Metrics Bar */}
      <section style={{ backgroundColor: '#ffffff', borderBottom: '1px solid var(--border-color)', padding: '24px 0' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            textAlign: 'center',
          }}>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary)' }}>25+</div>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>Specialist Doctors</div>
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--accent-purple)' }}>15,000+</div>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>Satisfied Patients</div>
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--success)' }}>99.8%</div>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>On-Time Consultations</div>
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#ea580c' }}>24/7</div>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>Emergency Trauma Center</div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialization Section */}
      <section style={{ padding: '60px 0 40px' }}>
        <div className="container">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            <div>
              <span className="badge badge-purple" style={{ marginBottom: '8px' }}>
                Departments
              </span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-dark)' }}>
                Explore Medical Specializations
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Filter doctors by healthcare specialty and view current available slots.
              </p>
            </div>

            <button
              onClick={() => onNavigate('doctors')}
              className="btn btn-outline"
              style={{ fontSize: '0.88rem' }}
            >
              View All Doctors <ArrowRight size={15} />
            </button>
          </div>

          <SpecializationFilter
            specializations={specializations}
            selected={selectedSpec}
            onSelect={(spec) => setSelectedSpec(spec)}
          />

          {/* Featured Doctors Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
            marginTop: '30px',
          }}>
            {filteredFeaturedDoctors.map((doc) => (
              <DoctorCard
                key={doc._id}
                doctor={doc}
                onBook={onBookDoctor}
                onSelectDoctor={onSelectDoctor}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose PulseCare Banner */}
      <section style={{
        background: 'linear-gradient(135deg, #ffffff 0%, var(--bg-main) 100%)',
        borderTop: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)',
        padding: '60px 0',
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 40px' }}>
            <span className="badge badge-blue" style={{ marginBottom: '8px' }}>
              Hospital Excellence
            </span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-dark)' }}>
              Modern Healthcare Designed for You
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              We eliminate chaotic waiting rooms with modern automated doctor schedules.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px',
          }}>
            <div className="card" style={{ padding: '24px', border: '1px solid var(--border-color)' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}>
                <Clock size={24} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px' }}>Real-Time Availability</h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                Slots refresh instantly. When an appointment is booked or cancelled, the schedule updates right before your eyes.
              </p>
            </div>

            <div className="card" style={{ padding: '24px', border: '1px solid var(--border-color)' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'var(--accent-purple-light)',
                color: 'var(--accent-purple)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}>
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px' }}>Zero Double-Booking</h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                Database-level concurrency locks ensure that two patients can never be double-booked for the same doctor slot.
              </p>
            </div>

            <div className="card" style={{ padding: '24px', border: '1px solid var(--border-color)' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'var(--success-light)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}>
                <HeartHandshake size={24} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px' }}>Seamless Patient Control</h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                Patients can access their personal dashboards, download confirmation receipts, and manage cancellations with one click.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
