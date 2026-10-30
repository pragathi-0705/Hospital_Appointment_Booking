import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { UserPlus, User, Mail, Phone, Lock, AlertCircle, CheckCircle } from 'lucide-react';

export const RegisterPage = ({ onNavigate, onRegisterSuccess }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!formData.name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!formData.email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMsg('Please enter your contact phone number.');
      return;
    }
    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
      });

      if (res.success) {
        onNavigate('patient-dashboard');
        onRegisterSuccess?.(res.user);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '50px 20px', maxWidth: '540px' }}>
      <div className="card" style={{
        padding: '36px',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-xl)',
        border: '1px solid var(--border-color)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: 'var(--accent-purple-light)',
            color: 'var(--accent-purple)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
          }}>
            <UserPlus size={26} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-dark)' }}>
            Patient Registration
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Register to book doctor appointments and view your healthcare records
          </p>
        </div>

        {errorMsg && (
          <div className="alert alert-error">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="var(--text-light)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Eleanor Vance"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                style={{ paddingLeft: '38px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-light)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                name="email"
                required
                placeholder="eleanor@example.com"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                style={{ paddingLeft: '38px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number *</label>
            <div style={{ position: 'relative' }}>
              <Phone size={18} color="var(--text-light)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="tel"
                name="phone"
                required
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
                className="form-input"
                style={{ paddingLeft: '38px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="var(--text-light)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="Min 6 chars"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="var(--text-light)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  placeholder="Repeat password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '10px', fontWeight: '700' }}
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <span
            onClick={() => onNavigate('login')}
            style={{ color: 'var(--primary)', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Log In here
          </span>
        </div>
      </div>
    </div>
  );
};
