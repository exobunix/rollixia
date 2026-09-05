import React from 'react';

/**
 * Rollixia Brand Logo Component
 * High-conversion, ultra-modern identity for Rollixia Digital Commerce Platform
 */
export default function RollixiaLogo({
  size = 38,
  showText = true,
  textSize = '1.4rem',
  textColor = 'var(--text-primary)',
  accentColor = '#818cf8',
  className = '',
  onClick = null
}) {
  return (
    <div
      className={`rollixia-brand-logo ${className}`}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none'
      }}
    >
      {/* Rollixia Iconic Modern Emblem */}
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: `${Math.round(size * 0.26)}px`,
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 55%, #d946ef 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(99, 102, 241, 0.45)',
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Subtle glass reflection overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '45%',
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0) 100%)',
            pointerEvents: 'none'
          }}
        />

        <svg
          width={Math.round(size * 0.62)}
          height={Math.round(size * 0.62)}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Stylized Modern Futuristic 'R' Glyph */}
          <path
            d="M7 6H16.2C20.5 6 24 9.13 24 13C24 16.36 21.43 19.16 18.02 19.82L24.5 27H19.2L13.2 20.2H11.5V27H7V6ZM11.5 10.2V16.2H16C17.93 16.2 19.5 14.77 19.5 13C19.5 11.23 17.93 10.2 16 10.2H11.5Z"
            fill="#ffffff"
          />
          {/* Cyber spark accent dot */}
          <circle cx="24.5" cy="7.5" r="2.2" fill="#38bdf8" />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <span
          className="brand-logo-text"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: textSize,
            letterSpacing: '-0.03em',
            color: textColor,
            lineHeight: 1
          }}
        >
          ROLLI<span style={{ color: accentColor, WebkitTextFillColor: accentColor }}>XIA</span>
        </span>
      )}
    </div>
  );
}
