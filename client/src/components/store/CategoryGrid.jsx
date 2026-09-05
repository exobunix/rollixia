import React from 'react';
import { Cpu, Layout, Palette, Smartphone, Sparkles, TrendingUp, Folder, ArrowRight } from 'lucide-react';

const iconMap = {
  Cpu: <Cpu size={26} color="#6366f1" />,
  Layout: <Layout size={26} color="#06b6d4" />,
  Palette: <Palette size={26} color="#8b5cf6" />,
  Smartphone: <Smartphone size={26} color="#10b981" />,
  Sparkles: <Sparkles size={26} color="#ec4899" />,
  TrendingUp: <TrendingUp size={26} color="#f59e0b" />
};

export function CategoryGrid({ categories = [], onSelectCategory }) {
  return (
    <section style={{ padding: '4.5rem 0' }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.05em' }}>
              Explore Marketplace
            </span>
            <h2 className="display-title gradient-text" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', marginTop: '4px' }}>
              Featured Categories
            </h2>
          </div>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Handpicked digital assets for all disciplines
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.5rem'
        }}>
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="glass-card"
              onClick={() => onSelectCategory(cat.slug)}
              style={{
                padding: '1.5rem',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '180px',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  background: 'var(--bg-surface-elevated)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--border-subtle)'
                }}>
                  {iconMap[cat.icon] || <Folder size={26} color="var(--primary)" />}
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  background: 'var(--bg-surface-elevated)',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-full)'
                }}>
                  {cat.product_count !== undefined ? cat.product_count : 1} items
                </span>
              </div>

              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {cat.name}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '0.75rem' }}>
                  {cat.description}
                </p>
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--primary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  Browse Collection <ArrowRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
