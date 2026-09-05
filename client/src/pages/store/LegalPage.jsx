import React, { useState } from 'react';
import { Shield, FileText, RefreshCw, Key } from 'lucide-react';

export function LegalPage({ initialTab = 'terms' }) {
  const [tab, setTab] = useState(initialTab);

  return (
    <div style={{ padding: '3.5rem 0 6rem 0' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        <div style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '2.5rem',
          overflowX: 'auto'
        }}>
          {[
            { id: 'terms', label: 'Terms & Conditions', icon: <FileText size={16} /> },
            { id: 'privacy', label: 'Privacy Policy', icon: <Shield size={16} /> },
            { id: 'refund', label: 'Refund Policy', icon: <RefreshCw size={16} /> },
            { id: 'license', label: 'License Guidelines', icon: <Key size={16} /> }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px',
                background: 'transparent',
                border: 'none',
                borderBottom: `2px solid ${tab === t.id ? 'var(--primary)' : 'transparent'}`,
                color: tab === t.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: tab === t.id ? 700 : 500,
                fontSize: '0.95rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="glass-card" style={{ padding: '3rem', lineHeight: 1.7, fontSize: '0.975rem', color: 'var(--text-secondary)' }}>
          {tab === 'terms' && (
            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                Terms & Conditions
              </h1>
              <p style={{ marginBottom: '1.25rem' }}>
                Welcome to Rollixia. By accessing or purchasing digital assets on our platform, you agree to abide by these Terms of Service.
              </p>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', margin: '1.5rem 0 0.5rem 0' }}>
                1. Digital Delivery
              </h3>
              <p style={{ marginBottom: '1.25rem' }}>
                All purchases are fulfilled through immediate cryptographic download tokens. Tokens are linked directly to your authenticated order. You are entitled to the purchased version and eligible future releases.
              </p>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', margin: '1.5rem 0 0.5rem 0' }}>
                2. User Account Security
              </h3>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials. Sharing access tokens or distributing uncompiled raw source code publicly is strictly prohibited.
              </p>
            </div>
          )}

          {tab === 'privacy' && (
            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                Privacy Policy
              </h1>
              <p style={{ marginBottom: '1.25rem' }}>
                Your privacy is paramount. We do not sell your personal information or transaction history to any third parties.
              </p>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', margin: '1.5rem 0 0.5rem 0' }}>
                Information We Collect
              </h3>
              <p style={{ marginBottom: '1.25rem' }}>
                We collect your name and email address strictly to deliver your digital purchases, supply automated receipts, and notify you when eligible product updates become available.
              </p>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', margin: '1.5rem 0 0.5rem 0' }}>
                Payment Security
              </h3>
              <p>
                Payment card data is processed directly by PCI-DSS compliant payment gateways through 256-bit TLS encryption. We never store raw card numbers on our servers.
              </p>
            </div>
          )}

          {tab === 'refund' && (
            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                Refund Policy for Digital Products
              </h1>
              <p style={{ marginBottom: '1.25rem' }}>
                Due to the immediate intangible nature of digital goods (source code, Figma files, and templates), our refund policy is designed to protect both creators and purchasers:
              </p>
              <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><strong>Defective Assets:</strong> If a digital product is verifiably broken, corrupt, or missing described features and our support team cannot provide a fix within 7 days, a full refund will be issued.</li>
                <li><strong>Mistaken Duplicate Orders:</strong> If you accidentally place duplicate orders for the identical product within 24 hours, the duplicate transaction will be refunded immediately.</li>
                <li><strong>Change of Mind:</strong> Once a digital asset has been downloaded, refunds based on change of mind cannot typically be granted unless approved by management review.</li>
              </ul>
              <p>
                To request assistance, please submit a ticket through your Customer Dashboard or contact <strong>support@digitalstore.com</strong> with your order reference.
              </p>
            </div>
          )}

          {tab === 'license' && (
            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                Commercial License Guidelines
              </h1>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
                <div style={{ padding: '1.5rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Personal License
                  </h3>
                  <p style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
                    Permits usage for 1 personal non-commercial project or portfolio. Cannot be used for paying clients or commercial SaaS applications.
                  </p>
                </div>

                <div style={{ padding: '1.5rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-bright)' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#10b981', marginBottom: '6px' }}>
                    Standard Commercial License (Most Popular)
                  </h3>
                  <p style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
                    Permits usage in unlimited commercial client websites, freelancing projects, internal company tools, and commercial end products. You may customize and compile the code. You may not resell the raw asset or template as a standalone competitor.
                  </p>
                </div>

                <div style={{ padding: '1.5rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '6px' }}>
                    Extended / Agency License
                  </h3>
                  <p style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
                    Permits unlimited developer seats across agency teams, usage in monetized SaaS platforms where paying users interact with the system, and whitelabel client deployments.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
