import React, { useState, useEffect } from 'react';
import { doctorApi } from '../api/api.js';
import { SpecializationFilter } from '../components/SpecializationFilter.jsx';
import { DoctorCard } from '../components/DoctorCard.jsx';
import { Search, Calendar, Filter, XCircle, Stethoscope } from 'lucide-react';

export const DoctorsPage = ({
  initialFilters = {},
  onBookDoctor,
  onSelectDoctor,
}) => {
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [selectedSpec, setSelectedSpec] = useState(initialFilters.specialization || 'All');
  const [search, setSearch] = useState(initialFilters.search || '');
  const [date, setDate] = useState(initialFilters.date || '');
  const [loading, setLoading] = useState(true);

  // Fetch Specializations once
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const res = await doctorApi.getSpecializations();
        if (res.success) setSpecializations(res.specializations || []);
      } catch (err) {
        console.error('Error fetching specializations:', err);
      }
    };
    fetchMeta();
  }, []);

  // Fetch Doctors whenever filters change
  useEffect(() => {
    let isMounted = true;
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const res = await doctorApi.getAll({
          specialization: selectedSpec,
          search,
          date,
        });
        if (isMounted && res.success) {
          setDoctors(res.doctors || []);
        }
      } catch (err) {
        console.error('Error fetching doctors:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDoctors();

    return () => {
      isMounted = false;
    };
  }, [selectedSpec, search, date]);

  const clearFilters = () => {
    setSelectedSpec('All');
    setSearch('');
    setDate('');
  };

  const hasActiveFilters = selectedSpec !== 'All' || search.trim() !== '' || date !== '';

  return (
    <div className="container" style={{ padding: '40px 20px 60px' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <span className="badge badge-blue" style={{ marginBottom: '8px' }}>
          Doctor Directory
        </span>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>
          Find Medical Doctors & Book Appointments
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
          Browse our certified physicians, review consultation fees & schedules, and select your preferred consultation time slot.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="card" style={{
        padding: '20px',
        marginBottom: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        border: '1px solid var(--border-color)',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
          alignItems: 'center',
        }}>
          {/* Search by doctor name */}
          <div style={{ position: 'relative' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by doctor name or qualification..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '38px', margin: 0 }}
            />
          </div>

          {/* Filter by target appointment date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="form-input"
              style={{ margin: 0 }}
              title="Show doctors available on this specific date"
            />
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div>
              <button
                type="button"
                onClick={clearFilters}
                className="btn btn-outline btn-sm"
                style={{ width: '100%', height: '42px' }}
              >
                <XCircle size={16} /> Reset Filters
              </button>
            </div>
          )}
        </div>

        {/* Specialization Filter Pills */}
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px' }}>
            Filter by Specialization:
          </div>
          <SpecializationFilter
            specializations={specializations}
            selected={selectedSpec}
            onSelect={(spec) => setSelectedSpec(spec)}
          />
        </div>
      </div>

      {/* Results Count & Status */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
      }}>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>
          Showing <span style={{ color: 'var(--text-dark)', fontWeight: '800' }}>{doctors.length}</span> doctors
          {selectedSpec !== 'All' && <span> in {selectedSpec}</span>}
          {date && <span> available on {date}</span>}
        </div>
      </div>

      {/* Loading Indicator */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid #bfdbfe',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p style={{ fontWeight: '600' }}>Loading available doctors...</p>
        </div>
      ) : doctors.length === 0 ? (
        <div className="card" style={{
          padding: '60px 20px',
          textAlign: 'center',
          maxWidth: '500px',
          margin: '40px auto',
        }}>
          <Stethoscope size={48} color="var(--text-light)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '8px' }}>
            No Doctors Found
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            We couldn't find any doctors matching your search criteria or schedule date.
          </p>
          <button onClick={clearFilters} className="btn btn-primary btn-sm">
            Reset Filters
          </button>
        </div>
      ) : (
        /* Doctors Grid */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px',
        }}>
          {doctors.map((doctor) => (
            <DoctorCard
              key={doctor._id}
              doctor={doctor}
              onBook={onBookDoctor}
              onSelectDoctor={onSelectDoctor}
            />
          ))}
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
