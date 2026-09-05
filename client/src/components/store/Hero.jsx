import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, DownloadCloud, Code, Layers, Star } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { formatCurrency } from '../../utils/formatters';

export function Hero({ onExplore, onViewBestsellers, onSelectProduct }) {
  const { currency } = useCurrency();

  return (
    <section style={{
      position: 'relative',
      padding: '5rem 0 4rem 0',
      overflow: 'hidden'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '3.5rem',
          alignItems: 'center'
        }}>
          {/* Left Column: Copy & CTAs */}
          <div>
            {/* Pill tag */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: 'var(--radius-full)',
              color: '#818cf8',
              fontSize: '0.825rem',
              fontWeight: 700,
              marginBottom: '1.5rem',
              letterSpacing: '0.02em'
            }}>
              <Sparkles size={14} />
              <span>THE GLOBAL DIGITAL COMMERCE PLATFORM</span>
            </div>

            <h1 className="display-title gradient-text" style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', marginBottom: '1.25rem' }}>
              Premium Digital Products Built to Help You <span className="gradient-brand-text">Create Faster.</span>
            </h1>

            <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2.25rem', maxWidth: '540px' }}>
              Discover world-class production software, full-stack website templates, UI kits, AI prompt libraries, and developer tools crafted by industry experts.
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
              <button
                onClick={onExplore}
                className="btn btn-primary btn-lg"
                style={{ fontWeight: 700, borderRadius: 'var(--radius-md)' }}
              >
                Explore Products <ArrowRight size={18} />
              </button>

              <button
                onClick={onViewBestsellers}
                className="btn btn-secondary btn-lg"
                style={{ fontWeight: 600, borderRadius: 'var(--radius-md)' }}
              >
                View Bestsellers
              </button>
            </div>

            {/* Quick Metrics */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1.5rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--border-subtle)'
            }}>
              <div>
                <p style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>50,000+</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Downloads Delivered</p>
              </div>
              <div style={{ width: '1px', background: 'var(--border-subtle)' }} />
              <div>
                <p style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  4.95 ★
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>From 3,200+ Reviews</p>
              </div>
              <div style={{ width: '1px', background: 'var(--border-subtle)' }} />
              <div>
                <p style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>100%</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Instant Token Delivery</p>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Product Composition */}
          <div style={{ position: 'relative' }}>
            {/* Glow orb */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '320px',
              height: '320px',
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, transparent 70%)',
              filter: 'blur(50px)',
              zIndex: 0
            }} />

            {/* Main Featured Showcase Card */}
            <div
              className="glass-card"
              style={{
                position: 'relative',
                zIndex: 1,
                padding: '1.25rem',
                borderRadius: 'var(--radius-xl)',
                background: 'rgba(15, 23, 42, 0.8)',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                cursor: 'pointer'
              }}
              onClick={() => onSelectProduct && onSelectProduct('apex-saas-dashboard-analytics-kit')}
            >
              <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '1rem' }}>
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=85"
                  alt="Apex SaaS Dashboard Mockup"
                  style={{ width: '100%', height: '240px', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: 'rgba(15, 23, 42, 0.85)',
                  backdropFilter: 'blur(8px)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#818cf8',
                  border: '1px solid rgba(99, 102, 241, 0.3)'
                }}>
                  FEATURED RELEASE
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Apex SaaS Dashboard UI Kit
                </h3>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>
                  {formatCurrency(1999, currency)}
                </span>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                65+ dark-mode dashboard screens, interactive React charts & atomic Figma system.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>✓ Lifetime Updates Included</span>
                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Explore Preview →</span>
              </div>
            </div>

            {/* Floating Trust Card 1 */}
            <div style={{
              position: 'absolute',
              bottom: '-25px',
              left: '-20px',
              zIndex: 2,
              background: 'rgba(30, 41, 59, 0.92)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: 'var(--shadow-md)'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShieldCheck size={18} color="#10b981" />
              </div>
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Commercial License</p>
                <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Client and SaaS ready</p>
              </div>
            </div>

            {/* Floating Trust Card 2 */}
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-15px',
              zIndex: 2,
              background: 'rgba(30, 41, 59, 0.92)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: 'var(--shadow-md)'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <DownloadCloud size={18} color="#818cf8" />
              </div>
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Instant Download</p>
                <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Direct ZIP & token access</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
