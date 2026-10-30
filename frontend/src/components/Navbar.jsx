import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Activity, Calendar, ShieldCheck, User as UserIcon, LogOut, Menu, X, Stethoscope } from 'lucide-react';

export const Navbar = ({ currentView, setCurrentView }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = (view) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '74px',
      }}>
        {/* Hospital Brand Logo */}
        <div
          onClick={() => navigate('home')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
          }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent-purple) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 10px rgba(37, 99, 235, 0.25)',
          }}>
            <Activity size={24} />
          </div>
          <div>
            <div style={{
              fontSize: '1.25rem',
              fontWeight: '800',
              letterSpacing: '-0.02em',
              color: 'var(--text-dark)',
              lineHeight: 1.1,
            }}>
              PulseCare<span style={{ color: 'var(--primary)' }}>+</span>
            </div>
            <div style={{
              fontSize: '0.72rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--accent-purple)',
            }}>
              Medical Center & Hospital
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav style={{
          display: 'none',
          gap: '8px',
          alignItems: 'center',
        }} className="desktop-nav">
          <button
            onClick={() => navigate('home')}
            className={`btn ${currentView === 'home' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.9rem', padding: '8px 16px' }}
          >
            Home
          </button>
          <button
            onClick={() => navigate('doctors')}
            className={`btn ${currentView === 'doctors' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.9rem', padding: '8px 16px' }}
          >
            <Stethoscope size={16} /> Find Doctors
          </button>

          {isAuthenticated && (
            <button
              onClick={() => navigate('patient-dashboard')}
              className={`btn ${currentView === 'patient-dashboard' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.9rem', padding: '8px 16px' }}
            >
              <Calendar size={16} /> My Appointments
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => navigate('admin-dashboard')}
              className={`btn ${currentView === 'admin-dashboard' ? 'btn-purple' : 'btn-ghost'}`}
              style={{ fontSize: '0.9rem', padding: '8px 16px' }}
            >
              <ShieldCheck size={16} /> Admin Portal
            </button>
          )}
        </nav>

        {/* Auth Actions (Desktop) */}
        <div style={{ display: 'none', alignItems: 'center', gap: '12px' }} className="desktop-auth">
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                onClick={() => navigate('patient-dashboard')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--bg-subtle)',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  cursor: 'pointer',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: isAdmin ? 'var(--accent-purple)' : 'var(--primary)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                }}>
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-dark)', lineHeight: 1.2 }}>
                    {user?.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {isAdmin ? 'Hospital Admin' : 'Patient'}
                  </div>
                </div>
              </div>
              <button
                onClick={logout}
                className="btn btn-outline btn-sm"
                title="Log out"
                style={{ padding: '8px 12px' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => navigate('login')}
                className="btn btn-outline"
                style={{ fontSize: '0.88rem', padding: '8px 16px' }}
              >
                <UserIcon size={16} /> Log In
              </button>
              <button
                onClick={() => navigate('register')}
                className="btn btn-primary"
                style={{ fontSize: '0.88rem', padding: '8px 18px' }}
              >
                Register
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="btn btn-ghost"
          style={{ display: 'flex', padding: '8px' }}
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: '#ffffff',
          borderTop: '1px solid var(--border-color)',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          boxShadow: 'var(--shadow-md)',
        }}>
          <button
            onClick={() => navigate('home')}
            className={`btn ${currentView === 'home' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ justifyContent: 'flex-start' }}
          >
            Home
          </button>
          <button
            onClick={() => navigate('doctors')}
            className={`btn ${currentView === 'doctors' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ justifyContent: 'flex-start' }}
          >
            <Stethoscope size={16} /> Find Doctors
          </button>

          {isAuthenticated && (
            <button
              onClick={() => navigate('patient-dashboard')}
              className={`btn ${currentView === 'patient-dashboard' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ justifyContent: 'flex-start' }}
            >
              <Calendar size={16} /> My Appointments
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => navigate('admin-dashboard')}
              className={`btn ${currentView === 'admin-dashboard' ? 'btn-purple' : 'btn-ghost'}`}
              style={{ justifyContent: 'flex-start' }}
            >
              <ShieldCheck size={16} /> Admin Portal
            </button>
          )}

          <div style={{ borderTop: '1px solid var(--border-color)', margin: '8px 0' }} />

          {isAuthenticated ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{user?.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</div>
              </div>
              <button onClick={logout} className="btn btn-danger-outline btn-sm">
                <LogOut size={14} /> Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => navigate('login')}
                className="btn btn-outline"
                style={{ flex: 1 }}
              >
                Log In
              </button>
              <button
                onClick={() => navigate('register')}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                Register
              </button>
            </div>
          )}
        </div>
      )}

      {/* Simple media query injection */}
      <style>{`
        @media (min-width: 820px) {
          .desktop-nav { display: flex !important; }
          .desktop-auth { display: flex !important; }
          header button[aria-label="Toggle Navigation Menu"] { display: none !important; }
        }
      `}</style>
    </header>
  );
};
