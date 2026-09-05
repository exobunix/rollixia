import React from 'react';

export function Badge({ children, variant = 'bestseller', className = '' }) {
  let badgeClass = 'badge';
  const v = variant ? variant.toLowerCase() : '';

  if (v.includes('bestseller')) badgeClass += ' badge-bestseller';
  else if (v.includes('trend') || v.includes('popular')) badgeClass += ' badge-trending';
  else if (v.includes('free')) badgeClass += ' badge-free';
  else if (v.includes('new')) badgeClass += ' badge-new';
  else if (v.includes('top') || v.includes('rated')) badgeClass += ' badge-top-rated';
  else badgeClass += ' badge-outline';

  return <span className={`${badgeClass} ${className}`}>{children}</span>;
}

export function StarRating({ rating = 5, reviewCount = null, size = 15 }) {
  const rounded = Math.round(Number(rating) * 10) / 10;
  const fullStars = Math.floor(rounded);
  const hasHalf = rounded - fullStars >= 0.4;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      <div style={{ display: 'flex', color: '#f59e0b', fontSize: `${size}px` }}>
        {[...Array(5)].map((_, i) => (
          <span key={i} style={{ color: i < fullStars ? '#f59e0b' : (i === fullStars && hasHalf ? '#fbbf24' : '#334155') }}>
            ★
          </span>
        ))}
      </div>
      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', marginLeft: '3px' }}>
        {rounded.toFixed(1)}
      </span>
      {reviewCount !== null && (
        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
}
