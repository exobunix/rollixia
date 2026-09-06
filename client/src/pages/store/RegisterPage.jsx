import React from 'react';
import GlassAuthContainer from '../../components/auth/GlassAuthContainer';

export function RegisterPage({ onNavigate }) {
  return <GlassAuthContainer initialMode="signup" onNavigate={onNavigate} />;
}

export default RegisterPage;
