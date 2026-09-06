import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function SignupForm({ onNavigate }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { addToast } = useToast();

  // Password strength calculator
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '#94a3b8' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 9) score += 1;
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    switch (score) {
      case 1:
        return { score: 25, label: 'Weak', color: '#f43f5e' };
      case 2:
        return { score: 50, label: 'Fair', color: '#f59e0b' };
      case 3:
        return { score: 75, label: 'Good', color: '#38bdf8' };
      case 4:
        return { score: 100, label: 'Strong', color: '#10b981' };
      default:
        return { score: 15, label: 'Too short', color: '#f43f5e' };
    }
  };

  const strength = getPasswordStrength(password);
  const passwordsMatch = !confirmPassword || password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    if (!agreeTerms) {
      setError('You must agree to the Terms of Service to create an account.');
      return;
    }

    setLoading(true);
    try {
      const newUser = await register(email.trim(), password, fullName.trim());
      addToast(`Account created! Welcome to Rollixia, ${newUser.full_name}!`, 'success');
      onNavigate('dashboard', { tab: 'orders' });
    } catch (err) {
      const errMsg = err.message || 'Registration failed. Please try again.';
      setError(errMsg);
      addToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-auth-form" noValidate>
      {/* Error Alert Box */}
      {error && (
        <div className="glass-auth-alert error">
          <AlertCircle size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>{error}</div>
        </div>
      )}

      {/* Full Name Field */}
      <div className="glass-input-group stagger-field-1">
        <label className="glass-input-label" htmlFor="signup-name">
          Full Name
        </label>
        <div className="glass-input-box">
          <div className="glass-input-icon">
            <User size={18} />
          </div>
          <input
            id="signup-name"
            type="text"
            required
            autoComplete="name"
            className="glass-input-field"
            placeholder="Alex Morgan"
            value={fullName}
            onChange={e => {
              setFullName(e.target.value);
              if (error) setError('');
            }}
          />
        </div>
      </div>

      {/* Email Address Field */}
      <div className="glass-input-group stagger-field-2">
        <label className="glass-input-label" htmlFor="signup-email">
          Email Address
        </label>
        <div className="glass-input-box">
          <div className="glass-input-icon">
            <Mail size={18} />
          </div>
          <input
            id="signup-email"
            type="email"
            required
            autoComplete="email"
            className="glass-input-field"
            placeholder="alex@example.com"
            value={email}
            onChange={e => {
              setEmail(e.target.value);
              if (error) setError('');
            }}
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="glass-input-group stagger-field-3">
        <label className="glass-input-label" htmlFor="signup-password">
          Password
        </label>
        <div className="glass-input-box">
          <div className="glass-input-icon">
            <Lock size={18} />
          </div>
          <input
            id="signup-password"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="new-password"
            className="glass-input-field"
            placeholder="At least 6 characters"
            value={password}
            onChange={e => {
              setPassword(e.target.value);
              if (error) setError('');
            }}
          />
          <button
            type="button"
            className="glass-password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            title={showPassword ? 'Hide password' : 'Show password'}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Password Strength Indicator */}
        {password && (
          <div className="glass-password-meter">
            <div className="glass-password-meter-bar">
              <div
                className="glass-password-meter-progress"
                style={{
                  width: `${strength.score}%`,
                  backgroundColor: strength.color
                }}
              />
            </div>
            <div className="glass-password-meter-labels">
              <span>Password strength</span>
              <span style={{ color: strength.color }}>{strength.label}</span>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="glass-input-group stagger-field-4">
        <label className="glass-input-label" htmlFor="signup-confirm-password">
          Confirm Password
        </label>
        <div className="glass-input-box">
          <div className="glass-input-icon">
            <Lock size={18} />
          </div>
          <input
            id="signup-confirm-password"
            type={showConfirmPassword ? 'text' : 'password'}
            required
            autoComplete="new-password"
            className={`glass-input-field ${!passwordsMatch ? 'has-error' : ''}`}
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={e => {
              setConfirmPassword(e.target.value);
              if (error) setError('');
            }}
          />
          <button
            type="button"
            className="glass-password-toggle"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            title={showConfirmPassword ? 'Hide password' : 'Show password'}
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {!passwordsMatch && (
          <span className="glass-input-error-text">Passwords do not match</span>
        )}
      </div>

      {/* Terms & Privacy Agreement */}
      <div className="glass-input-group stagger-field-5" style={{ marginBottom: '1.25rem' }}>
        <label className="glass-checkbox-label" style={{ alignItems: 'flex-start' }}>
          <input
            type="checkbox"
            className="glass-checkbox-input"
            checked={agreeTerms}
            onChange={e => setAgreeTerms(e.target.checked)}
          />
          <span className="glass-checkbox-custom" style={{ marginTop: '2px' }}>
            {agreeTerms && (
              <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                <path d="M1 4.5L4 7.5L10 1.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
          <span style={{ fontSize: '0.82rem', lineHeight: 1.45 }}>
            I agree to the{' '}
            <button
              type="button"
              className="glass-auth-link"
              onClick={() => onNavigate('terms')}
              style={{ fontSize: 'inherit' }}
            >
              Terms of Service
            </button>
            {' '}and{' '}
            <button
              type="button"
              className="glass-auth-link"
              onClick={() => onNavigate('privacy')}
              style={{ fontSize: 'inherit' }}
            >
              Privacy Policy
            </button>.
          </span>
        </label>
      </div>

      {/* Raised Glass CTA Button */}
      <button
        type="submit"
        className="glass-cta-button"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>Creating Account...</span>
          </>
        ) : (
          <>
            <span>CREATE ACCOUNT</span>
            <ArrowRight size={18} />
          </>
        )}
      </button>
    </form>
  );
}
