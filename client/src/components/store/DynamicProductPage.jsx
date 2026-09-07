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
  Share2,
  Database,
  Server,
  Code2,
  Users,
  Briefcase,
  FolderTree,
  ListChecks,
  Sliders,
  DollarSign,
  MessageSquare,
  Mail,
  Phone,
  Layout,
  Layers3,
  CheckSquare,
  HelpCircle as QuestionIcon
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatters';
import { apiRequest } from '../../utils/api';
import { Badge, StarRating } from '../../components/common/Badge';
import { getFallbackProductBySlug, getFallbackRelated } from '../../data/catalogFallbackService.js';
import { getProductImageOverrides } from '../../utils/imageCompressor.js';

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
    Navigation,
    Database,
    Server,
    Code2,
    Users,
    Briefcase,
    FolderTree,
    ListChecks,
    Sliders,
    DollarSign,
    MessageSquare,
    Mail,
    Phone,
    Layout
  };

  const Component = iconMap[name] || CheckCircle;
  return <Component size={size} className={className} style={style} />;
}

// Helper to auto-detect and parse video URLs (YouTube, Vimeo, MP4)
function parseVideoUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const url = rawUrl.trim();
  if (!url) return null;

  // YouTube detection (Standard, Shortened, Embed, Shorts)
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return {
      provider: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=0&rel=0`
    };
  }

  // Vimeo detection
  const vimeoMatch = url.match(/(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+))/i);
  if (vimeoMatch && vimeoMatch[3]) {
    return {
      provider: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[3]}`
    };
  }

  // Loom detection
  const loomMatch = url.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/i);
  if (loomMatch && loomMatch[1]) {
    return {
      provider: 'loom',
      embedUrl: `https://www.loom.com/embed/${loomMatch[1]}`
    };
  }

  // Direct MP4 or WebM
  if (url.match(/\.(mp4|webm|ogg)($|\?)/i) || url.toLowerCase().includes('.mp4')) {
    return {
      provider: 'mp4',
      src: url
    };
  }

  // Generic fallback if already embed or direct link
  if (url.includes('embed') || url.startsWith('http')) {
    return {
      provider: 'iframe',
      embedUrl: url
    };
  }

  return null;
}

