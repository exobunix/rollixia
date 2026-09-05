import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingBag,
  Zap,
  CheckCircle,
  ShieldCheck,
  DownloadCloud,
  ExternalLink,
  Play,
  Heart,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Star,
  RefreshCw,
  Clock,
  Layers,
  Sparkles,
  FileCode,
  Package,
  Gift,
  Check,
  Lock,
  Headphones,
  Award,
  ArrowRight,
  Shield,
  HelpCircle,
  Cpu,
  Monitor,
  Smartphone,
  Globe,
  Maximize2,
  X,
  AlertCircle,
  Wrench,
  Navigation,
  Share2
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatters';
import { apiRequest } from '../../utils/api';
import { Badge, StarRating } from '../../components/common/Badge';

// Helper to render dynamic Lucide icons from string names
function DynamicIcon({ name, size = 20, className = '', style }) {
  const iconMap = {
    Zap,
    CheckCircle,
    ShieldCheck,
    DownloadCloud,
    ExternalLink,
    Play,
    Heart,
    Star,
    RefreshCw,
    Clock,
    Layers,
    Sparkles,
    FileCode,
    Package,
    Gift,
    Check,
    Lock,
    Headphones,
    Award,
    ArrowRight,
    Shield,
    HelpCircle,
    Cpu,
    Monitor,
    Smartphone,
    Globe,
    ShoppingBag,
    Wrench,
    Navigation
  };

  const Component = iconMap[name] || CheckCircle;
  return <Component size={size} className={className} style={style} />;
}

import { getFallbackProductBySlug, getFallbackRelated } from '../../data/catalogFallbackService.js';

