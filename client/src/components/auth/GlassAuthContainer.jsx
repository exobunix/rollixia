import React, { useState, useEffect, useRef } from 'react';
import { Lock, UserPlus, KeyRound, Plus, ArrowLeft } from 'lucide-react';
import RollixiaLogo from '../common/RollixiaLogo';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import AnimeMascot from './AnimeMascot';
import './glassAuth.css';

export default function GlassAuthContainer({ initialMode = 'login', onNavigate }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup' | 'forgot'
  const [cardTilt, setCardTilt] = useState({ x: 0, y: 0 });
  const [cursorPos, setCursorPos] = useState({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 500,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 400
  });
  const [focusedField, setFocusedField] = useState(null);
  const [authSuccessUser, setAuthSuccessUser] = useState(null);
  const cardWrapRef = useRef(null);

  // Synchronize mode with prop changes (e.g. if URL changed externally)
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Synchronize browser popstate (back/forward)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.includes('signup') || path.includes('register')) {
        setMode('signup');
      } else if (path.includes('forgot')) {
        setMode('forgot');
      } else {
        setMode('login');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Real-time Global Cursor Tracking & 3D Tilt Effect
  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    setCursorPos({ x: clientX, y: clientY });

    if (window.innerWidth < 768) return; // Tilt only on desktop
    const { innerWidth, innerHeight } = window;

    // Calculate normalized coordinates (-1 to 1)
    const xNorm = (clientX / innerWidth) * 2 - 1;
    const yNorm = (clientY / innerHeight) * 2 - 1;

    // Max 3.5 degrees rotation
    const rotateY = (xNorm * 3.5).toFixed(2);
    const rotateX = (-yNorm * 3.5).toFixed(2);

    setCardTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setCardTilt({ x: 0, y: 0 });
  };

  // Auth Success Handler with Mascot Celebration and Bold Welcome
  const handleAuthSuccess = (userData) => {
    setAuthSuccessUser(userData);

    // Give 1.5s for the celebratory mascot jumping and bold welcome display
    setTimeout(() => {
      if (userData.role === 'admin' || userData.role === 'super_admin') {
        onNavigate('admin');
      } else {
        onNavigate('dashboard', { tab: 'orders' });
      }
    }, 1500);
  };

  // Determine current mascot state
  const mascotMood = authSuccessUser
    ? 'celebrate'
    : focusedField === 'password'
    ? 'password'
    : focusedField
    ? 'typing'
    : 'idle';

  // Smooth mode transition handlers with clean URL history push
  const handleSwitchToSignup = () => {
    setMode('signup');
    window.history.pushState(null, '', '/signup');
  };

  const handleSwitchToLogin = () => {
    setMode('login');
    window.history.pushState(null, '', '/login');
  };

  const handleSwitchToForgot = () => {
    setMode('forgot');
    window.history.pushState(null, '', '/forgot-password');
  };

  return (
    <div
      className="glass-auth-viewport"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 1. Ambient Background Lighting & Floating Orbs */}
      <div className="glass-auth-ambient" aria-hidden="true">
        <div className="glass-auth-light-top" />
        <div className="glass-auth-light-bottom" />
        <div className="glass-orb-1" />
        <div className="glass-orb-2" />
        <div className="glass-orb-3" />
        <div className="glass-orb-4" />
      </div>

      {/* 2. Glass Auth Scene with Anime Mascot Companion & 3D Card */}
      <div className="glass-auth-scene">
        {/* Roxi the Anime Mascot: Eye-tracking cursor & covering eyes for password */}
        <div className="glass-mascot-anchor">
          <AnimeMascot
            cursorPos={cursorPos}
            mood={mascotMood}
            focusedField={focusedField}
            userName={authSuccessUser?.full_name || ''}
          />
        </div>

        {/* Main Authentication Card Wrap with 3D Tilt */}
        <div
          ref={cardWrapRef}
          className="glass-auth-card-wrap"
          style={{
            transform: `rotateX(${cardTilt.x}deg) rotateY(${cardTilt.y}deg)`
          }}
        >
          <div className="glass-auth-card">
            {/* Header Branding & Morphing Icon */}
            <div className="glass-auth-header">
              <div className="glass-auth-brand-logo">
                <RollixiaLogo
                  size={36}
                  textSize="1.35rem"
                  onClick={() => onNavigate('home')}
                />
              </div>

              {/* Floating Glass Icon Pod with Morphing Glyphs */}
              <div className="glass-auth-icon-pod">
                <div key={mode} className="glass-auth-icon-inner">
                  {mode === 'login' && <Lock size={32} />}
                  {mode === 'signup' && <UserPlus size={32} />}
                  {mode === 'forgot' && <KeyRound size={32} />}
                </div>
              </div>

              {/* Dynamic Titles */}
              <h1 className="glass-auth-title" key={`title-${mode}`}>
                {mode === 'login' && 'Welcome Back'}
                {mode === 'signup' && 'Create Account'}
                {mode === 'forgot' && 'Forgot Password?'}
              </h1>

              <p className="glass-auth-subtitle" key={`subtitle-${mode}`}>
                {mode === 'login' && 'Login to continue your journey with Rollixia'}
                {mode === 'signup' && 'Start your journey with Rollixia'}
                {mode === 'forgot' && "Enter your email and we'll send you a reset link."}
              </p>
            </div>

            {/* Dynamic Form Content */}
            <div className="glass-auth-content" key={`form-${mode}`}>
              {mode === 'login' && (
                <LoginForm
                  onNavigate={onNavigate}
                  onSwitchToForgot={handleSwitchToForgot}
                  onFocusField={setFocusedField}
                  onBlurField={() => setFocusedField(null)}
                  onAuthSuccess={handleAuthSuccess}
                />
              )}

              {mode === 'signup' && (
                <SignupForm
                  onNavigate={onNavigate}
                  onFocusField={setFocusedField}
                  onBlurField={() => setFocusedField(null)}
                  onAuthSuccess={handleAuthSuccess}
                />
              )}

              {mode === 'forgot' && (
                <ForgotPasswordForm
                  onBackToLogin={handleSwitchToLogin}
                />
              )}
            </div>

            {/* Bottom Switch Button (+ or ←) */}
            {mode !== 'forgot' && (
              <div className="glass-auth-switch-row">
                <span className="glass-auth-switch-text">
                  {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
                </span>

                <button
                  type="button"
                  className="glass-auth-switch-btn"
                  onClick={mode === 'login' ? handleSwitchToSignup : handleSwitchToLogin}
                  title={mode === 'login' ? 'Create new account' : 'Switch to login'}
                  aria-label={mode === 'login' ? 'Create new account' : 'Switch to login'}
                >
                  {mode === 'login' ? <Plus size={22} strokeWidth={2.4} /> : <ArrowLeft size={20} strokeWidth={2.4} />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Celebratory Welcome Overlay Modal (Appears upon Login or Sign-up) */}
      {authSuccessUser && (
        <div className="glass-welcome-overlay" role="dialog" aria-modal="true">
          <div className="glass-welcome-modal">
            <div className="glass-welcome-mascot-wrap">
              <AnimeMascot
                cursorPos={cursorPos}
                mood="celebrate"
                userName={authSuccessUser.full_name}
              />
            </div>
            <div className="glass-welcome-badge">
              {authSuccessUser.isNew ? 'Account Created' : 'Authenticated'}
            </div>
            <h2 className="glass-welcome-title">
              WELCOME,{' '}
              <span className="glass-welcome-name">
                {authSuccessUser.full_name?.toUpperCase() || 'VALUED USER'}
              </span>!
            </h2>
            <p className="glass-welcome-sub">
              {authSuccessUser.isNew
                ? 'Your new Rollixia account is ready! Opening your dashboard...'
                : 'Great to have you back! Transitioning to your workspace...'}
            </p>
            <div className="glass-welcome-spinner-track">
              <div className="glass-welcome-spinner-fill" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
