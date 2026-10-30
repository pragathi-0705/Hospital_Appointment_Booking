import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowLeft } from 'lucide-react';

export const AdminLoginPage = ({ onNavigate, onLoginSuccess }) => {
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
        if (res.user.role !== 'admin') {
          setErrorMsg('Access denied: You do not have administrator permissions.');
          return;
        }
        onNavigate('admin-dashboard');
        onLoginSuccess?.(res.user);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Invalid administrator email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '60px 20px', maxWidth: '480px' }}>
      <button
        onClick={() => onNavigate('home')}
        className="btn btn-ghost btn-sm"
        style={{ marginBottom: '16px', gap: '6px' }}
      >
        <ArrowLeft size={16} /> Back to Hospital Home
      </button>

      <div className="card" style={{
        padding: '40px',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-xl)',
        border: '1px solid var(--border-color)',
        background: '#ffffff',
      }}>
        {/* Header Icon */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, var(--accent-purple) 0%, #4f46e5 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: '0 8px 16px rgba(124, 58, 237, 0.25)',
          }}>
            <ShieldCheck size={32} />
          </div>
          <span className="badge badge-purple" style={{ marginBottom: '8px' }}>
            Restricted Admin Portal
          </span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-dark)', marginTop: '4px' }}>
            Hospital Administration
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
            Authorized Medical Officers & Hospital Administrators Only
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="alert alert-error">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Administrator Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--accent-purple)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                required
                placeholder="Enter administrator email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '38px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Admin Security Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--accent-purple)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
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
            className="btn btn-purple"
            style={{ width: '100%', padding: '12px', marginTop: '10px', fontWeight: '700' }}
          >
            {loading ? 'Verifying Admin Access...' : 'Login to Admin Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
};