export function DynamicProductPage({ slug, productData: initialData, onNavigate, isPreviewMode = false }) {
  const fallbackProduct = !initialData && slug ? getFallbackProductBySlug(slug) : null;
  const [data, setData] = useState(() => initialData || fallbackProduct || null);
  const [related, setRelated] = useState(() => (!initialData && slug ? getFallbackRelated(slug) : []));
  const [loading, setLoading] = useState(() => !initialData && !fallbackProduct);

  // Gallery & Lightbox State
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [lightboxCaption, setLightboxCaption] = useState('');

  // Video Modal
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // FAQ Accordion State
  const [openFaqIndices, setOpenFaqIndices] = useState([0]);

  // Sticky Bar & Scroll Position
  const [showStickyBar, setShowStickyBar] = useState(false);
  const heroRef = useRef(null);

  // License Selection
  const [selectedLicense, setSelectedLicense] = useState(null);

  // Context Hooks
  const { addToCart } = useCart();
  const { currency } = useCurrency();
  const { user } = useAuth();
  const { addToast } = useToast();

  // Scroll trigger for sticky purchase bar
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const heroBottom = heroRef.current.getBoundingClientRect().bottom;
        setShowStickyBar(heroBottom < 0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') setLightboxOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen]);

  // Load product data
  useEffect(() => {
    if (initialData) {
      setData(initialData);
      if (initialData.licenses && initialData.licenses.length > 0) {
        setSelectedLicense(initialData.licenses[0]);
      }
      return;
    }

    if (!slug) return;
    setLoading(true);
    if (!isPreviewMode) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    apiRequest(`/api/products/${slug}`)
      .then(res => {
        setData(res);
        if (res.licenses && res.licenses.length > 0) {
          setSelectedLicense(res.licenses[0]);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));

    apiRequest(`/api/products/${slug}/related`)
      .then(res => setRelated(res || []))
      .catch(() => {});
  }, [slug, initialData, isPreviewMode]);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
        <div style={{
          width: '44px',
          height: '44px',
          border: '4px solid rgba(99, 102, 241, 0.2)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <p style={{ fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.04em' }}>Loading product experience...</p>
      </div>
    );
  }

  if (!data || !data.product) {
    return (
      <div className="pdp-container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <div style={{
          width: '64px',
          height: '64px',
          background: 'rgba(244, 63, 94, 0.12)',
          border: '1px solid rgba(244, 63, 94, 0.25)',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          color: 'var(--accent-rose)'
        }}>
          <AlertCircle size={32} />
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>Product Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 2rem', fontSize: '0.95rem' }}>
          The requested digital product could not be located or may have been updated in our catalog.
        </p>
        <button
          onClick={() => onNavigate && onNavigate('products')}
          className="btn btn-primary"
        >
          Explore Full Catalog
        </button>
      </div>
    );
  }

  const {
    product,
    media = [],
    licenses = [],
    features = [],
    faqs = [],
    testimonials = [],
    sections: dbSections = []
  } = data;

  // Price calculation based on selected license or base product
  const selectedLicenseRegular = (selectedLicense && selectedLicense.regular_price) ? selectedLicense.regular_price : product.regular_price;
  const selectedLicenseOffer = (selectedLicense && selectedLicense.price !== undefined)
    ? selectedLicense.price
    : (product.sale_price !== null && product.sale_price !== undefined ? product.sale_price : product.regular_price);

  const currentPrice = selectedLicenseOffer;
  const regularPrice = selectedLicenseRegular;
  const hasDiscount = regularPrice > currentPrice;
  const discountPct = hasDiscount ? Math.round(((regularPrice - currentPrice) / regularPrice) * 100) : 0;
  const savingsAmount = hasDiscount ? regularPrice - currentPrice : 0;

  // Primary gallery list
  const galleryImages = media.length > 0
    ? media.filter(m => m.media_type === 'image' || !m.media_type)
    : [{ id: 'primary', media_url: product.hero_image || product.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80', caption: product.title }];

  const currentGalleryImg = galleryImages[selectedGalleryIndex] || galleryImages[0];

  // Handlers
  const handleBuyNow = () => {
    if (isPreviewMode) {
      addToast('Live Preview Mode: Purchase flow simulated', 'info');
      return;
    }
    addToCart(product, selectedLicense);
    if (onNavigate) onNavigate('checkout');
  };

  const handleAddToCart = () => {
    if (isPreviewMode) {
      addToast('Live Preview Mode: Added to simulated cart', 'info');
      return;
    }
    addToCart(product, selectedLicense);
    addToast(`${product.title} added to cart!`, 'success');
  };

  const openLightbox = (url, caption = '') => {
    setLightboxImage(url);
    setLightboxCaption(caption);
    setLightboxOpen(true);
  };

  const toggleFaq = (index) => {
    setOpenFaqIndices(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const expandAllFaqs = () => {
    const faqList = getSectionData('faq') || faqs;
    setOpenFaqIndices(faqList.map((_, idx) => idx));
  };

  const collapseAllFaqs = () => {
    setOpenFaqIndices([]);
  };

  // Helper to extract content of a section from database sections
  const getSection = (type) => dbSections.find(s => s.section_type === type);
  const getSectionData = (type) => {
    const sec = getSection(type);
    return sec ? sec.content : null;
  };

  // ----------------------------------------------------
  // CANONICAL SECTION RENDERERS (1 to 20)
  // ----------------------------------------------------

  // 01. Breadcrumb
  const renderBreadcrumb = () => (
    <nav aria-label="Breadcrumb" className="pdp-breadcrumbs">
      <div className="pdp-container">
        <ul className="pdp-breadcrumb-list">
          <li>
            <button
              onClick={() => onNavigate && onNavigate('home')}
              className="pdp-breadcrumb-btn"
            >
              Home
            </button>
          </li>
          <li className="pdp-breadcrumb-separator">/</li>
          <li>
            <button
              onClick={() => onNavigate && onNavigate('products', { category: product.category_slug || product.category_name })}
              className="pdp-breadcrumb-btn"
            >
              {product.category_name || 'Software & Digital Products'}
            </button>
          </li>
          <li className="pdp-breadcrumb-separator">/</li>
          <li className="pdp-breadcrumb-current" aria-current="page">
            {product.title}
          </li>
        </ul>
      </div>
    </nav>
  );

  // 02. Product Hero
  const renderHero = () => {
    const heroHighlights = [
      product.category_name || 'Instant Digital Delivery',
      'Commercial Production License',
      'Clean Modular Architecture',
      'Continuous Lifetime Updates'
    ];

    return (
      <section ref={heroRef} className="pdp-hero">
        <div className="pdp-container">
          <div className="pdp-hero-grid">
            {/* LEFT: Product Details & Purchase Trigger */}
            <div className="pdp-hero-left">
              {/* Category & Badges */}
              <div className="pdp-badge-strip">
                <span className="pdp-category-pill">
                  {product.category_name || 'DIGITAL PRODUCT'}
                </span>
                {product.badge && (
                  <Badge variant={product.badge}>{product.badge}</Badge>
                )}
              </div>

              {/* Title & Subtitle */}
              <div>
                <h1 className="pdp-title">
                  {product.title}
                </h1>
                {product.subtitle && (
                  <p className="pdp-subtitle">
                    {product.subtitle}
                  </p>
                )}
              </div>

              {/* Description */}
              <p className="pdp-description">
                {product.short_description || product.full_description?.slice(0, 190)}
              </p>

              {/* Feature Highlights */}
              <div className="pdp-hero-bullets">
                {heroHighlights.map((hl, idx) => (
                  <div key={idx} className="pdp-hero-bullet-item">
                    <div className="pdp-bullet-icon">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span>{hl}</span>
                  </div>
                ))}
              </div>

              {/* Pricing Box */}
              <div className="pdp-pricing-card">
                <div className="pdp-price-row">
                  <span className="pdp-current-price">
                    {formatCurrency(currentPrice, currency)}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="pdp-regular-price">
                        {formatCurrency(regularPrice, currency)}
                      </span>
                      <span className="pdp-save-badge">
                        Save {formatCurrency(savingsAmount, currency)} ({discountPct}% OFF)
                      </span>
                    </>
                  )}
                </div>

                {/* License Tier Selector */}
                {licenses && licenses.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                        Select License Option:
                      </span>
                      {selectedLicense && selectedLicense.regular_price && selectedLicense.regular_price > selectedLicense.price && (
                        <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>
                          ✓ Save {formatCurrency(selectedLicense.regular_price - selectedLicense.price, currency)} with this tier
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: licenses.length > 1 ? `repeat(${licenses.length}, 1fr)` : '1fr', gap: '0.6rem' }}>
                      {licenses.map(lic => {
                        const isSel = selectedLicense?.id === lic.id || (!selectedLicense && lic.id === licenses[0]?.id);
                        const licName = lic.license_name || lic.name || 'Standard Commercial License';
                        const hasLicDiscount = lic.regular_price && lic.regular_price > lic.price;
                        const licDiscountPct = hasLicDiscount ? Math.round(((lic.regular_price - lic.price) / lic.regular_price) * 100) : 0;

                        return (
                          <button
                            key={lic.id || licName}
                            type="button"
                            onClick={() => setSelectedLicense(lic)}
                            style={{
                              background: isSel ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-surface-elevated)',
                              border: `2px solid ${isSel ? 'var(--primary)' : 'var(--border-medium)'}`,
                              borderRadius: 'var(--radius-md)',
                              padding: '0.85rem 1rem',
                              textAlign: 'left',
                              cursor: 'pointer',
                              color: 'var(--text-primary)',
                              transition: 'all var(--transition-fast)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px',
                              position: 'relative'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                              <span style={{ fontSize: '0.825rem', fontWeight: 700, color: isSel ? 'var(--primary)' : 'var(--text-primary)', lineHeight: 1.3 }}>
                                {licName}
                              </span>
                              {isSel && (
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }}></span>
                              )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                                {formatCurrency(lic.price, currency)}
                              </span>
                              {hasLicDiscount && (
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                                  {formatCurrency(lic.regular_price, currency)}
                                </span>
                              )}
                              {hasLicDiscount && (
                                <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700 }}>
                                  ({licDiscountPct}% OFF)
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Active License Inclusions & Terms Callout */}
                    {selectedLicense && (
                      <div style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(99, 102, 241, 0.08)',
                        border: '1px solid rgba(99, 102, 241, 0.22)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px'
                      }}>
                        <ShieldCheck size={17} color="var(--primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <div style={{ fontSize: '0.8rem', lineHeight: 1.45 }}>
                          <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>
                            {selectedLicense.license_name || selectedLicense.name} Inclusions:
                          </strong>
                          <span style={{ color: 'var(--text-secondary)' }}>
                            {selectedLicense.description || selectedLicense.permissions || 'Single project deployment with full source code, personal and client commercial rights included.'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* CTA Buttons */}
                <div className="pdp-cta-grid">
                  <button
                    onClick={handleBuyNow}
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%', gap: '0.6rem' }}
                  >
                    <Zap size={18} fill="currentColor" />
                    <span>BUY NOW</span>
                  </button>
                  <button
                    onClick={handleAddToCart}
                    className="btn btn-secondary btn-lg"
                    style={{ width: '100%', gap: '0.6rem' }}
                  >
                    <ShoppingBag size={18} />
                    <span>ADD TO CART</span>
                  </button>
                </div>

                {/* Trust Indicators */}
                <div className="pdp-trust-bar">
                  <span className="pdp-trust-item">
                    <Lock size={14} style={{ color: 'var(--accent-emerald)' }} />
                    256-Bit Encrypted Payment
                  </span>
                  <span className="pdp-trust-item">
                    <DownloadCloud size={14} style={{ color: 'var(--primary)' }} />
                    Instant File Access
                  </span>
                  <span className="pdp-trust-item">
                    <ShieldCheck size={14} style={{ color: 'var(--accent-emerald)' }} />
                    Commercial License
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT: Large Mockup Frame */}
            <div className="pdp-hero-right">
              <div className="pdp-mockup-frame">
                <div className="pdp-mockup-viewport">
                  <img
                    src={product.hero_image || currentGalleryImg.media_url}
                    alt={product.title}
                    className="pdp-mockup-img"
                  />

                  {product.demo_url && (
                    <a
                      href={product.demo_url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{
                        position: 'absolute',
                        bottom: '1rem',
                        right: '1rem',
                        background: 'rgba(15, 23, 42, 0.9)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: 'var(--shadow-md)'
                      }}
                    >
                      <ExternalLink size={13} />
                      Live Preview
                    </a>
                  )}
                </div>

                {/* Floating Quality Badge */}
                <div className="pdp-hero-badge-float">
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-emerald)',
                    flexShrink: 0
                  }}>
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Quality Verified
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Production Ready Code
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  // 03. Product Gallery
  const renderGallery = () => {
    return (
      <section className="pdp-section">
        <div className="pdp-container">
          <div className="pdp-gallery-header">
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Product Gallery</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Explore interfaces, layouts, and responsive views.</p>
            </div>
            <button
              onClick={() => openLightbox(currentGalleryImg.media_url, currentGalleryImg.caption)}
              className="btn btn-outline btn-sm"
            >
              <Maximize2 size={13} />
              Fullscreen
            </button>
          </div>

          {/* Primary Viewport */}
          <div className="pdp-gallery-main">
            <img
              src={currentGalleryImg.media_url}
              alt={currentGalleryImg.caption || product.title}
              className="pdp-gallery-img"
              onClick={() => openLightbox(currentGalleryImg.media_url, currentGalleryImg.caption)}
            />

            {galleryImages.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedGalleryIndex(prev => (prev === 0 ? galleryImages.length - 1 : prev - 1))}
                  className="pdp-gallery-nav-btn pdp-gallery-nav-prev"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setSelectedGalleryIndex(prev => (prev === galleryImages.length - 1 ? 0 : prev + 1))}
                  className="pdp-gallery-nav-btn pdp-gallery-nav-next"
                  aria-label="Next image"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            <div className="pdp-gallery-counter">
              {selectedGalleryIndex + 1} / {galleryImages.length}
            </div>
          </div>

          {/* Thumbnails */}
          {galleryImages.length > 1 && (
            <div className="pdp-thumbnails-strip">
              {galleryImages.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setSelectedGalleryIndex(idx)}
                  className={`pdp-thumb-btn ${selectedGalleryIndex === idx ? 'active' : ''}`}
                >
                  <img src={img.media_url} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  };

  // 04. Highlights Grid
  const renderHighlights = () => {
    const highlights = getSectionData('highlights') || [
      { icon: 'Zap', title: 'Ready to Deploy', description: 'Immediate production setup with clean scaffolding.' },
      { icon: 'ShieldCheck', title: 'Commercial License', description: 'Safe for commercial and client deployments.' },
      { icon: 'Layers', title: 'Modular Architecture', description: 'Clean extensible code built to scale.' },
      { icon: 'RefreshCw', title: 'Lifetime Updates', description: 'Continuous improvements and bug fixes.' }
    ];

    if (!highlights || !highlights.length) return null;

    return (
      <section className="pdp-section">
        <div className="pdp-container">
          <div className="pdp-grid-4">
            {highlights.map((hl, idx) => (
              <div key={idx} className="pdp-card">
                <div className="pdp-card-icon">
                  <DynamicIcon name={hl.icon} size={20} />
                </div>
                <h3 className="pdp-card-title">{hl.title}</h3>
                <p className="pdp-card-text">{hl.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // 05. Product Overview
  const renderOverview = () => {
    const overviewContent = getSectionData('overview');
    const specsList = overviewContent?.specs || [
      { label: 'Category', value: product.category_name || 'Software Application' },
      { label: 'Delivery', value: 'Instant Download & Access' },
      { label: 'License', value: 'Commercial Single Project' },
      { label: 'File Type', value: 'Full Source Code ZIP' }
    ];

    const description = overviewContent?.description || product.full_description || product.short_description;

    return (
      <section className="pdp-section">
        <div className="pdp-container">
          <div className="pdp-overview-grid">
            {/* LEFT: About This Product */}
            <div>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
                About This Product
              </h2>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.975rem', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                {description}
              </div>
            </div>

            {/* RIGHT: Quick Specifications Card */}
            <div className="pdp-specs-box">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <Cpu size={18} style={{ color: 'var(--primary)' }} />
                Quick Specifications
              </h3>

              <div>
                {specsList.map((sp, idx) => (
                  <div key={idx} className="pdp-specs-row">
                    <span className="pdp-specs-label">{sp.label}</span>
                    <span className="pdp-specs-val">{sp.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  // 06. Key Features
  const renderFeatures = () => {
    const featList = getSectionData('features') || features;
    if (!featList || !featList.length) return null;

    return (
      <section className="pdp-section">
        <div className="pdp-container">
          <div className="pdp-section-header">
            <span className="pdp-kicker">Built For Scale</span>
            <h2 className="pdp-section-title">Key Features</h2>
            <p className="pdp-section-subtitle">Carefully engineered capabilities included out of the box.</p>
          </div>

          <div className="pdp-grid-3">
            {featList.map((f, idx) => (
              <div key={idx} className="pdp-card">
                <div className="pdp-card-icon">
                  <DynamicIcon name={f.icon || 'CheckCircle'} size={20} />
                </div>
                <h3 className="pdp-card-title">{f.title}</h3>
                <p className="pdp-card-text">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // 07. Feature Showcase (Alternating visual rows)
  const renderShowcase = () => {
    const showcaseList = getSectionData('showcase');
    if (!showcaseList || !showcaseList.length) return null;

    return (
      <section className="pdp-section">
        <div className="pdp-container">
          <div className="pdp-section-header">
            <span className="pdp-kicker">Deep Dive</span>
            <h2 className="pdp-section-title">Feature Showcase</h2>
            <p className="pdp-section-subtitle">See how every module functions in action.</p>
          </div>

          <div>
            {showcaseList.map((item, idx) => {
              const isReversed = item.alignment === 'right' || idx % 2 === 1;

              return (
                <div
                  key={idx}
                  className={`pdp-showcase-row ${isReversed ? 'reversed' : ''}`}
                >
                  {/* Screenshot Frame */}
                  <div
                    onClick={() => openLightbox(item.image, item.title)}
                    className="pdp-showcase-frame"
                    style={{ order: isReversed ? 2 : 1 }}
                  >
                    <img src={item.image} alt={item.title} />
                  </div>

                  {/* Text & Bullets */}
                  <div style={{ order: isReversed ? 1 : 2, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{
                      display: 'inline-flex',
                      alignSelf: 'flex-start',
                      padding: '0.2rem 0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      background: 'rgba(99, 102, 241, 0.12)',
                      color: 'var(--primary)',
                      border: '1px solid rgba(99, 102, 241, 0.25)'
                    }}>
                      {`0${idx + 1}`}
                    </div>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.25 }}>
                      {item.title}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.6 }}>
                      {item.description}
                    </p>

                    {item.bullet_points && item.bullet_points.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' }}>
                        {item.bullet_points.map((bp, bIdx) => (
                          <div key={bIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            <div className="pdp-bullet-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', borderColor: 'rgba(99, 102, 241, 0.4)', color: 'var(--primary)' }}>
                              <Check size={11} strokeWidth={3} />
                            </div>
                            <span>{bp}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  };

  // 08. Screenshots Grid
  const renderScreenshots = () => {
    const screenshots = getSectionData('screenshots');
    if (!screenshots || !screenshots.length) return null;

    return (
      <section className="pdp-section">
        <div className="pdp-container">
          <div className="pdp-section-header">
            <span className="pdp-kicker">Interface Previews</span>
            <h2 className="pdp-section-title">Explore the Product</h2>
            <p className="pdp-section-subtitle">Take a closer look at the interface and functionality.</p>
          </div>

          <div className="pdp-grid-3">
            {screenshots.map((s, idx) => (
              <div
                key={idx}
                onClick={() => openLightbox(s.url, s.caption)}
                className="pdp-card"
                style={{ padding: '0.5rem', cursor: 'pointer', overflow: 'hidden' }}
              >
                <div style={{ aspectRatio: '16/10', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#000' }}>
                  <img
                    src={s.url}
                    alt={s.caption || `Screenshot ${idx + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                  />
                </div>
                {s.caption && (
                  <div style={{ padding: '0.75rem 0.5rem 0.25rem', textAlign: 'center', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {s.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // 09. What's Included
  const renderIncluded = () => {
    const items = getSectionData('included') || [
      { title: 'Full Clean Source Code', description: 'Unencrypted codebase ready for customization.', icon: 'FileCode' },
      { title: 'Setup Documentation', description: 'Comprehensive guides with setup steps.', icon: 'Package' },
      { title: 'Admin Dashboard', description: 'Complete backend panel for system control.', icon: 'Layers' },
      { title: 'Commercial License', description: 'Authorized for client or business use.', icon: 'ShieldCheck' }
    ];

    return (
      <section className="pdp-section">
        <div className="pdp-container">
          <div className="pdp-section-header">
            <span className="pdp-kicker">Deliverables</span>
            <h2 className="pdp-section-title">What's Included</h2>
            <p className="pdp-section-subtitle">Everything delivered straight into your customer account.</p>
          </div>

          <div className="pdp-grid-3">
            {items.map((it, idx) => (
              <div key={idx} className="pdp-card" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div className="pdp-bullet-icon" style={{ marginTop: '3px' }}>
                  <Check size={14} strokeWidth={3} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{it.title}</h3>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{it.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // 10. How It Works
  const renderHowItWorks = () => {
    const steps = getSectionData('how_it_works') || [
      { step: '01', title: 'Choose Product', description: 'Review features and choose your license tier.', icon: 'ShoppingBag' },
      { step: '02', title: 'Complete Payment', description: 'Encrypted, instant checkout with direct confirmation.', icon: 'Lock' },
      { step: '03', title: 'Receive Access', description: 'Get download files and documentation immediately.', icon: 'DownloadCloud' },
      { step: '04', title: 'Deploy & Launch', description: 'Follow quickstart instructions to go live.', icon: 'Zap' }
    ];

    return (
      <section className="pdp-section">
        <div className="pdp-container">
          <div className="pdp-section-header">
            <span className="pdp-kicker">Process</span>
            <h2 className="pdp-section-title">How It Works</h2>
            <p className="pdp-section-subtitle">From purchase to live deployment in simple steps.</p>
          </div>

          <div className="pdp-grid-4">
            {steps.map((st, idx) => (
              <div key={idx} className="pdp-card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{
                  padding: '0.2rem 0.7rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  background: 'rgba(99, 102, 241, 0.12)',
                  color: 'var(--primary)',
                  border: '1px solid rgba(99, 102, 241, 0.3)'
                }}>
                  {st.step || `0${idx + 1}`}
                </span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>{st.title}</h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{st.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // 11. Technical Specifications
  const renderSpecs = () => {
    const specs = getSectionData('specs');
    if (!specs || !specs.length) return null;

    return (
      <section className="pdp-section">
        <div className="pdp-container">
          <div className="pdp-section-header">
            <span className="pdp-kicker">Engineering</span>
            <h2 className="pdp-section-title">Technical Specifications</h2>
            <p className="pdp-section-subtitle">System compatibility, frameworks, and requirements.</p>
          </div>

          <div className="pdp-table-wrap">
            <table className="pdp-table">
              <tbody>
                {specs.map((sp, idx) => (
                  <tr key={idx}>
                    <td className="label-col">{sp.label}</td>
                    <td className="val-col">{sp.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    );
  };

  // 12. Supported Platforms
  const renderPlatforms = () => {
    const platforms = getSectionData('platforms');
    if (!platforms || !platforms.length) return null;

    return (
      <section className="pdp-section">
        <div className="pdp-container">
          <div className="pdp-section-header">
            <span className="pdp-kicker">Compatibility</span>
            <h2 className="pdp-section-title">Supported Platforms</h2>
            <p className="pdp-section-subtitle">Built to integrate with your existing technology stack.</p>
          </div>

          <div className="pdp-grid-4">
            {platforms.map((pl, idx) => (
              <div key={idx} className="pdp-card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="pdp-card-icon">
                  <DynamicIcon name={pl.icon || 'Globe'} size={22} />
                </div>
                <h3 className="pdp-card-title" style={{ fontSize: '0.95rem' }}>{pl.name}</h3>
                <p className="pdp-card-text" style={{ fontSize: '0.8rem' }}>{pl.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // 13. Use Cases
  const renderUseCases = () => {
    const useCases = getSectionData('use_cases');
    if (!useCases || !useCases.length) return null;

    return (
      <section className="pdp-section">
        <div className="pdp-container">
          <div className="pdp-section-header">
            <span className="pdp-kicker">Application</span>
            <h2 className="pdp-section-title">Built for Different Models</h2>
            <p className="pdp-section-subtitle">Tailored deployment scenarios across various industry niches.</p>
          </div>

          <div className="pdp-grid-3">
            {useCases.map((uc, idx) => (
              <div key={idx} className="pdp-card">
                <div className="pdp-card-icon">
                  <DynamicIcon name={uc.icon || 'Layers'} size={22} />
                </div>
                <h3 className="pdp-card-title">{uc.title}</h3>
                <p className="pdp-card-text">{uc.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // 14. Video Tour
  const renderVideo = () => {
    const videoData = getSectionData('video') || (product.video_url ? { url: product.video_url, title: 'Product Walkthrough', description: 'See the solution in action.' } : null);
    if (!videoData || !videoData.url) return null;

    return (
      <section className="pdp-section">
        <div className="pdp-container">
          <div className="pdp-section-header">
            <span className="pdp-kicker">Live Demo</span>
            <h2 className="pdp-section-title">See It In Action</h2>
            <p className="pdp-section-subtitle">{videoData.description || 'Watch the detailed walkthrough.'}</p>
          </div>

          <div style={{
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            border: '1px solid var(--border-medium)',
            background: '#060913',
            aspectRatio: '16/9',
            boxShadow: 'var(--shadow-lg)'
          }}>
            {videoData.url.includes('youtube.com') || videoData.url.includes('youtu.be') ? (
              <iframe
                src={videoData.url.replace('watch?v=', 'embed/')}
                title={videoData.title || 'Video Tour'}
                style={{ width: '100%', height: '100%', border: 0 }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video controls poster={videoData.thumbnail} style={{ width: '100%', height: '100%', objectFit: 'cover' }}>
                <source src={videoData.url} type="video/mp4" />
              </video>
            )}
          </div>
        </div>
      </section>
    );
  };

  // 15. Pricing CTA Section
  const renderPricing = () => {
    return (
      <section className="pdp-section">
        <div className="pdp-container">
          <div className="pdp-conversion-banner">
            <span className="pdp-kicker">Instant Access</span>
            <h2 className="pdp-section-title" style={{ marginTop: '0.25rem' }}>
              Ready to Get Started?
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '640px', margin: '0.75rem auto 1.5rem', fontSize: '1rem' }}>
              Get {product.title} today with lifetime updates and standard commercial license.
            </p>

            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <span style={{ fontSize: 'clamp(2.5rem, 4vw, 3.25rem)', fontWeight: 800, color: '#fff' }}>
                {formatCurrency(currentPrice, currency)}
              </span>
              {hasDiscount && (
                <span style={{ fontSize: '1.25rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                  {formatCurrency(regularPrice, currency)}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '460px', margin: '0 auto' }}>
              <button
                onClick={handleBuyNow}
                className="btn btn-primary btn-lg"
                style={{ flex: '1 1 200px', gap: '0.5rem' }}
              >
                <Zap size={18} fill="currentColor" />
                <span>BUY NOW</span>
              </button>
              <button
                onClick={handleAddToCart}
                className="btn btn-secondary btn-lg"
                style={{ flex: '1 1 200px', gap: '0.5rem' }}
              >
                <ShoppingBag size={18} />
                <span>ADD TO CART</span>
              </button>
            </div>

            <div className="pdp-trust-bar" style={{ justifyContent: 'center', gap: '2rem', marginTop: '2.5rem' }}>
              <span className="pdp-trust-item"><Lock size={14} style={{ color: 'var(--accent-emerald)' }} /> Secure Payment</span>
              <span className="pdp-trust-item"><DownloadCloud size={14} style={{ color: 'var(--primary)' }} /> Instant Access</span>
              <span className="pdp-trust-item"><ShieldCheck size={14} style={{ color: 'var(--accent-emerald)' }} /> Commercial Rights</span>
            </div>
          </div>
        </div>
      </section>
    );
  };

  // 16. Customer Testimonials
  const renderTestimonials = () => {
    const testList = (testimonials && testimonials.length > 0) ? testimonials : (getSectionData('testimonials') || []);
    if (!testList || !testList.length) return null;

    return (
      <section className="pdp-section">
        <div className="pdp-container">
          <div className="pdp-section-header">
            <span className="pdp-kicker">Social Proof</span>
            <h2 className="pdp-section-title">What Our Customers Say</h2>
            <p className="pdp-section-subtitle">Real feedback from verified purchasers who deployed this product.</p>
          </div>

          <div className="pdp-grid-3">
            {testList.map((tm, idx) => (
              <div key={idx} className="pdp-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <StarRating rating={tm.rating || 5} />
                    {(tm.is_verified === 1 || tm.is_verified === true || tm.is_verified === undefined) && (
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <CheckCircle size={12} /> Verified
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, fontStyle: 'italic' }}>
                    "{tm.text || tm.quote || tm.review || ''}"
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                  {tm.avatar_url && (
                    <img src={tm.avatar_url} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                  )}
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{tm.name || tm.user_name || 'Verified Customer'}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tm.designation || tm.role || 'Verified Buyer'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // 17. FAQ Accordion
  const renderFaq = () => {
    const faqList = getSectionData('faq') || faqs;
    if (!faqList || !faqList.length) return null;

    return (
      <section className="pdp-section">
        <div className="pdp-container">
          <div className="pdp-section-header">
            <span className="pdp-kicker">Support</span>
            <h2 className="pdp-section-title">Frequently Asked Questions</h2>
            <p className="pdp-section-subtitle">Have a question before purchasing? Find quick answers below.</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '1rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>
            <button onClick={expandAllFaqs} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>Expand All</button>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <button onClick={collapseAllFaqs} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>Collapse All</button>
          </div>

          <div className="pdp-faq-list">
            {faqList.map((item, idx) => {
              const isOpen = openFaqIndices.includes(idx);
              return (
                <div key={idx} className="pdp-faq-item">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="pdp-faq-header"
                  >
                    <span>{item.question}</span>
                    {isOpen ? <ChevronUp size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} /> : <ChevronDown size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
                  </button>
                  {isOpen && (
                    <div className="pdp-faq-body">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  };

  // 18. License & Delivery Information
  const renderLicenseDelivery = () => {
    const licData = getSectionData('license_delivery') || {
      license_type: 'Commercial Project License',
      delivery_method: 'Instant Digital Download',
      access: 'Lifetime access with unlimited downloads',
      support: 'Standard technical assistance included',
      disclaimer: 'Product is independently developed for professional deployment.'
    };

    return (
      <section className="pdp-section">
        <div className="pdp-container">
          <div className="pdp-card" style={{ padding: '2rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="pdp-card-icon" style={{ marginBottom: 0 }}>
                <ShieldCheck size={22} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>License & Delivery Information</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Clear terms and instant delivery specifications.</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div className="pdp-license-box" style={{ padding: '1.25rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>License Type</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.35rem' }}>{licData.license_type}</div>
              </div>
              <div className="pdp-license-box" style={{ padding: '1.25rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Delivery Method</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.35rem' }}>{licData.delivery_method}</div>
              </div>
              <div className="pdp-license-box" style={{ padding: '1.25rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Access Period</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.35rem' }}>{licData.access}</div>
              </div>
              <div className="pdp-license-box" style={{ padding: '1.25rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Support</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.35rem' }}>{licData.support}</div>
              </div>
            </div>

            {licData.disclaimer && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', lineHeight: 1.6 }}>
                {licData.disclaimer}
              </p>
            )}
          </div>
        </div>
      </section>
    );
  };

  // 19. Related Products
  const renderRelated = () => {
    if (!related || related.length === 0) return null;

    return (
      <section className="pdp-section">
        <div className="pdp-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <span className="pdp-kicker">Recommended</span>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>You May Also Like</h2>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('products')}
              className="btn btn-outline btn-sm"
            >
              View Catalog <ArrowRight size={14} />
            </button>
          </div>

          <div className="pdp-grid-4">
            {related.slice(0, 4).map(prod => {
              const effectivePrice = prod.sale_price !== null && prod.sale_price !== undefined ? prod.sale_price : prod.regular_price;
              const hasDisc = prod.regular_price > effectivePrice;

              return (
                <div
                  key={prod.id}
                  onClick={() => onNavigate && onNavigate('product-detail', { slug: prod.slug })}
                  className="pdp-card"
                  style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '0.85rem' }}
                >
                  <div>
                    <div style={{ aspectRatio: '16/10', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#000', position: 'relative', marginBottom: '0.75rem' }}>
                      <img
                        src={prod.thumbnail || prod.hero_image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'}
                        alt={prod.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {prod.badge && (
                        <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem' }}>
                          <Badge variant={prod.badge}>{prod.badge}</Badge>
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.04em' }}>
                      {prod.category_name || 'Software'}
                    </span>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {prod.title}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', paddingTop: '0.75rem', marginTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <div>
                      <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {formatCurrency(effectivePrice, currency)}
                      </span>
                      {hasDisc && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through', marginLeft: '0.5rem' }}>
                          {formatCurrency(prod.regular_price, currency)}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                      View →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  };

  // 20. Final Conversion CTA
  const renderFinalCta = () => {
    const finalData = getSectionData('final_cta') || {
      heading: 'Ready to Launch Your Next Project?',
      subheading: `Get ${product.title} today and build faster.`,
      cta_text: 'GET THIS PRODUCT'
    };

    return (
      <section className="pdp-section">
        <div className="pdp-container">
          <div className="pdp-conversion-banner" style={{ padding: '4rem 2rem' }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
              {finalData.heading}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '540px', margin: '0 auto 2rem' }}>
              {finalData.subheading}
            </p>

            <button
              onClick={handleBuyNow}
              className="btn btn-primary btn-lg"
              style={{ gap: '0.6rem', padding: '1rem 2.5rem', fontSize: '1.05rem' }}
            >
              <span>{finalData.cta_text || 'GET THIS PRODUCT'}</span>
              <ArrowRight size={18} />
            </button>

            <div className="pdp-trust-bar" style={{ justifyContent: 'center', gap: '2rem', marginTop: '2.5rem' }}>
              <span className="pdp-trust-item"><Lock size={14} style={{ color: 'var(--accent-emerald)' }} /> Secure Checkout</span>
              <span className="pdp-trust-item"><DownloadCloud size={14} style={{ color: 'var(--primary)' }} /> Instant File Delivery</span>
              <span className="pdp-trust-item"><ShieldCheck size={14} style={{ color: 'var(--accent-emerald)' }} /> Professional Support</span>
            </div>
          </div>
        </div>
      </section>
    );
  };

  // Section Dispatcher Map
  const sectionRendererMap = {
    breadcrumb: renderBreadcrumb,
    hero: renderHero,
    gallery: renderGallery,
    highlights: renderHighlights,
    overview: renderOverview,
    features: renderFeatures,
    showcase: renderShowcase,
    screenshots: renderScreenshots,
    included: renderIncluded,
    how_it_works: renderHowItWorks,
    specs: renderSpecs,
    platforms: renderPlatforms,
    use_cases: renderUseCases,
    video: renderVideo,
    pricing: renderPricing,
    testimonials: renderTestimonials,
    faq: renderFaq,
    license_delivery: renderLicenseDelivery,
    related: renderRelated,
    final_cta: renderFinalCta
  };

  // Canonical ordering fallback if dbSections is empty
  const defaultCanonicalTypes = [
    'breadcrumb', 'hero', 'gallery', 'highlights', 'overview', 'features',
    'showcase', 'screenshots', 'included', 'how_it_works', 'specs', 'platforms',
    'use_cases', 'video', 'pricing', 'testimonials', 'faq', 'license_delivery',
    'related', 'final_cta'
  ];

  const orderedSections = dbSections.length > 0
    ? dbSections.filter(s => s.is_visible === undefined || s.is_visible === 1 || s.is_visible === true).map(s => s.section_type || s.type)
    : defaultCanonicalTypes;

  return (
    <article className="pdp-page">
      {/* 20 Canonical Dynamic Sections in Configured Order */}
      {orderedSections.map((secType, idx) => {
        const renderer = sectionRendererMap[secType];
        if (!renderer) return null;
        return <React.Fragment key={`${secType}-${idx}`}>{renderer()}</React.Fragment>;
      })}

      {/* Sticky Bottom Purchase Bar */}
      {showStickyBar && (
        <div className="pdp-sticky-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', overflow: 'hidden' }}>
            <img
              src={product.thumbnail || product.hero_image}
              alt=""
              style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border-subtle)' }}
            />
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {product.title}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {formatCurrency(currentPrice, currency)}
                </span>
                {hasDiscount && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                    {formatCurrency(regularPrice, currency)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
            <button
              onClick={handleAddToCart}
              className="btn btn-secondary btn-sm"
            >
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              className="btn btn-primary btn-sm"
            >
              <Zap size={14} fill="currentColor" />
              BUY NOW
            </button>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="pdp-lightbox-overlay"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="pdp-lightbox-close"
            aria-label="Close Lightbox"
          >
            <X size={20} />
          </button>

          <div className="pdp-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightboxImage}
              alt={lightboxCaption}
            />
          </div>

          {lightboxCaption && (
            <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', fontWeight: 500 }}>
              {lightboxCaption}
            </p>
          )}
        </div>
      )}
    </article>
  );
}
