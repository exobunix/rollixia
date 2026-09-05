import React, { useState } from 'react';
import { Layers, ShieldCheck, Zap, Mail, ArrowRight, Heart } from 'lucide-react';
import RollixiaLogo from './RollixiaLogo';
import { useToast } from '../../context/ToastContext';

export function Footer({ onNavigate }) {
  const [email, setEmail] = useState('');
  const { addToast } = useToast();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      addToast('Thank you for subscribing! Check your inbox for exclusive digital deals.', 'success');
      setEmail('');
    }
  };

  return (
    <footer style={{
      background: 'var(--bg-surface)',
      borderTop: '1px solid var(--border-subtle)',
      marginTop: 'auto',
      paddingTop: '4rem',
      paddingBottom: '2.5rem'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3.5rem'
        }}>
          {/* Col 1: Brand */}
          <div style={{ maxWidth: '340px' }}>
            <div style={{ marginBottom: '1rem' }}>
              <RollixiaLogo size={34} textSize="1.25rem" onClick={() => onNavigate('home')} />
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              The global marketplace for high-converting digital products, production software, UI kits, templates, and creator tools.
            </p>
            <div style={{ display: 'flex', gap: '12px', color: 'var(--text-muted)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem' }}>
                <ShieldCheck size={16} color="#10b981" /> 100% Verified Code
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem' }}>
                <Zap size={16} color="var(--primary)" /> Instant Access
              </span>
            </div>
          </div>

          {/* Col 2: Marketplace */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Marketplace
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.7rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <li>
                <button onClick={() => onNavigate('products')} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                  Explore All Products
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('products', { category: 'software-saas' })} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                  Software & SaaS Kits
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('products', { category: 'website-templates' })} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                  Website Templates
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('products', { category: 'ui-kits-design-systems' })} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                  UI Kits & Figma Files
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('products', { badge: 'FREE' })} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                  Free Resources & Starters
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Trust */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Trust & Legal
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.7rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <li>
                <button onClick={() => onNavigate('legal', { tab: 'terms' })} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('legal', { tab: 'privacy' })} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('legal', { tab: 'refund' })} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                  Refund Policy for Digital Goods
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('legal', { tab: 'license' })} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                  Commercial License Guidelines
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('dashboard', { tab: 'support' })} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                  Customer Support Helpdesk
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Stay Ahead
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
              Receive weekly curated digital assets, early access drops, and exclusive flash coupon codes.
            </p>
            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="email"
                required
                placeholder="you@company.com"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ padding: '0.6rem 0.85rem', fontSize: '0.85rem' }}
              />
              <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '0.6rem 0.9rem' }}>
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          paddingTop: '2rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.85rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            © 2026 ROLLIXIA Inc. All rights reserved. Built for world-class creators.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span>🔒 256-Bit SSL Checkout</span>
            <span>⚡ Automated Tokenized Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
