import React, { useState } from 'react';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function ForgotPasswordForm({ onBackToLogin }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      // Simulate sending reset link with realistic delay
      await new Promise(resolve => setTimeout(resolve, 800));
      setSubmitted(true);
      addToast('Password reset link sent to your email!', 'success');
    } catch (err) {
      setError('Unable to send reset link right now. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem auto',
          color: '#10b981'
        }}>
          <CheckCircle2 size={28} />
        </div>

        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '0.5rem'
        }}>
          Reset Link Dispatched
        </h3>

        <p style={{
          fontSize: '0.88rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          marginBottom: '1.75rem'
        }}>
          We've sent a secure password reset link to <strong>{email}</strong>. Please check your inbox and spam folder.
        </p>

        <button
          type="button"
          className="glass-cta-button"
          onClick={onBackToLogin}
        >
          <ArrowLeft size={18} />
          <span>Back to Login</span>
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-auth-form" noValidate>
      {error && (
        <div className="glass-auth-alert error">
          <AlertCircle size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>{error}</div>
        </div>
      )}

      <div className="glass-input-group stagger-field-1">
        <label className="glass-input-label" htmlFor="forgot-email">
          Registered Email Address
        </label>
        <div className="glass-input-box">
          <div className="glass-input-icon">
            <Mail size={18} />
          </div>
          <input
            id="forgot-email"
            type="email"
            required
            autoComplete="email"
            className="glass-input-field"
            placeholder="Enter your registered email"
            value={email}
            onChange={e => {
              setEmail(e.target.value);
              if (error) setError('');
            }}
          />
        </div>
      </div>

      <div className="stagger-field-2" style={{ marginTop: '1.25rem' }}>
        <button
          type="submit"
          className="glass-cta-button"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Sending Reset Link...</span>
            </>
          ) : (
            <>
              <span>SEND RESET LINK</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>

      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <button
          type="button"
          className="glass-auth-link"
          onClick={onBackToLogin}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <ArrowLeft size={15} />
          <span>Back to Login</span>
        </button>
      </div>
    </form>
  );
}
