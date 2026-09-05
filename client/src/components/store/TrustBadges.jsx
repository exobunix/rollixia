import React from 'react';
import { ShieldCheck, DownloadCloud, CheckCircle2, RefreshCw, Headphones } from 'lucide-react';

export function TrustBadges() {
  const badges = [
    {
      icon: <DownloadCloud size={24} color="#6366f1" />,
      title: 'Instant Delivery',
      desc: 'Immediate tokenized download access right after purchase.'
    },
    {
      icon: <CheckCircle2 size={24} color="#10b981" />,
      title: 'Commercial License',
      desc: 'Build client websites, mobile apps, and profitable SaaS products.'
    },
    {
      icon: <RefreshCw size={24} color="#06b6d4" />,
      title: 'Free Lifetime Updates',
      desc: 'Get future version releases and enhancements at no additional cost.'
    },
    {
      icon: <ShieldCheck size={24} color="#8b5cf6" />,
      title: '100% Verified Assets',
      desc: 'Curated by senior engineers with zero bloat and clean structure.'
    },
    {
      icon: <Headphones size={24} color="#f59e0b" />,
      title: 'Dedicated Support',
      desc: 'Direct helpdesk and responsive developer assistance whenever needed.'
    }
  ];

  return (
    <section style={{ padding: '2rem 0', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem'
        }}>
          {badges.map((b, i) => (
            <div
              key={i}
              className="trust-badge-card"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <div
                className="trust-badge-icon-box"
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  flexShrink: 0
                }}
              >
                {b.icon}
              </div>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                  {b.title}
                </h4>
                <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {b.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
