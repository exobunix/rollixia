import React from 'react';
import GlassAuthContainer from '../../components/auth/GlassAuthContainer';

export function LoginPage({ onNavigate }) {
  return <GlassAuthContainer initialMode="login" onNavigate={onNavigate} />;
}

export default LoginPage;