export function DynamicProductPage({ slug, productData: initialData, onNavigate, isPreviewMode = false }) {
  const cleanSlug = slug ? decodeURIComponent(String(slug)).trim() : '';
  const fallbackProduct = !initialData && cleanSlug ? getFallbackProductBySlug(cleanSlug) : null;
  const [data, setData] = useState(() => initialData || fallbackProduct || null);
  const [related, setRelated] = useState(() => (!initialData && cleanSlug ? getFallbackRelated(cleanSlug) : []));
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
  const { addToCart, setIsCartOpen } = useCart();
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

  // Keyboard navigation for Lightbox & Video Modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (lightboxOpen) setLightboxOpen(false);
        if (isVideoModalOpen) setIsVideoModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, isVideoModalOpen]);

  // Load product data
  useEffect(() => {
    if (initialData) {
      setData(initialData);
      const lics = initialData.licenses || initialData.product?.licenses || [];
      if (lics.length > 0) {
        setSelectedLicense(lics[0]);
      }
      return;
    }

    if (!cleanSlug) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    apiRequest(`/api/products/${cleanSlug}`)
      .then(res => {
        if (!isMounted) return;
        if (res && (res.product || res.id)) {
          setData(res);
          const lics = res.licenses || res.product?.licenses || [];
          if (lics.length > 0) {
            setSelectedLicense(lics[0]);
          }
        } else if (fallbackProduct) {
          setData(fallbackProduct);
          const lics = fallbackProduct.licenses || [];
          if (lics.length > 0) setSelectedLicense(lics[0]);
        }
      })
      .catch(err => {
        console.warn('API error, using local fallback:', err);
        if (fallbackProduct && isMounted) {
          setData(fallbackProduct);
          const lics = fallbackProduct.licenses || [];
          if (lics.length > 0) setSelectedLicense(lics[0]);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    apiRequest(`/api/products/${cleanSlug}/related`)
      .then(relRes => {
        if (!isMounted) return;
        if (Array.isArray(relRes) && relRes.length > 0) {
          setRelated(relRes);
        }
      })
      .catch(() => {});

    return () => { isMounted = false; };
  }, [cleanSlug, initialData]);

  // Listen for live catalog updates from admin edits
  useEffect(() => {
    if (!cleanSlug || initialData) return;
    const handleCatalogUpdate = (e) => {
      if (e && e.detail && e.detail.product) {
        const p = e.detail.product;
        const matches = (
          String(p.id) === String(cleanSlug) ||
          p.slug === cleanSlug ||
          (data && (String(p.id) === String(data.id || data.product?.id) || p.slug === (data.slug || data.product?.slug)))
        );
        if (matches) {
          const updatedFull = getFallbackProductBySlug(cleanSlug);
          if (updatedFull) {
            setData(updatedFull);
            return;
          }
        }
      }

      const updated = getFallbackProductBySlug(cleanSlug);
      if (updated && (updated.product || updated.id)) {
        setData(updated);
        const lics = updated.licenses || updated.product?.licenses || [];
        if (lics.length > 0) {
          setSelectedLicense(lics[0]);
        }
      }
    };
    window.addEventListener('rollixia_catalog_updated', handleCatalogUpdate);
    window.addEventListener('storage', handleCatalogUpdate);
    return () => {
      window.removeEventListener('rollixia_catalog_updated', handleCatalogUpdate);
      window.removeEventListener('storage', handleCatalogUpdate);
    };
  }, [cleanSlug, initialData, data]);

  // Loading State
  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(99, 102, 241, 0.2)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ fontWeight: 600 }}>Loading product experience...</p>
        </div>
      </div>
    );
  }

  // Not Found State
  if (!data) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '480px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <AlertCircle size={28} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            Product Not Found
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.925rem' }}>
            The product you are looking for does not exist, has been removed, or is currently unpublished.
          </p>
          <button
            onClick={() => onNavigate && onNavigate('products')}
            className="btn btn-primary"
          >
            Browse All Products
          </button>
        </div>
      </div>
    );
  }

  // Normalize Product Payload
  const product = data.product || data;
  const media = Array.isArray(data.media) ? data.media : [];
  const features = Array.isArray(data.features) ? data.features : [];
  const faqs = Array.isArray(data.faqs) ? data.faqs : [];
  const testimonials = Array.isArray(data.testimonials) ? data.testimonials : [];
  const dbSections = Array.isArray(data.sections) ? data.sections : [];
  const licenses = Array.isArray(data.licenses) ? data.licenses : [];

  // Calculate Prices
  const basePrice = product.sale_price !== null && product.sale_price !== undefined ? product.sale_price : product.regular_price;
  const currentPrice = selectedLicense ? selectedLicense.price : basePrice;
  const regularPrice = selectedLicense && selectedLicense.regular_price ? selectedLicense.regular_price : product.regular_price;
  const hasDiscount = regularPrice > currentPrice;
  const discountPct = hasDiscount ? Math.round(((regularPrice - currentPrice) / regularPrice) * 100) : 0;
  const savingsAmount = hasDiscount ? regularPrice - currentPrice : 0;

  const imgOverrides = getProductImageOverrides(product.id, product.slug) || getProductImageOverrides(null, cleanSlug);
  const effectiveHero = imgOverrides?.hero_image || product.hero_image;
  const effectiveSecondary = imgOverrides?.hero_secondary_image !== undefined ? imgOverrides.hero_secondary_image : product.hero_secondary_image;
  const effectiveThumb = imgOverrides?.thumbnail || product.thumbnail || effectiveHero;

  // Build Media Gallery
  const galleryImages = [];
  if (effectiveHero) galleryImages.push({ media_url: effectiveHero, caption: product.title });
  if (effectiveSecondary && effectiveSecondary !== effectiveHero) {
    galleryImages.push({ media_url: effectiveSecondary, caption: `${product.title} — Secondary Showcase` });
  }
  if (effectiveThumb && effectiveThumb !== effectiveHero && effectiveThumb !== effectiveSecondary) {
    galleryImages.push({ media_url: effectiveThumb, caption: product.title });
  }
  media.forEach(m => {
    if (m && m.media_url && !galleryImages.some(g => g.media_url === m.media_url)) {
      if (effectiveHero && effectiveHero !== m.media_url && m.media_url.endsWith('-cover.svg')) {
        return;
      }
      galleryImages.push(m);
    }
  });
  if (galleryImages.length === 0) {
    galleryImages.push({
      media_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      caption: product.title
    });
  }
  const currentGalleryImg = galleryImages[selectedGalleryIndex] || galleryImages[0];

  // CTA Action Handlers
  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      title: product.title,
      price: currentPrice,
      regular_price: regularPrice,
      image: product.thumbnail || product.hero_image,
      slug: product.slug,
      license_name: selectedLicense?.license_name || selectedLicense?.name || 'Standard License',
      license_id: selectedLicense?.id || null
    });
    addToast(`Added "${product.title}" to cart`, 'success');
  };

  const handleBuyNow = (overrideLicense = null) => {
    const lic = overrideLicense || selectedLicense;
    const licPrice = lic ? lic.price : currentPrice;
    const licRegPrice = lic?.regular_price || regularPrice;
    const licName = lic?.license_name || lic?.name || 'Standard License';
    const licId = lic?.id || null;

    addToCart({
      id: product.id,
      title: product.title,
      price: licPrice,
      regular_price: licRegPrice,
      image: product.thumbnail || product.hero_image,
      slug: product.slug,
      license_name: licName,
      license_id: licId
    }, null, false);
    setIsCartOpen(false);
    if (onNavigate) {
      onNavigate('checkout');
    }
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
    const rawFaq = getSectionData('faq');
    const faqList = Array.isArray(rawFaq) ? rawFaq : (Array.isArray(faqs) ? faqs : []);
    setOpenFaqIndices(faqList.map((_, idx) => idx));
  };

  const collapseAllFaqs = () => {
    setOpenFaqIndices([]);
  };

  // Helper to extract content of a section from database sections
  const getSection = (type) => (Array.isArray(dbSections) ? dbSections.find(s => s && (s.section_type === type || s.type === type)) : null);
  const getSectionData = (type) => {
    const sec = getSection(type);
    if (!sec || sec.content === undefined || sec.content === null) return null;
    let val = sec.content;
    if (typeof val === 'string') {
      try {
        val = JSON.parse(val);
        if (typeof val === 'string') {
          try { val = JSON.parse(val); } catch (e) {}
        }
      } catch (e) {
        // Keep original string if not valid JSON
      }
    }
    return val;
  };

  // ----------------------------------------------------
  // CANONICAL SECTION RENDERERS
  // ----------------------------------------------------

  // 00. Breadcrumb
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
              {product.category_name || 'Digital Products'}
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

  // 01. SECTION 01 — HERO
  const renderHero = () => {
    const heroHighlights = [
      product.category_name || 'Instant Digital Delivery',
      'Commercial Production License',
      'Clean Modular Architecture',
      'Lifetime Updates & Direct Support'
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

              {/* Eyebrow / Tagline */}
              {product.eyebrow && (
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {product.eyebrow}
                </div>
              )}

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
                {product.short_description || product.full_description?.slice(0, 220)}
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

                    <div className="pdp-hero-licenses-grid">
                      {licenses.map(lic => {
                        const isSel = selectedLicense?.id === lic.id || (!selectedLicense && lic.id === licenses[0]?.id);
                        const licName = lic.license_name || lic.name || 'Standard License';
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
                    <span>{product.cta_text || 'BUY NOW'}</span>
                  </button>
                  <button
                    onClick={handleAddToCart}
                    className="btn btn-secondary btn-lg"
                    style={{ width: '100%', gap: '0.6rem' }}
                  >
                    <ShoppingBag size={18} />
                    <span>{product.secondary_cta_text || 'ADD TO CART'}</span>
                  </button>
                </div>

                {/* Dynamic Hero Quick Action Links (Demo Links & Video Launcher) */}
                {(() => {
                  const isDemoVisible = getSection('demo')?.is_visible !== 0 && product.show_demo_links !== false && product.show_demo_links !== 0;
                  const isVideoVisible = getSection('video')?.is_visible !== 0 && product.is_video_visible !== false && product.is_video_visible !== 0;
                  const hasVideo = !!(getSectionData('video')?.url || product.video_url);

                  let activeDemos = [];
                  if (isDemoVisible) {
                    if (Array.isArray(product.demo_links) && product.demo_links.length > 0) {
                      activeDemos = product.demo_links.filter(d => d && d.url && (d.is_visible === undefined || d.is_visible === true || d.is_visible === 1));
                    } else if (typeof product.demo_links === 'string') {
                      try {
                        const parsed = JSON.parse(product.demo_links);
                        if (Array.isArray(parsed)) {
                          activeDemos = parsed.filter(d => d && d.url && (d.is_visible === undefined || d.is_visible === true || d.is_visible === 1));
                        }
                      } catch (e) {}
                    }
                    if (activeDemos.length === 0) {
                      if (product.live_demo_url || product.demo_url) {
                        activeDemos.push({ label: 'App Demo Link', url: product.live_demo_url || product.demo_url });
                      }
                      if (product.customer_demo_url) {
                        activeDemos.push({ label: 'Customer App', url: product.customer_demo_url });
                      }
                      if (product.admin_demo_url) {
                        activeDemos.push({ label: 'Admin Portal', url: product.admin_demo_url });
                      }
                      if (product.partner_demo_url) {
                        activeDemos.push({ label: 'Partner Panel', url: product.partner_demo_url });
                      }
                      if (product.web_demo_url) {
                        activeDemos.push({ label: 'Web App', url: product.web_demo_url });
                      }
                    }
                  }

                  if (activeDemos.length === 0 && (!hasVideo || !isVideoVisible)) return null;

                  return (
                    <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                      {/* Render Each Active Demo Link with its Custom Name */}
                      {activeDemos.map((demo, dIdx) => (
                        <a
                          key={demo.id || dIdx}
                          href={demo.url}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-outline btn-sm"
                          style={{
                            flex: '1 1 auto',
                            justifyContent: 'center',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontWeight: 700,
                            padding: '8px 14px',
                            background: 'rgba(99, 102, 241, 0.08)',
                            borderColor: 'rgba(99, 102, 241, 0.3)'
                          }}
                        >
                          <ExternalLink size={13} color="var(--primary)" />
                          <span>{demo.label || 'Live Demo'}</span>
                        </a>
                      ))}

                      {/* Video Walkthrough Play Button */}
                      {hasVideo && isVideoVisible && (
                        <button
                          type="button"
                          onClick={() => {
                            const videoEl = document.getElementById('section-video');
                            if (videoEl) {
                              videoEl.scrollIntoView({ behavior: 'smooth' });
                            }
                            setIsVideoModalOpen(true);
                          }}
                          className="btn btn-outline btn-sm"
                          style={{
                            flex: '1 1 auto',
                            justifyContent: 'center',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontWeight: 700,
                            padding: '8px 14px',
                            background: 'rgba(244, 63, 94, 0.08)',
                            borderColor: 'rgba(244, 63, 94, 0.3)',
                            color: '#f43f5e'
                          }}
                        >
                          <Play size={13} fill="currentColor" />
                          <span>Watch Video Demo</span>
                        </button>
                      )}
                    </div>
                  );
                })()}

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
                    Commercial Rights
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT: Large Mockup Frame(s) - Supports Dual Mockup to fill vertical blank space */}
            {(() => {
              const imgOverrides = getProductImageOverrides(product.id, product.slug) || getProductImageOverrides(null, cleanSlug);
              const effectiveHeroImg = imgOverrides?.hero_image || product.hero_image;
              const effectiveSecondaryImg = imgOverrides?.hero_secondary_image !== undefined ? imgOverrides.hero_secondary_image : product.hero_secondary_image;

              const primaryHeroImg = effectiveHeroImg || currentGalleryImg?.media_url || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80';
              const secondaryHeroImg = effectiveSecondaryImg || (Array.isArray(product.media) && product.media.length > 1 ? product.media[1].media_url : null);

              return (
                <div className="pdp-hero-right" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* 1. Primary Mockup Frame */}
                  <div className="pdp-mockup-frame">
                    <div className="pdp-mockup-viewport">
                      <img
                        src={primaryHeroImg}
                        alt={product.title}
                        className="pdp-mockup-img"
                        onClick={() => {
                          setLightboxImage(primaryHeroImg);
                          setLightboxCaption(`${product.title} — Main Showcase`);
                          setLightboxOpen(true);
                        }}
                        style={{ cursor: 'pointer' }}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80';
                        }}
                      />

                      {product.demo_url && (
                        <a
                          href={product.demo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary btn-sm"
                          style={{
                            position: 'absolute',
                            bottom: '0.85rem',
                            right: '0.85rem',
                            background: 'rgba(15, 23, 42, 0.9)',
                            backdropFilter: 'blur(10px)',
                            boxShadow: 'var(--shadow-md)',
                            zIndex: 2
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
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Quality Verified
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          Production Ready Code
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Secondary Mockup Frame (Dual Hero Showcase - Fills Vertical Blank Space) */}
                  {secondaryHeroImg && (
                    <div
                      className="pdp-mockup-frame"
                      style={{
                        background: 'linear-gradient(180deg, rgba(20, 28, 48, 0.85) 0%, rgba(10, 15, 30, 0.95) 100%)',
                        borderColor: 'rgba(99, 102, 241, 0.25)',
                        boxShadow: 'var(--shadow-md), 0 10px 25px rgba(0,0,0,0.4)',
                        marginTop: '0.5rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.5rem 0.5rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          <Sparkles size={13} color="var(--primary)" />
                          <span>Mobile App & Workflow View</span>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600 }}>Click to Zoom</span>
                      </div>
                      <div
                        className="pdp-mockup-viewport"
                        style={{ aspectRatio: '16 / 9', cursor: 'pointer' }}
                        onClick={() => {
                          setLightboxImage(secondaryHeroImg);
                          setLightboxCaption(`${product.title} — Workflow & Mobile View`);
                          setLightboxOpen(true);
                        }}
                      >
                        <img
                          src={secondaryHeroImg}
                          alt={`${product.title} Secondary View`}
                          className="pdp-mockup-img"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </section>
    );
  };

  // 02. SECTION 02 — PRODUCT DEMO VIDEO
  const renderVideo = () => {
    let videoSec = getSectionData('video');
    const rawUrl = videoSec?.url || product.video_url;
    if (!rawUrl) return null;

    const parsed = parseVideoUrl(rawUrl);
    if (!parsed) return null;

    const videoTitle = videoSec?.title || product.video_title || 'See the Product in Action';
    const videoDesc = videoSec?.description || product.video_description || 'Watch the comprehensive walkthrough to explore interface, flow, and backend capabilities.';
    const videoPoster = videoSec?.thumbnail || product.video_thumbnail || product.hero_image;

    return (
      <section id="section-video" className="pdp-section">
        <div className="pdp-container">
          <div className="pdp-section-header">
            <span className="pdp-kicker">Interactive Showcase</span>
            <h2 className="pdp-section-title">{videoTitle}</h2>
            <p className="pdp-section-subtitle">{videoDesc}</p>
          </div>

          <div style={{
            maxWidth: '1080px',
            margin: '0 auto',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            border: '1px solid var(--border-medium)',
            background: '#060913',
            aspectRatio: '16/9',
            boxShadow: 'var(--shadow-xl)',
            position: 'relative'
          }}>
            {parsed.provider === 'youtube' || parsed.provider === 'vimeo' || parsed.provider === 'loom' || parsed.provider === 'iframe' ? (
              <iframe
                src={parsed.embedUrl}
                title={videoTitle}
                style={{ width: '100%', height: '100%', border: 0 }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              />
            ) : (
              <video
                controls
                poster={videoPoster}
                preload="metadata"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              >
                <source src={parsed.src} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </div>
      </section>
    );
  };

  // 03. SECTION 03 — WHAT IS THIS PRODUCT? (OVERVIEW)
  const renderOverview = () => {
    let overviewContent = getSectionData('overview');
    if (typeof overviewContent === 'string') {
      try { overviewContent = JSON.parse(overviewContent); } catch (e) {}
    }

    const title = overviewContent?.title || `What is ${product.title}?`;
    const subtitle = overviewContent?.subtitle || 'A complete, production-grade foundation engineered for rapid deployment.';
    const description = overviewContent?.description || product.full_description || product.short_description;

    const rawSpecs = overviewContent?.specs;
    const specsList = Array.isArray(rawSpecs) && rawSpecs.length > 0 ? rawSpecs : [
      { label: 'Category', value: product.category_name || 'Software Application' },
      { label: 'Delivery', value: 'Instant Download & Access' },
      { label: 'License', value: selectedLicense?.license_name || 'Commercial Single Project' },
      { label: 'File Bundle', value: 'Complete Source Code + Docs' }
    ];

    return (
      <section className="pdp-section">
        <div className="pdp-container">
          <div className="pdp-overview-grid">
            {/* LEFT: Rich text about the product */}
            <div>
              <span className="pdp-kicker">Platform Overview</span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem', marginBottom: '1.25rem' }}>
                {title}
              </h2>
              <p style={{ fontSize: '1rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '1.25rem' }}>
                {subtitle}
              </p>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.975rem', lineHeight: 1.75, whiteSpace: 'pre-line' }}>
                {description}
              </div>

              {overviewContent?.cta_text && (
                <div style={{ marginTop: '1.5rem' }}>
                  <button onClick={handleBuyNow} className="btn btn-primary btn-md">
                    <span>{overviewContent.cta_text}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}
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

  // 04. SECTION 04 — COMPLETE PRODUCT ECOSYSTEM
  const renderEcosystem = () => {
    let raw = getSectionData('ecosystem');
    if (typeof raw === 'string') {
      try { raw = JSON.parse(raw); } catch (e) {}
    }
    const items = Array.isArray(raw) ? raw : [];
    if (!items || items.length === 0) return null;

    return (
      <section className="pdp-section">
        <div className="pdp-container">
          <div className="pdp-section-header">
            <span className="pdp-kicker">Unified Architecture</span>
            <h2 className="pdp-section-title">Complete Product Ecosystem</h2>
            <p className="pdp-section-subtitle">Every piece of software needed to run your entire operation seamlessly.</p>
          </div>

          <div className="pdp-ecosystem-grid">
            {items.map((item, idx) => (
              <div key={idx} className="pdp-ecosystem-card">
                <div className="pdp-ecosystem-icon">
                  <DynamicIcon name={item.icon || 'Layers'} size={24} />
                </div>
                <h3 className="pdp-ecosystem-title">{item.title}</h3>
                <p className="pdp-ecosystem-desc">{item.description}</p>
                {item.link && (
                  <a href={item.link} target="_blank" rel="noreferrer" className="pdp-ecosystem-link">
                    Explore component <ExternalLink size={12} />
                  </a>
                )}
                {item.screenshot && (
                  <img
                    src={item.screenshot}
                    alt={item.title}
                    onClick={() => openLightbox(item.screenshot, item.title)}
                    style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginTop: '0.75rem', cursor: 'pointer', border: '1px solid var(--border-subtle)' }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // 05. SECTION 05 — PRODUCT DEMO / LIVE PREVIEW STRIP
  const renderDemo = () => {
    const demoSec = getSection('demo');
    if (demoSec && (demoSec.is_visible === 0 || demoSec.is_visible === false)) return null;
    if (product.show_demo_links === 0 || product.show_demo_links === false) return null;

    let activeDemoLinks = [];
    const rawDemoContent = getSectionData('demo') || product.demo_links;

    if (Array.isArray(rawDemoContent) && rawDemoContent.length > 0) {
      activeDemoLinks = rawDemoContent
        .filter(d => d && d.url && (d.is_visible === undefined || d.is_visible === true || d.is_visible === 1))
        .map(d => ({
          label: d.label || 'Live Demo',
          url: d.url,
          icon: ExternalLink
        }));
    } else if (typeof rawDemoContent === 'string') {
      try {
        const parsed = JSON.parse(rawDemoContent);
        if (Array.isArray(parsed)) {
          activeDemoLinks = parsed
            .filter(d => d && d.url && (d.is_visible === undefined || d.is_visible === true || d.is_visible === 1))
            .map(d => ({
              label: d.label || 'Live Demo',
              url: d.url,
              icon: ExternalLink
            }));
        }
      } catch (e) {}
    }

    if (activeDemoLinks.length === 0) {
      activeDemoLinks = [
        (product.live_demo_url || product.demo_url) ? { label: 'App Demo Link', url: product.live_demo_url || product.demo_url, icon: ExternalLink } : null,
        product.customer_demo_url ? { label: 'Try Customer App', url: product.customer_demo_url, icon: Smartphone } : null,
        product.partner_demo_url ? { label: 'View Partner Panel', url: product.partner_demo_url, icon: Briefcase } : null,
        product.admin_demo_url ? { label: 'Open Admin Demo', url: product.admin_demo_url, icon: Layout } : null,
        product.web_demo_url ? { label: 'Website Demo', url: product.web_demo_url, icon: Globe } : null,
        (product.docs_url || product.doc_url) ? { label: 'Documentation', url: product.docs_url || product.doc_url, icon: FileCode } : null
      ].filter(Boolean);
    }

    // Add Watch Video walkthrough button if video exists and visible
    const isVideoVisible = getSection('video')?.is_visible !== 0 && product.is_video_visible !== false && product.is_video_visible !== 0;
    if ((product.video_url || getSectionData('video')?.url) && isVideoVisible) {
      activeDemoLinks.push({
        label: 'Watch Video Walkthrough',
        url: product.video_url || getSectionData('video')?.url,
        icon: Play,
        isVideo: true
      });
    }

    if (activeDemoLinks.length === 0) return null;

    return (
      <section className="pdp-section" style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
        <div className="pdp-container">
          <div className="pdp-demo-strip">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Sparkles size={18} color="var(--primary)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)' }}>
                Experience Live Previews:
              </span>
            </div>

            <div className="pdp-demo-links">
              {activeDemoLinks.map((demo, idx) => {
                const IconComponent = demo.icon;
                if (demo.isVideo) {
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setIsVideoModalOpen(true)}
                      className="pdp-demo-btn"
                      style={{ cursor: 'pointer', background: 'rgba(244, 63, 94, 0.1)', borderColor: 'rgba(244, 63, 94, 0.3)', color: '#f43f5e' }}
                    >
                      <IconComponent size={14} fill="currentColor" />
                      <span>{demo.label}</span>
                    </button>
                  );
                }
                return (
                  <a
                    key={idx}
                    href={demo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="pdp-demo-btn"
                  >
                    <IconComponent size={14} />
                    <span>{demo.label}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    );
  };

  // 06. SECTION 06 — CUSTOMER / USER EXPERIENCE
  const renderCustomerExperience = () => {
    let raw = getSectionData('customer_experience') || getSectionData('showcase') || product.customer_experience || product.showcase;
    if (typeof raw === 'string') {
      try { raw = JSON.parse(raw); } catch (e) {}
    }
    const showcaseList = Array.isArray(raw) ? raw : [];
    if (!showcaseList || showcaseList.length === 0) return null;

    return (
      <section className="pdp-section">
        <div className="pdp-container">
          <div className="pdp-section-header">
            <span className="pdp-kicker">User Flow</span>
            <h2 className="pdp-section-title">Customer & User Experience</h2>
            <p className="pdp-section-subtitle">Intuitive, frictionless design engineered to maximize user engagement and conversions.</p>
          </div>

          <div>
            {showcaseList.map((item, idx) => {
              const isReversed = item.alignment === 'right' || idx % 2 === 1;

              return (
                <div key={idx} className={`pdp-showcase-row ${isReversed ? 'reversed' : ''}`}>
                  {/* Screenshot Frame */}
                  <div
                    onClick={() => item.image && openLightbox(item.image, item.title)}
                    className="pdp-showcase-frame"
                    style={{ order: isReversed ? 2 : 1 }}
                  >
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80'}
                      alt={item.title}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80';
                      }}
                    />
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

                    {Array.isArray(item.bullet_points) && item.bullet_points.length > 0 && (
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

  // 07. SECTION 07 — PARTNER / PROVIDER EXPERIENCE
  const renderPartnerExperience = () => {
    let raw = getSectionData('partner_experience') || product.partner_experience;
    if (typeof raw === 'string') {
      try { raw = JSON.parse(raw); } catch (e) {}
    }
    const partnerList = Array.isArray(raw) ? raw : [];
    if (!partnerList || partnerList.length === 0) return null;

    return (
      <section className="pdp-section">
        <div className="pdp-container">
          <div className="pdp-section-header">
            <span className="pdp-kicker">Provider Workflow</span>
            <h2 className="pdp-section-title">Partner & Provider Experience</h2>
            <p className="pdp-section-subtitle">Dedicated tools and interfaces empowering partners to fulfill services efficiently.</p>
          </div>

          <div>
            {partnerList.map((item, idx) => {
              const isReversed = item.alignment === 'right' || idx % 2 === 1;

              return (
                <div key={idx} className={`pdp-showcase-row ${isReversed ? 'reversed' : ''}`}>
                  <div
                    onClick={() => item.image && openLightbox(item.image, item.title)}
                    className="pdp-showcase-frame"
                    style={{ order: isReversed ? 2 : 1 }}
                  >
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80'}
                      alt={item.title}
                    />
                  </div>

                  <div style={{ order: isReversed ? 1 : 2, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{
                      display: 'inline-flex',
                      alignSelf: 'flex-start',
                      padding: '0.2rem 0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      background: 'rgba(16, 185, 129, 0.12)',
                      color: 'var(--accent-emerald)',
                      border: '1px solid rgba(16, 185, 129, 0.25)'
                    }}>
                      PROVIDER MODULE {idx + 1}
                    </div>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.25 }}>
                      {item.title}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.6 }}>
                      {item.description}
                    </p>

                    {Array.isArray(item.bullet_points) && item.bullet_points.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' }}>
                        {item.bullet_points.map((bp, bIdx) => (
                          <div key={bIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            <div className="pdp-bullet-icon">
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

  // 08. SECTION 08 — ADMIN PANEL / DASHBOARD SHOWCASE
  const renderAdminExperience = () => {
    let raw = getSectionData('admin_experience') || product.admin_experience;
    if (typeof raw === 'string') {
      try { raw = JSON.parse(raw); } catch (e) {}
    }
    const adminList = Array.isArray(raw) ? raw : [];
    if (!adminList || adminList.length === 0) return null;

    return (
      <section className="pdp-section">
        <div className="pdp-container">
          <div className="pdp-section-header">
            <span className="pdp-kicker">Mission Control</span>
            <h2 className="pdp-section-title">Admin Dashboard & Operations</h2>
            <p className="pdp-section-subtitle">Real-time metrics, order routing, user management, and business configuration.</p>
          </div>

          <div className="pdp-grid-3">
            {adminList.map((item, idx) => (
              <div key={idx} className="pdp-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {item.image && (
                  <div
                    onClick={() => openLightbox(item.image, item.title)}
                    style={{ aspectRatio: '16/10', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#000', cursor: 'pointer' }}
                  >
                    <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <h3 className="pdp-card-title" style={{ marginTop: '0.5rem' }}>{item.title}</h3>
                <p className="pdp-card-text">{item.description}</p>
                {item.link && (
                  <a href={item.link} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    View admin demo <ExternalLink size={12} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // 09. SECTION 09 — KEY FEATURES
  const renderFeatures = () => {
    let raw = getSectionData('features');
    if (typeof raw === 'string') {
      try { raw = JSON.parse(raw); } catch (e) {}
    }
    const featList = Array.isArray(raw) && raw.length > 0 ? raw : (Array.isArray(features) ? features : []);
    if (!featList || featList.length === 0) return null;

    return (
      <section className="pdp-section">
        <div className="pdp-container">
          <div className="pdp-section-header">
            <span className="pdp-kicker">Capabilities</span>
            <h2 className="pdp-section-title">Key Features</h2>
            <p className="pdp-section-subtitle">Carefully engineered capabilities included out of the box.</p>
          </div>

          <div className="pdp-grid-3">
            {featList.map((f, idx) => (
              <div key={idx} className="pdp-card">
                <div className="pdp-card-icon">
                  <DynamicIcon name={f.icon || 'CheckCircle'} size={20} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '0.5rem' }}>
                  <h3 className="pdp-card-title" style={{ marginBottom: 0 }}>{f.title}</h3>
                  {f.badge && <Badge variant={f.badge}>{f.badge}</Badge>}
                </div>
                <p className="pdp-card-text">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // 10. SECTION 10 — HOW IT WORKS
  const renderHowItWorks = () => {
    let raw = getSectionData('how_it_works');
    if (typeof raw === 'string') {
      try { raw = JSON.parse(raw); } catch (e) {}
    }
    const defaultSteps = [
      { step: '01', title: 'Choose Product', description: 'Review specifications and select your preferred license tier.', icon: 'ShoppingBag' },
      { step: '02', title: 'Instant Checkout', description: 'Encrypted 256-bit checkout with immediate access confirmation.', icon: 'Lock' },
      { step: '03', title: 'Download Bundle', description: 'Access clean unencrypted source code and documentation.', icon: 'DownloadCloud' },
      { step: '04', title: 'Deploy & Launch', description: 'Follow step-by-step documentation to configure and go live.', icon: 'Zap' }
    ];
    const steps = Array.isArray(raw) && raw.length > 0 ? raw : defaultSteps;

    return (
      <section className="pdp-section">
        <div className="pdp-container">
          <div className="pdp-section-header">
            <span className="pdp-kicker">Deployment Flow</span>
            <h2 className="pdp-section-title">How It Works</h2>
            <p className="pdp-section-subtitle">From purchase to production in clear, structured steps.</p>
          </div>

          <div className="pdp-timeline-grid">
            {steps.map((st, idx) => (
              <div key={idx} className="pdp-timeline-step">
                <span className="pdp-timeline-num">{st.step || `0${idx + 1}`}</span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>{st.title}</h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{st.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // 11. SECTION 11 — WHAT'S INCLUDED (Grouped checklist)
  const renderIncluded = () => {
    let raw = getSectionData('included');
    if (typeof raw === 'string') {
      try { raw = JSON.parse(raw); } catch (e) {}
    }

    // Default categorized groups if none provided
    const defaultGroups = [
      {
        group_title: 'Mobile Applications',
        icon: 'Smartphone',
        items: [
          'Full native or Flutter/React Native source code',
          'Android production build and project files',
          'iOS Xcode workspace and configuration',
          'Push notifications integration ready'
        ]
      },
      {
        group_title: 'Web & Portals',
        icon: 'Monitor',
        items: [
          'Responsive customer-facing web application',
          'Complete Admin Panel with analytical dashboard',
          'Role-based access control and user management',
          'SEO optimized meta tags and structured schema'
        ]
      },
      {
        group_title: 'Backend & APIs',
        icon: 'Server',
        items: [
          'RESTful API server with modular controllers',
          'Database schemas, seeds, and migrations',
          'JWT authentication & payment webhook listeners',
          'Comprehensive Postman collection & API docs'
        ]
      }
    ];

    const groups = Array.isArray(raw) && raw.length > 0 ? raw : defaultGroups;

    return (
      <section className="pdp-section">
        <div className="pdp-container">
          <div className="pdp-section-header">
            <span className="pdp-kicker">Deliverables Package</span>
            <h2 className="pdp-section-title">What's Included in Your Download</h2>
            <p className="pdp-section-subtitle">A transparent breakdown of every component, repository, and asset delivered.</p>
          </div>

          <div className="pdp-included-groups">
            {groups.map((grp, idx) => {
              const itemsList = Array.isArray(grp.items) ? grp.items : [];
              return (
                <div key={idx} className="pdp-included-group-card">
                  <div className="pdp-included-group-header">
                    <DynamicIcon name={grp.icon || 'Package'} size={20} />
                    <span>{grp.group_title || grp.title || `Package ${idx + 1}`}</span>
                  </div>

                  {grp.description && (
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.5 }}>
                      {grp.description}
                    </p>
                  )}

                  <div className="pdp-included-list">
                    {itemsList.map((item, iIdx) => {
                      const itemTitle = typeof item === 'string' ? item : (item.title || item.name);
                      return (
                        <div key={iIdx} className="pdp-included-item">
                          <div className="pdp-included-icon">
                            <Check size={12} strokeWidth={3} />
                          </div>
                          <span>{itemTitle}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  };

  // 12. SECTION 12 — SOURCE CODE STRUCTURE
  const renderSourceCode = () => {
    let raw = getSectionData('source_code');
    if (typeof raw === 'string') {
      try { raw = JSON.parse(raw); } catch (e) {}
    }
    const modules = Array.isArray(raw) ? raw : [];
    if (!modules || modules.length === 0) return null;

    return (
      <section className="pdp-section">
        <div className="pdp-container">
          <div className="pdp-section-header">
            <span className="pdp-kicker">Architecture</span>
            <h2 className="pdp-section-title">Source Code Structure</h2>
            <p className="pdp-section-subtitle">Well-organized, clean code directories designed for quick onboarding and customization.</p>
          </div>

          <div className="pdp-code-tree">
            <div className="pdp-code-tree-header">
              <FolderTree size={18} />
              <span>{product.title} Codebase Repository</span>
            </div>
            {modules.map((m, idx) => (
              <div key={idx} style={{ padding: '4px 0' }}>
                <span style={{ color: 'var(--primary)', fontWeight: 700 }}>├── {m.name || m.module_name || m.title}</span>
                {m.description && <span style={{ color: 'var(--text-muted)', marginLeft: '1rem' }}>— {m.description}</span>}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // 13. SECTION 13 — TECHNOLOGY STACK / SPECIFICATIONS
  const renderSpecs = () => {
    let raw = getSectionData('specs');
    if (typeof raw === 'string') {
      try { raw = JSON.parse(raw); } catch (e) {}
    }
    let specs = Array.isArray(raw) && raw.length > 0 ? raw : [];
    if (!specs.length && typeof product.technical_specs === 'string') {
      try { specs = JSON.parse(product.technical_specs); } catch (e) {}
    } else if (!specs.length && Array.isArray(product.technical_specs)) {
      specs = product.technical_specs;
    }

    if (!Array.isArray(specs) || specs.length === 0) return null;

    return (
      <section className="pdp-section">
        <div className="pdp-container">
          <div className="pdp-section-header">
            <span className="pdp-kicker">Engineering</span>
            <h2 className="pdp-section-title">Technology Stack & Specifications</h2>
            <p className="pdp-section-subtitle">Frameworks, database engines, SDKs, and version compatibilities.</p>
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

  // 14. SECTION 14 — REQUIREMENTS
  const renderRequirements = () => {
    let raw = getSectionData('requirements');
    if (typeof raw === 'string') {
      try { raw = JSON.parse(raw); } catch (e) {}
    }
    const requirements = Array.isArray(raw) ? raw : [];
    if (!requirements || requirements.length === 0) return null;

    return (
      <section className="pdp-section">
        <div className="pdp-container">
          <div className="pdp-section-header">
            <span className="pdp-kicker">Prerequisites</span>
            <h2 className="pdp-section-title">What You Need to Get Started</h2>
            <p className="pdp-section-subtitle">Required third-party accounts, hosting infrastructure, and environment specifications.</p>
          </div>

          <div className="pdp-grid-3">
            {requirements.map((req, idx) => (
              <div key={idx} className="pdp-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <DynamicIcon name={req.icon || 'ShieldCheck'} size={20} style={{ color: 'var(--primary)' }} />
                  <span className={`pdp-pill-badge ${req.is_required !== false && req.required !== false ? 'pdp-pill-required' : 'pdp-pill-optional'}`}>
                    {req.is_required !== false && req.required !== false ? 'Required' : 'Optional'}
                  </span>
                </div>
                <h3 className="pdp-card-title" style={{ marginTop: '0.25rem', marginBottom: 0 }}>{req.title}</h3>
                <p className="pdp-card-text">{req.description}</p>
                {req.link && (
                  <a href={req.link} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: 'auto', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    View account info <ExternalLink size={12} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // 15. SECTION 15 — CUSTOMIZATION ("MAKE IT YOURS")
  const renderCustomization = () => {
    let raw = getSectionData('customization');
    if (typeof raw === 'string') {
      try { raw = JSON.parse(raw); } catch (e) {}
    }
    const items = Array.isArray(raw) ? raw : [];
    if (!items || items.length === 0) return null;

    return (
      <section className="pdp-section">
        <div className="pdp-container">
          <div className="pdp-section-header">
            <span className="pdp-kicker">White Label Ready</span>
            <h2 className="pdp-section-title">Make It Yours</h2>
            <p className="pdp-section-subtitle">Complete flexibility to personalize branding, features, logic, and integrations.</p>
          </div>

          <div className="pdp-grid-4">
            {items.map((c, idx) => (
              <div key={idx} className="pdp-card">
                <div className="pdp-card-icon">
                  <DynamicIcon name={c.icon || 'Sliders'} size={20} />
                </div>
                <h3 className="pdp-card-title">{c.title}</h3>
                <p className="pdp-card-text">{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // 16. SECTION 16 — WHO IS THIS FOR?
  const renderWhoIsItFor = () => {
    let raw = getSectionData('who_is_it_for');
    if (typeof raw === 'string') {
      try { raw = JSON.parse(raw); } catch (e) {}
    }
    const audience = Array.isArray(raw) ? raw : [];
    if (!audience || audience.length === 0) return null;

    return (
      <section className="pdp-section">
        <div className="pdp-container">
          <div className="pdp-section-header">
            <span className="pdp-kicker">Target Audience</span>
            <h2 className="pdp-section-title">Who Is This Product For?</h2>
            <p className="pdp-section-subtitle">Engineered to deliver high ROI across various technical and business profiles.</p>
          </div>

          <div className="pdp-grid-4">
            {audience.map((aud, idx) => (
              <div key={idx} className="pdp-card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="pdp-card-icon">
                  <DynamicIcon name={aud.icon || 'Users'} size={22} />
                </div>
                <h3 className="pdp-card-title">{aud.title}</h3>
                <p className="pdp-card-text">{aud.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // 17. SECTION 17 — USE CASES
  const renderUseCases = () => {
    let raw = getSectionData('use_cases');
    if (typeof raw === 'string') {
      try { raw = JSON.parse(raw); } catch (e) {}
    }
    const useCases = Array.isArray(raw) ? raw : [];
    if (!useCases || useCases.length === 0) return null;

    return (
      <section className="pdp-section">
        <div className="pdp-container">
          <div className="pdp-section-header">
            <span className="pdp-kicker">Application</span>
            <h2 className="pdp-section-title">Built for Multiple Business Models</h2>
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

  // 18. SECTION 18 — WHY THIS PRODUCT / WHY NOT BUILD FROM SCRATCH
  const renderComparison = () => {
    let raw = getSectionData('comparison');
    if (typeof raw === 'string') {
      try { raw = JSON.parse(raw); } catch (e) {}
    }
    const rows = Array.isArray(raw) ? raw : [];
    if (!rows || rows.length === 0) return null;

    return (
      <section className="pdp-section">
        <div className="pdp-container">
          <div className="pdp-section-header">
            <span className="pdp-kicker">Value Comparison</span>
            <h2 className="pdp-section-title">Why Start With This Product?</h2>
            <p className="pdp-section-subtitle">Compare starting with our production code versus developing from scratch.</p>
          </div>

          <div className="pdp-comparison-table-wrap">
            <table className="pdp-comparison-table">
              <thead>
                <tr>
                  <th style={{ width: '38%' }}>Evaluation Metric</th>
                  <th className="highlight-col" style={{ width: '31%' }}>{product.title} (Ready to Deploy)</th>
                  <th style={{ width: '31%' }}>Custom Build From Zero</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{r.feature || r.label}</td>
                    <td className="highlight-col">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981' }}>
                        <CheckCircle size={15} />
                        <span>{r.product_value || r.ours || 'Included Out of Box'}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-muted)' }}>{r.scratch_value || r.theirs || 'Build & Test Yourself'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    );
  };

  // 19. SECTION 19 — AFTER PURCHASE
  const renderAfterPurchase = () => {
    let raw = getSectionData('after_purchase');
    if (typeof raw === 'string') {
      try { raw = JSON.parse(raw); } catch (e) {}
    }
    const defaultSteps = [
      { step: '01', title: 'Complete Purchase', description: 'Immediate receipt with private download link and license key.' },
      { step: '02', title: 'Download Source Code', description: 'Access GitHub repo or direct ZIP archive with clean files.' },
      { step: '03', title: 'Follow Documentation', description: 'Step-by-step setup guide for local environment and server.' },
      { step: '04', title: 'Launch to Production', description: 'Deploy to cloud servers or app stores with commercial rights.' }
    ];
    const steps = Array.isArray(raw) && raw.length > 0 ? raw : defaultSteps;

    return (
      <section className="pdp-section">
        <div className="pdp-container">
          <div className="pdp-section-header">
            <span className="pdp-kicker">Onboarding Experience</span>
            <h2 className="pdp-section-title">What Happens After You Buy?</h2>
            <p className="pdp-section-subtitle">Instant fulfillment with everything needed to immediately begin development.</p>
          </div>

          <div className="pdp-timeline-grid">
            {steps.map((st, idx) => (
              <div key={idx} className="pdp-timeline-step">
                <span className="pdp-timeline-num">{st.step || `0${idx + 1}`}</span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>{st.title}</h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{st.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // 20. SECTION 20 — PRICING & LICENSES
  const renderPricing = () => {
    return (
      <section id="section-pricing" className="pdp-section">
        <div className="pdp-container">
          <div className="pdp-section-header">
            <span className="pdp-kicker">Simple Transparent Pricing</span>
            <h2 className="pdp-section-title">Choose Your License Plan</h2>
            <p className="pdp-section-subtitle">No recurring subscriptions or hidden royalties. Full ownership for your project.</p>
          </div>

          <div className={`pdp-pricing-plans-grid ${licenses && licenses.length === 1 ? 'is-single-plan' : ''}`}>
            {licenses && licenses.length > 0 ? (
              licenses.map(lic => {
                const isSel = selectedLicense?.id === lic.id;
                const licName = lic.license_name || lic.name || 'Commercial License';
                const hasLicDiscount = lic.regular_price && lic.regular_price > lic.price;
                const licDiscountPct = hasLicDiscount ? Math.round(((lic.regular_price - lic.price) / lic.regular_price) * 100) : 0;
                const featuresList = Array.isArray(lic.features) ? lic.features : [
                  'Full Unencrypted Source Code',
                  'Commercial Deployment Rights',
                  'Lifetime Code Updates',
                  'Direct Technical Support',
                  'Comprehensive Documentation'
                ];

                return (
                  <div
                    key={lic.id || licName}
                    className={`pdp-card pdp-pricing-plan-card ${isSel ? 'is-selected-plan' : ''}`}
                    style={{
                      border: isSel ? '2px solid var(--primary)' : '1px solid var(--border-medium)',
                      background: isSel ? 'linear-gradient(180deg, rgba(99, 102, 241, 0.08) 0%, var(--bg-surface) 100%)' : 'var(--bg-surface)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative'
                    }}
                  >
                    {isSel && (
                      <div className="pdp-selected-badge" style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)', color: '#fff', fontSize: '0.72rem', fontWeight: 800, padding: '3px 12px', borderRadius: '9999px', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', zIndex: 2 }}>
                        Selected Option
                      </div>
                    )}

                    <div>
                      <h3 className="pdp-plan-card-title" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{licName}</h3>
                      <p className="pdp-plan-card-desc" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', minHeight: '38px', marginBottom: '1.5rem' }}>
                        {lic.description || 'Standard production license with commercial client permissions.'}
                      </p>

                      <div className="pdp-plan-price-row" style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <span className="pdp-plan-price-text" style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                          {formatCurrency(lic.price, currency)}
                        </span>
                        {hasLicDiscount && (
                          <>
                            <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                              {formatCurrency(lic.regular_price, currency)}
                            </span>
                            <span className="pdp-save-badge">
                              {licDiscountPct}% OFF
                            </span>
                          </>
                        )}
                      </div>

                      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {featuresList.map((f, fIdx) => (
                          <div key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            <CheckCircle size={16} color="var(--accent-emerald)" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <button
                        onClick={() => {
                          setSelectedLicense(lic);
                          handleBuyNow(lic);
                        }}
                        className="btn btn-primary btn-lg"
                        style={{ width: '100%', gap: '0.5rem' }}
                      >
                        <Zap size={18} fill="currentColor" />
                        <span>BUY THIS LICENSE</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedLicense(lic);
                          handleAddToCart();
                        }}
                        className="btn btn-secondary btn-md"
                        style={{ width: '100%' }}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="pdp-card pdp-pricing-fallback-card" style={{ textAlign: 'center', maxWidth: '500px', margin: '0 auto', width: '100%' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{product.title}</h3>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.75rem', margin: '1.5rem 0', flexWrap: 'wrap' }}>
                  <span className="pdp-plan-price-text" style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                    {formatCurrency(currentPrice, currency)}
                  </span>
                  {hasDiscount && (
                    <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                      {formatCurrency(regularPrice, currency)}
                    </span>
                  )}
                </div>
                <div className="pdp-fallback-btn-row" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                  <button onClick={handleBuyNow} className="btn btn-primary btn-lg" style={{ flex: 1, minWidth: '140px' }}>
                    <Zap size={18} fill="currentColor" /> BUY NOW
                  </button>
                  <button onClick={handleAddToCart} className="btn btn-secondary btn-lg" style={{ flex: 1, minWidth: '140px' }}>
                    Add to Cart
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  };

  // 21. SECTION 21 — LICENSE TERMS & PERMISSIONS
  const renderLicense = () => {
    const licData = getSectionData('license') || getSectionData('license_delivery') || {
      license_type: selectedLicense?.license_name || 'Commercial Single Project License',
      delivery_method: 'Instant Digital Download',
      access: 'Lifetime access with continuous updates',
      support: 'Direct developer assistance',
      can_customize: 'Yes — full source code modification permitted.',
      can_deploy: 'Yes — personal or single client commercial deployment.',
      can_rebrand: 'Yes — 100% white label branding allowed.',
      can_resell: 'No — redistributing raw source code is prohibited.'
    };

    return (
      <section className="pdp-section">
        <div className="pdp-container">
          <div className="pdp-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="pdp-card-icon" style={{ marginBottom: 0 }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>License & Legal Permissions</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Understand exactly what rights and freedoms are included with your purchase.</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '1.25rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Can I Customize Code?</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#10b981', marginTop: '0.35rem' }}>✓ Allowed — 100% Full Access</div>
              </div>
              <div style={{ padding: '1.25rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Commercial Deployment?</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#10b981', marginTop: '0.35rem' }}>✓ Allowed — Client & Business</div>
              </div>
              <div style={{ padding: '1.25rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>White Label Branding?</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#10b981', marginTop: '0.35rem' }}>✓ Allowed — Remove All Brand Tags</div>
              </div>
              <div style={{ padding: '1.25rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Raw Code Reselling?</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f43f5e', marginTop: '0.35rem' }}>✕ Prohibited — Cannot Resell Source</div>
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

  // 22. SECTION 22 — TESTIMONIALS
  const renderTestimonials = () => {
    let raw = (testimonials && testimonials.length > 0) ? testimonials : getSectionData('testimonials');
    if (typeof raw === 'string') {
      try { raw = JSON.parse(raw); } catch (e) {}
    }
    const testList = Array.isArray(raw) ? raw : [];
    if (!testList || testList.length === 0) return null;

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

  // 23. SECTION 23 — REVIEWS / RATINGS
  const renderReviews = () => {
    const rawRating = product.average_rating || 5.0;
    const totalReviews = product.review_count || (testimonials ? testimonials.length : 12);

    return (
      <section className="pdp-section">
        <div className="pdp-container">
          <div className="pdp-card" style={{ padding: '2rem 2.5rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
              <div>
                <span className="pdp-kicker">Product Ratings</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  Verified Buyer Reviews
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Based on verified orders and customer reviews.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
                  {Number(rawRating).toFixed(1)}
                </div>
                <div>
                  <StarRating rating={Math.round(rawRating)} />
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {totalReviews} verified ratings
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  // 24. SECTION 24 — FAQ ACCORDION
  const renderFaq = () => {
    let raw = getSectionData('faq');
    if (typeof raw === 'string') {
      try { raw = JSON.parse(raw); } catch (e) {}
    }
    const faqList = Array.isArray(raw) && raw.length > 0 ? raw : (Array.isArray(faqs) ? faqs : []);
    if (!faqList || faqList.length === 0) return null;

    return (
      <section className="pdp-section">
        <div className="pdp-container">
          <div className="pdp-section-header">
            <span className="pdp-kicker">Got Questions?</span>
            <h2 className="pdp-section-title">Frequently Asked Questions</h2>
            <p className="pdp-section-subtitle">Everything you need to know about files, licensing, delivery, and customization.</p>
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

  // 25. SECTION 25 — FINAL CTA
  const renderFinalCta = () => {
    const finalData = getSectionData('final_cta') || {
      heading: 'Ready to Launch Your Solution?',
      subheading: `Get ${product.title} today with full unencrypted source code and standard commercial deployment license.`,
      cta_text: product.cta_text || 'BUY NOW'
    };

    return (
      <section className="pdp-section">
        <div className="pdp-container">
          <div className="pdp-conversion-banner" style={{ padding: '4rem 2rem' }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
              {finalData.heading}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
              {finalData.subheading}
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '460px', margin: '0 auto' }}>
              <button
                onClick={handleBuyNow}
                className="btn btn-primary btn-lg"
                style={{ flex: '1 1 200px', gap: '0.6rem' }}
              >
                <Zap size={18} fill="currentColor" />
                <span>{finalData.cta_text || 'BUY NOW'}</span>
              </button>
              <button
                onClick={handleAddToCart}
                className="btn btn-secondary btn-lg"
                style={{ flex: '1 1 200px', gap: '0.6rem' }}
              >
                <ShoppingBag size={18} />
                <span>ADD TO CART</span>
              </button>
            </div>

            <div className="pdp-trust-bar" style={{ justifyContent: 'center', gap: '2rem', marginTop: '2.5rem' }}>
              <span className="pdp-trust-item"><Lock size={14} style={{ color: 'var(--accent-emerald)' }} /> Secure Checkout</span>
              <span className="pdp-trust-item"><DownloadCloud size={14} style={{ color: 'var(--primary)' }} /> Instant File Delivery</span>
              <span className="pdp-trust-item"><ShieldCheck size={14} style={{ color: 'var(--accent-emerald)' }} /> Commercial Rights</span>
            </div>
          </div>
        </div>
      </section>
    );
  };

  // 26. SECTION 26 — CONTACT / SUPPORT
  const renderSupport = () => {
    const supportData = getSectionData('support') || {
      email: 'support@rollixia.com',
      whatsapp: '+1 (800) 555-ROLL',
      docs_url: product.docs_url || product.doc_url,
      description: 'Have a pre-sale question or need custom architecture assistance? Our engineering team is ready to help.'
    };

    return (
      <section className="pdp-section">
        <div className="pdp-container">
          <div className="pdp-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
            <div style={{ maxWidth: '640px', margin: '0 auto' }}>
              <span className="pdp-kicker">Dedicated Assistance</span>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem', marginBottom: '0.75rem' }}>
                Questions Before Purchasing?
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem' }}>
                {supportData.description}
              </p>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {supportData.email && (
                  <a href={`mailto:${supportData.email}`} className="btn btn-outline btn-md">
                    <Mail size={16} />
                    <span>Email Support</span>
                  </a>
                )}
                {supportData.whatsapp && (
                  <a href={`https://wa.me/${supportData.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="btn btn-outline btn-md">
                    <MessageSquare size={16} />
                    <span>WhatsApp Chat</span>
                  </a>
                )}
                {supportData.docs_url && (
                  <a href={supportData.docs_url} target="_blank" rel="noreferrer" className="btn btn-outline btn-md">
                    <FileCode size={16} />
                    <span>Browse Documentation</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  // 27. CUSTOM SECTION RENDERER
  const renderCustomSection = (sec) => {
    if (!sec) return null;
    let content = sec.content;
    if (typeof content === 'string') {
      try { content = JSON.parse(content); } catch (e) {}
    }
    content = content || {};

    const title = sec.title || content.title || 'Custom Section';
    const eyebrow = content.eyebrow || 'Information';
    const desc = content.description || content.text || '';
    const image = content.image || content.media_url;
    const ctaText = content.cta_text;
    const ctaUrl = content.cta_url;

    return (
      <section key={sec.id || sec.section_type} className="pdp-section">
        <div className="pdp-container">
          <div className="pdp-section-header">
            {eyebrow && <span className="pdp-kicker">{eyebrow}</span>}
            <h2 className="pdp-section-title">{title}</h2>
            {desc && <p className="pdp-section-subtitle">{desc}</p>}
          </div>

          {image && (
            <div style={{ maxWidth: '900px', margin: '1.5rem auto 0', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-medium)' }}>
              <img src={image} alt={title} style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
          )}

          {ctaText && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              {ctaUrl ? (
                <a href={ctaUrl} target="_blank" rel="noreferrer" className="btn btn-primary btn-md">
                  <span>{ctaText}</span>
                  <ArrowRight size={16} />
                </a>
              ) : (
                <button onClick={handleBuyNow} className="btn btn-primary btn-md">
                  <span>{ctaText}</span>
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    );
  };

  // Section Dispatcher Map
  const sectionRendererMap = {
    breadcrumb: renderBreadcrumb,
    hero: renderHero,
    video: renderVideo,
    overview: renderOverview,
    ecosystem: renderEcosystem,
    demo: renderDemo,
    customer_experience: renderCustomerExperience,
    partner_experience: renderPartnerExperience,
    admin_experience: renderAdminExperience,
    features: renderFeatures,
    how_it_works: renderHowItWorks,
    included: renderIncluded,
    source_code: renderSourceCode,
    specs: renderSpecs,
    requirements: renderRequirements,
    customization: renderCustomization,
    who_is_it_for: renderWhoIsItFor,
    use_cases: renderUseCases,
    comparison: renderComparison,
    after_purchase: renderAfterPurchase,
    pricing: renderPricing,
    license: renderLicense,
    testimonials: renderTestimonials,
    reviews: renderReviews,
    faq: renderFaq,
    final_cta: renderFinalCta,
    support: renderSupport,

    // Backward compatibility aliases
    highlights: () => null,
    showcase: renderCustomerExperience,
    screenshots: () => null,
    license_delivery: renderLicense,
    platforms: () => null,
    related: () => null
  };

  // Canonical ordering fallback if dbSections is empty
  const defaultCanonicalTypes = [
    'breadcrumb',
    'hero',
    'video',
    'overview',
    'ecosystem',
    'demo',
    'customer_experience',
    'partner_experience',
    'admin_experience',
    'features',
    'how_it_works',
    'included',
    'source_code',
    'specs',
    'requirements',
    'customization',
    'who_is_it_for',
    'use_cases',
    'comparison',
    'after_purchase',
    'pricing',
    'license',
    'testimonials',
    'reviews',
    'faq',
    'final_cta',
    'support'
  ];

  // Compile active sections from database or fall back to canonical order
  let orderedSections = [];
  if (Array.isArray(dbSections) && dbSections.length > 0) {
    let visibleSections = dbSections
      .filter(s => s && (s.is_visible === undefined || s.is_visible === 1 || s.is_visible === true))
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    // Dynamic Video Section Visibility
    const hasVideo = !!(product.video_url || getSectionData('video')?.url);
    const isVideoExplicitlyHidden = product.is_video_visible === 0 || product.is_video_visible === false;
    const isVideoExplicitlyEnabled = product.is_video_visible === 1 || product.is_video_visible === true;

    if (!hasVideo || isVideoExplicitlyHidden) {
      visibleSections = visibleSections.filter(s => (s.section_type || s.type) !== 'video');
    } else if (hasVideo && isVideoExplicitlyEnabled) {
      const alreadyHasVideo = visibleSections.some(s => (s.section_type || s.type) === 'video');
      if (!alreadyHasVideo) {
        const heroIdx = visibleSections.findIndex(s => (s.section_type || s.type) === 'hero');
        const videoEntry = { section_type: 'video', is_visible: 1, sort_order: 2.5 };
        if (heroIdx !== -1) {
          visibleSections.splice(heroIdx + 1, 0, videoEntry);
        } else {
          visibleSections.unshift(videoEntry);
        }
      }
    }

    // Dynamic Demo Section Visibility
    const isDemoExplicitlyHidden = product.show_demo_links === 0 || product.show_demo_links === false;
    if (isDemoExplicitlyHidden) {
      visibleSections = visibleSections.filter(s => (s.section_type || s.type) !== 'demo');
    } else {
      const alreadyHasDemo = visibleSections.some(s => (s.section_type || s.type) === 'demo');
      if (!alreadyHasDemo) {
        const heroIdx = visibleSections.findIndex(s => (s.section_type || s.type) === 'hero');
        const demoEntry = { section_type: 'demo', is_visible: 1, sort_order: 2.2 };
        if (heroIdx !== -1) {
          visibleSections.splice(heroIdx + 1, 0, demoEntry);
        } else {
          visibleSections.unshift(demoEntry);
        }
      }
    }

    orderedSections = visibleSections;
  } else {
    orderedSections = defaultCanonicalTypes
      .filter(type => {
        if (type === 'video' && (!product.video_url || product.is_video_visible === 0 || product.is_video_visible === false)) return false;
        if (type === 'demo' && (product.show_demo_links === 0 || product.show_demo_links === false)) return false;
        return true;
      })
      .map((type, idx) => ({
        section_type: type,
        is_visible: 1,
        sort_order: idx + 1
      }));
  }

  return (
    <article className="pdp-page">
      {/* Dynamic Sections in Admin Configured Order */}
      {orderedSections.map((sec, idx) => {
        const secType = sec.section_type || sec.type;
        if (!secType) return null;

        if (secType === 'custom' || secType.startsWith('custom_') || sec.is_custom) {
          return <React.Fragment key={`custom-${sec.id || idx}`}>{renderCustomSection(sec)}</React.Fragment>;
        }

        const renderer = sectionRendererMap[secType];
        if (!renderer) return null;
        return <React.Fragment key={`${secType}-${sec.id || idx}`}>{renderer()}</React.Fragment>;
      })}

      {/* Sticky Bottom Purchase Bar */}
      {showStickyBar && (
        <div className="pdp-sticky-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', overflow: 'hidden' }}>
            <img
              src={product.thumbnail || product.hero_image || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=200&q=80'}
              alt=""
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=200&q=80';
              }}
              style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border-subtle)' }}
            />
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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

      {/* Image Gallery Lightbox Modal */}
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

      {/* Product Video Demo Modal Lightbox */}
      {isVideoModalOpen && (() => {
        const rawVideoUrl = getSectionData('video')?.url || product.video_url;
        const parsed = parseVideoUrl(rawVideoUrl);
        if (!parsed) return null;
        const videoTitle = getSectionData('video')?.title || product.video_title || product.title || 'Product Video Demo';

        return (
          <div
            role="dialog"
            aria-modal="true"
            className="pdp-lightbox-overlay"
            style={{ zIndex: 99999, background: 'rgba(5, 7, 15, 0.9)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setIsVideoModalOpen(false)}
          >
            <button
              onClick={() => setIsVideoModalOpen(false)}
              className="pdp-lightbox-close"
              aria-label="Close Video Modal"
              style={{
                position: 'fixed',
                top: '1.5rem',
                right: '1.5rem',
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.12)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.2)',
                zIndex: 100000,
                transition: 'all 0.2s'
              }}
            >
              <X size={22} />
            </button>

            <div
              style={{
                width: '94%',
                maxWidth: '1020px',
                aspectRatio: '16/9',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                background: '#000',
                boxShadow: '0 25px 60px -15px rgba(0,0,0,0.85), 0 0 50px rgba(99, 102, 241, 0.3)',
                border: '1px solid var(--border-medium)',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {parsed.provider === 'youtube' || parsed.provider === 'vimeo' || parsed.provider === 'loom' || parsed.provider === 'iframe' ? (
                <iframe
                  src={parsed.embedUrl.includes('?') ? `${parsed.embedUrl}&autoplay=1` : `${parsed.embedUrl}?autoplay=1`}
                  title={videoTitle}
                  style={{ width: '100%', height: '100%', border: 0 }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <video
                  controls
                  autoPlay
                  preload="auto"
                  poster={product.video_thumbnail || product.hero_image}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                >
                  <source src={parsed.src} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </div>
        );
      })()}
    </article>
  );
}
