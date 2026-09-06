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
  Award,
  Database,
  Server,
  Code2,
  Users,
  Briefcase,
  FolderTree,
  ListChecks,
  Sliders,
  Copy,
  Edit3
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
  const [activeFeatureSubTab, setActiveFeatureSubTab] = useState('features');
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
    video_type: 'auto',
    video_thumbnail: '',
    video_title: 'See the Product in Action',
    video_description: 'Watch the complete video walkthrough.',
    demo_url: '',
    live_demo_url: '',
    customer_demo_url: '',
    partner_demo_url: '',
    admin_demo_url: '',
    web_demo_url: '',
    doc_url: '',
    docs_url: '',
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

  // Canonical 26 sections manager + custom sections
  const defaultCanonicalSections = [
    { section_type: 'breadcrumb', title: '00. Breadcrumb Navigation', is_visible: 1, sort_order: 1 },
    { section_type: 'hero', title: '01. Hero Section', is_visible: 1, sort_order: 2 },
    { section_type: 'video', title: '02. Product Demo Video', is_visible: 1, sort_order: 3 },
    { section_type: 'overview', title: '03. What is this Product? (Overview)', is_visible: 1, sort_order: 4 },
    { section_type: 'ecosystem', title: '04. Complete Product Ecosystem', is_visible: 1, sort_order: 5 },
    { section_type: 'demo', title: '05. Product Demo / Live Preview Links', is_visible: 1, sort_order: 6 },
    { section_type: 'customer_experience', title: '06. Customer / User Experience', is_visible: 1, sort_order: 7 },
    { section_type: 'partner_experience', title: '07. Partner / Provider Experience', is_visible: 0, sort_order: 8 },
    { section_type: 'admin_experience', title: '08. Admin Panel / Dashboard', is_visible: 1, sort_order: 9 },
    { section_type: 'features', title: '09. Key Features', is_visible: 1, sort_order: 10 },
    { section_type: 'how_it_works', title: '10. How It Works Timeline', is_visible: 1, sort_order: 11 },
    { section_type: 'included', title: "11. What's Included (Deliverables)", is_visible: 1, sort_order: 12 },
    { section_type: 'source_code', title: '12. Source Code Architecture', is_visible: 1, sort_order: 13 },
    { section_type: 'specs', title: '13. Technology Stack & Specs', is_visible: 1, sort_order: 14 },
    { section_type: 'requirements', title: '14. Requirements / What You Need', is_visible: 1, sort_order: 15 },
    { section_type: 'customization', title: '15. Customization (Make It Yours)', is_visible: 1, sort_order: 16 },
    { section_type: 'who_is_it_for', title: '16. Who Is This For?', is_visible: 1, sort_order: 17 },
    { section_type: 'use_cases', title: '17. Business Use Cases', is_visible: 1, sort_order: 18 },
    { section_type: 'comparison', title: '18. Why This Product vs Build from Scratch', is_visible: 1, sort_order: 19 },
    { section_type: 'after_purchase', title: '19. What Happens After You Buy?', is_visible: 1, sort_order: 20 },
    { section_type: 'pricing', title: '20. Pricing & Licenses', is_visible: 1, sort_order: 21 },
    { section_type: 'license', title: '21. License & Legal Permissions', is_visible: 1, sort_order: 22 },
    { section_type: 'testimonials', title: '22. Customer Testimonials', is_visible: 1, sort_order: 23 },
    { section_type: 'reviews', title: '23. Reviews & Ratings', is_visible: 1, sort_order: 24 },
    { section_type: 'faq', title: '24. Frequently Asked Questions', is_visible: 1, sort_order: 25 },
    { section_type: 'final_cta', title: '25. Final Conversion CTA', is_visible: 1, sort_order: 26 },
    { section_type: 'support', title: '26. Contact & Support', is_visible: 1, sort_order: 27 }
  ];

  const [sections, setSections] = useState(defaultCanonicalSections);

  // Section-specific structured datasets
  const [features, setFeatures] = useState([]);
  const [ecosystem, setEcosystem] = useState([]);
  const [customerShowcase, setCustomerShowcase] = useState([]);
  const [partnerShowcase, setPartnerShowcase] = useState([]);
  const [adminShowcase, setAdminShowcase] = useState([]);
  const [howItWorksSteps, setHowItWorksSteps] = useState([]);
  const [includedGroups, setIncludedGroups] = useState([]);
  const [sourceCodeTree, setSourceCodeTree] = useState([]);
  const [specs, setSpecs] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [customizationItems, setCustomizationItems] = useState([]);
  const [audienceList, setAudienceList] = useState([]);
  const [useCases, setUseCases] = useState([]);
  const [comparisonRows, setComparisonRows] = useState([]);
  const [afterPurchaseSteps, setAfterPurchaseSteps] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [mediaList, setMediaList] = useState([]);
  const [licensesList, setLicensesList] = useState([]);

  // Modal State for Custom Sections
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customSectionDraft, setCustomSectionDraft] = useState({
    title: '',
    eyebrow: '',
    description: '',
    image: '',
    cta_text: '',
    cta_url: ''
  });

  // Helper safely parse section content
  const parseSecContent = (raw) => {
    if (!raw) return null;
    if (typeof raw === 'object') return raw;
    try {
      const parsed = JSON.parse(raw);
      return typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
    } catch (e) {
      return null;
    }
  };

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
            setProduct(prev => ({ ...prev, ...res.product }));

            if (res.sections && res.sections.length > 0) {
              // Merge existing database sections into local state
              const loadedSections = res.sections.map((s, idx) => ({
                id: s.id,
                section_type: s.section_type || s.type,
                title: s.title || s.section_type,
                is_visible: s.is_visible !== undefined ? s.is_visible : 1,
                sort_order: s.sort_order || idx + 1,
                content: parseSecContent(s.content)
              }));

              // Ensure canonical sections are represented if missing
              const combinedSections = [...loadedSections];
              defaultCanonicalSections.forEach(defSec => {
                if (!combinedSections.some(cs => cs.section_type === defSec.section_type)) {
                  combinedSections.push({ ...defSec, sort_order: combinedSections.length + 1 });
                }
              });

              combinedSections.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
              setSections(combinedSections);

              // Extract structured datasets
              const ecoSec = loadedSections.find(s => s.section_type === 'ecosystem');
              if (ecoSec && Array.isArray(ecoSec.content)) setEcosystem(ecoSec.content);

              const csSec = loadedSections.find(s => s.section_type === 'customer_experience' || s.section_type === 'showcase');
              if (csSec && Array.isArray(csSec.content)) setCustomerShowcase(csSec.content);

              const psSec = loadedSections.find(s => s.section_type === 'partner_experience');
              if (psSec && Array.isArray(psSec.content)) setPartnerShowcase(psSec.content);

              const asSec = loadedSections.find(s => s.section_type === 'admin_experience');
              if (asSec && Array.isArray(asSec.content)) setAdminShowcase(asSec.content);

              const incSec = loadedSections.find(s => s.section_type === 'included');
              if (incSec && Array.isArray(incSec.content)) setIncludedGroups(incSec.content);

              const hwSec = loadedSections.find(s => s.section_type === 'how_it_works');
              if (hwSec && Array.isArray(hwSec.content)) setHowItWorksSteps(hwSec.content);

              const srcSec = loadedSections.find(s => s.section_type === 'source_code');
              if (srcSec && Array.isArray(srcSec.content)) setSourceCodeTree(srcSec.content);

              const spSec = loadedSections.find(s => s.section_type === 'specs');
              if (spSec && Array.isArray(spSec.content)) setSpecs(spSec.content);

              const reqSec = loadedSections.find(s => s.section_type === 'requirements');
              if (reqSec && Array.isArray(reqSec.content)) setRequirements(reqSec.content);

              const custSec = loadedSections.find(s => s.section_type === 'customization');
              if (custSec && Array.isArray(custSec.content)) setCustomizationItems(custSec.content);

              const audSec = loadedSections.find(s => s.section_type === 'who_is_it_for');
              if (audSec && Array.isArray(audSec.content)) setAudienceList(audSec.content);

              const ucSec = loadedSections.find(s => s.section_type === 'use_cases');
              if (ucSec && Array.isArray(ucSec.content)) setUseCases(ucSec.content);

              const compSec = loadedSections.find(s => s.section_type === 'comparison');
              if (compSec && Array.isArray(compSec.content)) setComparisonRows(compSec.content);

              const apSec = loadedSections.find(s => s.section_type === 'after_purchase');
              if (apSec && Array.isArray(apSec.content)) setAfterPurchaseSteps(apSec.content);
            }

            if (res.features && res.features.length > 0) setFeatures(res.features);
            if (res.faqs) setFaqs(res.faqs);
            if (res.testimonials) setTestimonials(res.testimonials);
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

  const duplicateSection = (index) => {
    const sec = sections[index];
    const newSec = {
      ...sec,
      id: undefined,
      section_type: `custom_${Date.now()}`,
      title: `${sec.title} (Copy)`,
      sort_order: index + 2,
      is_custom: 1
    };
    const updated = [...sections];
    updated.splice(index + 1, 0, newSec);
    setSections(updated.map((s, idx) => ({ ...s, sort_order: idx + 1 })));
    addToast('Section duplicated', 'success');
  };

  const deleteSection = (index) => {
    const sec = sections[index];
    if (!sec.section_type.startsWith('custom_') && !sec.is_custom) {
      addToast('Canonical sections can only be disabled, not deleted.', 'warning');
      return;
    }
    setSections(sections.filter((_, idx) => idx !== index));
    addToast('Custom section removed', 'info');
  };

  const handleAddCustomSection = () => {
    if (!customSectionDraft.title.trim()) {
      addToast('Please enter a section title', 'error');
      return;
    }

    const newSec = {
      section_type: `custom_${Date.now()}`,
      title: customSectionDraft.title,
      is_visible: 1,
      sort_order: sections.length + 1,
      is_custom: 1,
      content: { ...customSectionDraft }
    };

    setSections([...sections, newSec]);
    setShowCustomModal(false);
    setCustomSectionDraft({
      title: '',
      eyebrow: '',
      description: '',
      image: '',
      cta_text: '',
      cta_url: ''
    });
    addToast('Custom section added successfully', 'success');
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
      let content = s.content;
      if (s.section_type === 'features') content = features;
      else if (s.section_type === 'ecosystem') content = ecosystem;
      else if (s.section_type === 'customer_experience' || s.section_type === 'showcase') content = customerShowcase;
      else if (s.section_type === 'partner_experience') content = partnerShowcase;
      else if (s.section_type === 'admin_experience') content = adminShowcase;
      else if (s.section_type === 'how_it_works') content = howItWorksSteps;
      else if (s.section_type === 'included') content = includedGroups;
      else if (s.section_type === 'source_code') content = sourceCodeTree;
      else if (s.section_type === 'specs') content = specs;
      else if (s.section_type === 'requirements') content = requirements;
      else if (s.section_type === 'customization') content = customizationItems;
      else if (s.section_type === 'who_is_it_for') content = audienceList;
      else if (s.section_type === 'use_cases') content = useCases;
      else if (s.section_type === 'comparison') content = comparisonRows;
      else if (s.section_type === 'after_purchase') content = afterPurchaseSteps;
      else if (s.section_type === 'faq') content = faqs;
      else if (s.section_type === 'testimonials') content = testimonials;
      else if (s.section_type === 'video') {
        content = product.video_url ? {
          url: product.video_url,
          title: product.video_title,
          description: product.video_description,
          thumbnail: product.video_thumbnail
        } : null;
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

      if (productId) {
        await apiRequest(`/api/admin/products/${productId}`, {
          method: 'PUT',
          body: JSON.stringify(productPayload)
        });
      } else {
        const createRes = await apiRequest('/api/admin/products', {
          method: 'POST',
          body: JSON.stringify(productPayload)
        });
        finalProductId = createRes.productId;
      }

      // Save sections with enriched structured data
      if (finalProductId) {
        const enrichedSections = sections.map((s, idx) => {
          let secContent = s.content;
          if (s.section_type === 'features') secContent = features;
          else if (s.section_type === 'ecosystem') secContent = ecosystem;
          else if (s.section_type === 'customer_experience' || s.section_type === 'showcase') secContent = customerShowcase;
          else if (s.section_type === 'partner_experience') secContent = partnerShowcase;
          else if (s.section_type === 'admin_experience') secContent = adminShowcase;
          else if (s.section_type === 'how_it_works') secContent = howItWorksSteps;
          else if (s.section_type === 'included') secContent = includedGroups;
          else if (s.section_type === 'source_code') secContent = sourceCodeTree;
          else if (s.section_type === 'specs') secContent = specs;
          else if (s.section_type === 'requirements') secContent = requirements;
          else if (s.section_type === 'customization') secContent = customizationItems;
          else if (s.section_type === 'who_is_it_for') secContent = audienceList;
          else if (s.section_type === 'use_cases') secContent = useCases;
          else if (s.section_type === 'comparison') secContent = comparisonRows;
          else if (s.section_type === 'after_purchase') secContent = afterPurchaseSteps;
          else if (s.section_type === 'faq') secContent = faqs;
          else if (s.section_type === 'testimonials') secContent = testimonials;
          else if (s.section_type === 'video') {
            secContent = product.video_url ? {
              url: product.video_url,
              title: product.video_title,
              description: product.video_description,
              thumbnail: product.video_thumbnail
            } : null;
          }

          return {
            section_type: s.section_type,
            title: s.title,
            is_visible: s.is_visible !== undefined ? s.is_visible : 1,
            sort_order: idx + 1,
            content: typeof secContent === 'object' && secContent !== null ? JSON.stringify(secContent) : secContent
          };
        });

        await apiRequest(`/api/admin/products/${finalProductId}/sections`, {
          method: 'PUT',
          body: JSON.stringify({ sections: enrichedSections })
        });
      }

      addToast('Product saved successfully!', 'success');
      if (onSaved) onSaved();
      if (redirectAfterSave && onBack) onBack();
    } catch (err) {
      console.error('Save error:', err);
      addToast(err.message || 'Failed to save product', 'error');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'basic', label: '1. Basic Info & Details', icon: List },
    { id: 'pricing', label: '2. Pricing & Licenses', icon: DollarSign },
    { id: 'media', label: '3. Images & Media Gallery', icon: ImageIcon },
    { id: 'links', label: '4. Links & Deliverables', icon: LinkIcon },
    { id: 'sections', label: '5. Page Sections & Ordering', icon: Layers },
    { id: 'features', label: '6. Features, Specs & Assets', icon: CheckSquare },
    { id: 'faqs', label: '7. FAQs & Testimonials', icon: HelpCircle },
    { id: 'seo', label: '8. SEO & Social Meta', icon: Search }
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
              <div className="ab-section-desc">Manage primary product title, store category, collections, descriptions, and demo video settings.</div>

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
                    placeholder="e.g. Modern Full-Stack Service Marketplace Platform"
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
                    placeholder="modern-service-marketplace"
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
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Quick Select Presets</span>
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
                    placeholder="e.g. COMPLETE PRODUCTION SYSTEM"
                    className="ab-input"
                  />
                </div>

                <div className="ab-form-group">
                  <label className="ab-form-label">Subtitle</label>
                  <input
                    type="text"
                    value={product.subtitle || ''}
                    onChange={(e) => setProduct(prev => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="e.g. Built for senior software engineers & agencies"
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
                    rows={5}
                  />
                </div>
              </div>

              {/* CORE REQUIREMENT 13: PRODUCT DEMO VIDEO */}
              <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                  <Video size={18} color="var(--primary)" />
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    Product Demo Video Configuration
                  </h3>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Enter a video link (YouTube, Vimeo, or direct MP4 URL). The frontend automatically detects and embeds the responsive player.
                </p>

                <div className="ab-form-grid">
                  <div className="ab-form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="ab-form-label">Product Demo Video URL</label>
                    <input
                      type="url"
                      value={product.video_url || ''}
                      onChange={(e) => setProduct(prev => ({ ...prev, video_url: e.target.value }))}
                      placeholder="https://www.youtube.com/watch?v=... OR https://vimeo.com/... OR https://.../video.mp4"
                      className="ab-input"
                    />
                  </div>

                  <div className="ab-form-group">
                    <label className="ab-form-label">Video Player Type</label>
                    <select
                      value={product.video_type || 'auto'}
                      onChange={(e) => setProduct(prev => ({ ...prev, video_type: e.target.value }))}
                      className="ab-select"
                    >
                      <option value="auto">Auto Detect</option>
                      <option value="youtube">YouTube</option>
                      <option value="vimeo">Vimeo</option>
                      <option value="mp4">Direct MP4 Video</option>
                    </select>
                  </div>

                  <div className="ab-form-group">
                    <label className="ab-form-label">Video Poster / Thumbnail URL</label>
                    <input
                      type="url"
                      value={product.video_thumbnail || ''}
                      onChange={(e) => setProduct(prev => ({ ...prev, video_thumbnail: e.target.value }))}
                      placeholder="https://images.unsplash.com/..."
                      className="ab-input"
                    />
                  </div>

                  <div className="ab-form-group">
                    <label className="ab-form-label">Video Section Title</label>
                    <input
                      type="text"
                      value={product.video_title || ''}
                      onChange={(e) => setProduct(prev => ({ ...prev, video_title: e.target.value }))}
                      placeholder="See the Product in Action"
                      className="ab-input"
                    />
                  </div>

                  <div className="ab-form-group">
                    <label className="ab-form-label">Video Short Description</label>
                    <input
                      type="text"
                      value={product.video_description || ''}
                      onChange={(e) => setProduct(prev => ({ ...prev, video_description: e.target.value }))}
                      placeholder="Watch our end-to-end workflow walkthrough."
                      className="ab-input"
                    />
                  </div>
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
                  <label className="ab-form-label">Catalog Regular Price (₹) *</label>
                  <input
                    type="number"
                    value={product.regular_price}
                    onChange={(e) => setProduct(prev => ({ ...prev, regular_price: parseFloat(e.target.value) || 0 }))}
                    className="ab-input"
                  />
                </div>

                <div className="ab-form-group">
                  <label className="ab-form-label">Offer / Sale Price (₹)</label>
                  <input
                    type="number"
                    value={product.sale_price || ''}
                    onChange={(e) => setProduct(prev => ({ ...prev, sale_price: e.target.value === '' ? null : parseFloat(e.target.value) }))}
                    placeholder="Leave empty if no discount"
                    className="ab-input"
                    style={{ color: '#10b981', fontWeight: 700 }}
                  />
                </div>

                <div className="ab-form-group">
                  <label className="ab-form-label">Primary CTA Button Label</label>
                  <input
                    type="text"
                    value={product.cta_text || 'BUY NOW'}
                    onChange={(e) => setProduct(prev => ({ ...prev, cta_text: e.target.value }))}
                    placeholder="BUY NOW"
                    className="ab-input"
                  />
                </div>

                <div className="ab-form-group">
                  <label className="ab-form-label">Secondary CTA Button Label</label>
                  <input
                    type="text"
                    value={product.secondary_cta_text || 'ADD TO CART'}
                    onChange={(e) => setProduct(prev => ({ ...prev, secondary_cta_text: e.target.value }))}
                    placeholder="ADD TO CART"
                    className="ab-input"
                  />
                </div>
              </div>

              {/* License Tiers Management */}
              <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      License Tiers (e.g. Standard Source Code vs Extended Setup)
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                      Add multiple plans with distinct prices and permissions.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLicensesList([
                      ...licensesList,
                      {
                        license_name: 'Extended Setup Package',
                        price: (product.sale_price || product.regular_price) + 2000,
                        regular_price: (product.regular_price || 2999) + 3000,
                        description: 'Includes full source code + end-to-end server deployment and environment configuration.'
                      }
                    ])}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Plus size={14} /> Add License Tier
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {licensesList.length === 0 ? (
                    <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                      No separate license tiers configured. The catalog base price will be used.
                    </div>
                  ) : (
                    licensesList.map((lic, idx) => (
                      <div key={idx} style={{ padding: '14px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '8px', alignItems: 'end' }}>
                          <div>
                            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>License Tier Name</label>
                            <input
                              type="text"
                              value={lic.license_name || lic.name || ''}
                              onChange={(e) => {
                                const updated = [...licensesList];
                                updated[idx].license_name = e.target.value;
                                setLicensesList(updated);
                              }}
                              placeholder="e.g. Standard Commercial License"
                              className="ab-input"
                              style={{ fontWeight: 600 }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Regular Price (₹)</label>
                            <input
                              type="number"
                              value={lic.regular_price || ''}
                              onChange={(e) => {
                                const updated = [...licensesList];
                                updated[idx].regular_price = parseFloat(e.target.value) || 0;
                                setLicensesList(updated);
                              }}
                              placeholder="e.g. 5999"
                              className="ab-input"
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Offer Price (₹) *</label>
                            <input
                              type="number"
                              value={lic.price || ''}
                              onChange={(e) => {
                                const updated = [...licensesList];
                                updated[idx].price = parseFloat(e.target.value) || 0;
                                setLicensesList(updated);
                              }}
                              placeholder="e.g. 2999"
                              className="ab-input"
                              style={{ color: '#10b981', fontWeight: 700 }}
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => setLicensesList(licensesList.filter((_, i) => i !== idx))}
                            className="btn btn-outline btn-sm"
                            style={{ color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)', height: '38px', padding: '0 10px' }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        <div>
                          <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Inclusions & Rights Description</label>
                          <input
                            type="text"
                            value={lic.description || ''}
                            onChange={(e) => {
                              const updated = [...licensesList];
                              updated[idx].description = e.target.value;
                              setLicensesList(updated);
                            }}
                            placeholder="e.g. Single project deployment, full source code, lifetime updates"
                            className="ab-input"
                          />
                        </div>
                      </div>
                    ))
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
              <div className="ab-section-desc">Manage all 7 live demo URLs, customer apps, partner panels, documentation, and the deliverable download bundle.</div>

              <div className="ab-form-grid">
                <div className="ab-form-group">
                  <label className="ab-form-label">Primary Live Demo URL</label>
                  <input
                    type="url"
                    value={product.live_demo_url || product.demo_url || ''}
                    onChange={(e) => setProduct(prev => ({ ...prev, live_demo_url: e.target.value, demo_url: e.target.value }))}
                    placeholder="https://demo.rollixia.com/..."
                    className="ab-input"
                  />
                </div>

                <div className="ab-form-group">
                  <label className="ab-form-label">Customer App Demo URL</label>
                  <input
                    type="url"
                    value={product.customer_demo_url || ''}
                    onChange={(e) => setProduct(prev => ({ ...prev, customer_demo_url: e.target.value }))}
                    placeholder="https://customer.demo.rollixia.com"
                    className="ab-input"
                  />
                </div>

                <div className="ab-form-group">
                  <label className="ab-form-label">Partner / Provider Panel Demo URL</label>
                  <input
                    type="url"
                    value={product.partner_demo_url || ''}
                    onChange={(e) => setProduct(prev => ({ ...prev, partner_demo_url: e.target.value }))}
                    placeholder="https://partner.demo.rollixia.com"
                    className="ab-input"
                  />
                </div>

                <div className="ab-form-group">
                  <label className="ab-form-label">Admin Dashboard Demo URL</label>
                  <input
                    type="url"
                    value={product.admin_demo_url || ''}
                    onChange={(e) => setProduct(prev => ({ ...prev, admin_demo_url: e.target.value }))}
                    placeholder="https://admin.demo.rollixia.com"
                    className="ab-input"
                  />
                </div>

                <div className="ab-form-group">
                  <label className="ab-form-label">Web App Demo URL</label>
                  <input
                    type="url"
                    value={product.web_demo_url || ''}
                    onChange={(e) => setProduct(prev => ({ ...prev, web_demo_url: e.target.value }))}
                    placeholder="https://web.demo.rollixia.com"
                    className="ab-input"
                  />
                </div>

                <div className="ab-form-group">
                  <label className="ab-form-label">Documentation / Guide URL</label>
                  <input
                    type="url"
                    value={product.docs_url || product.doc_url || ''}
                    onChange={(e) => setProduct(prev => ({ ...prev, docs_url: e.target.value, doc_url: e.target.value }))}
                    placeholder="https://docs.rollixia.com/..."
                    className="ab-input"
                  />
                </div>

                <div className="ab-form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="ab-form-label">Associated Deliverable File Name</label>
                  <input
                    type="text"
                    value={product.deliverable_name || (product.slug ? `${product.slug}-v1.0.0.zip` : '')}
                    onChange={(e) => setProduct(prev => ({ ...prev, deliverable_name: e.target.value }))}
                    placeholder="software-package-v1.0.0.zip"
                    className="ab-input"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SECTIONS & ORDERING (SECTION BUILDER) */}
          {activeTab === 'sections' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div>
                  <div className="ab-section-title">Visual Page Section Manager</div>
                  <div className="ab-section-desc">
                    Enable, disable, reorder, duplicate, or delete any storefront section. Disabled sections gracefully collapse.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCustomModal(true)}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={15} />
                  <span>+ Add Custom Section</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '1.25rem' }}>
                {sections.map((sec, idx) => {
                  const isVisible = sec.is_visible === 1 || sec.is_visible === true;
                  const isCustom = sec.section_type.startsWith('custom_') || sec.is_custom;

                  return (
                    <div key={sec.section_type || idx} className="ab-item-row" style={{ opacity: isVisible ? 1 : 0.6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                        <input
                          type="checkbox"
                          checked={isVisible}
                          onChange={() => toggleSectionVisibility(idx)}
                          id={`sec-${idx}`}
                          style={{ width: '16px', height: '16px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                        />
                        <label htmlFor={`sec-${idx}`} style={{ fontSize: '0.85rem', fontWeight: 600, color: isVisible ? 'var(--text-primary)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                            {String(idx + 1).padStart(2, '0')}.
                          </span>
                          <span>{sec.title}</span>
                          <span style={{ fontSize: '0.72rem', color: isCustom ? '#10b981' : 'var(--primary)', fontFamily: 'var(--font-mono)', background: 'var(--bg-surface-elevated)', padding: '1px 6px', borderRadius: '4px' }}>
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
                        <button
                          type="button"
                          onClick={() => duplicateSection(idx)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px' }}
                          title="Duplicate Section"
                        >
                          <Copy size={13} />
                        </button>
                        {isCustom && (
                          <button
                            type="button"
                            onClick={() => deleteSection(idx)}
                            className="btn btn-outline btn-sm"
                            style={{ color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)', padding: '4px 8px' }}
                            title="Delete Custom Section"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: FEATURES, SPECS & ASSETS */}
          {activeTab === 'features' && (
            <div>
              <div className="ab-section-title">Features, Ecosystem, Specs & Deliverables</div>
              <div className="ab-section-desc">Manage structured content modules for the public product page.</div>

              {/* Sub-Tabs Bar */}
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-medium)' }}>
                {[
                  { id: 'features', label: 'Key Features' },
                  { id: 'ecosystem', label: 'Product Ecosystem' },
                  { id: 'customer', label: 'Customer Showcase' },
                  { id: 'partner', label: 'Partner Showcase' },
                  { id: 'admin', label: 'Admin Dashboard' },
                  { id: 'how_it_works', label: 'How It Works' },
                  { id: 'included', label: "What's Included" },
                  { id: 'source_code', label: 'Source Code Tree' },
                  { id: 'specs', label: 'Tech Specs' },
                  { id: 'requirements', label: 'Requirements' },
                  { id: 'customization', label: 'Customization' },
                  { id: 'audience', label: 'Audience' },
                  { id: 'use_cases', label: 'Use Cases' },
                  { id: 'comparison', label: 'Comparison Matrix' },
                  { id: 'after_purchase', label: 'After Purchase' }
                ].map(sub => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setActiveFeatureSubTab(sub.id)}
                    className={`btn btn-sm ${activeFeatureSubTab === sub.id ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ whiteSpace: 'nowrap', fontSize: '0.75rem' }}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>

              {/* SUB-TAB 1: Key Features */}
              {activeFeatureSubTab === 'features' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      Key Features Grid (Section 09)
                    </h3>
                    <button
                      type="button"
                      onClick={() => setFeatures([...features, { icon: 'CheckCircle', title: 'New Feature', description: 'Detailed feature description...' }])}
                      className="btn btn-secondary btn-sm"
                    >
                      <Plus size={14} /> Add Feature
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {features.map((f, idx) => (
                      <div key={idx} className="ab-item-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '6px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: '8px' }}>
                          <input
                            type="text"
                            value={f.icon || 'CheckCircle'}
                            onChange={(e) => {
                              const updated = [...features];
                              updated[idx].icon = e.target.value;
                              setFeatures(updated);
                            }}
                            placeholder="Icon name"
                            className="ab-input"
                          />
                          <input
                            type="text"
                            value={f.title || ''}
                            onChange={(e) => {
                              const updated = [...features];
                              updated[idx].title = e.target.value;
                              setFeatures(updated);
                            }}
                            placeholder="Feature Title"
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
                          value={f.description || ''}
                          onChange={(e) => {
                            const updated = [...features];
                            updated[idx].description = e.target.value;
                            setFeatures(updated);
                          }}
                          placeholder="Feature description..."
                          className="ab-input"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUB-TAB 2: Ecosystem */}
              {activeFeatureSubTab === 'ecosystem' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      Complete Product Ecosystem (Section 04)
                    </h3>
                    <button
                      type="button"
                      onClick={() => setEcosystem([...ecosystem, { title: 'Customer App', icon: 'Smartphone', description: 'Cross-platform mobile application.', link: '' }])}
                      className="btn btn-secondary btn-sm"
                    >
                      <Plus size={14} /> Add Component
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {ecosystem.map((item, idx) => (
                      <div key={idx} className="ab-item-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '6px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: '8px' }}>
                          <input
                            type="text"
                            value={item.icon || 'Layers'}
                            onChange={(e) => {
                              const updated = [...ecosystem];
                              updated[idx].icon = e.target.value;
                              setEcosystem(updated);
                            }}
                            placeholder="Icon"
                            className="ab-input"
                          />
                          <input
                            type="text"
                            value={item.title || ''}
                            onChange={(e) => {
                              const updated = [...ecosystem];
                              updated[idx].title = e.target.value;
                              setEcosystem(updated);
                            }}
                            placeholder="Component Title (e.g. Admin Dashboard)"
                            className="ab-input"
                            style={{ fontWeight: 600 }}
                          />
                          <button
                            type="button"
                            onClick={() => setEcosystem(ecosystem.filter((_, i) => i !== idx))}
                            className="btn btn-outline btn-sm"
                            style={{ color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={item.description || ''}
                          onChange={(e) => {
                            const updated = [...ecosystem];
                            updated[idx].description = e.target.value;
                            setEcosystem(updated);
                          }}
                          placeholder="Short description..."
                          className="ab-input"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUB-TAB 3: Customer Showcase */}
              {activeFeatureSubTab === 'customer' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      Customer & User Experience Showcase (Section 06)
                    </h3>
                    <button
                      type="button"
                      onClick={() => setCustomerShowcase([...customerShowcase, { title: 'Seamless Booking Experience', description: 'Customers can browse and book in under 60 seconds.', image: '' }])}
                      className="btn btn-secondary btn-sm"
                    >
                      <Plus size={14} /> Add Showcase Row
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {customerShowcase.map((item, idx) => (
                      <div key={idx} style={{ padding: '12px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            value={item.title || ''}
                            onChange={(e) => {
                              const updated = [...customerShowcase];
                              updated[idx].title = e.target.value;
                              setCustomerShowcase(updated);
                            }}
                            placeholder="Module Title"
                            className="ab-input"
                            style={{ fontWeight: 600, flex: 1 }}
                          />
                          <button
                            type="button"
                            onClick={() => setCustomerShowcase(customerShowcase.filter((_, i) => i !== idx))}
                            className="btn btn-outline btn-sm"
                            style={{ color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={item.description || ''}
                          onChange={(e) => {
                            const updated = [...customerShowcase];
                            updated[idx].description = e.target.value;
                            setCustomerShowcase(updated);
                          }}
                          placeholder="Description..."
                          className="ab-input"
                        />
                        <input
                          type="url"
                          value={item.image || ''}
                          onChange={(e) => {
                            const updated = [...customerShowcase];
                            updated[idx].image = e.target.value;
                            setCustomerShowcase(updated);
                          }}
                          placeholder="Screenshot Image URL: https://..."
                          className="ab-input"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUB-TAB 4: Partner Showcase */}
              {activeFeatureSubTab === 'partner' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      Partner & Provider Experience Showcase (Section 07)
                    </h3>
                    <button
                      type="button"
                      onClick={() => setPartnerShowcase([...partnerShowcase, { title: 'Partner Job Dispatching', description: 'Instant push notifications and real-time status updates.', image: '' }])}
                      className="btn btn-secondary btn-sm"
                    >
                      <Plus size={14} /> Add Partner Row
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {partnerShowcase.map((item, idx) => (
                      <div key={idx} style={{ padding: '12px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            value={item.title || ''}
                            onChange={(e) => {
                              const updated = [...partnerShowcase];
                              updated[idx].title = e.target.value;
                              setPartnerShowcase(updated);
                            }}
                            placeholder="Provider Feature Title"
                            className="ab-input"
                            style={{ fontWeight: 600, flex: 1 }}
                          />
                          <button
                            type="button"
                            onClick={() => setPartnerShowcase(partnerShowcase.filter((_, i) => i !== idx))}
                            className="btn btn-outline btn-sm"
                            style={{ color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={item.description || ''}
                          onChange={(e) => {
                            const updated = [...partnerShowcase];
                            updated[idx].description = e.target.value;
                            setPartnerShowcase(updated);
                          }}
                          placeholder="Description..."
                          className="ab-input"
                        />
                        <input
                          type="url"
                          value={item.image || ''}
                          onChange={(e) => {
                            const updated = [...partnerShowcase];
                            updated[idx].image = e.target.value;
                            setPartnerShowcase(updated);
                          }}
                          placeholder="Screenshot Image URL: https://..."
                          className="ab-input"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUB-TAB 5: Admin Showcase */}
              {activeFeatureSubTab === 'admin' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      Admin Panel & Dashboard Showcase (Section 08)
                    </h3>
                    <button
                      type="button"
                      onClick={() => setAdminShowcase([...adminShowcase, { title: 'Revenue & Commission Engine', description: 'Automated payouts and split commission processing.', image: '' }])}
                      className="btn btn-secondary btn-sm"
                    >
                      <Plus size={14} /> Add Admin Showcase
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {adminShowcase.map((item, idx) => (
                      <div key={idx} className="ab-item-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '6px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            value={item.title || ''}
                            onChange={(e) => {
                              const updated = [...adminShowcase];
                              updated[idx].title = e.target.value;
                              setAdminShowcase(updated);
                            }}
                            placeholder="Module Title"
                            className="ab-input"
                            style={{ fontWeight: 600, flex: 1 }}
                          />
                          <button
                            type="button"
                            onClick={() => setAdminShowcase(adminShowcase.filter((_, i) => i !== idx))}
                            className="btn btn-outline btn-sm"
                            style={{ color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={item.description || ''}
                          onChange={(e) => {
                            const updated = [...adminShowcase];
                            updated[idx].description = e.target.value;
                            setAdminShowcase(updated);
                          }}
                          placeholder="Description..."
                          className="ab-input"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUB-TAB 6: How It Works */}
              {activeFeatureSubTab === 'how_it_works' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      How It Works Process Flow (Section 10)
                    </h3>
                    <button
                      type="button"
                      onClick={() => setHowItWorksSteps([...howItWorksSteps, { step: `0${howItWorksSteps.length + 1}`, title: 'Next Step', description: 'Step description...' }])}
                      className="btn btn-secondary btn-sm"
                    >
                      <Plus size={14} /> Add Step
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {howItWorksSteps.map((st, idx) => (
                      <div key={idx} className="ab-item-row" style={{ gap: '8px' }}>
                        <input
                          type="text"
                          value={st.step || `0${idx + 1}`}
                          onChange={(e) => {
                            const updated = [...howItWorksSteps];
                            updated[idx].step = e.target.value;
                            setHowItWorksSteps(updated);
                          }}
                          style={{ width: '60px' }}
                          className="ab-input"
                        />
                        <input
                          type="text"
                          value={st.title || ''}
                          onChange={(e) => {
                            const updated = [...howItWorksSteps];
                            updated[idx].title = e.target.value;
                            setHowItWorksSteps(updated);
                          }}
                          placeholder="Step Title"
                          className="ab-input"
                          style={{ fontWeight: 600, flex: 1 }}
                        />
                        <input
                          type="text"
                          value={st.description || ''}
                          onChange={(e) => {
                            const updated = [...howItWorksSteps];
                            updated[idx].description = e.target.value;
                            setHowItWorksSteps(updated);
                          }}
                          placeholder="Step description..."
                          className="ab-input"
                          style={{ flex: 2 }}
                        />
                        <button
                          type="button"
                          onClick={() => setHowItWorksSteps(howItWorksSteps.filter((_, i) => i !== idx))}
                          className="btn btn-outline btn-sm"
                          style={{ color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUB-TAB 7: What's Included */}
              {activeFeatureSubTab === 'included' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      What's Included Groups & Items (Section 11)
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIncludedGroups([...includedGroups, { group_title: 'New Deliverable Group', icon: 'Package', items: ['Item 1', 'Item 2'] }])}
                      className="btn btn-secondary btn-sm"
                    >
                      <Plus size={14} /> Add Group
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {includedGroups.map((grp, idx) => (
                      <div key={idx} style={{ padding: '12px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            value={grp.group_title || ''}
                            onChange={(e) => {
                              const updated = [...includedGroups];
                              updated[idx].group_title = e.target.value;
                              setIncludedGroups(updated);
                            }}
                            placeholder="Group Title (e.g. Mobile Apps)"
                            className="ab-input"
                            style={{ fontWeight: 700, flex: 1 }}
                          />
                          <button
                            type="button"
                            onClick={() => setIncludedGroups(includedGroups.filter((_, i) => i !== idx))}
                            className="btn btn-outline btn-sm"
                            style={{ color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <textarea
                          value={Array.isArray(grp.items) ? grp.items.join('\n') : ''}
                          onChange={(e) => {
                            const updated = [...includedGroups];
                            updated[idx].items = e.target.value.split('\n').filter(Boolean);
                            setIncludedGroups(updated);
                          }}
                          placeholder="Enter items, one per line..."
                          className="ab-textarea"
                          rows={3}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUB-TAB 8: Tech Specs */}
              {activeFeatureSubTab === 'specs' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      Technology Stack & Specifications (Section 13)
                    </h3>
                    <button
                      type="button"
                      onClick={() => setSpecs([...specs, { label: 'Database', value: 'PostgreSQL / Supabase' }])}
                      className="btn btn-secondary btn-sm"
                    >
                      <Plus size={14} /> Add Spec Row
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {specs.map((sp, idx) => (
                      <div key={idx} className="ab-item-row" style={{ gap: '8px' }}>
                        <input
                          type="text"
                          value={sp.label || ''}
                          onChange={(e) => {
                            const updated = [...specs];
                            updated[idx].label = e.target.value;
                            setSpecs(updated);
                          }}
                          placeholder="Specification (e.g. Framework)"
                          className="ab-input"
                          style={{ flex: 1 }}
                        />
                        <input
                          type="text"
                          value={sp.value || ''}
                          onChange={(e) => {
                            const updated = [...specs];
                            updated[idx].value = e.target.value;
                            setSpecs(updated);
                          }}
                          placeholder="Value (e.g. Next.js 14 / TypeScript)"
                          className="ab-input"
                          style={{ flex: 2 }}
                        />
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
              )}

              {/* SUB-TAB 9: Comparison */}
              {activeFeatureSubTab === 'comparison' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      Product vs Build From Scratch Comparison (Section 18)
                    </h3>
                    <button
                      type="button"
                      onClick={() => setComparisonRows([...comparisonRows, { label: 'Time to Market', product_value: 'Ready in 24 Hours', scratch_value: '4-6 Months' }])}
                      className="btn btn-secondary btn-sm"
                    >
                      <Plus size={14} /> Add Row
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {comparisonRows.map((r, idx) => (
                      <div key={idx} className="ab-item-row" style={{ gap: '8px' }}>
                        <input
                          type="text"
                          value={r.label || r.feature || ''}
                          onChange={(e) => {
                            const updated = [...comparisonRows];
                            updated[idx].label = e.target.value;
                            setComparisonRows(updated);
                          }}
                          placeholder="Metric (e.g. Frontend App)"
                          className="ab-input"
                          style={{ flex: 1 }}
                        />
                        <input
                          type="text"
                          value={r.product_value || ''}
                          onChange={(e) => {
                            const updated = [...comparisonRows];
                            updated[idx].product_value = e.target.value;
                            setComparisonRows(updated);
                          }}
                          placeholder="Product Value (e.g. Included)"
                          className="ab-input"
                          style={{ flex: 1, color: '#10b981' }}
                        />
                        <input
                          type="text"
                          value={r.scratch_value || ''}
                          onChange={(e) => {
                            const updated = [...comparisonRows];
                            updated[idx].scratch_value = e.target.value;
                            setComparisonRows(updated);
                          }}
                          placeholder="Scratch Value (e.g. $15,000+)"
                          className="ab-input"
                          style={{ flex: 1 }}
                        />
                        <button
                          type="button"
                          onClick={() => setComparisonRows(comparisonRows.filter((_, i) => i !== idx))}
                          className="btn btn-outline btn-sm"
                          style={{ color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    Frequently Asked Questions (Section 24)
                  </h3>
                  <button
                    type="button"
                    onClick={() => setFaqs([...faqs, { question: 'Do I get full unencrypted source code?', answer: 'Yes! You receive complete unencrypted source code with full commercial rights.' }])}
                    className="btn btn-secondary btn-sm"
                  >
                    <Plus size={14} /> Add FAQ
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {faqs.map((f, idx) => (
                    <div key={idx} style={{ padding: '12px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          value={f.question || ''}
                          onChange={(e) => {
                            const updated = [...faqs];
                            updated[idx].question = e.target.value;
                            setFaqs(updated);
                          }}
                          placeholder="Question..."
                          className="ab-input"
                          style={{ fontWeight: 600, flex: 1 }}
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

              {/* Testimonials */}
              <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    Verified Buyer Testimonials (Section 22)
                  </h3>
                  <button
                    type="button"
                    onClick={() => setTestimonials([...testimonials, { name: 'Verified Purchaser', designation: 'Technical Founder', rating: 5, text: 'Exceptional codebase, saved us months of engineering time.', is_verified: 1 }])}
                    className="btn btn-secondary btn-sm"
                  >
                    <Plus size={14} /> Add Testimonial
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {testimonials.map((t, idx) => (
                    <div key={idx} style={{ padding: '12px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 100px auto', gap: '8px' }}>
                        <input
                          type="text"
                          value={t.name || t.user_name || ''}
                          onChange={(e) => {
                            const updated = [...testimonials];
                            updated[idx].name = e.target.value;
                            setTestimonials(updated);
                          }}
                          placeholder="Buyer Name"
                          className="ab-input"
                          style={{ fontWeight: 600 }}
                        />
                        <input
                          type="text"
                          value={t.designation || t.role || ''}
                          onChange={(e) => {
                            const updated = [...testimonials];
                            updated[idx].designation = e.target.value;
                            setTestimonials(updated);
                          }}
                          placeholder="Role / Company"
                          className="ab-input"
                        />
                        <select
                          value={t.rating || 5}
                          onChange={(e) => {
                            const updated = [...testimonials];
                            updated[idx].rating = parseInt(e.target.value);
                            setTestimonials(updated);
                          }}
                          className="ab-select"
                        >
                          <option value={5}>5 ★★★★★</option>
                          <option value={4}>4 ★★★★☆</option>
                          <option value={3}>3 ★★★☆☆</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => setTestimonials(testimonials.filter((_, i) => i !== idx))}
                          className="btn btn-outline btn-sm"
                          style={{ color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <textarea
                        value={t.text || t.quote || ''}
                        onChange={(e) => {
                          const updated = [...testimonials];
                          updated[idx].text = e.target.value;
                          setTestimonials(updated);
                        }}
                        placeholder="Review quote..."
                        className="ab-textarea"
                        rows={2}
                      />
                    </div>
                  ))}
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
                    placeholder="source code, react, saas, template"
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

      {/* Add Custom Section Modal */}
      {showCustomModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 350,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-xl)',
            maxWidth: '560px',
            width: '100%',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                + Add Custom Section
              </h3>
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="btn btn-outline btn-sm"
              >
                <X size={15} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label className="ab-form-label">Section Title *</label>
                <input
                  type="text"
                  value={customSectionDraft.title}
                  onChange={(e) => setCustomSectionDraft(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Enterprise Security & Compliance"
                  className="ab-input"
                />
              </div>

              <div>
                <label className="ab-form-label">Eyebrow / Kicker Tag</label>
                <input
                  type="text"
                  value={customSectionDraft.eyebrow}
                  onChange={(e) => setCustomSectionDraft(prev => ({ ...prev, eyebrow: e.target.value }))}
                  placeholder="e.g. ENTERPRISE GRADE"
                  className="ab-input"
                />
              </div>

              <div>
                <label className="ab-form-label">Section Description / Content</label>
                <textarea
                  value={customSectionDraft.description}
                  onChange={(e) => setCustomSectionDraft(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the capabilities or specifications..."
                  className="ab-textarea"
                  rows={3}
                />
              </div>

              <div>
                <label className="ab-form-label">Optional Image / Diagram URL</label>
                <input
                  type="url"
                  value={customSectionDraft.image}
                  onChange={(e) => setCustomSectionDraft(prev => ({ ...prev, image: e.target.value }))}
                  placeholder="https://images.unsplash.com/..."
                  className="ab-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label className="ab-form-label">CTA Button Text (Optional)</label>
                  <input
                    type="text"
                    value={customSectionDraft.cta_text}
                    onChange={(e) => setCustomSectionDraft(prev => ({ ...prev, cta_text: e.target.value }))}
                    placeholder="e.g. Request Demo"
                    className="ab-input"
                  />
                </div>
                <div>
                  <label className="ab-form-label">CTA Link URL (Optional)</label>
                  <input
                    type="url"
                    value={customSectionDraft.cta_url}
                    onChange={(e) => setCustomSectionDraft(prev => ({ ...prev, cta_url: e.target.value }))}
                    placeholder="https://..."
                    className="ab-input"
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddCustomSection}
                className="btn btn-primary btn-sm"
              >
                Add Section
              </button>
            </div>
          </div>
        </div>
      )}

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
              <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '999px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)', fontWeight: 600 }}>
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
