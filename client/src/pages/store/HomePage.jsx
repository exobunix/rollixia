import React, { useState, useEffect, useRef } from 'react';
import { Hero } from '../../components/store/Hero';
import { TrustBadges } from '../../components/store/TrustBadges';
import { CategoryGrid } from '../../components/store/CategoryGrid';
import { ProductCard } from '../../components/store/ProductCard';
import { QuickViewModal } from '../../components/store/QuickViewModal';
import { apiRequest } from '../../utils/api';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
  ChevronDown,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  SlidersHorizontal
} from 'lucide-react';

export function HomePage({ onNavigate }) {
  const [categories, setCategories] = useState([]);
  const [featuredData, setFeaturedData] = useState({
    all: [],
    bestsellers: [],
    trending: [],
    topRated: [],
    freeDeals: [],
    newArrivals: []
  });
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('scroll'); // 'scroll' | 'grid'
  const [quickViewSlug, setQuickViewSlug] = useState(null);
  const [openFaq, setOpenFaq] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    apiRequest('/api/categories').then(data => setCategories(data)).catch(() => {});
    apiRequest('/api/products/featured').then(data => {
      setFeaturedData(data);
    }).catch(() => {});
  }, []);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const currentProducts = (featuredData[activeTab] && featuredData[activeTab].length > 0)
    ? featuredData[activeTab]
    : (featuredData.all || []);


  const homeFaqs = [
    {
      q: 'What happens immediately after I complete my purchase?',
      a: 'Your access is instantaneous. You will immediately see your unique order confirmation with 1-click tokenized download buttons. You will also have permanent access in your Customer Dashboard under "My Downloads".'
    },
    {
      q: 'Are commercial licenses included for client work?',
      a: 'Yes! All standard commercial licenses permit usage in unlimited commercial client projects, websites, and apps. For redistributable SaaS templates and enterprise teams, our Extended Licenses are also available.'
    },
    {
      q: 'Do I receive free future updates?',
      a: 'Yes. Every product includes lifetime updates. When creators release a new version or bug fix (e.g. v2.1.0), you will see an update notification in your dashboard to download the latest archive for free.'
    },
    {
      q: 'What payment methods are supported?',
      a: 'We support all major Credit/Debit Cards, UPI, NetBanking, and automated secure gateways with 256-bit SSL encryption.'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <Hero
        onExplore={() => onNavigate('products')}
        onViewBestsellers={() => {
          setActiveTab('bestsellers');
          document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
        onSelectProduct={(slug) => onNavigate('product-detail', { slug })}
      />

      {/* Trust Pillars */}
      <TrustBadges />

      {/* Featured Categories */}
      <CategoryGrid
        categories={categories}
        onSelectCategory={(slug) => onNavigate('products', { category: slug })}
      />

      {/* Tabbed Products Showcase */}
      <section id="products-section" style={{ padding: '4rem 0' }}>
        <div className="container">
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            marginBottom: '3rem'
          }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.05em' }}>
              Handpicked Digital Excellence
            </span>
            <h2 className="display-title gradient-text" style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', marginTop: '4px', marginBottom: '1.25rem' }}>
              Explore Curated Releases
            </h2>

            {/* Tabs Bar */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              padding: '6px',
              background: 'var(--bg-surface-elevated)',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-subtle)'
            }}>
              {[
                { id: 'all', label: `⚡ All Products (${(featuredData.all || []).length || 14})` },
                { id: 'bestsellers', label: '🔥 Bestsellers' },
                { id: 'trending', label: '✨ Trending Deals' },
                { id: 'topRated', label: '★ Top Rated' },
                { id: 'newArrivals', label: '🚀 New Arrivals' },
                { id: 'freeDeals', label: '🎁 Freebies' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 'var(--radius-full)',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                    color: activeTab === tab.id ? '#ffffff' : 'var(--text-secondary)'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Carousel Controls & Status Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{currentProducts.length} Curated Products</span>
              {viewMode === 'scroll' && <span>• Scroll horizontally or use arrows to explore →</span>}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {viewMode === 'scroll' && (
                <>
                  <button
                    onClick={() => handleScroll('left')}
                    className="btn-icon"
                    title="Scroll Left"
                    style={{ width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => handleScroll('right')}
                    className="btn-icon"
                    title="Scroll Right"
                    style={{ width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
              <button
                onClick={() => setViewMode(v => v === 'scroll' ? 'grid' : 'scroll')}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {viewMode === 'scroll' ? (
                  <>
                    <LayoutGrid size={14} />
                    <span>Grid View</span>
                  </>
                ) : (
                  <>
                    <SlidersHorizontal size={14} />
                    <span>Scroll Carousel</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Products Display: Scrollable Carousel or Responsive Grid */}
          {viewMode === 'scroll' ? (
            <div
              ref={scrollRef}
              style={{
                display: 'flex',
                gap: '1.5rem',
                overflowX: 'auto',
                scrollSnapType: 'x mandatory',
                paddingBottom: '1.5rem',
                scrollBehavior: 'smooth',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {currentProducts.map(prod => (
                <div
                  key={prod.id}
                  style={{
                    flex: '0 0 300px',
                    minWidth: '300px',
                    maxWidth: '320px',
                    scrollSnapAlign: 'start',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <ProductCard
                    product={prod}
                    onSelect={(slug) => onNavigate('product-detail', { slug })}
                    onQuickView={(p) => setQuickViewSlug(p.slug)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid-products">
              {currentProducts.map(prod => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onSelect={(slug) => onNavigate('product-detail', { slug })}
                  onQuickView={(p) => setQuickViewSlug(p.slug)}
                />
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
            <button
              onClick={() => onNavigate('products')}
              className="btn btn-secondary btn-lg"
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              View Full Catalog ({categories.reduce((sum, c) => sum + (c.product_count || 0), 0) || (featuredData.all || []).length || 14}+ Assets) <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Promotional Banner */}
      <section style={{ padding: '3rem 0' }}>
        <div className="container">
          <div
            className="flowpay-promo-card"
            style={{
              position: 'relative',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              padding: '3.5rem 3rem',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '2rem'
            }}
          >
            <div style={{ maxWidth: '600px' }}>
              <span className="badge badge-bestseller" style={{ marginBottom: '1rem' }}>
                SPECIAL BUNDLE LAUNCH
              </span>
              <h3 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '1rem' }}>
                FlowPay Fintech Suite: Flutter Mobile & Node.js Backend
              </h3>
              <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                Launch your fintech MVP in days instead of months. Full biometric auth, 3D card flips, wallet transfers, and production REST API with database schemas.
              </p>
              <button
                onClick={() => onNavigate('product-detail', { slug: 'flowpay-fullstack-mobile-banking-app' })}
                className="btn btn-primary btn-lg"
              >
                Claim Launch Deal (50% Off) <ArrowRight size={18} />
              </button>
            </div>

            <div
              className="flowpay-features-box"
              style={{
                backdropFilter: 'blur(12px)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.75rem',
                minWidth: '260px'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={18} color="#10b981" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>40+ Flutter 3.24 Screens</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={18} color="#10b981" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Node.js & SQLite/Postgres</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={18} color="#10b981" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Stripe & Razorpay Ready</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={18} color="#10b981" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Commercial Rights</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="testimonials-section" style={{ padding: '4.5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.05em' }}>
              Trusted by 15,000+ Teams
            </span>
            <h2 className="display-title gradient-text" style={{ fontSize: '2.4rem', marginTop: '4px' }}>
              What Creators Are Saying
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.75rem'
          }}>
            {[
              {
                quote: 'Apex SaaS UI Kit allowed us to launch our analytics platform 3 months ahead of schedule. The tokens and dark mode styling are unmatched.',
                author: 'Marcus Vance',
                role: 'Founder at DataScale',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
              },
              {
                quote: 'The Terraform and CloudScale modules passed our enterprise SOC-2 audit on the first review. Incredible value for the price.',
                author: 'Elena Rostova',
                role: 'Lead Cloud Architect',
                avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80'
              },
              {
                quote: 'Instant downloads, genuine lifetime updates, and clean file structures. Rollixia is now our agency’s primary source for templates.',
                author: 'Devon Wright',
                role: 'Creative Director at WrightStudio',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80'
              }
            ].map((t, idx) => (
              <div key={idx} className="glass-card testimonial-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', color: '#f59e0b', marginBottom: '1rem', fontSize: '1.1rem' }}>
                  ★★★★★
                </div>
                <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem', flex: 1 }}>
                  "{t.quote}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={t.avatar}
                    alt={t.author}
                    style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{t.author}</h4>
                    <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ padding: '4.5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.05em' }}>
              Common Questions
            </span>
            <h2 className="display-title gradient-text" style={{ fontSize: '2.4rem', marginTop: '4px' }}>
              Frequently Asked Questions
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
            {homeFaqs.map((faq, idx) => (
              <div
                key={idx}
                className="glass-card"
                style={{ overflow: 'hidden', transition: 'border-color var(--transition-fast)' }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                  style={{
                    width: '100%',
                    padding: '1.25rem 1.5rem',
                    background: 'transparent',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={20}
                    color="var(--text-muted)"
                    style={{
                      transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform var(--transition-fast)'
                    }}
                  />
                </button>
                {openFaq === idx && (
                  <div style={{ padding: '0 1.5rem 1.25rem 1.5rem', fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      <QuickViewModal
        productSlug={quickViewSlug}
        onClose={() => setQuickViewSlug(null)}
        onNavigateProduct={(slug) => {
          setQuickViewSlug(null);
          onNavigate('product-detail', { slug });
        }}
      />
    </div>
  );
}
