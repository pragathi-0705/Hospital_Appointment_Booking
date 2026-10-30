import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { LogIn, Lock, Mail, AlertCircle, User } from 'lucide-react';

export const LoginPage = ({ onNavigate, onLoginSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await login({ email, password });
      if (res.success) {
        if (res.user.role === 'admin') {
          onNavigate('admin-dashboard');
        } else {
          onNavigate('patient-dashboard');
        }
        onLoginSuccess?.(res.user);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Demo auto-fill helper for Patient only
  const handleQuickDemoPatient = async () => {
    const demoEmail = 'patient@example.com';
    const demoPassword = 'PatientPassword123';
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await login({ email: demoEmail, password: demoPassword });
      if (res.success) {
        onNavigate('patient-dashboard');
        onLoginSuccess?.(res.user);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Demo patient login failed. Ensure database is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '60px 20px', maxWidth: '480px' }}>
      <div className="card" style={{
        padding: '36px',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-xl)',
        border: '1px solid var(--border-color)',
      }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
          }}>
            <LogIn size={26} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-dark)' }}>
            Patient Portal Login
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Sign in to book doctor appointments and view your medical records
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="alert alert-error">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-light)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                required
                placeholder="patient@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '38px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-light)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '38px' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '8px', fontWeight: '700' }}
          >
            {loading ? 'Authenticating...' : 'Sign In as Patient'}
          </button>
        </form>

        {/* Patient Demo 1-Click Access */}
        <div style={{
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px solid var(--border-color)',
        }}>
          <button
            type="button"
            disabled={loading}
            onClick={handleQuickDemoPatient}
            className="btn btn-outline btn-sm"
            style={{ width: '100%', justifyContent: 'center', height: '40px' }}
          >
            <User size={15} /> Quick Sign-in with Demo Patient
          </button>
        </div>

        {/* Register Footer */}
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <span
            onClick={() => onNavigate('register')}
            style={{ color: 'var(--primary)', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Register as a Patient
          </span>
        </div>
      </div>
    </div>
  );
};
