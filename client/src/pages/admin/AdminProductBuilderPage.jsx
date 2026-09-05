import React, { useState, useEffect } from 'react';
import {
  Save,
  Eye,
  Globe,
  ArrowLeft,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  AlertCircle,
  Smartphone,
  Tablet,
  Monitor,
  Sparkles,
  Layers,
  Gift,
  HelpCircle,
  MessageSquare,
  FileCode,
  Link as LinkIcon,
  Shield,
  Tag,
  DollarSign,
  Image as ImageIcon,
  Check,
  RefreshCw,
  Video,
  List,
  CheckSquare,
  Package,
  Wrench,
  Search,
  ExternalLink,
  X,
  Cpu,
  Award
} from 'lucide-react';
import { apiRequest } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatters';
import { DynamicProductPage } from '../../components/store/DynamicProductPage';

export function AdminProductBuilderPage({ productId, onBack, onSaved }) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(!!productId);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [categories, setCategories] = useState([]);

  // Product Core Form State
  const [product, setProduct] = useState({
    title: '',
    slug: '',
    sku: '',
    category_id: 1,
    product_type: 'Digital Resource',
    regular_price: 2999,
    sale_price: 1499,
    badge: 'POPULAR',
    hero_image: '',
    thumbnail: '',
    short_description: '',
    full_description: '',
    eyebrow: '',
    subtitle: '',
    cta_text: 'BUY NOW',
    secondary_cta_text: 'ADD TO CART',
    video_url: '',
    demo_url: '',
    doc_url: '',
    deliverable_name: '',
    deliverable_version: '1.0.0',
    status: 'published',
    asset_availability: 'Available',
    disclaimer: '',
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    og_image: ''
  });

  // Canonical 20 sections manager
  const [sections, setSections] = useState([
    { section_type: 'breadcrumb', title: 'Breadcrumb Navigation', is_visible: 1, sort_order: 1 },
    { section_type: 'hero', title: 'Product Hero', is_visible: 1, sort_order: 2 },
    { section_type: 'gallery', title: 'Product Gallery', is_visible: 1, sort_order: 3 },
    { section_type: 'highlights', title: 'Trust / Key Highlights', is_visible: 1, sort_order: 4 },
    { section_type: 'overview', title: 'Product Overview & Specs', is_visible: 1, sort_order: 5 },
    { section_type: 'features', title: 'Key Features', is_visible: 1, sort_order: 6 },
    { section_type: 'showcase', title: 'Feature Showcase', is_visible: 1, sort_order: 7 },
    { section_type: 'screenshots', title: 'Product Screenshots', is_visible: 1, sort_order: 8 },
    { section_type: 'included', title: "What's Included", is_visible: 1, sort_order: 9 },
    { section_type: 'how_it_works', title: 'How It Works', is_visible: 1, sort_order: 10 },
    { section_type: 'specs', title: 'Technical Specifications', is_visible: 1, sort_order: 11 },
    { section_type: 'platforms', title: 'Supported Platforms', is_visible: 1, sort_order: 12 },
    { section_type: 'use_cases', title: 'Business Use Cases', is_visible: 1, sort_order: 13 },
    { section_type: 'video', title: 'Product Demo / Video', is_visible: 1, sort_order: 14 },
    { section_type: 'pricing', title: 'Pricing CTA', is_visible: 1, sort_order: 15 },
    { section_type: 'testimonials', title: 'Customer Testimonials', is_visible: 1, sort_order: 16 },
    { section_type: 'faq', title: 'Frequently Asked Questions', is_visible: 1, sort_order: 17 },
    { section_type: 'license_delivery', title: 'License & Delivery Info', is_visible: 1, sort_order: 18 },
    { section_type: 'related', title: 'Related Products', is_visible: 1, sort_order: 19 },
    { section_type: 'final_cta', title: 'Final Conversion CTA', is_visible: 1, sort_order: 20 }
  ]);

  // Section-specific structured datasets
  const [highlights, setHighlights] = useState([]);
  const [showcase, setShowcase] = useState([]);
  const [screenshots, setScreenshots] = useState([]);
  const [specs, setSpecs] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [useCases, setUseCases] = useState([]);
  const [includedItems, setIncludedItems] = useState([]);
  const [steps, setSteps] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [features, setFeatures] = useState([]);
  const [mediaList, setMediaList] = useState([]);
  const [licensesList, setLicensesList] = useState([]);
  const [videoConfig, setVideoConfig] = useState({ provider: 'youtube', url: '', title: '', description: '' });
  const [licenseConfig, setLicenseConfig] = useState({
    license_type: 'Commercial Project License',
    delivery_method: 'Instant Digital Download',
    access: 'Lifetime access with unlimited downloads',
    support: 'Standard technical assistance included',
    disclaimer: ''
  });

  // Load initial product data
  useEffect(() => {
    apiRequest('/api/categories').then(data => {
      setCategories(data || []);
      if (!productId && data && data.length > 0) {
        setProduct(prev => ({ ...prev, category_id: data[0].id }));
      }
    }).catch(() => {});

    if (productId) {
      setLoading(true);
      apiRequest(`/api/admin/products/${productId}/full`)
        .then(res => {
          if (res && res.product) {
            setProduct(res.product);

            if (res.sections && res.sections.length > 0) {
              setSections(res.sections.map((s, idx) => ({
                section_type: s.section_type || s.type,
                title: s.title,
                is_visible: s.is_visible !== undefined ? s.is_visible : 1,
                sort_order: s.sort_order || idx + 1,
                content: s.content
              })));

              const hlSec = res.sections.find(s => (s.section_type || s.type) === 'highlights');
              if (hlSec && Array.isArray(hlSec.content)) setHighlights(hlSec.content);

              const scSec = res.sections.find(s => (s.section_type || s.type) === 'showcase');
              if (scSec && Array.isArray(scSec.content)) setShowcase(scSec.content);

              const scrSec = res.sections.find(s => (s.section_type || s.type) === 'screenshots');
              if (scrSec && Array.isArray(scrSec.content)) setScreenshots(scrSec.content);

              const spSec = res.sections.find(s => (s.section_type || s.type) === 'specs');
              if (spSec && Array.isArray(spSec.content)) setSpecs(spSec.content);

              const plSec = res.sections.find(s => (s.section_type || s.type) === 'platforms');
              if (plSec && Array.isArray(plSec.content)) setPlatforms(plSec.content);

              const ucSec = res.sections.find(s => (s.section_type || s.type) === 'use_cases');
              if (ucSec && Array.isArray(ucSec.content)) setUseCases(ucSec.content);

              const incSec = res.sections.find(s => (s.section_type || s.type) === 'included');
              if (incSec && Array.isArray(incSec.content)) setIncludedItems(incSec.content);

              const stSec = res.sections.find(s => (s.section_type || s.type) === 'how_it_works');
              if (stSec && Array.isArray(stSec.content)) setSteps(stSec.content);

              const vidSec = res.sections.find(s => (s.section_type || s.type) === 'video');
              if (vidSec && vidSec.content) setVideoConfig(vidSec.content);

              const licSec = res.sections.find(s => (s.section_type || s.type) === 'license_delivery');
              if (licSec && licSec.content) setLicenseConfig(licSec.content);
            }

            if (res.faqs) setFaqs(res.faqs);
            if (res.testimonials && res.testimonials.length > 0) {
              setTestimonials(res.testimonials.map(t => ({
                id: t.id,
                name: t.name || t.user_name || '',
                user_name: t.name || t.user_name || '',
                designation: t.designation || t.role || '',
                role: t.designation || t.role || '',
                text: t.text || t.quote || '',
                quote: t.text || t.quote || '',
                rating: t.rating !== undefined ? t.rating : 5,
                avatar_url: t.avatar_url || '',
                is_verified: t.is_verified !== undefined ? (t.is_verified ? 1 : 0) : 1
              })));
            } else {
              const testSec = res.sections?.find(s => (s.section_type || s.type) === 'testimonials');
              if (testSec && Array.isArray(testSec.content) && testSec.content.length > 0) {
                setTestimonials(testSec.content.map(t => ({
                  id: t.id,
                  name: t.name || t.user_name || '',
                  user_name: t.name || t.user_name || '',
                  designation: t.designation || t.role || '',
                  role: t.designation || t.role || '',
                  text: t.text || t.quote || '',
                  quote: t.text || t.quote || '',
                  rating: t.rating !== undefined ? t.rating : 5,
                  avatar_url: t.avatar_url || '',
                  is_verified: t.is_verified !== undefined ? (t.is_verified ? 1 : 0) : 1
                })));
              }
            }

            if (res.features && res.features.length > 0) {
              setFeatures(res.features);
            } else {
              const featSec = res.sections?.find(s => (s.section_type || s.type) === 'features');
              if (featSec && Array.isArray(featSec.content)) setFeatures(featSec.content);
            }

            if (res.media) setMediaList(res.media);
            if (res.licenses) setLicensesList(res.licenses);
          }
        })
        .catch(err => {
          console.error(err);
          addToast('Failed to load product details for editing', 'error');
        })
        .finally(() => setLoading(false));
    }
  }, [productId]);

  // Section Ordering & Visibility
  const moveSection = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    const reordered = [...sections];
    const item = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = item;
    setSections(reordered.map((sec, idx) => ({ ...sec, sort_order: idx + 1 })));
  };

  const toggleSectionVisibility = (index) => {
    const updated = [...sections];
    updated[index].is_visible = updated[index].is_visible === 1 ? 0 : 1;
    setSections(updated);
  };

  // Compile final live preview data payload
  const previewPayload = {
    product: { ...product },
    media: mediaList.length > 0 ? mediaList : [{ media_url: product.hero_image || product.thumbnail }],
    faqs,
    testimonials,
    features,
    licenses: licensesList,
    sections: sections.map(s => {
      let content = null;
      if (s.section_type === 'highlights') content = highlights;
      else if (s.section_type === 'showcase') content = showcase;
      else if (s.section_type === 'screenshots') content = screenshots;
      else if (s.section_type === 'specs') content = specs;
      else if (s.section_type === 'platforms') content = platforms;
      else if (s.section_type === 'use_cases') content = useCases;
      else if (s.section_type === 'included') content = includedItems;
      else if (s.section_type === 'how_it_works') content = steps;
      else if (s.section_type === 'video') content = videoConfig.url ? videoConfig : null;
      else if (s.section_type === 'license_delivery') content = licenseConfig;
      else if (s.section_type === 'overview') {
        content = {
          specs: specs.slice(0, 5),
          description: product.full_description || product.short_description
        };
      }
      return { ...s, content };
    })
  };

  // Save changes to database (Handles both CREATE and UPDATE)
  const handleSave = async (overrideStatus, redirectAfterSave = false) => {
    if (!product.title.trim()) {
      addToast('Please enter a product title', 'error');
      return;
    }

    setSaving(true);
    try {
      const targetStatus = overrideStatus || product.status || 'published';
      const productPayload = {
        ...product,
        status: targetStatus,
        media: mediaList,
        features,
        faqs,
        testimonials,
        licenses: licensesList,
        category_id: product.category_id || (categories[0] ? categories[0].id : 1)
      };

      let finalProductId = productId;
      let finalSlug = product.slug;

      if (productId) {
        // 1. Update existing product base record
        await apiRequest(`/api/admin/products/${productId}`, {
          method: 'PUT',
          body: JSON.stringify(productPayload)
        });
      } else {
        // 1. Create new product record
        const createRes = await apiRequest('/api/admin/products', {
          method: 'POST',
          body: JSON.stringify(productPayload)
        });
        finalProductId = createRes.productId;
        finalSlug = createRes.slug || product.slug;
      }

      // 2. Prepare comprehensive canonical 20 sections payload
      if (finalProductId) {
        const enrichedSections = sections.map((s, idx) => {
          let secContent = null;
          if (s.section_type === 'highlights') secContent = highlights;
          else if (s.section_type === 'showcase') secContent = showcase;
          else if (s.section_type === 'screenshots') secContent = screenshots;
          else if (s.section_type === 'specs') secContent = specs;
          else if (s.section_type === 'platforms') secContent = platforms;
          else if (s.section_type === 'use_cases') secContent = useCases;
          else if (s.section_type === 'included') secContent = includedItems;
          else if (s.section_type === 'how_it_works') secContent = steps;
          else if (s.section_type === 'video') secContent = videoConfig.url ? videoConfig : null;
          else if (s.section_type === 'license_delivery') secContent = licenseConfig;
          else if (s.section_type === 'testimonials') secContent = testimonials;
          else if (s.section_type === 'faq') secContent = faqs;
          else if (s.section_type === 'features') secContent = features;
          else if (s.section_type === 'overview') {
            secContent = {
              specs: specs.slice(0, 5),
              description: product.full_description || product.short_description
            };
          }

          return {
            section_type: s.section_type,
            title: s.title,
            sort_order: idx + 1,
            is_visible: s.is_visible,
            content: secContent
          };
        });

        await apiRequest(`/api/admin/products/${finalProductId}/sections`, {
          method: 'PUT',
          body: JSON.stringify({ sections: enrichedSections })
        });
      }

      addToast(
        productId
          ? 'Product details and sections updated successfully!'
          : 'Product created and published to store successfully!',
        'success'
      );

      // If new product created or explicit redirect requested
      if (!productId && onSaved) {
        onSaved(finalSlug);
      } else if (redirectAfterSave && onSaved) {
        onSaved(finalSlug);
      }
    } catch (err) {
      console.error('Save error:', err);
      addToast(err.message || 'Failed to save product', 'error');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'basic', label: '1. Basic Info & Details', icon: List, desc: 'Name, slug, category, badges, and overview descriptions' },
    { id: 'pricing', label: '2. Pricing & Licenses', icon: DollarSign, desc: 'Regular and sale pricing, discount, CTA buttons, license options' },
    { id: 'media', label: '3. Images & Media Gallery', icon: ImageIcon, desc: 'Hero banner, thumbnail image, additional gallery items' },
    { id: 'links', label: '4. Links & Deliverables', icon: LinkIcon, desc: 'Live demo link, video demo preview, documentation URL, file bundle' },
    { id: 'sections', label: '5. Page Sections & Ordering', icon: Layers, desc: 'Enable/disable and reorder all 20 canonical page sections' },
    { id: 'features', label: '6. Features, Specs & Assets', icon: CheckSquare, desc: 'Key features, technical specifications, what\'s included' },
    { id: 'faqs', label: '7. FAQs & Testimonials', icon: HelpCircle, desc: 'Customer questions, answers, and verified client testimonials' },
    { id: 'seo', label: '8. SEO & Social Meta', icon: Search, desc: 'Meta tags, page titles, search keywords, and OG image' }
  ];

  if (loading) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <div style={{
          width: '36px',
          height: '36px',
          border: '3px solid rgba(99, 102, 241, 0.2)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem'
        }} />
        <p style={{ fontWeight: 600 }}>Loading product configuration data...</p>
      </div>
    );
  }

  return (
    <div className="ab-container">
      {/* Top Header Card */}
      <div className="ab-header-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={onBack}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            title="Return to products"
          >
            <ArrowLeft size={16} />
            <span>Products</span>
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {product.title || (productId ? 'Edit Product' : 'Add New Product')}
              </h1>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '9999px',
                background: product.status === 'published' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: product.status === 'published' ? '#10b981' : '#f59e0b',
                border: `1px solid ${product.status === 'published' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
              }}>
                {(product.status || 'published').toUpperCase()}
              </span>
            </div>
            {product.slug && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Store URL:</span>
                <a
                  href={`/products/${product.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-mono)' }}
                >
                  /products/{product.slug}
                  <ExternalLink size={11} />
                </a>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <select
            value={product.status || 'published'}
            onChange={(e) => setProduct(prev => ({ ...prev, status: e.target.value }))}
            className="ab-select"
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem' }}
          >
            <option value="published">Status: Published</option>
            <option value="draft">Status: Draft</option>
            <option value="archived">Status: Archived</option>
          </select>

          <button
            onClick={() => setIsPreviewOpen(true)}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Eye size={15} />
            <span>Live Preview</span>
          </button>

          <button
            onClick={() => handleSave(product.status)}
            disabled={saving}
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Save size={15} />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Main Builder Layout: Left Tabs, Right Form Card */}
      <div className="ab-layout">
        {/* Left Navigation Card */}
        <aside className="ab-nav-card">
          <div style={{ padding: '4px 8px 8px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Product Modules
          </div>
          {tabs.map(tab => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`ab-nav-btn ${isActive ? 'active' : ''}`}
              >
                <IconComp size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Right Content Editor Card */}
        <div className="ab-content-card">
          {/* TAB 1: BASIC INFO */}
          {activeTab === 'basic' && (
            <div>
              <div className="ab-section-title">Product Name & Overview</div>
              <div className="ab-section-desc">Manage primary product title, store category, collections, and descriptions.</div>

              <div className="ab-form-grid">
                <div className="ab-form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="ab-form-label">Product Name / Title *</label>
                  <input
                    type="text"
                    value={product.title || ''}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setProduct(prev => ({
                        ...prev,
                        title: newTitle,
                        slug: prev.slug ? prev.slug : newTitle.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
                      }));
                    }}
                    placeholder="e.g. Modern Minimalist Tailwind Portfolio Template"
                    className="ab-input"
                    required
                  />
                </div>

                <div className="ab-form-group">
                  <label className="ab-form-label">Store URL Slug</label>
                  <input
                    type="text"
                    value={product.slug || ''}
                    onChange={(e) => setProduct(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="modern-minimalist-tailwind-portfolio"
                    className="ab-input"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  />
                </div>

                <div className="ab-form-group">
                  <label className="ab-form-label">Store Category *</label>
                  <select
                    value={product.category_id || 1}
                    onChange={(e) => setProduct(prev => ({ ...prev, category_id: parseInt(e.target.value) }))}
                    className="ab-select"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="ab-form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="ab-form-label">
                    <span>Badge / Collection Tag</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Quick Select Presets Below</span>
                  </label>
                  <input
                    type="text"
                    value={product.badge || ''}
                    onChange={(e) => setProduct(prev => ({ ...prev, badge: e.target.value }))}
                    placeholder="e.g. DEAL, FREE, POPULAR, BESTSELLER"
                    className="ab-input"
                  />
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                    {['DEAL', 'FREE', 'POPULAR', 'BESTSELLER', 'TRENDING', 'NEW'].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setProduct(prev => ({ ...prev, badge: tag }))}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="ab-form-group">
                  <label className="ab-form-label">Header Eyebrow / Tagline</label>
                  <input
                    type="text"
                    value={product.eyebrow || ''}
                    onChange={(e) => setProduct(prev => ({ ...prev, eyebrow: e.target.value }))}
                    placeholder="e.g. ULTRA-CLEAN DEVELOPER TEMPLATE"
                    className="ab-input"
                  />
                </div>

                <div className="ab-form-group">
                  <label className="ab-form-label">Subtitle</label>
                  <input
                    type="text"
                    value={product.subtitle || ''}
                    onChange={(e) => setProduct(prev => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="e.g. Built for senior software engineers & product designers"
                    className="ab-input"
                  />
                </div>

                <div className="ab-form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="ab-form-label">Short Description (Hero Section)</label>
                  <textarea
                    value={product.short_description || ''}
                    onChange={(e) => setProduct(prev => ({ ...prev, short_description: e.target.value }))}
                    placeholder="Provide a concise 1-2 sentence overview of what makes this product exceptional..."
                    className="ab-textarea"
                    rows={2}
                  />
                </div>

                <div className="ab-form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="ab-form-label">Comprehensive Full Description</label>
                  <textarea
                    value={product.full_description || ''}
                    onChange={(e) => setProduct(prev => ({ ...prev, full_description: e.target.value }))}
                    placeholder="Describe the product features, benefits, tech stack, and installation steps in depth..."
                    className="ab-textarea"
                    rows={6}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRICING & LICENSES */}
          {activeTab === 'pricing' && (
            <div>
              <div className="ab-section-title">Pricing, Discounts & Licenses</div>
              <div className="ab-section-desc">Configure catalog pricing, discounts, call to action button labels, and project licenses.</div>

              <div className="ab-form-grid">
                <div className="ab-form-group">
                  <label className="ab-form-label">Regular / Original Price (₹)</label>
                  <input
                    type="number"
                    value={product.regular_price || 0}
                    onChange={(e) => setProduct(prev => ({ ...prev, regular_price: parseFloat(e.target.value) || 0 }))}
                    className="ab-input"
                  />
                </div>

                <div className="ab-form-group">
                  <label className="ab-form-label">Sale / Discounted Price (₹)</label>
                  <input
                    type="number"
                    value={product.sale_price !== null && product.sale_price !== undefined ? product.sale_price : ''}
                    onChange={(e) => setProduct(prev => ({ ...prev, sale_price: e.target.value === '' ? null : parseFloat(e.target.value) }))}
                    placeholder="Optional sale price"
                    className="ab-input"
                  />
                  {product.sale_price !== null && product.sale_price < product.regular_price && (
                    <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, marginTop: '4px' }}>
                      ✓ {Math.round(((product.regular_price - product.sale_price) / product.regular_price) * 100)}% Discount Applied (Savings: {formatCurrency(product.regular_price - product.sale_price)})
                    </div>
                  )}
                </div>

                <div className="ab-form-group">
                  <label className="ab-form-label">Primary CTA Button Label</label>
                  <input
                    type="text"
                    value={product.cta_text || 'BUY NOW'}
                    onChange={(e) => setProduct(prev => ({ ...prev, cta_text: e.target.value }))}
                    className="ab-input"
                  />
                </div>

                <div className="ab-form-group">
                  <label className="ab-form-label">Secondary CTA Button Label</label>
                  <input
                    type="text"
                    value={product.secondary_cta_text || 'ADD TO CART'}
                    onChange={(e) => setProduct(prev => ({ ...prev, secondary_cta_text: e.target.value }))}
                    className="ab-input"
                  />
                </div>
              </div>

              {/* License Tiers Manager */}
              <div style={{ marginTop: '2.5rem', paddingTop: '1.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                      Multiple License Options (Main Price, Offer Price & Inclusions)
                    </h3>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                      Set the Main/Actual Price and discounted Offer Price for each license tier, along with what is included (e.g. single vs extended usage).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const baseReg = product.regular_price || 4999;
                      const baseSale = product.sale_price !== null && product.sale_price !== undefined ? product.sale_price : baseReg;
                      setLicensesList([
                        ...licensesList,
                        {
                          name: 'Extended Developer License',
                          regular_price: baseReg * 2,
                          price: Math.round(baseSale * 1.8),
                          description: 'Multi-client commercial deployment rights with full source code & priority developer assistance'
                        }
                      ]);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Plus size={15} /> Add License Tier
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {licensesList.length === 0 ? (
                    <div style={{ padding: '1.75rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-medium)' }}>
                      Currently using single default license. Click <strong>"+ Add License Tier"</strong> to offer Standard vs Extended vs Enterprise developer options with custom offer prices.
                    </div>
                  ) : (
                    licensesList.map((lic, idx) => {
                      const licName = lic.name || lic.license_name || '';
                      const mainPrice = lic.regular_price !== undefined && lic.regular_price !== null ? lic.regular_price : '';
                      const offerPrice = lic.price !== undefined ? lic.price : '';
                      const hasLicSavings = mainPrice && offerPrice && parseFloat(mainPrice) > parseFloat(offerPrice);
                      const licSavings = hasLicSavings ? parseFloat(mainPrice) - parseFloat(offerPrice) : 0;
                      const licDiscountPct = hasLicSavings ? Math.round((licSavings / parseFloat(mainPrice)) * 100) : 0;

                      return (
                        <div
                          key={idx}
                          style={{
                            padding: '1.25rem',
                            background: 'var(--bg-surface-elevated)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-medium)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                          }}
                        >
                          {/* Row 1: Name, Main Price, Offer Price, Delete */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 2.5fr) minmax(130px, 1.2fr) minmax(130px, 1.2fr) auto', gap: '10px', alignItems: 'end' }}>
                            <div>
                              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                                License Option Name *
                              </label>
                              <input
                                type="text"
                                value={licName}
                                onChange={(e) => {
                                  const updated = [...licensesList];
                                  updated[idx].name = e.target.value;
                                  updated[idx].license_name = e.target.value;
                                  setLicensesList(updated);
                                }}
                                placeholder="e.g. Standard Commercial License"
                                className="ab-input"
                                style={{ fontWeight: 600 }}
                              />
                            </div>

                            <div>
                              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                                Main / Actual Price (₹)
                              </label>
                              <input
                                type="number"
                                value={mainPrice}
                                onChange={(e) => {
                                  const updated = [...licensesList];
                                  updated[idx].regular_price = e.target.value === '' ? null : parseFloat(e.target.value);
                                  setLicensesList(updated);
                                }}
                                placeholder="e.g. 7999"
                                className="ab-input"
                              />
                            </div>

                            <div>
                              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                                Offer / Sale Price (₹) *
                              </label>
                              <input
                                type="number"
                                value={offerPrice}
                                onChange={(e) => {
                                  const updated = [...licensesList];
                                  updated[idx].price = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                  setLicensesList(updated);
                                }}
                                placeholder="e.g. 4999"
                                className="ab-input"
                                style={{ fontWeight: 700, color: '#10b981' }}
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => setLicensesList(licensesList.filter((_, i) => i !== idx))}
                              className="btn btn-outline btn-sm"
                              style={{ color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)', height: '38px', padding: '0 10px' }}
                              title="Delete License Tier"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>

                          {/* Row 2: Inclusions & Rights Description */}
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                License Inclusions & Content (Shown to users upon selecting this tier) *
                              </label>
                              {hasLicSavings && (
                                <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>
                                  ✓ Customer Saves {formatCurrency(licSavings)} ({licDiscountPct}% OFF)
                                </span>
                              )}
                            </div>
                            <input
                              type="text"
                              value={lic.description || ''}
                              onChange={(e) => {
                                const updated = [...licensesList];
                                updated[idx].description = e.target.value;
                                setLicensesList(updated);
                              }}
                              placeholder="e.g. Single project deployment with full source code, lifetime updates, and commercial usage rights"
                              className="ab-input"
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MEDIA & GALLERY */}
          {activeTab === 'media' && (
            <div>
              <div className="ab-section-title">Images & Visual Media Gallery</div>
              <div className="ab-section-desc">Manage the primary hero image, thumbnail, screenshots, and visual product gallery.</div>

              <div className="ab-form-grid">
                <div className="ab-form-group">
                  <label className="ab-form-label">Primary Hero Image URL</label>
                  <input
                    type="text"
                    value={product.hero_image || ''}
                    onChange={(e) => setProduct(prev => ({ ...prev, hero_image: e.target.value }))}
                    placeholder="https://images.unsplash.com/..."
                    className="ab-input"
                  />
                  {product.hero_image && (
                    <div style={{ marginTop: '8px', borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '140px', background: 'var(--bg-surface-elevated)' }}>
                      <img src={product.hero_image} alt="Hero Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>

                <div className="ab-form-group">
                  <label className="ab-form-label">Thumbnail Image URL</label>
                  <input
                    type="text"
                    value={product.thumbnail || ''}
                    onChange={(e) => setProduct(prev => ({ ...prev, thumbnail: e.target.value }))}
                    placeholder="https://images.unsplash.com/..."
                    className="ab-input"
                  />
                  {product.thumbnail && (
                    <div style={{ marginTop: '8px', borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '140px', background: 'var(--bg-surface-elevated)' }}>
                      <img src={product.thumbnail} alt="Thumbnail Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Gallery Media */}
              <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      Product Carousel & Lightbox Gallery
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                      Additional screenshots and photos that appear in the interactive hero gallery.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMediaList([...mediaList, { media_url: '', caption: 'Screenshot preview', media_type: 'image' }])}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Plus size={14} /> Add Gallery Image
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {mediaList.length === 0 ? (
                    <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                      No additional gallery images added. The hero image will be used as the primary showcase image.
                    </div>
                  ) : (
                    mediaList.map((m, idx) => (
                      <div key={idx} className="ab-item-row">
                        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
                          <input
                            type="text"
                            value={m.media_url || ''}
                            onChange={(e) => {
                              const updated = [...mediaList];
                              updated[idx].media_url = e.target.value;
                              setMediaList(updated);
                            }}
                            placeholder="Image URL: https://..."
                            className="ab-input"
                          />
                          <input
                            type="text"
                            value={m.caption || ''}
                            onChange={(e) => {
                              const updated = [...mediaList];
                              updated[idx].caption = e.target.value;
                              setMediaList(updated);
                            }}
                            placeholder="Caption (e.g. Dashboard view)"
                            className="ab-input"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setMediaList(mediaList.filter((_, i) => i !== idx))}
                          className="btn btn-outline btn-sm"
                          style={{ color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LINKS & DELIVERABLES */}
          {activeTab === 'links' && (
            <div>
              <div className="ab-section-title">Links & Digital Deliverable Packages</div>
              <div className="ab-section-desc">Manage interactive live demo links, video previews, documentation, and the downloadable asset package.</div>

              <div className="ab-form-grid">
                <div className="ab-form-group">
                  <label className="ab-form-label">Live Demo URL (Opens in new tab)</label>
                  <input
                    type="url"
                    value={product.demo_url || ''}
                    onChange={(e) => setProduct(prev => ({ ...prev, demo_url: e.target.value }))}
                    placeholder="https://demo.rollixia.com/..."
                    className="ab-input"
                  />
                </div>

                <div className="ab-form-group">
                  <label className="ab-form-label">Video Demo URL (YouTube, Vimeo, or MP4)</label>
                  <input
                    type="url"
                    value={product.video_url || ''}
                    onChange={(e) => {
                      const url = e.target.value;
                      setProduct(prev => ({ ...prev, video_url: url }));
                      setVideoConfig(prev => ({ ...prev, url }));
                    }}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="ab-input"
                  />
                </div>

                <div className="ab-form-group">
                  <label className="ab-form-label">Documentation / Guide Link</label>
                  <input
                    type="url"
                    value={product.doc_url || ''}
                    onChange={(e) => setProduct(prev => ({ ...prev, doc_url: e.target.value }))}
                    placeholder="https://docs.rollixia.com/..."
                    className="ab-input"
                  />
                </div>

                <div className="ab-form-group">
                  <label className="ab-form-label">Associated Deliverable File Name</label>
                  <input
                    type="text"
                    value={product.deliverable_name || (product.slug ? `${product.slug}-v1.0.0.zip` : '')}
                    onChange={(e) => setProduct(prev => ({ ...prev, deliverable_name: e.target.value }))}
                    placeholder="template-package-v1.0.0.zip"
                    className="ab-input"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  />
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Tip: You can manage and replace the actual uploaded file bundle in the <strong>Product Files</strong> admin tab.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SECTIONS & ORDERING */}
          {activeTab === 'sections' && (
            <div>
              <div className="ab-section-title">Canonical 20 Page Sections & Ordering</div>
              <div className="ab-section-desc">
                Toggle visibility on/off for any of the 20 canonical page sections. Disabled sections disappear with zero empty margins.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {sections.map((sec, idx) => (
                  <div key={sec.section_type} className="ab-item-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input
                        type="checkbox"
                        checked={sec.is_visible === 1}
                        onChange={() => toggleSectionVisibility(idx)}
                        id={`sec-${idx}`}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                      />
                      <label htmlFor={`sec-${idx}`} style={{ fontSize: '0.85rem', fontWeight: 600, color: sec.is_visible === 1 ? 'var(--text-primary)' : 'var(--text-muted)', cursor: 'pointer' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginRight: '8px' }}>
                          {String(idx + 1).padStart(2, '0')}.
                        </span>
                        {sec.title}
                        <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontFamily: 'var(--font-mono)', marginLeft: '8px' }}>
                          [{sec.section_type}]
                        </span>
                      </label>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => moveSection(idx, -1)}
                        disabled={idx === 0}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px' }}
                        title="Move Up"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSection(idx, 1)}
                        disabled={idx === sections.length - 1}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px' }}
                        title="Move Down"
                      >
                        <ArrowDown size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: FEATURES, HIGHLIGHTS & SPECS */}
          {activeTab === 'features' && (
            <div>
              <div className="ab-section-title">Features, Highlights, Specs & Compatibility</div>
              <div className="ab-section-desc">Manage all structured data modules displayed on the live product storefront.</div>

              {/* 1. Key Features Grid */}
              <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      Key Features Grid (Section 06)
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                      Primary feature cards with icons rendered in the "Key Features" 3-column storefront grid.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFeatures([...features, { icon: 'CheckCircle', title: 'New Feature Capability', description: 'Describe the feature benefits and architecture.' }])}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Plus size={14} /> Add Feature
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {features.length === 0 ? (
                    <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-medium)' }}>
                      No key features configured. Click <strong>"+ Add Feature"</strong> to add feature cards.
                    </div>
                  ) : (
                    features.map((feat, idx) => (
                      <div key={idx} style={{ padding: '12px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: '8px', alignItems: 'center' }}>
                          <input
                            type="text"
                            value={feat.icon || 'CheckCircle'}
                            onChange={(e) => {
                              const updated = [...features];
                              updated[idx].icon = e.target.value;
                              setFeatures(updated);
                            }}
                            placeholder="Icon name"
                            className="ab-input"
                            title="Icon name (e.g. CheckCircle, Zap, ShieldCheck, ShoppingBag, Sparkles, Layers, Cpu, Globe)"
                          />
                          <input
                            type="text"
                            value={feat.title || ''}
                            onChange={(e) => {
                              const updated = [...features];
                              updated[idx].title = e.target.value;
                              setFeatures(updated);
                            }}
                            placeholder="Feature Title (e.g. WooCommerce Ready)"
                            className="ab-input"
                            style={{ fontWeight: 600 }}
                          />
                          <button
                            type="button"
                            onClick={() => setFeatures(features.filter((_, i) => i !== idx))}
                            className="btn btn-outline btn-sm"
                            style={{ color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={feat.description || ''}
                          onChange={(e) => {
                            const updated = [...features];
                            updated[idx].description = e.target.value;
                            setFeatures(updated);
                          }}
                          placeholder="Feature description / value proposition..."
                          className="ab-input"
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 2. Trust Highlights Grid */}
              <div style={{ marginBottom: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      Trust Highlights (Section 04)
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                      4-column highlight badges rendered directly under the hero banner.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHighlights([...highlights, { icon: 'Award', title: 'Top-Rated Asset', description: 'Vetted by our senior technical review team.' }])}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Plus size={14} /> Add Highlight
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {highlights.length === 0 ? (
                    <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                      Using default highlights. Click <strong>"+ Add Highlight"</strong> to customize.
                    </div>
                  ) : (
                    highlights.map((hl, idx) => (
                      <div key={idx} style={{ padding: '12px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: '8px', alignItems: 'center' }}>
                          <input
                            type="text"
                            value={hl.icon || 'Zap'}
                            onChange={(e) => {
                              const updated = [...highlights];
                              updated[idx].icon = e.target.value;
                              setHighlights(updated);
                            }}
                            placeholder="Icon (Zap, Award)"
                            className="ab-input"
                          />
                          <input
                            type="text"
                            value={hl.title || ''}
                            onChange={(e) => {
                              const updated = [...highlights];
                              updated[idx].title = e.target.value;
                              setHighlights(updated);
                            }}
                            placeholder="Highlight Title"
                            className="ab-input"
                            style={{ fontWeight: 600 }}
                          />
                          <button
                            type="button"
                            onClick={() => setHighlights(highlights.filter((_, i) => i !== idx))}
                            className="btn btn-outline btn-sm"
                            style={{ color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={hl.description || ''}
                          onChange={(e) => {
                            const updated = [...highlights];
                            updated[idx].description = e.target.value;
                            setHighlights(updated);
                          }}
                          placeholder="Highlight description..."
                          className="ab-input"
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 3. Technical Specifications */}
              <div style={{ marginBottom: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      Technical Specifications (Section 11)
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                      Detailed specification table (Framework, WordPress version, PHP, etc.).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSpecs([...specs, { label: 'Framework', value: 'React / Tailwind' }])}
                    className="btn btn-secondary btn-sm"
                  >
                    <Plus size={14} /> Add Spec
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {specs.map((sp, idx) => (
                    <div key={idx} className="ab-item-row">
                      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '8px' }}>
                        <input
                          type="text"
                          value={sp.label || sp.spec_name || ''}
                          onChange={(e) => {
                            const updated = [...specs];
                            updated[idx].label = e.target.value;
                            setSpecs(updated);
                          }}
                          placeholder="Spec Name (e.g. Version)"
                          className="ab-input"
                        />
                        <input
                          type="text"
                          value={sp.value || sp.spec_value || ''}
                          onChange={(e) => {
                            const updated = [...specs];
                            updated[idx].value = e.target.value;
                            setSpecs(updated);
                          }}
                          placeholder="Value (e.g. 2.4.0 / TypeScript 5)"
                          className="ab-input"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setSpecs(specs.filter((_, i) => i !== idx))}
                        className="btn btn-outline btn-sm"
                        style={{ color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. What's Included */}
              <div style={{ marginBottom: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      What's Included Assets Checklist (Section 09)
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                      Deliverables checklist delivered directly into customer download packages.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIncludedItems([...includedItems, { title: 'Complete source code repository', subtitle: 'ZIP package with documentation' }])}
                    className="btn btn-secondary btn-sm"
                  >
                    <Plus size={14} /> Add Item
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {includedItems.map((item, idx) => (
                    <div key={idx} className="ab-item-row">
                      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '8px' }}>
                        <input
                          type="text"
                          value={item.title || ''}
                          onChange={(e) => {
                            const updated = [...includedItems];
                            updated[idx].title = e.target.value;
                            setIncludedItems(updated);
                          }}
                          placeholder="Item Title (e.g. Figma UI Kit)"
                          className="ab-input"
                        />
                        <input
                          type="text"
                          value={item.subtitle || ''}
                          onChange={(e) => {
                            const updated = [...includedItems];
                            updated[idx].subtitle = e.target.value;
                            setIncludedItems(updated);
                          }}
                          placeholder="Description (e.g. 150+ vector components)"
                          className="ab-input"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setIncludedItems(includedItems.filter((_, i) => i !== idx))}
                        className="btn btn-outline btn-sm"
                        style={{ color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Supported Platforms */}
              <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      Supported Platforms & Compatibility (Section 12)
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                      Compatible ecosystem frameworks and platforms (e.g. WordPress 6.x, WooCommerce, Elementor).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPlatforms([...platforms, { icon: 'Globe', name: 'WordPress 6.x', description: 'Built for block editor' }])}
                    className="btn btn-secondary btn-sm"
                  >
                    <Plus size={14} /> Add Platform
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {platforms.map((pl, idx) => (
                    <div key={idx} className="ab-item-row">
                      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '120px 1fr 2fr', gap: '8px' }}>
                        <input
                          type="text"
                          value={pl.icon || 'Globe'}
                          onChange={(e) => {
                            const updated = [...platforms];
                            updated[idx].icon = e.target.value;
                            setPlatforms(updated);
                          }}
                          placeholder="Icon (Globe)"
                          className="ab-input"
                        />
                        <input
                          type="text"
                          value={pl.name || ''}
                          onChange={(e) => {
                            const updated = [...platforms];
                            updated[idx].name = e.target.value;
                            setPlatforms(updated);
                          }}
                          placeholder="Platform Name"
                          className="ab-input"
                          style={{ fontWeight: 600 }}
                        />
                        <input
                          type="text"
                          value={pl.description || ''}
                          onChange={(e) => {
                            const updated = [...platforms];
                            updated[idx].description = e.target.value;
                            setPlatforms(updated);
                          }}
                          placeholder="Description / Support note"
                          className="ab-input"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setPlatforms(platforms.filter((_, i) => i !== idx))}
                        className="btn btn-outline btn-sm"
                        style={{ color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: FAQS & TESTIMONIALS */}
          {activeTab === 'faqs' && (
            <div>
              <div className="ab-section-title">Frequently Asked Questions & Customer Testimonials</div>
              <div className="ab-section-desc">Manage customer objections with transparent FAQs and verified buyer reviews.</div>

              {/* FAQs */}
              <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      Frequently Asked Questions (Section 17)
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                      Expandable accordion items addressing pre-purchase customer queries.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFaqs([...faqs, { question: 'Do I get lifetime updates?', answer: 'Yes! Every purchase comes with unlimited lifetime updates and downloads.' }])}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Plus size={14} /> Add FAQ
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {faqs.map((f, idx) => (
                    <div key={idx} style={{ padding: '14px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="text"
                          value={f.question || ''}
                          onChange={(e) => {
                            const updated = [...faqs];
                            updated[idx].question = e.target.value;
                            setFaqs(updated);
                          }}
                          placeholder="Question title..."
                          className="ab-input"
                          style={{ fontWeight: 600 }}
                        />
                        <button
                          type="button"
                          onClick={() => setFaqs(faqs.filter((_, i) => i !== idx))}
                          className="btn btn-outline btn-sm"
                          style={{ color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <textarea
                        value={f.answer || ''}
                        onChange={(e) => {
                          const updated = [...faqs];
                          updated[idx].answer = e.target.value;
                          setFaqs(updated);
                        }}
                        placeholder="Detailed answer..."
                        className="ab-textarea"
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Reviews & Testimonials */}
              <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      Customer Reviews & Quotes (Section 16)
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                      Verified purchaser testimonials displayed in the "What Our Customers Say" storefront section.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTestimonials([
                      ...testimonials,
                      {
                        name: 'Alex Rivera',
                        user_name: 'Alex Rivera',
                        designation: 'Staff Frontend Engineer',
                        role: 'Staff Frontend Engineer',
                        rating: 5,
                        text: 'Saved our engineering team weeks of work! Clean code and great support.',
                        quote: 'Saved our engineering team weeks of work! Clean code and great support.',
                        is_verified: 1,
                        avatar_url: ''
                      }
                    ])}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Plus size={14} /> Add Testimonial
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {testimonials.length === 0 ? (
                    <div style={{ padding: '1.75rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-medium)' }}>
                      No testimonials added yet. Click <strong>"+ Add Testimonial"</strong> to add customer reviews.
                    </div>
                  ) : (
                    testimonials.map((t, idx) => {
                      const authorName = t.name || t.user_name || '';
                      const roleDesc = t.designation || t.role || '';
                      const reviewText = t.text || t.quote || '';
                      const ratingVal = t.rating !== undefined ? t.rating : 5;
                      const isVer = t.is_verified === 1 || t.is_verified === true || t.is_verified === undefined;

                      return (
                        <div key={idx} style={{ padding: '14px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 2fr) minmax(160px, 2fr) 95px 105px auto', gap: '8px', alignItems: 'end' }}>
                            <div>
                              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '3px', display: 'block' }}>
                                Reviewer Name *
                              </label>
                              <input
                                type="text"
                                value={authorName}
                                onChange={(e) => {
                                  const updated = [...testimonials];
                                  updated[idx].name = e.target.value;
                                  updated[idx].user_name = e.target.value;
                                  setTestimonials(updated);
                                }}
                                placeholder="e.g. Arjun Mehta"
                                className="ab-input"
                                style={{ fontWeight: 600 }}
                              />
                            </div>

                            <div>
                              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '3px', display: 'block' }}>
                                Title / Company
                              </label>
                              <input
                                type="text"
                                value={roleDesc}
                                onChange={(e) => {
                                  const updated = [...testimonials];
                                  updated[idx].designation = e.target.value;
                                  updated[idx].role = e.target.value;
                                  setTestimonials(updated);
                                }}
                                placeholder="e.g. CTO, NexaDigital Solutions"
                                className="ab-input"
                              />
                            </div>

                            <div>
                              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '3px', display: 'block' }}>
                                Rating (★)
                              </label>
                              <select
                                value={ratingVal}
                                onChange={(e) => {
                                  const updated = [...testimonials];
                                  updated[idx].rating = parseInt(e.target.value) || 5;
                                  setTestimonials(updated);
                                }}
                                className="ab-select"
                              >
                                <option value={5}>5 ★★★★★</option>
                                <option value={4}>4 ★★★★☆</option>
                                <option value={3}>3 ★★★☆☆</option>
                                <option value={2}>2 ★★☆☆☆</option>
                                <option value={1}>1 ★☆☆☆☆</option>
                              </select>
                            </div>

                            <div>
                              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '3px', display: 'block' }}>
                                Status Badge
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...testimonials];
                                  updated[idx].is_verified = isVer ? 0 : 1;
                                  setTestimonials(updated);
                                }}
                                className={`btn btn-sm ${isVer ? 'btn-secondary' : 'btn-outline'}`}
                                style={{ width: '100%', fontSize: '0.72rem', height: '38px', color: isVer ? '#10b981' : 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                              >
                                <CheckCircle size={12} />
                                {isVer ? 'Verified' : 'Standard'}
                              </button>
                            </div>

                            <div>
                              <button
                                type="button"
                                onClick={() => setTestimonials(testimonials.filter((_, i) => i !== idx))}
                                className="btn btn-outline btn-sm"
                                style={{ color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)', height: '38px', padding: '0 10px' }}
                                title="Delete Testimonial"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>

                          <div>
                            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '3px', display: 'block' }}>
                              Review Feedback / Quote *
                            </label>
                            <textarea
                              value={reviewText}
                              onChange={(e) => {
                                const updated = [...testimonials];
                                updated[idx].text = e.target.value;
                                updated[idx].quote = e.target.value;
                                setTestimonials(updated);
                              }}
                              placeholder="Review quote text..."
                              className="ab-textarea"
                              rows={2}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '3px', display: 'block' }}>
                              Reviewer Avatar URL (Optional)
                            </label>
                            <input
                              type="url"
                              value={t.avatar_url || ''}
                              onChange={(e) => {
                                const updated = [...testimonials];
                                updated[idx].avatar_url = e.target.value;
                                setTestimonials(updated);
                              }}
                              placeholder="https://images.unsplash.com/photo-..."
                              className="ab-input"
                              style={{ fontSize: '0.8rem' }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: SEO & SOCIAL */}
          {activeTab === 'seo' && (
            <div>
              <div className="ab-section-title">SEO & Social Meta Configuration</div>
              <div className="ab-section-desc">Optimize this product for search engines and social media sharing previews.</div>

              <div className="ab-form-grid">
                <div className="ab-form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="ab-form-label">SEO Meta Title</label>
                  <input
                    type="text"
                    value={product.seo_title || ''}
                    onChange={(e) => setProduct(prev => ({ ...prev, seo_title: e.target.value }))}
                    placeholder={product.title || 'Product Meta Title'}
                    className="ab-input"
                  />
                </div>

                <div className="ab-form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="ab-form-label">Meta Description</label>
                  <textarea
                    value={product.seo_description || ''}
                    onChange={(e) => setProduct(prev => ({ ...prev, seo_description: e.target.value }))}
                    placeholder="Search engine description snippet (140-160 characters recommend)..."
                    className="ab-textarea"
                    rows={3}
                  />
                </div>

                <div className="ab-form-group">
                  <label className="ab-form-label">Search Keywords</label>
                  <input
                    type="text"
                    value={product.seo_keywords || ''}
                    onChange={(e) => setProduct(prev => ({ ...prev, seo_keywords: e.target.value }))}
                    placeholder="react, tailwind, portfolio, dashboard"
                    className="ab-input"
                  />
                </div>

                <div className="ab-form-group">
                  <label className="ab-form-label">OG Social Share Image URL</label>
                  <input
                    type="text"
                    value={product.og_image || ''}
                    onChange={(e) => setProduct(prev => ({ ...prev, og_image: e.target.value }))}
                    placeholder="https://.../og-preview.png"
                    className="ab-input"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live Preview Modal */}
      {isPreviewOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 300,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Modal Header Controls */}
          <div style={{
            padding: '12px 24px',
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-medium)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                Storefront Live Preview
              </span>
              <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '999px', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 600 }}>
                {product.title || 'Untitled Product'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`btn btn-sm ${previewDevice === 'desktop' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <Monitor size={14} /> Desktop
              </button>
              <button
                onClick={() => setPreviewDevice('tablet')}
                className={`btn btn-sm ${previewDevice === 'tablet' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <Tablet size={14} /> Tablet
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`btn btn-sm ${previewDevice === 'mobile' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <Smartphone size={14} /> Mobile
              </button>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="btn btn-outline btn-sm"
                style={{ marginLeft: '12px' }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Modal Preview Body */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            justifyContent: 'center',
            background: 'var(--bg-main)',
            padding: previewDevice === 'desktop' ? '0' : '2rem'
          }}>
            <div style={{
              width: previewDevice === 'desktop' ? '100%' : previewDevice === 'tablet' ? '768px' : '400px',
              transition: 'width 0.3s ease',
              boxShadow: previewDevice === 'desktop' ? 'none' : '0 20px 50px rgba(0,0,0,0.5)',
              borderRadius: previewDevice === 'desktop' ? '0' : '16px',
              overflow: 'hidden'
            }}>
              <DynamicProductPage
                productData={previewPayload}
                isPreviewMode={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
