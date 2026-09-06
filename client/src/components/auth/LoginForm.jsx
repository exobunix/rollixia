import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function LoginForm({ onNavigate, onSwitchToForgot }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(cleanEmail, password);
      addToast(`Welcome back, ${user.full_name || 'Customer'}!`, 'success');
      if (user.role === 'admin' || user.role === 'super_admin') {
        onNavigate('admin');
      } else {
        onNavigate('dashboard', { tab: 'orders' });
      }
    } catch (err) {
      const errMsg = err.message || 'Invalid email or password. Please verify your credentials.';
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

      {/* Email Address Field */}
      <div className="glass-input-group stagger-field-1">
        <label className="glass-input-label" htmlFor="login-email">
          Email Address
        </label>
        <div className="glass-input-box">
          <div className="glass-input-icon">
            <Mail size={18} />
          </div>
          <input
            id="login-email"
            type="email"
            required
            autoComplete="email"
            className={`glass-input-field ${error ? 'has-error' : ''}`}
            placeholder="Enter your email address"
            value={email}
            onChange={e => {
              setEmail(e.target.value);
              if (error) setError('');
            }}
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="glass-input-group stagger-field-2">
        <label className="glass-input-label" htmlFor="login-password">
          Password
        </label>
        <div className="glass-input-box">
          <div className="glass-input-icon">
            <Lock size={18} />
          </div>
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="current-password"
            className={`glass-input-field ${error ? 'has-error' : ''}`}
            placeholder="Enter your password"
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
      </div>

      {/* Options Row (Remember Me + Forgot Password) */}
      <div className="glass-auth-options stagger-field-3">
        <label className="glass-checkbox-label">
          <input
            type="checkbox"
            className="glass-checkbox-input"
            checked={rememberMe}
            onChange={e => setRememberMe(e.target.checked)}
          />
          <span className="glass-checkbox-custom">
            {rememberMe && (
              <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                <path d="M1 4.5L4 7.5L10 1.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
          <span>Remember me</span>
        </label>

        <button
          type="button"
          className="glass-auth-link"
          onClick={onSwitchToForgot}
        >
          Forgot Password?
        </button>
      </div>

      {/* Raised Glass CTA Button */}
      <div className="stagger-field-4">
        <button
          type="submit"
          className="glass-cta-button"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Signing In...</span>
            </>
          ) : (
            <>
              <span>LOGIN</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
