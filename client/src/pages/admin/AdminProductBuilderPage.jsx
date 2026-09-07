import React, { useState, useEffect, useRef } from 'react';
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
  Edit3,
  UploadCloud,
  Play,
  ToggleLeft,
  ToggleRight,
  Film
} from 'lucide-react';
import { apiRequest } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatters';
import { DynamicProductPage } from '../../components/store/DynamicProductPage';
import { FALLBACK_PRODUCTS } from '../../data/fallbackCatalog.js';
import { compressImageFile, compressDataUrlIfNeeded, syncProductImageToStorage, getProductImageOverrides } from '../../utils/imageCompressor.js';

export function AdminProductBuilderPage({ productId: propProductId, onBack, onSaved }) {
  const { addToast } = useToast();

  // Extract product ID from props or URL search parameters (?id=32 or ?productId=32)
  const productId = propProductId || (() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      return searchParams.get('id') || searchParams.get('productId') || null;
    }
    return null;
  })();
  const effectiveProductId = productId;

  const [loading, setLoading] = useState(!!effectiveProductId);
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
    hero_secondary_image: '',
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
    is_video_visible: 1,
    show_demo_links: 1,
    demo_links: [],
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

  const [demoLinks, setDemoLinks] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Hidden File Input Refs
  const heroFileInputRef = useRef(null);
  const heroSecondaryFileInputRef = useRef(null);
  const thumbFileInputRef = useRef(null);
  const multiGalleryInputRef = useRef(null);
  const videoPosterInputRef = useRef(null);
  const sectionImageInputRef = useRef(null);
  const [activeSectionImageTarget, setActiveSectionImageTarget] = useState(null);

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
  const defaultAfterPurchaseSteps = [
    { step: '01', title: 'Complete Purchase', description: 'Immediate receipt with private download link and license key.' },
    { step: '02', title: 'Download Source Code', description: 'Access GitHub repo or direct ZIP archive with clean files.' },
    { step: '03', title: 'Follow Documentation', description: 'Step-by-step setup guide for local environment and server.' },
    { step: '04', title: 'Launch to Production', description: 'Deploy to cloud servers or app stores with commercial rights.' }
  ];

  const [afterPurchaseSteps, setAfterPurchaseSteps] = useState(defaultAfterPurchaseSteps);
  const [afterPurchaseData, setAfterPurchaseData] = useState({
    kicker: 'Onboarding Experience',
    title: 'What Happens After You Buy?',
    subtitle: 'Instant fulfillment with everything needed to immediately begin development.'
  });

  const [licensePermissions, setLicensePermissions] = useState({
    title: 'License & Legal Permissions',
    subtitle: 'Understand exactly what rights and freedoms are included with your purchase.',
    label_customize: 'Can I Customize Code?',
    can_customize: '✓ Allowed — 100% Full Access',
    label_deploy: 'Commercial Deployment?',
    can_deploy: '✓ Allowed — Client & Business',
    label_rebrand: 'White Label Branding?',
    can_rebrand: '✓ Allowed — Remove All Brand Tags',
    label_resell: 'Raw Code Reselling?',
    can_resell: '✕ Prohibited — Cannot Resell Source',
    disclaimer: 'All product names, logos, and brands are property of their respective owners. Platform is independently developed and provided for professional production deployment.'
  });

  const [reviewsConfig, setReviewsConfig] = useState({
    kicker: 'Product Ratings',
    title: 'Verified Buyer Reviews',
    subtitle: 'Based on verified orders and customer reviews.',
    average_rating: 5.0,
    review_count: 24
  });

  const [supportConfig, setSupportConfig] = useState({
    kicker: 'Dedicated Assistance',
    title: 'Questions Before Purchasing?',
    description: 'Have a pre-sale question or need custom architecture assistance? Our engineering team is ready to help.',
    email: 'support@rollixia.com',
    whatsapp: '+1 (800) 555-ROLL',
    docs_url: ''
  });

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
      if (!effectiveProductId && data && data.length > 0) {
        setProduct(prev => ({ ...prev, category_id: data[0].id }));
      }
    }).catch(() => {});

    function populateFromProductData(res) {
      if (!res) return false;
      const prod = res.product || (res.id || res.title ? res : null);
      if (!prod) return false;

      // Fetch any dedicated local storage image overrides
      const overrides = getProductImageOverrides(prod.id || effectiveProductId, prod.slug);
      const initialHero = overrides?.hero_image || prod.hero_image || '';
      const initialSecondary = overrides?.hero_secondary_image !== undefined ? overrides.hero_secondary_image : (prod.hero_secondary_image || '');
      const initialThumb = overrides?.thumbnail || prod.thumbnail || initialHero;

      setProduct(prev => ({
        ...prev,
        ...prod,
        title: prod.title || '',
        slug: prod.slug || '',
        sku: prod.sku || '',
        category_id: prod.category_id || 1,
        badge: prod.badge || '',
        eyebrow: prod.eyebrow || '',
        subtitle: prod.subtitle || '',
        short_description: prod.short_description || '',
        full_description: prod.full_description || '',
        regular_price: prod.regular_price !== undefined ? prod.regular_price : 2999,
        sale_price: prod.sale_price !== undefined ? prod.sale_price : null,
        cta_text: prod.cta_text || 'BUY NOW',
        secondary_cta_text: prod.secondary_cta_text || 'ADD TO CART',
        video_url: prod.video_url || '',
        video_type: prod.video_type || 'auto',
        video_thumbnail: prod.video_thumbnail || '',
        video_title: prod.video_title || 'See the Product in Action',
        video_description: prod.video_description || 'Watch the complete video walkthrough.',
        is_video_visible: prod.is_video_visible !== undefined ? (prod.is_video_visible ? 1 : 0) : 1,
        show_demo_links: prod.show_demo_links !== undefined ? (prod.show_demo_links ? 1 : 0) : 1,
        demo_links: prod.demo_links || [],
        demo_url: prod.demo_url || prod.live_demo_url || '',
        live_demo_url: prod.live_demo_url || prod.demo_url || '',
        customer_demo_url: prod.customer_demo_url || '',
        partner_demo_url: prod.partner_demo_url || '',
        admin_demo_url: prod.admin_demo_url || '',
        web_demo_url: prod.web_demo_url || '',
        docs_url: prod.docs_url || prod.doc_url || '',
        doc_url: prod.doc_url || prod.docs_url || '',
        deliverable_name: prod.deliverable_name || '',
        status: prod.status || 'published',
        seo_title: prod.seo_title || '',
        seo_description: prod.seo_description || '',
        seo_keywords: prod.seo_keywords || '',
        og_image: prod.og_image || '',
        hero_image: initialHero,
        hero_secondary_image: initialSecondary,
        thumbnail: initialThumb
      }));

      // Hydrate custom demo links
      let rawDemoLinks = prod.demo_links;
      if (typeof rawDemoLinks === 'string') {
        try { rawDemoLinks = JSON.parse(rawDemoLinks); } catch (e) { rawDemoLinks = []; }
      }
      let initialDemos = [];
      if (Array.isArray(rawDemoLinks) && rawDemoLinks.length > 0) {
        initialDemos = rawDemoLinks.map((d, i) => ({
          id: d.id || `demo-${i + 1}`,
          label: d.label || 'App Demo Link',
          url: d.url || '',
          is_visible: d.is_visible !== undefined ? !!d.is_visible : true
        }));
      } else {
        if (prod.live_demo_url || prod.demo_url) {
          initialDemos.push({ id: 'demo-1', label: 'App Demo Link', url: prod.live_demo_url || prod.demo_url, is_visible: true });
        }
        if (prod.customer_demo_url) {
          initialDemos.push({ id: 'demo-2', label: 'Customer App Demo', url: prod.customer_demo_url, is_visible: true });
        }
        if (prod.partner_demo_url) {
          initialDemos.push({ id: 'demo-3', label: 'Partner / Provider Panel', url: prod.partner_demo_url, is_visible: true });
        }
        if (prod.admin_demo_url) {
          initialDemos.push({ id: 'demo-4', label: 'Admin Dashboard Demo', url: prod.admin_demo_url, is_visible: true });
        }
        if (prod.web_demo_url) {
          initialDemos.push({ id: 'demo-5', label: 'Web App Demo', url: prod.web_demo_url, is_visible: true });
        }
        if (prod.docs_url || prod.doc_url) {
          initialDemos.push({ id: 'demo-6', label: 'Documentation / Guide', url: prod.docs_url || prod.doc_url, is_visible: true });
        }
      }
      if (initialDemos.length === 0) {
        initialDemos = [
          { id: 'demo-1', label: 'App Demo Link', url: '', is_visible: true }
        ];
      }
      setDemoLinks(initialDemos);

      // Sections hydration
      const loadedSectionsRaw = res.sections || prod.sections || [];
      if (Array.isArray(loadedSectionsRaw) && loadedSectionsRaw.length > 0) {
        const loadedSections = loadedSectionsRaw.map((s, idx) => {
          let secType = s.section_type || s.type;
          if (secType === 'showcase') secType = 'customer_experience';
          if (secType === 'license_delivery') secType = 'license';
          return {
            id: s.id,
            section_type: secType,
            title: s.title || secType,
            is_visible: s.is_visible !== undefined ? s.is_visible : 1,
            sort_order: s.sort_order || idx + 1,
            content: parseSecContent(s.content)
          };
        });

        // Deduplicate loaded sections by section_type
        const seen = new Set();
        const dedupedLoaded = [];
        loadedSections.forEach(s => {
          const isCustom = s.section_type === 'custom' || s.section_type.startsWith('custom_') || s.is_custom;
          if (isCustom) {
            dedupedLoaded.push(s);
          } else if (!seen.has(s.section_type)) {
            seen.add(s.section_type);
            dedupedLoaded.push(s);
          }
        });

        const combinedSections = [...dedupedLoaded];
        defaultCanonicalSections.forEach(defSec => {
          if (!combinedSections.some(cs => cs.section_type === defSec.section_type)) {
            combinedSections.push({ ...defSec, sort_order: combinedSections.length + 1 });
          }
        });

        combinedSections.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        setSections(combinedSections);

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
        if (apSec && apSec.content) {
          const parsed = parseSecContent(apSec.content);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAfterPurchaseSteps(parsed);
          } else if (parsed && typeof parsed === 'object') {
            if (Array.isArray(parsed.steps) && parsed.steps.length > 0) {
              setAfterPurchaseSteps(parsed.steps);
            }
            setAfterPurchaseData(prev => ({
              ...prev,
              kicker: parsed.kicker || prev.kicker,
              title: parsed.title || apSec.title || prev.title,
              subtitle: parsed.subtitle || apSec.subtitle || prev.subtitle
            }));
          }
        }

        const licSec = loadedSections.find(s => s.section_type === 'license' || s.section_type === 'license_delivery');
        if (licSec && licSec.content) {
          const parsed = parseSecContent(licSec.content);
          if (parsed && typeof parsed === 'object') {
            setLicensePermissions(prev => ({
              ...prev,
              title: parsed.title || licSec.title || prev.title,
              subtitle: parsed.subtitle || licSec.subtitle || prev.subtitle,
              label_customize: parsed.label_customize || prev.label_customize,
              can_customize: parsed.can_customize || prev.can_customize,
              label_deploy: parsed.label_deploy || prev.label_deploy,
              can_deploy: parsed.can_deploy || prev.can_deploy,
              label_rebrand: parsed.label_rebrand || prev.label_rebrand,
              can_rebrand: parsed.can_rebrand || prev.can_rebrand,
              label_resell: parsed.label_resell || prev.label_resell,
              can_resell: parsed.can_resell || prev.can_resell,
              disclaimer: parsed.disclaimer || prod.disclaimer || prev.disclaimer
            }));
          }
        }

        const revSec = loadedSections.find(s => s.section_type === 'reviews');
        if (revSec && revSec.content) {
          const parsedRev = parseSecContent(revSec.content);
          if (parsedRev && typeof parsedRev === 'object') {
            setReviewsConfig(prev => ({
              ...prev,
              kicker: parsedRev.kicker || prev.kicker,
              title: parsedRev.title || revSec.title || prev.title,
              subtitle: parsedRev.subtitle || revSec.subtitle || prev.subtitle,
              average_rating: parsedRev.average_rating !== undefined ? parsedRev.average_rating : prev.average_rating,
              review_count: parsedRev.review_count !== undefined ? parsedRev.review_count : prev.review_count
            }));
          }
        }
        if (prod.average_rating !== undefined || prod.rating_avg !== undefined) {
          setReviewsConfig(prev => ({
            ...prev,
            average_rating: prod.average_rating !== undefined ? prod.average_rating : (prod.rating_avg !== undefined ? prod.rating_avg : prev.average_rating),
            review_count: prod.review_count !== undefined ? prod.review_count : prev.review_count
          }));
        }

        const supSec = loadedSections.find(s => s.section_type === 'support');
        if (supSec && supSec.content) {
          const parsedSup = parseSecContent(supSec.content);
          if (parsedSup && typeof parsedSup === 'object') {
            setSupportConfig(prev => ({
              ...prev,
              kicker: parsedSup.kicker || prev.kicker,
              title: parsedSup.title || supSec.title || prev.title,
              description: parsedSup.description || prev.description,
              email: parsedSup.email || prev.email,
              whatsapp: parsedSup.whatsapp || prev.whatsapp,
              docs_url: parsedSup.docs_url || prod.docs_url || prod.doc_url || prev.docs_url
            }));
          }
        }
      }

      // Parse technical_specs if specs state is empty
      if (prod.technical_specs) {
        try {
          const rawSpecs = typeof prod.technical_specs === 'string' ? JSON.parse(prod.technical_specs) : prod.technical_specs;
          if (Array.isArray(rawSpecs) && rawSpecs.length > 0) {
            setSpecs(prev => prev.length > 0 ? prev : rawSpecs);
          } else if (typeof rawSpecs === 'object' && rawSpecs !== null) {
            const specRows = Object.entries(rawSpecs).map(([k, v]) => ({
              label: k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              value: String(v)
            }));
            setSpecs(prev => prev.length > 0 ? prev : specRows);
          }
        } catch (e) {}
      }

      // Parse how_it_works if howItWorksSteps state is empty
      if (prod.how_it_works) {
        try {
          const rawHw = typeof prod.how_it_works === 'string' ? JSON.parse(prod.how_it_works) : prod.how_it_works;
          if (Array.isArray(rawHw) && rawHw.length > 0) {
            const formattedHw = rawHw.map((st, i) => ({
              step: st.step || `0${i + 1}`,
              title: st.title || '',
              description: st.desc || st.description || ''
            }));
            setHowItWorksSteps(prev => prev.length > 0 ? prev : formattedHw);
          }
        } catch (e) {}
      }

      // Features
      const loadedFeatures = res.features || prod.features || [];
      if (Array.isArray(loadedFeatures) && loadedFeatures.length > 0) setFeatures(loadedFeatures);

      // FAQs
      const loadedFaqs = res.faqs || prod.faqs || [];
      if (Array.isArray(loadedFaqs) && loadedFaqs.length > 0) setFaqs(loadedFaqs);

      // Testimonials
      const loadedTestimonials = res.testimonials || prod.testimonials || [];
      if (Array.isArray(loadedTestimonials) && loadedTestimonials.length > 0) setTestimonials(loadedTestimonials);

      // Media
      const loadedMedia = res.media || prod.media || [];
      if (Array.isArray(loadedMedia) && loadedMedia.length > 0) setMediaList(loadedMedia);

      // Licenses with features
      const loadedLicenses = res.licenses || prod.licenses || [];
      const defaultFeatures = [
        'Full Unencrypted Source Code',
        'Commercial Deployment Rights',
        'Lifetime Code Updates',
        'Direct Technical Support',
        'Comprehensive Documentation'
      ];
      if (Array.isArray(loadedLicenses) && loadedLicenses.length > 0) {
        setLicensesList(loadedLicenses.map(lic => ({
          ...lic,
          features: Array.isArray(lic.features) && lic.features.length > 0
            ? lic.features
            : (typeof lic.features === 'string'
                ? lic.features.split('\n').map(s => s.trim()).filter(Boolean)
                : defaultFeatures)
        })));
      }

      return true;
    }

    if (effectiveProductId) {
      setLoading(true);
      apiRequest(`/api/admin/products/${effectiveProductId}/full`)
        .then(res => {
          const success = populateFromProductData(res);
          if (!success) {
            // Check fallback catalog by ID or slug
            const fallback = FALLBACK_PRODUCTS.find(p => String(p.id) === String(effectiveProductId) || p.slug === String(effectiveProductId));
            if (fallback) {
              populateFromProductData({ product: fallback });
            }
          }
        })
        .catch(err => {
          console.warn('API error loading product, trying fallback catalog:', err);
          const fallback = FALLBACK_PRODUCTS.find(p => String(p.id) === String(effectiveProductId) || p.slug === String(effectiveProductId));
          if (fallback) {
            populateFromProductData({ product: fallback });
          } else {
            addToast('Failed to load product details for editing', 'error');
          }
        })
        .finally(() => setLoading(false));
    }
  }, [effectiveProductId]);

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
    const newVis = (updated[index].is_visible === 1 || updated[index].is_visible === true) ? 0 : 1;
    updated[index].is_visible = newVis;
    setSections(updated);

    if (updated[index].section_type === 'video') {
      setProduct(prev => ({ ...prev, is_video_visible: newVis }));
    } else if (updated[index].section_type === 'demo') {
      setProduct(prev => ({ ...prev, show_demo_links: newVis }));
    }
  };

  const toggleSectionTypeVisibility = (secType, explicitState = null) => {
    setSections(prev => prev.map(s => {
      if (s.section_type === secType) {
        const nextState = explicitState !== null ? (explicitState ? 1 : 0) : ((s.is_visible === 1 || s.is_visible === true) ? 0 : 1);
        return { ...s, is_visible: nextState };
      }
      return s;
    }));
    if (secType === 'video') {
      setProduct(prev => ({
        ...prev,
        is_video_visible: explicitState !== null ? (explicitState ? 1 : 0) : ((prev.is_video_visible === 1 || prev.is_video_visible === true) ? 0 : 1)
      }));
    } else if (secType === 'demo') {
      setProduct(prev => ({
        ...prev,
        show_demo_links: explicitState !== null ? (explicitState ? 1 : 0) : ((prev.show_demo_links === 1 || prev.show_demo_links === true) ? 0 : 1)
      }));
    }
  };

  function parseAdminVideoUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== 'string') return null;
    const url = rawUrl.trim();
    if (!url) return null;

    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (ytMatch && ytMatch[1]) {
      return {
        provider: 'youtube',
        embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=0&rel=0`
      };
    }

    const vimeoMatch = url.match(/(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+))/i);
    if (vimeoMatch && vimeoMatch[3]) {
      return {
        provider: 'vimeo',
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[3]}`
      };
    }

    const loomMatch = url.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/i);
    if (loomMatch && loomMatch[1]) {
      return {
        provider: 'loom',
        embedUrl: `https://www.loom.com/embed/${loomMatch[1]}`
      };
    }

    if (url.match(/\.(mp4|webm|ogg)($|\?)/i) || url.toLowerCase().includes('.mp4')) {
      return {
        provider: 'mp4',
        src: url
      };
    }

    if (url.includes('embed') || url.startsWith('http')) {
      return {
        provider: 'iframe',
        embedUrl: url
      };
    }

    return null;
  }

  // File Upload Handlers (Hero, Secondary Hero, Thumbnail, Video Thumbnail, Section Images, Gallery)
  const handleImageFileUpload = async (file, targetField, extra = null) => {
    if (!file) return;
    setUploadingImage(true);

    const applyUrlToTarget = (url) => {
      const pId = effectiveProductId || product.id;
      const pSlug = product.slug || 'servicepro';

      if (targetField === 'hero') {
        const thumb = product.thumbnail || url;
        setProduct(prev => ({ ...prev, hero_image: url, thumbnail: prev.thumbnail || url }));
        setMediaList(prev => {
          const next = [...prev];
          const thumbIdx = next.findIndex(m => m.is_thumbnail === 1 || m.is_thumbnail === true);
          if (thumbIdx >= 0) {
            next[thumbIdx] = { ...next[thumbIdx], media_url: url };
          } else if (next.length > 0) {
            next[0] = { ...next[0], media_url: url };
          } else {
            next.unshift({ media_url: url, is_thumbnail: 1, media_type: 'image' });
          }
          return next;
        });
        // AUTO-SYNC TO LIVE WEBSITE STORAGE IMMEDIATELY
        syncProductImageToStorage(pId, pSlug, { hero_image: url, thumbnail: thumb });
      } else if (targetField === 'hero_secondary') {
        setProduct(prev => ({ ...prev, hero_secondary_image: url }));
        // AUTO-SYNC TO LIVE WEBSITE STORAGE IMMEDIATELY
        syncProductImageToStorage(pId, pSlug, { hero_secondary_image: url });
      } else if (targetField === 'thumbnail') {
        setProduct(prev => ({ ...prev, thumbnail: url }));
        // AUTO-SYNC TO LIVE WEBSITE STORAGE IMMEDIATELY
        syncProductImageToStorage(pId, pSlug, { thumbnail: url });
      } else if (targetField === 'video_thumbnail') {
        setProduct(prev => ({ ...prev, video_thumbnail: url }));
        syncProductImageToStorage(pId, pSlug, { video_thumbnail: url });
      } else if (targetField === 'customer_showcase' && extra?.index !== undefined) {
        setCustomerShowcase(prev => {
          const next = [...prev];
          if (next[extra.index]) next[extra.index] = { ...next[extra.index], image: url };
          return next;
        });
      } else if (targetField === 'partner_showcase' && extra?.index !== undefined) {
        setPartnerShowcase(prev => {
          const next = [...prev];
          if (next[extra.index]) next[extra.index] = { ...next[extra.index], image: url };
          return next;
        });
      } else if (targetField === 'admin_showcase' && extra?.index !== undefined) {
        setAdminShowcase(prev => {
          const next = [...prev];
          if (next[extra.index]) next[extra.index] = { ...next[extra.index], image: url };
          return next;
        });
      } else if (targetField === 'custom_section' && extra?.index !== undefined) {
        setSections(prev => {
          const next = [...prev];
          if (next[extra.index]) {
            const curContent = typeof next[extra.index].content === 'object' && next[extra.index].content !== null ? next[extra.index].content : {};
            next[extra.index] = {
              ...next[extra.index],
              content: { ...curContent, image: url }
            };
          }
          return next;
        });
      }
      addToast('Image updated and synced to live website!', 'success');
      setUploadingImage(false);
    };

    try {
      const formData = new FormData();
      formData.append('media', file);
      const res = await apiRequest('/api/admin/files/upload-media', {
        method: 'POST',
        body: formData
      });
      if (res && res.url) {
        applyUrlToTarget(res.url);
        return;
      }
    } catch (e) {
      // Fallback to client-side compressed image below
    }

    try {
      const compressedUrl = await compressImageFile(file, 1280, 1280, 0.82);
      if (compressedUrl) {
        applyUrlToTarget(compressedUrl);
        return;
      }
    } catch (compErr) {
      console.warn('[ImageCompressor] Canvas compression failed, fallback to reader:', compErr);
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      applyUrlToTarget(e.target.result);
    };
    reader.onerror = () => {
      addToast('Failed to read image file', 'error');
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleMultipleImagesUpload = async (files) => {
    if (!files || files.length === 0) return;
    const fileList = Array.from(files);
    setUploadingImage(true);
    addToast(`Uploading ${fileList.length} gallery image(s)...`, 'info');

    const newItems = [];
    for (const file of fileList) {
      let mediaUrl = '';
      try {
        const formData = new FormData();
        formData.append('media', file);
        const res = await apiRequest('/api/admin/files/upload-media', {
          method: 'POST',
          body: formData
        });
        if (res && res.url) {
          mediaUrl = res.url;
        }
      } catch (err) {}

      if (!mediaUrl) {
        try {
          mediaUrl = await compressImageFile(file, 1280, 1280, 0.82);
        } catch (e) {
          mediaUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (ev) => resolve(ev.target.result);
            reader.onerror = () => resolve('');
            reader.readAsDataURL(file);
          });
        }
      }

      if (mediaUrl) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        newItems.push({
          media_url: mediaUrl,
          caption: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
          media_type: 'image'
        });
      }
    }

    if (newItems.length > 0) {
      setMediaList(prev => [...prev, ...newItems]);
      setProduct(prev => ({
        ...prev,
        hero_image: prev.hero_image || newItems[0].media_url,
        thumbnail: prev.thumbnail || newItems[0].media_url
      }));
      addToast(`Added ${newItems.length} images to product gallery!`, 'success');
    }
    setUploadingImage(false);
  };

  // Custom Demo Links Handlers
  const handleDemoLinkChange = (index, field, value) => {
    const updated = [...demoLinks];
    updated[index][field] = value;
    setDemoLinks(updated);
  };

  const handleAddDemoLink = (presetLabel = 'App Demo Link') => {
    const newDemo = {
      id: `demo-${Date.now()}`,
      label: presetLabel,
      url: '',
      is_visible: true
    };
    setDemoLinks([...demoLinks, newDemo]);
    addToast(`Added "${presetLabel}" slot`, 'info');
  };

  const handleDeleteDemoLink = (index) => {
    setDemoLinks(demoLinks.filter((_, idx) => idx !== index));
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

  const jumpToSectionEditor = (secType) => {
    if (['pricing', 'license', 'license_delivery'].includes(secType)) {
      setActiveTab('pricing');
    } else if (['media', 'hero', 'gallery'].includes(secType)) {
      setActiveTab('media');
    } else if (secType === 'video') {
      setActiveTab('basic');
    } else if (['demo', 'links'].includes(secType)) {
      setActiveTab('links');
    } else if (['faq', 'testimonials', 'reviews', 'support'].includes(secType)) {
      setActiveTab('faqs');
    } else if (['seo'].includes(secType)) {
      setActiveTab('seo');
    } else {
      setActiveTab('features');
      if (secType === 'customer_experience' || secType === 'showcase') setActiveFeatureSubTab('customer');
      else if (secType === 'partner_experience') setActiveFeatureSubTab('partner');
      else if (secType === 'admin_experience') setActiveFeatureSubTab('admin');
      else if (secType === 'how_it_works') setActiveFeatureSubTab('how_it_works');
      else if (secType === 'included') setActiveFeatureSubTab('included');
      else if (secType === 'source_code') setActiveFeatureSubTab('source_code');
      else if (secType === 'specs') setActiveFeatureSubTab('specs');
      else if (secType === 'requirements') setActiveFeatureSubTab('requirements');
      else if (secType === 'customization') setActiveFeatureSubTab('customization');
      else if (secType === 'who_is_it_for') setActiveFeatureSubTab('audience');
      else if (secType === 'use_cases') setActiveFeatureSubTab('use_cases');
      else if (secType === 'comparison') setActiveFeatureSubTab('comparison');
      else if (secType === 'after_purchase') setActiveFeatureSubTab('after_purchase');
      else if (secType === 'ecosystem') setActiveFeatureSubTab('ecosystem');
      else setActiveFeatureSubTab('features');
    }
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
    product: {
      ...product,
      average_rating: parseFloat(reviewsConfig.average_rating) || 5.0,
      review_count: parseInt(reviewsConfig.review_count, 10) || 24,
      rating_avg: parseFloat(reviewsConfig.average_rating) || 5.0
    },
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
      else if (s.section_type === 'after_purchase') content = { ...afterPurchaseData, steps: afterPurchaseSteps };
      else if (s.section_type === 'license' || s.section_type === 'license_delivery') content = licensePermissions;
      else if (s.section_type === 'reviews') content = reviewsConfig;
      else if (s.section_type === 'support') content = supportConfig;
      else if (s.section_type === 'faq') content = faqs;
      else if (s.section_type === 'testimonials') content = testimonials;
      else if (s.section_type === 'demo') content = demoLinks;
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
      // 1. Compress any large base64 data URLs before saving
      const compressedHero = await compressDataUrlIfNeeded(product.hero_image, 1280, 1280, 0.82);
      const compressedHeroSecondary = await compressDataUrlIfNeeded(product.hero_secondary_image, 1280, 1280, 0.82);
      const compressedThumbnail = await compressDataUrlIfNeeded(product.thumbnail || compressedHero, 800, 800, 0.82);

      // Compress customer showcase images
      const compressedCustomerShowcase = await Promise.all(
        customerShowcase.map(async item => ({
          ...item,
          image: item.image ? await compressDataUrlIfNeeded(item.image, 1280, 1280, 0.82) : item.image
        }))
      );

      // Compress partner showcase images
      const compressedPartnerShowcase = await Promise.all(
        partnerShowcase.map(async item => ({
          ...item,
          image: item.image ? await compressDataUrlIfNeeded(item.image, 1280, 1280, 0.82) : item.image
        }))
      );

      // Compress admin showcase images
      const compressedAdminShowcase = await Promise.all(
        adminShowcase.map(async item => ({
          ...item,
          image: item.image ? await compressDataUrlIfNeeded(item.image, 1280, 1280, 0.82) : item.image
        }))
      );

      // Sync primary hero image into mediaList
      let finalMediaList = Array.isArray(mediaList) ? [...mediaList] : [];
      if (compressedHero) {
        // Filter out obsolete default cover SVGs if custom photo is present
        const isCustomHero = !compressedHero.endsWith('-cover.svg');
        if (isCustomHero) {
          finalMediaList = finalMediaList.filter(m => !m.media_url || !m.media_url.endsWith('-cover.svg'));
        }
        const thumbIdx = finalMediaList.findIndex(m => m.is_thumbnail === 1 || m.is_thumbnail === true);
        if (thumbIdx >= 0) {
          finalMediaList[thumbIdx] = { ...finalMediaList[thumbIdx], media_url: compressedHero };
        } else {
          finalMediaList.unshift({ media_url: compressedHero, is_thumbnail: 1, media_type: 'image' });
        }
      }
      if (compressedHeroSecondary && !finalMediaList.some(m => m.media_url === compressedHeroSecondary)) {
        finalMediaList.push({ media_url: compressedHeroSecondary, is_thumbnail: 0, media_type: 'image' });
      }

      const targetStatus = overrideStatus || product.status || 'published';
      const firstActiveDemo = demoLinks.find(d => d.is_visible && d.url) || demoLinks[0];
      const productPayload = {
        ...product,
        hero_image: compressedHero || product.hero_image,
        hero_secondary_image: compressedHeroSecondary || product.hero_secondary_image,
        thumbnail: compressedThumbnail || product.thumbnail,
        average_rating: parseFloat(reviewsConfig.average_rating) || 5.0,
        review_count: parseInt(reviewsConfig.review_count, 10) || 24,
        rating_avg: parseFloat(reviewsConfig.average_rating) || 5.0,
        status: targetStatus,
        media: finalMediaList,
        demo_links: demoLinks,
        live_demo_url: firstActiveDemo?.url || product.live_demo_url,
        demo_url: firstActiveDemo?.url || product.demo_url,
        features,
        faqs,
        testimonials,
        licenses: licensesList,
        category_id: product.category_id || (categories[0] ? categories[0].id : 1),
        updated_at: new Date().toISOString()
      };

      let finalProductId = productId || effectiveProductId;

      // 1. Immediately sync dedicated product image overrides to local storage
      syncProductImageToStorage(finalProductId, productPayload.slug, {
        hero_image: productPayload.hero_image,
        hero_secondary_image: productPayload.hero_secondary_image,
        thumbnail: productPayload.thumbnail
      });

      // 2. Persist to backend server if available, without blocking on network failure
      if (productId) {
        try {
          await apiRequest(`/api/admin/products/${productId}`, {
            method: 'PUT',
            body: JSON.stringify(productPayload)
          });
        } catch (apiErr) {
          console.warn('[AdminProductBuilder] Remote API PUT warning:', apiErr);
        }
      } else {
        try {
          const createRes = await apiRequest('/api/admin/products', {
            method: 'POST',
            body: JSON.stringify(productPayload)
          });
          if (createRes && createRes.productId) {
            finalProductId = createRes.productId;
          }
        } catch (createErr) {
          console.warn('[AdminProductBuilder] Remote API POST warning:', createErr);
        }
      }

      // Save sections with enriched structured data
      let enrichedSections = [];
      if (finalProductId) {
        enrichedSections = sections.map((s, idx) => {
          let secContent = s.content;
          if (s.section_type === 'features') secContent = features;
          else if (s.section_type === 'ecosystem') secContent = ecosystem;
          else if (s.section_type === 'customer_experience' || s.section_type === 'showcase') secContent = compressedCustomerShowcase;
          else if (s.section_type === 'partner_experience') secContent = compressedPartnerShowcase;
          else if (s.section_type === 'admin_experience') secContent = compressedAdminShowcase;
          else if (s.section_type === 'how_it_works') secContent = howItWorksSteps;
          else if (s.section_type === 'included') secContent = includedGroups;
          else if (s.section_type === 'source_code') secContent = sourceCodeTree;
          else if (s.section_type === 'specs') secContent = specs;
          else if (s.section_type === 'requirements') secContent = requirements;
          else if (s.section_type === 'customization') secContent = customizationItems;
          else if (s.section_type === 'who_is_it_for') secContent = audienceList;
          else if (s.section_type === 'use_cases') secContent = useCases;
          else if (s.section_type === 'comparison') secContent = comparisonRows;
          else if (s.section_type === 'after_purchase') secContent = { ...afterPurchaseData, steps: afterPurchaseSteps };
          else if (s.section_type === 'license' || s.section_type === 'license_delivery') secContent = licensePermissions;
          else if (s.section_type === 'reviews') secContent = reviewsConfig;
          else if (s.section_type === 'support') secContent = supportConfig;
          else if (s.section_type === 'faq') secContent = faqs;
          else if (s.section_type === 'testimonials') secContent = testimonials;
          else if (s.section_type === 'demo') secContent = demoLinks;
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

        // Deduplicate enriched sections before persisting to eliminate duplicate sections
        const seenSecs = new Set();
        enrichedSections = enrichedSections.filter(s => {
          const isCustom = s.section_type === 'custom' || s.section_type.startsWith('custom_');
          if (isCustom) return true;
          if (seenSecs.has(s.section_type)) return false;
          seenSecs.add(s.section_type);
          return true;
        });

        try {
          await apiRequest(`/api/admin/products/${finalProductId}/sections`, {
            method: 'PUT',
            body: JSON.stringify({ sections: enrichedSections })
          });
        } catch (secErr) {
          console.warn('[AdminProductBuilder] Remote sections PUT warning:', secErr);
        }
      }

      // Synchronize in-memory product state
      setProduct(prev => ({ ...prev, ...productPayload }));
      setCustomerShowcase(compressedCustomerShowcase);
      setPartnerShowcase(compressedPartnerShowcase);
      setAdminShowcase(compressedAdminShowcase);
      setMediaList(finalMediaList);

      // Direct client cache synchronization for zero-latency storefront reflection
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          let storedProducts = [];
          try {
            const raw = localStorage.getItem('rollixia_admin_products');
            storedProducts = raw ? JSON.parse(raw) : [];
            if (!Array.isArray(storedProducts)) storedProducts = [];
          } catch (e) {
            storedProducts = [];
          }

          // Filter out unmodified static catalog dumps to keep storage compact
          const customDelta = storedProducts.filter(p => p && (
            (p.hero_image && !p.hero_image.endsWith('-cover.svg')) ||
            p.hero_secondary_image ||
            p.demo_links ||
            p.updated_at
          ));

          const idx = customDelta.findIndex(p => String(p.id) === String(finalProductId) || p.slug === productPayload.slug);
          const fullSavedObj = {
            ...(idx >= 0 ? customDelta[idx] : {}),
            ...productPayload,
            id: finalProductId,
            sections: enrichedSections
          };

          if (idx >= 0) {
            customDelta[idx] = fullSavedObj;
          } else {
            customDelta.push(fullSavedObj);
          }

          try {
            localStorage.setItem('rollixia_admin_products', JSON.stringify(customDelta));
          } catch (quotaErr) {
            console.warn('[AdminProductBuilder] Quota limit exceeded, keeping only current product:', quotaErr);
            localStorage.setItem('rollixia_admin_products', JSON.stringify([fullSavedObj]));
          }

          window.dispatchEvent(new CustomEvent('rollixia_catalog_updated', {
            detail: { productId: finalProductId, product: fullSavedObj }
          }));
        }
      } catch (e) {
        console.error('[AdminProductBuilder] Failed to synchronize client cache:', e);
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
    { id: 'faqs', label: '7. FAQs, Reviews & Support', icon: HelpCircle },
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

                        {/* License Features Checklist */}
                        <div style={{ marginTop: '4px', paddingTop: '8px', borderTop: '1px dashed var(--border-subtle)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                              Plan Checklist Features (Green Checkmarks)
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...licensesList];
                                const curFeatures = Array.isArray(updated[idx].features) ? updated[idx].features : [];
                                updated[idx].features = [...curFeatures, 'New Included Benefit'];
                                setLicensesList(updated);
                              }}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.7rem', padding: '2px 8px', height: 'auto', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Plus size={12} /> Add Feature
                            </button>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {(Array.isArray(lic.features) ? lic.features : []).map((feat, fIdx) => (
                              <div key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <CheckCircle size={14} color="#10b981" style={{ flexShrink: 0 }} />
                                <input
                                  type="text"
                                  value={feat}
                                  onChange={(e) => {
                                    const updated = [...licensesList];
                                    const curFeatures = [...(Array.isArray(updated[idx].features) ? updated[idx].features : [])];
                                    curFeatures[fIdx] = e.target.value;
                                    updated[idx].features = curFeatures;
                                    setLicensesList(updated);
                                  }}
                                  placeholder="e.g. Full Unencrypted Source Code"
                                  className="ab-input"
                                  style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...licensesList];
                                    const curFeatures = (Array.isArray(updated[idx].features) ? updated[idx].features : []).filter((_, i) => i !== fIdx);
                                    updated[idx].features = curFeatures;
                                    setLicensesList(updated);
                                  }}
                                  className="btn btn-outline btn-sm"
                                  style={{ color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)', padding: '4px 6px', height: 'auto' }}
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* License & Legal Permissions Management (Section 21) */}
              <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      License & Legal Permissions Matrix (Section 21)
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                      Configure the legal rights, permissions, and restrictions displayed to prospective purchasers.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLicensePermissions({
                      title: 'License & Legal Permissions',
                      subtitle: 'Understand exactly what rights and freedoms are included with your purchase.',
                      label_customize: 'Can I Customize Code?',
                      can_customize: '✓ Allowed — 100% Full Access',
                      label_deploy: 'Commercial Deployment?',
                      can_deploy: '✓ Allowed — Client & Business',
                      label_rebrand: 'White Label Branding?',
                      can_rebrand: '✓ Allowed — Remove All Brand Tags',
                      label_resell: 'Raw Code Reselling?',
                      can_resell: '✕ Prohibited — Cannot Resell Source',
                      disclaimer: 'All product names, logos, and brands are property of their respective owners. Platform is independently developed and provided for professional production deployment.'
                    })}
                    className="btn btn-secondary btn-sm"
                  >
                    Reset Defaults
                  </button>
                </div>

                <div className="ab-form-grid" style={{ marginBottom: '1.25rem' }}>
                  <div className="ab-form-group">
                    <label className="ab-form-label">Section Title</label>
                    <input
                      type="text"
                      value={licensePermissions.title || ''}
                      onChange={(e) => setLicensePermissions(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="License & Legal Permissions"
                      className="ab-input"
                      style={{ fontWeight: 600 }}
                    />
                  </div>
                  <div className="ab-form-group">
                    <label className="ab-form-label">Section Subtitle</label>
                    <input
                      type="text"
                      value={licensePermissions.subtitle || ''}
                      onChange={(e) => setLicensePermissions(prev => ({ ...prev, subtitle: e.target.value }))}
                      placeholder="Understand exactly what rights and freedoms are included with your purchase."
                      className="ab-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '1.25rem' }}>
                  {/* Card 1: Customization */}
                  <div style={{ padding: '12px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Permission 1 Header</label>
                    <input
                      type="text"
                      value={licensePermissions.label_customize || 'Can I Customize Code?'}
                      onChange={(e) => setLicensePermissions(prev => ({ ...prev, label_customize: e.target.value }))}
                      className="ab-input"
                      style={{ fontSize: '0.8rem' }}
                    />
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '4px' }}>Permission 1 Status / Text</label>
                    <input
                      type="text"
                      value={licensePermissions.can_customize || '✓ Allowed — 100% Full Access'}
                      onChange={(e) => setLicensePermissions(prev => ({ ...prev, can_customize: e.target.value }))}
                      className="ab-input"
                      style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981' }}
                    />
                  </div>

                  {/* Card 2: Commercial Deployment */}
                  <div style={{ padding: '12px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Permission 2 Header</label>
                    <input
                      type="text"
                      value={licensePermissions.label_deploy || 'Commercial Deployment?'}
                      onChange={(e) => setLicensePermissions(prev => ({ ...prev, label_deploy: e.target.value }))}
                      className="ab-input"
                      style={{ fontSize: '0.8rem' }}
                    />
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '4px' }}>Permission 2 Status / Text</label>
                    <input
                      type="text"
                      value={licensePermissions.can_deploy || '✓ Allowed — Client & Business'}
                      onChange={(e) => setLicensePermissions(prev => ({ ...prev, can_deploy: e.target.value }))}
                      className="ab-input"
                      style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981' }}
                    />
                  </div>

                  {/* Card 3: White Label */}
                  <div style={{ padding: '12px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Permission 3 Header</label>
                    <input
                      type="text"
                      value={licensePermissions.label_rebrand || 'White Label Branding?'}
                      onChange={(e) => setLicensePermissions(prev => ({ ...prev, label_rebrand: e.target.value }))}
                      className="ab-input"
                      style={{ fontSize: '0.8rem' }}
                    />
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '4px' }}>Permission 3 Status / Text</label>
                    <input
                      type="text"
                      value={licensePermissions.can_rebrand || '✓ Allowed — Remove All Brand Tags'}
                      onChange={(e) => setLicensePermissions(prev => ({ ...prev, can_rebrand: e.target.value }))}
                      className="ab-input"
                      style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981' }}
                    />
                  </div>

                  {/* Card 4: Reselling Prohibited */}
                  <div style={{ padding: '12px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Permission 4 Header</label>
                    <input
                      type="text"
                      value={licensePermissions.label_resell || 'Raw Code Reselling?'}
                      onChange={(e) => setLicensePermissions(prev => ({ ...prev, label_resell: e.target.value }))}
                      className="ab-input"
                      style={{ fontSize: '0.8rem' }}
                    />
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '4px' }}>Permission 4 Status / Text</label>
                    <input
                      type="text"
                      value={licensePermissions.can_resell || '✕ Prohibited — Cannot Resell Source'}
                      onChange={(e) => setLicensePermissions(prev => ({ ...prev, can_resell: e.target.value }))}
                      className="ab-input"
                      style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f43f5e' }}
                    />
                  </div>
                </div>

                <div className="ab-form-group">
                  <label className="ab-form-label">Legal Disclaimer / Brand Copyright Notice</label>
                  <textarea
                    rows={2}
                    value={licensePermissions.disclaimer || ''}
                    onChange={(e) => setLicensePermissions(prev => ({ ...prev, disclaimer: e.target.value }))}
                    placeholder="All product names, logos, and brands are property of their respective owners..."
                    className="ab-textarea"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MEDIA & GALLERY */}
          {activeTab === 'media' && (
            <div>
              {/* Hidden File Inputs for Universal Image Uploads */}
              <input
                type="file"
                ref={heroFileInputRef}
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleImageFileUpload(e.target.files[0], 'hero');
                  }
                  e.target.value = '';
                }}
                style={{ display: 'none' }}
              />
              <input
                type="file"
                ref={thumbFileInputRef}
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleImageFileUpload(e.target.files[0], 'thumbnail');
                  }
                  e.target.value = '';
                }}
                style={{ display: 'none' }}
              />
              <input
                type="file"
                ref={heroSecondaryFileInputRef}
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleImageFileUpload(e.target.files[0], 'hero_secondary');
                  }
                  e.target.value = '';
                }}
                style={{ display: 'none' }}
              />
              <input
                type="file"
                ref={sectionImageInputRef}
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0] && activeSectionImageTarget) {
                    handleImageFileUpload(e.target.files[0], activeSectionImageTarget.type, activeSectionImageTarget);
                  }
                  e.target.value = '';
                }}
                style={{ display: 'none' }}
              />
              <input
                type="file"
                ref={multiGalleryInputRef}
                multiple
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleMultipleImagesUpload(e.target.files);
                  }
                  e.target.value = '';
                }}
                style={{ display: 'none' }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <div className="ab-section-title">Images & Visual Media Gallery</div>
                  <div className="ab-section-desc">
                    Manage the primary hero image, thumbnail, and product gallery. Upload multiple images at once, replace existing images, or delete them.
                  </div>
                </div>

                {/* Quick Toggle for Gallery Section on Storefront */}
                {(() => {
                  const gallerySec = sections.find(s => s.section_type === 'gallery');
                  const isGalVisible = gallerySec ? (gallerySec.is_visible === 1 || gallerySec.is_visible === true) : true;
                  return (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      background: 'var(--bg-surface-elevated)',
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          Gallery on Storefront
                        </div>
                        <div style={{ fontSize: '0.72rem', color: isGalVisible ? '#10b981' : '#f43f5e', fontWeight: 600 }}>
                          {isGalVisible ? 'Visible to Users' : 'Hidden from Users'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleSectionTypeVisibility('gallery')}
                        style={{
                          width: '42px',
                          height: '22px',
                          borderRadius: '9999px',
                          background: isGalVisible ? 'var(--primary)' : 'rgba(255,255,255,0.15)',
                          border: 'none',
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                          padding: 0,
                          flexShrink: 0
                        }}
                        title={isGalVisible ? "Click to hide gallery on storefront" : "Click to show gallery on storefront"}
                      >
                        <span
                          style={{
                            position: 'absolute',
                            top: '3px',
                            left: isGalVisible ? '23px' : '3px',
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            background: '#fff',
                            transition: 'left 0.2s',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.4)'
                          }}
                        />
                      </button>
                    </div>
                  );
                })()}
              </div>

              {/* Live Website Image Sync Action Banner */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 1.25rem',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: '#10b981',
                    boxShadow: '0 0 10px #10b981',
                    display: 'inline-block'
                  }} />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                      Live Website Image Sync Active
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      All uploaded or pasted images sync directly to your live product page.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => handleSave()}
                    disabled={saving}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 800, padding: '8px 18px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
                  >
                    <Save size={15} />
                    <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
                  </button>
                  <a
                    href={`/products/${product.slug || effectiveProductId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}
                  >
                    <ExternalLink size={14} />
                    <span>View on Live Website</span>
                  </a>
                </div>
              </div>

              <div className="ab-form-grid" style={{ gap: '1.5rem' }}>
                {/* 1. Primary Hero Image */}
                <div className="ab-form-group" style={{
                  background: 'var(--bg-surface-elevated)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div>
                      <label className="ab-form-label" style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>
                        Primary Hero Showcase Image
                      </label>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Main image displayed on product detail page header
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => heroFileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="btn btn-primary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', padding: '6px 12px' }}
                      >
                        <UploadCloud size={14} />
                        <span>{uploadingImage ? 'Uploading...' : 'Change / Upload Image'}</span>
                      </button>
                      {product.hero_image && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Are you sure you want to remove the hero image?')) {
                              setProduct(prev => ({ ...prev, hero_image: '' }));
                              addToast('Hero image removed', 'info');
                            }
                          }}
                          className="btn btn-outline btn-sm"
                          style={{ color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)', padding: '6px 10px' }}
                          title="Delete Hero Image"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    height: '180px',
                    background: '#0a0e1a',
                    border: '1px dashed var(--border-medium)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    marginBottom: '0.75rem'
                  }}>
                    {product.hero_image ? (
                      <img
                        src={product.hero_image}
                        alt="Hero Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                    ) : (
                      <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem' }}>
                        <ImageIcon size={32} style={{ margin: '0 auto 6px', opacity: 0.5 }} />
                        <p style={{ fontSize: '0.8rem', margin: 0 }}>No hero image set</p>
                        <button
                          type="button"
                          onClick={() => heroFileInputRef.current?.click()}
                          style={{ marginTop: '6px', background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.78rem', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          Upload Image File
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Or enter image direct URL / CDN path:
                    </label>
                    <input
                      type="text"
                      value={product.hero_image || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProduct(prev => ({ ...prev, hero_image: val, thumbnail: prev.thumbnail || val }));
                        syncProductImageToStorage(effectiveProductId || product.id, product.slug, { hero_image: val, thumbnail: product.thumbnail || val });
                      }}
                      onBlur={() => {
                        syncProductImageToStorage(effectiveProductId || product.id, product.slug, { hero_image: product.hero_image, thumbnail: product.thumbnail || product.hero_image });
                      }}
                      placeholder="https://images.unsplash.com/... or /uploads/..."
                      className="ab-input"
                      style={{ fontSize: '0.8rem' }}
                    />
                  </div>
                </div>

                {/* 2. Secondary Hero Image (Dual Hero Mockup) */}
                <div className="ab-form-group" style={{
                  background: 'var(--bg-surface-elevated)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <label className="ab-form-label" style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>
                          Secondary Hero Mockup Image
                        </label>
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)', padding: '2px 6px', borderRadius: '4px' }}>
                          DUAL HERO
                        </span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Displayed in hero alongside primary mockup (e.g. mobile/workflow view)
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => heroSecondaryFileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="btn btn-primary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', padding: '6px 12px' }}
                      >
                        <UploadCloud size={14} />
                        <span>{uploadingImage ? 'Uploading...' : 'Change / Upload Image'}</span>
                      </button>
                      {product.hero_secondary_image && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Are you sure you want to remove the secondary hero image?')) {
                              setProduct(prev => ({ ...prev, hero_secondary_image: '' }));
                              syncProductImageToStorage(effectiveProductId || product.id, product.slug, { hero_secondary_image: '' });
                              addToast('Secondary hero image removed', 'info');
                            }
                          }}
                          className="btn btn-outline btn-sm"
                          style={{ color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)', padding: '6px 10px' }}
                          title="Delete Secondary Hero Image"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    height: '180px',
                    background: '#0a0e1a',
                    border: '1px dashed var(--border-medium)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    marginBottom: '0.75rem'
                  }}>
                    {product.hero_secondary_image ? (
                      <img
                        src={product.hero_secondary_image}
                        alt="Secondary Hero Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                    ) : (
                      <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem' }}>
                        <ImageIcon size={32} style={{ margin: '0 auto 6px', opacity: 0.5 }} />
                        <p style={{ fontSize: '0.8rem', margin: 0 }}>No secondary hero image set</p>
                        <button
                          type="button"
                          onClick={() => heroSecondaryFileInputRef.current?.click()}
                          style={{ marginTop: '6px', background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.78rem', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          Upload Secondary Image File
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Or enter image direct URL / CDN path:
                    </label>
                    <input
                      type="text"
                      value={product.hero_secondary_image || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProduct(prev => ({ ...prev, hero_secondary_image: val }));
                        syncProductImageToStorage(effectiveProductId || product.id, product.slug, { hero_secondary_image: val });
                      }}
                      onBlur={() => {
                        syncProductImageToStorage(effectiveProductId || product.id, product.slug, { hero_secondary_image: product.hero_secondary_image });
                      }}
                      placeholder="https://images.unsplash.com/... or /uploads/..."
                      className="ab-input"
                      style={{ fontSize: '0.8rem' }}
                    />
                  </div>
                </div>

                {/* 3. Thumbnail Image */}
                <div className="ab-form-group" style={{
                  background: 'var(--bg-surface-elevated)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div>
                      <label className="ab-form-label" style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>
                        Catalog Thumbnail Card Image
                      </label>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Appears on store homepage, catalog cards, and checkout
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => thumbFileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="btn btn-primary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', padding: '6px 12px' }}
                      >
                        <UploadCloud size={14} />
                        <span>{uploadingImage ? 'Uploading...' : 'Change / Upload'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (product.hero_image) {
                            setProduct(prev => ({ ...prev, thumbnail: prev.hero_image }));
                            syncProductImageToStorage(effectiveProductId || product.id, product.slug, { thumbnail: product.hero_image });
                            addToast('Synced thumbnail with hero image', 'success');
                          } else {
                            addToast('No hero image to sync', 'warning');
                          }
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', padding: '6px 10px' }}
                        title="Copy image from Hero"
                      >
                        <RefreshCw size={13} />
                        <span>Same as Hero</span>
                      </button>
                      {product.thumbnail && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Are you sure you want to remove the thumbnail?')) {
                              setProduct(prev => ({ ...prev, thumbnail: '' }));
                              syncProductImageToStorage(effectiveProductId || product.id, product.slug, { thumbnail: '' });
                              addToast('Thumbnail removed', 'info');
                            }
                          }}
                          className="btn btn-outline btn-sm"
                          style={{ color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)', padding: '6px 10px' }}
                          title="Delete Thumbnail"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    height: '180px',
                    background: '#0a0e1a',
                    border: '1px dashed var(--border-medium)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    marginBottom: '0.75rem'
                  }}>
                    {product.thumbnail ? (
                      <img
                        src={product.thumbnail}
                        alt="Thumbnail Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                    ) : (
                      <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem' }}>
                        <ImageIcon size={32} style={{ margin: '0 auto 6px', opacity: 0.5 }} />
                        <p style={{ fontSize: '0.8rem', margin: 0 }}>No thumbnail image set</p>
                        <button
                          type="button"
                          onClick={() => thumbFileInputRef.current?.click()}
                          style={{ marginTop: '6px', background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.78rem', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          Upload Thumbnail File
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Or enter thumbnail direct URL / CDN path:
                    </label>
                    <input
                      type="text"
                      value={product.thumbnail || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProduct(prev => ({ ...prev, thumbnail: val }));
                        syncProductImageToStorage(effectiveProductId || product.id, product.slug, { thumbnail: val });
                      }}
                      onBlur={() => {
                        syncProductImageToStorage(effectiveProductId || product.id, product.slug, { thumbnail: product.thumbnail });
                      }}
                      placeholder="https://images.unsplash.com/... or /uploads/..."
                      className="ab-input"
                      style={{ fontSize: '0.8rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* 2. SECTION FEATURE & SHOWCASE IMAGES MANAGER */}
              <div style={{
                marginTop: '2rem',
                background: 'var(--bg-surface-elevated)',
                padding: '1.5rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-medium)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Layers size={18} color="var(--primary)" />
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                        Product Page Section & Feature Images
                      </h3>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                        Live Storefront Sections
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                      Easily change or replace images for each storefront section (Customer User Experience, Partner Dispatcher, Dashboards, Custom Sections).
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setCustomerShowcase(prev => [
                        ...prev,
                        {
                          title: 'New Section Feature',
                          description: 'Feature description explaining user experience and capabilities.',
                          image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
                          bullet_points: ['Feature highlight']
                        }
                      ]);
                      addToast('Added new feature showcase card', 'success');
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Plus size={14} />
                    <span>+ Add Section Feature Card</span>
                  </button>
                </div>

                {/* Grid of Section Images */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
                  {/* Customer Experience / Showcase Items */}
                  {customerShowcase.map((item, idx) => (
                    <div
                      key={`cs-${idx}`}
                      style={{
                        background: 'var(--bg-surface)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Customer Experience · Card {String(idx + 1).padStart(2, '0')}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Remove showcase item "${item.title || 'Feature'}"?`)) {
                              setCustomerShowcase(prev => prev.filter((_, i) => i !== idx));
                              addToast('Showcase item removed', 'info');
                            }
                          }}
                          className="btn btn-outline btn-sm"
                          style={{ color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.25)', padding: '2px 6px', height: 'auto' }}
                          title="Delete Feature"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      {/* Image Preview with overlay button */}
                      <div style={{
                        position: 'relative',
                        height: '160px',
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'hidden',
                        background: '#060913',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px'
                      }}>
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title || 'Showcase Image'}
                            style={{ width: '100%', height: '100%', maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80';
                            }}
                          />
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.8rem', gap: '6px' }}>
                            <ImageIcon size={20} />
                            <span>No image set</span>
                          </div>
                        )}

                        <div style={{
                          position: 'absolute',
                          bottom: '8px',
                          right: '8px',
                          display: 'flex',
                          gap: '6px',
                          background: 'rgba(15, 23, 42, 0.9)',
                          backdropFilter: 'blur(8px)',
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-sm)'
                        }}>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveSectionImageTarget({ type: 'customer_showcase', index: idx });
                              sectionImageInputRef.current?.click();
                            }}
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: '0.72rem', padding: '4px 8px', height: 'auto', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <UploadCloud size={12} />
                            <span>Change Image</span>
                          </button>
                          {item.image && (
                            <button
                              type="button"
                              onClick={() => {
                                const next = [...customerShowcase];
                                next[idx] = { ...next[idx], image: '' };
                                setCustomerShowcase(next);
                                addToast('Image cleared', 'info');
                              }}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.72rem', padding: '4px 6px', height: 'auto', color: '#f43f5e' }}
                              title="Clear Image"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Title & Image URL inputs */}
                      <input
                        type="text"
                        value={item.title || ''}
                        onChange={(e) => {
                          const next = [...customerShowcase];
                          next[idx] = { ...next[idx], title: e.target.value };
                          setCustomerShowcase(next);
                        }}
                        placeholder="Feature Title (e.g. Frictionless Booking)"
                        className="ab-input"
                        style={{ fontWeight: 700, fontSize: '0.85rem' }}
                      />
                      <input
                        type="text"
                        value={item.image || ''}
                        onChange={(e) => {
                          const next = [...customerShowcase];
                          next[idx] = { ...next[idx], image: e.target.value };
                          setCustomerShowcase(next);
                        }}
                        placeholder="Or enter image URL: https://..."
                        className="ab-input"
                        style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}
                      />
                    </div>
                  ))}

                  {/* Partner Showcase Items */}
                  {partnerShowcase.map((item, idx) => (
                    <div
                      key={`ps-${idx}`}
                      style={{
                        background: 'var(--bg-surface)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Partner Flow · Card {String(idx + 1).padStart(2, '0')}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Remove partner item "${item.title || 'Feature'}"?`)) {
                              setPartnerShowcase(prev => prev.filter((_, i) => i !== idx));
                              addToast('Partner item removed', 'info');
                            }
                          }}
                          className="btn btn-outline btn-sm"
                          style={{ color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.25)', padding: '2px 6px', height: 'auto' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <div style={{
                        position: 'relative',
                        height: '160px',
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'hidden',
                        background: '#060913',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px'
                      }}>
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title || 'Partner Image'}
                            style={{ width: '100%', height: '100%', maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80';
                            }}
                          />
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.8rem', gap: '6px' }}>
                            <ImageIcon size={20} />
                            <span>No image set</span>
                          </div>
                        )}

                        <div style={{
                          position: 'absolute',
                          bottom: '8px',
                          right: '8px',
                          display: 'flex',
                          gap: '6px',
                          background: 'rgba(15, 23, 42, 0.9)',
                          backdropFilter: 'blur(8px)',
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-sm)'
                        }}>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveSectionImageTarget({ type: 'partner_showcase', index: idx });
                              sectionImageInputRef.current?.click();
                            }}
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: '0.72rem', padding: '4px 8px', height: 'auto', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <UploadCloud size={12} />
                            <span>Change Image</span>
                          </button>
                        </div>
                      </div>

                      <input
                        type="text"
                        value={item.title || ''}
                        onChange={(e) => {
                          const next = [...partnerShowcase];
                          next[idx] = { ...next[idx], title: e.target.value };
                          setPartnerShowcase(next);
                        }}
                        placeholder="Feature Title"
                        className="ab-input"
                        style={{ fontWeight: 700, fontSize: '0.85rem' }}
                      />
                      <input
                        type="text"
                        value={item.image || ''}
                        onChange={(e) => {
                          const next = [...partnerShowcase];
                          next[idx] = { ...next[idx], image: e.target.value };
                          setPartnerShowcase(next);
                        }}
                        placeholder="Direct image URL: https://..."
                        className="ab-input"
                        style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Product Carousel & Multi-Image Gallery */}
              <div style={{
                marginTop: '2rem',
                padding: '1.5rem',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                        Product Image Gallery & Screenshots
                      </h3>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        background: 'rgba(99, 102, 241, 0.15)',
                        color: 'var(--primary)',
                        border: '1px solid rgba(99, 102, 241, 0.3)'
                      }}>
                        {mediaList.length} image{mediaList.length === 1 ? '' : 's'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                      Upload multiple images simultaneously. Users can swipe through or click any image to view the high-resolution lightbox.
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => multiGalleryInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="btn btn-primary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
                    >
                      <UploadCloud size={15} />
                      <span>{uploadingImage ? 'Uploading Images...' : '+ Upload Multiple Images'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMediaList([...mediaList, { media_url: '', caption: `Screenshot ${mediaList.length + 1}`, media_type: 'image' }])}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Plus size={14} />
                      <span>Add via URL</span>
                    </button>

                    {mediaList.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Are you sure you want to remove all ${mediaList.length} gallery images?`)) {
                            setMediaList([]);
                            addToast('Gallery cleared', 'info');
                          }
                        }}
                        className="btn btn-outline btn-sm"
                        style={{ color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        title="Delete All Gallery Images"
                      >
                        <Trash2 size={13} />
                        <span>Clear All</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Gallery Items List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {mediaList.length === 0 ? (
                    <div
                      onClick={() => multiGalleryInputRef.current?.click()}
                      style={{
                        padding: '2.5rem 1.5rem',
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: 'var(--radius-md)',
                        border: '2px dashed var(--border-medium)',
                        cursor: 'pointer',
                        transition: 'border-color 0.2s'
                      }}
                    >
                      <UploadCloud size={36} color="var(--primary)" style={{ margin: '0 auto 8px', opacity: 0.8 }} />
                      <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', margin: '0 0 4px' }}>
                        No gallery images added yet
                      </p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                        Click here or use the <strong>"+ Upload Multiple Images"</strong> button to select screenshots from your computer.
                      </p>
                    </div>
                  ) : (
                    mediaList.map((m, idx) => {
                      const itemFileRef = `gallery-file-${idx}`;
                      return (
                        <div
                          key={idx}
                          className="ab-item-row"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-subtle)',
                            padding: '10px 14px',
                            borderRadius: 'var(--radius-md)'
                          }}
                        >
                          {/* Hidden single file replacer */}
                          <input
                            type="file"
                            id={itemFileRef}
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={async (e) => {
                              if (e.target.files && e.target.files[0]) {
                                const file = e.target.files[0];
                                const reader = new FileReader();
                                reader.onload = (rev) => {
                                  const updated = [...mediaList];
                                  updated[idx].media_url = rev.target.result;
                                  setMediaList(updated);
                                  addToast('Gallery image replaced', 'success');
                                };
                                reader.readAsDataURL(file);
                              }
                              e.target.value = '';
                            }}
                          />

                          {/* Thumbnail Preview */}
                          <div style={{
                            width: '80px',
                            height: '56px',
                            borderRadius: 'var(--radius-sm)',
                            overflow: 'hidden',
                            background: '#0a0e1a',
                            border: '1px solid var(--border-subtle)',
                            flexShrink: 0,
                            position: 'relative'
                          }}>
                            {m.media_url ? (
                              <img
                                src={m.media_url}
                                alt={m.caption || `Image ${idx + 1}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=200&q=80';
                                }}
                              />
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: 'var(--text-muted)' }}>
                                <ImageIcon size={18} />
                              </div>
                            )}
                          </div>

                          {/* Inputs: URL & Caption */}
                          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div>
                              <label style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                                Image Caption / Title
                              </label>
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
                                style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                              />
                            </div>

                            <div>
                              <label style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                                Image URL / Path
                              </label>
                              <input
                                type="text"
                                value={m.media_url || ''}
                                onChange={(e) => {
                                  const updated = [...mediaList];
                                  updated[idx].media_url = e.target.value;
                                  setMediaList(updated);
                                }}
                                placeholder="https://... or data:image/..."
                                className="ab-input"
                                style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                              />
                            </div>
                          </div>

                          {/* Actions: Replace, Make Hero, Delete */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                            <button
                              type="button"
                              onClick={() => {
                                const el = document.getElementById(itemFileRef);
                                if (el) el.click();
                              }}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.72rem', padding: '4px 8px' }}
                              title="Change / Replace Image File"
                            >
                              <UploadCloud size={13} />
                              <span>Change</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (m.media_url) {
                                  setProduct(prev => ({ ...prev, hero_image: m.media_url, thumbnail: prev.thumbnail || m.media_url }));
                                  addToast('Set as product primary hero image!', 'success');
                                }
                              }}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.72rem', padding: '4px 8px' }}
                              title="Make this image the primary Hero image"
                            >
                              <span>Set as Hero</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setMediaList(mediaList.filter((_, i) => i !== idx));
                                addToast('Gallery image removed', 'info');
                              }}
                              className="btn btn-outline btn-sm"
                              style={{ color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)', padding: '5px 8px' }}
                              title="Delete this image"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LINKS & DELIVERABLES */}
          {activeTab === 'links' && (
            <div>
              {/* Hidden file input for video poster */}
              <input
                type="file"
                ref={videoPosterInputRef}
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleImageFileUpload(e.target.files[0], 'video_thumbnail');
                  }
                  e.target.value = '';
                }}
                style={{ display: 'none' }}
              />

              {/* 1. CUSTOM LIVE DEMO LINKS BUILDER */}
              <div style={{
                background: 'var(--bg-surface-elevated)',
                padding: '1.5rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                marginBottom: '2rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <LinkIcon size={18} color="var(--primary)" />
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                        Product Live Demo Links & Interactive Previews
                      </h3>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                      Add live demo buttons with any custom label (e.g. "App Demo Link", "Customer App", "Web App Preview", "Admin Portal").
                      These render as prominent, working action buttons on the storefront.
                    </p>
                  </div>

                  {/* Section Visibility Toggle */}
                  {(() => {
                    const demoSec = sections.find(s => s.section_type === 'demo');
                    const isDemoVisible = demoSec ? (demoSec.is_visible === 1 || demoSec.is_visible === true) : (product.show_demo_links !== 0);
                    return (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        background: 'var(--bg-surface)',
                        padding: '8px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)'
                      }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            Show Demo Links on Storefront
                          </div>
                          <div style={{ fontSize: '0.72rem', color: isDemoVisible ? '#10b981' : '#f43f5e', fontWeight: 600 }}>
                            {isDemoVisible ? 'Visible to Users' : 'Hidden from Users'}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleSectionTypeVisibility('demo')}
                          style={{
                            width: '42px',
                            height: '22px',
                            borderRadius: '9999px',
                            background: isDemoVisible ? 'var(--primary)' : 'rgba(255,255,255,0.15)',
                            border: 'none',
                            position: 'relative',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                            padding: 0,
                            flexShrink: 0
                          }}
                          title={isDemoVisible ? "Click to hide demo links on storefront" : "Click to show demo links on storefront"}
                        >
                          <span
                            style={{
                              position: 'absolute',
                              top: '3px',
                              left: isDemoVisible ? '23px' : '3px',
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              background: '#fff',
                              transition: 'left 0.2s',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.4)'
                            }}
                          />
                        </button>
                      </div>
                    );
                  })()}
                </div>

                {/* Quick Presets & Add Button */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '1.25rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Quick Presets:</span>
                    {[
                      'App Demo Link',
                      'Customer App Demo',
                      'Partner / Provider Panel',
                      'Admin Dashboard Demo',
                      'Web App Demo',
                      'Live Documentation'
                    ].map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleAddDemoLink(preset)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '3px 9px', fontSize: '0.72rem' }}
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddDemoLink('App Demo Link')}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
                  >
                    <Plus size={14} />
                    <span>+ Add Custom Demo Link</span>
                  </button>
                </div>

                {/* List of Custom Demo Links */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {demoLinks.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-medium)' }}>
                      <Globe size={28} style={{ margin: '0 auto 6px', opacity: 0.5 }} />
                      <p style={{ margin: 0, fontWeight: 600 }}>No demo links added yet.</p>
                      <p style={{ fontSize: '0.78rem', margin: '4px 0 0', color: 'var(--text-secondary)' }}>
                        Click "+ Add Custom Demo Link" above to configure your app demo or live preview.
                      </p>
                    </div>
                  ) : (
                    demoLinks.map((demo, idx) => (
                      <div
                        key={demo.id || idx}
                        className="ab-item-row"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-subtle)',
                          padding: '12px 14px',
                          borderRadius: 'var(--radius-md)',
                          opacity: demo.is_visible ? 1 : 0.6
                        }}
                      >
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)', minWidth: '24px' }}>
                          #{idx + 1}
                        </span>

                        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '10px' }}>
                          <div>
                            <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>
                              Button Name / Label on Storefront *
                            </label>
                            <input
                              type="text"
                              value={demo.label || ''}
                              onChange={(e) => handleDemoLinkChange(idx, 'label', e.target.value)}
                              placeholder="e.g. App Demo Link, Customer App, Live Preview"
                              className="ab-input"
                              style={{ fontWeight: 600 }}
                              required
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>
                              Demo URL Link *
                            </label>
                            <input
                              type="url"
                              value={demo.url || ''}
                              onChange={(e) => handleDemoLinkChange(idx, 'url', e.target.value)}
                              placeholder="https://app.demo.rollixia.com"
                              className="ab-input"
                              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}
                              required
                            />
                          </div>
                        </div>

                        {/* Individual link visibility toggle */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                          <button
                            type="button"
                            onClick={() => handleDemoLinkChange(idx, 'is_visible', !demo.is_visible)}
                            style={{
                              width: '36px',
                              height: '20px',
                              borderRadius: '9999px',
                              background: demo.is_visible ? 'var(--primary)' : 'rgba(255,255,255,0.15)',
                              border: 'none',
                              position: 'relative',
                              cursor: 'pointer',
                              transition: 'background 0.2s',
                              padding: 0
                            }}
                            title={demo.is_visible ? "Active on storefront" : "Hidden on storefront"}
                          >
                            <span
                              style={{
                                position: 'absolute',
                                top: '2px',
                                left: demo.is_visible ? '18px' : '2px',
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                background: '#fff',
                                transition: 'left 0.2s',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.4)'
                              }}
                            />
                          </button>

                          {demo.url && (
                            <a
                              href={demo.url}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '6px 8px', display: 'inline-flex', alignItems: 'center' }}
                              title="Test URL in new tab"
                            >
                              <ExternalLink size={13} />
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteDemoLink(idx)}
                            className="btn btn-outline btn-sm"
                            style={{ color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)', padding: '6px 8px' }}
                            title="Delete Demo Link"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 2. PRODUCT VIDEO WALKTHROUGH CONFIGURATION & LIVE PLAYER */}
              <div style={{
                background: 'var(--bg-surface-elevated)',
                padding: '1.5rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                marginBottom: '2rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Video size={18} color="var(--primary)" />
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                        Product Video Walkthrough & Responsive Player
                      </h3>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                      Enter a video link (YouTube, Vimeo, Loom, or MP4 URL). The frontend automatically embeds the player and renders a "Watch Video Demo" button on the storefront.
                    </p>
                  </div>

                  {/* Video Section Storefront Toggle */}
                  {(() => {
                    const videoSec = sections.find(s => s.section_type === 'video');
                    const isVidVisible = videoSec ? (videoSec.is_visible === 1 || videoSec.is_visible === true) : (product.is_video_visible !== 0);
                    return (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        background: 'var(--bg-surface)',
                        padding: '8px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)'
                      }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            Show Video on Storefront
                          </div>
                          <div style={{ fontSize: '0.72rem', color: isVidVisible ? '#10b981' : '#f43f5e', fontWeight: 600 }}>
                            {isVidVisible ? 'Visible to Users' : 'Hidden from Users'}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleSectionTypeVisibility('video')}
                          style={{
                            width: '42px',
                            height: '22px',
                            borderRadius: '9999px',
                            background: isVidVisible ? 'var(--primary)' : 'rgba(255,255,255,0.15)',
                            border: 'none',
                            position: 'relative',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                            padding: 0,
                            flexShrink: 0
                          }}
                          title={isVidVisible ? "Click to hide video section on storefront" : "Click to show video section on storefront"}
                        >
                          <span
                            style={{
                              position: 'absolute',
                              top: '3px',
                              left: isVidVisible ? '23px' : '3px',
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              background: '#fff',
                              transition: 'left 0.2s',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.4)'
                            }}
                          />
                        </button>
                      </div>
                    );
                  })()}
                </div>

                <div className="ab-form-grid" style={{ gap: '1rem', marginBottom: '1.25rem' }}>
                  <div className="ab-form-group" style={{ gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label className="ab-form-label" style={{ margin: 0 }}>Product Video URL *</label>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Supported: YouTube, YouTube Shorts, Vimeo, Loom, direct MP4
                      </span>
                    </div>
                    <input
                      type="url"
                      value={product.video_url || ''}
                      onChange={(e) => setProduct(prev => ({ ...prev, video_url: e.target.value }))}
                      placeholder="https://www.youtube.com/watch?v=... OR https://vimeo.com/... OR https://www.loom.com/share/... OR https://.../video.mp4"
                      className="ab-input"
                      style={{ fontFamily: 'var(--font-mono)' }}
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
                    <label className="ab-form-label">Video Player Type</label>
                    <select
                      value={product.video_type || 'auto'}
                      onChange={(e) => setProduct(prev => ({ ...prev, video_type: e.target.value }))}
                      className="ab-select"
                    >
                      <option value="auto">Auto-Detect Provider</option>
                      <option value="youtube">YouTube Embed</option>
                      <option value="vimeo">Vimeo Player</option>
                      <option value="loom">Loom Embed</option>
                      <option value="mp4">Direct MP4 HTML5 Video</option>
                    </select>
                  </div>

                  <div className="ab-form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="ab-form-label">Video Short Description</label>
                    <input
                      type="text"
                      value={product.video_description || ''}
                      onChange={(e) => setProduct(prev => ({ ...prev, video_description: e.target.value }))}
                      placeholder="Watch the comprehensive video walkthrough to explore key features and user flows."
                      className="ab-input"
                    />
                  </div>

                  <div className="ab-form-group" style={{ gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label className="ab-form-label" style={{ margin: 0 }}>Video Poster / Custom Thumbnail</label>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => videoPosterInputRef.current?.click()}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                        >
                          <UploadCloud size={12} /> Upload Poster File
                        </button>
                        {product.video_thumbnail && (
                          <button
                            type="button"
                            onClick={() => setProduct(prev => ({ ...prev, video_thumbnail: '' }))}
                            className="btn btn-outline btn-sm"
                            style={{ color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)', padding: '3px 8px', fontSize: '0.72rem' }}
                          >
                            Remove Poster
                          </button>
                        )}
                      </div>
                    </div>
                    <input
                      type="text"
                      value={product.video_thumbnail || ''}
                      onChange={(e) => setProduct(prev => ({ ...prev, video_thumbnail: e.target.value }))}
                      placeholder="https://... or upload a thumbnail above"
                      className="ab-input"
                      style={{ fontSize: '0.8rem' }}
                    />
                  </div>
                </div>

                {/* LIVE EMBEDDED VIDEO PREVIEW PLAYER */}
                {(() => {
                  const parsed = parseAdminVideoUrl(product.video_url);
                  return (
                    <div style={{
                      marginTop: '1rem',
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Play size={15} color="var(--primary)" />
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            Live Video Player Preview
                          </span>
                        </div>
                        {parsed && (
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: '#10b981',
                            border: '1px solid rgba(16, 185, 129, 0.3)'
                          }}>
                            {parsed.provider.toUpperCase()} DETECTED & READY
                          </span>
                        )}
                      </div>

                      {parsed ? (
                        <div style={{
                          maxWidth: '720px',
                          margin: '0 auto',
                          borderRadius: 'var(--radius-md)',
                          overflow: 'hidden',
                          border: '1px solid var(--border-medium)',
                          background: '#000',
                          aspectRatio: '16/9',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                        }}>
                          {parsed.provider === 'youtube' || parsed.provider === 'vimeo' || parsed.provider === 'loom' || parsed.provider === 'iframe' ? (
                            <iframe
                              src={parsed.embedUrl}
                              title="Product Video Preview"
                              style={{ width: '100%', height: '100%', border: 0 }}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                            />
                          ) : (
                            <video
                              controls
                              poster={product.video_thumbnail || product.hero_image}
                              preload="metadata"
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            >
                              <source src={parsed.src} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          )}
                        </div>
                      ) : (
                        <div style={{
                          padding: '1.5rem',
                          textAlign: 'center',
                          color: 'var(--text-muted)',
                          border: '1px dashed var(--border-medium)',
                          borderRadius: 'var(--radius-sm)'
                        }}>
                          <Film size={28} style={{ margin: '0 auto 6px', opacity: 0.4 }} />
                          <p style={{ fontSize: '0.85rem', margin: 0 }}>
                            Enter a valid video URL above to preview and test playback here.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* 3. DIGITAL DELIVERABLE PACKAGE */}
              <div style={{
                background: 'var(--bg-surface-elevated)',
                padding: '1.5rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div className="ab-section-title" style={{ fontSize: '1.05rem', margin: '0 0 4px' }}>
                  Associated Digital Deliverable Package
                </div>
                <div className="ab-section-desc" style={{ marginBottom: '1rem' }}>
                  The archive file that customers will be authorized to download upon successful order payment.
                </div>

                <div className="ab-form-grid">
                  <div className="ab-form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="ab-form-label">Deliverable Archive File Name</label>
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
            </div>
          )}

          {/* TAB 5: SECTIONS & ORDERING (SECTION BUILDER WITH TOGGLE SWITCHES) */}
          {activeTab === 'sections' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
                <div>
                  <div className="ab-section-title">Visual Page Section Manager</div>
                  <div className="ab-section-desc">
                    Toggle visibility switches on/off to directly control what sections display on the user storefront. Reorder sections using up/down arrows.
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
                    <div
                      key={sec.section_type || idx}
                      className="ab-item-row"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-surface-elevated)',
                        border: `1px solid ${isVisible ? 'var(--border-subtle)' : 'rgba(255,255,255,0.05)'}`,
                        opacity: isVisible ? 1 : 0.6,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                        {/* Modern Toggle Switch */}
                        <button
                          type="button"
                          onClick={() => toggleSectionVisibility(idx)}
                          style={{
                            width: '42px',
                            height: '22px',
                            borderRadius: '9999px',
                            background: isVisible ? 'var(--primary)' : 'rgba(255,255,255,0.15)',
                            border: 'none',
                            position: 'relative',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                            padding: 0,
                            flexShrink: 0
                          }}
                          title={isVisible ? "Click to hide on storefront" : "Click to show on storefront"}
                        >
                          <span
                            style={{
                              position: 'absolute',
                              top: '3px',
                              left: isVisible ? '23px' : '3px',
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              background: '#fff',
                              transition: 'left 0.2s',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.4)'
                            }}
                          />
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            {String(idx + 1).padStart(2, '0')}.
                          </span>
                          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: isVisible ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                            {sec.title}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: isCustom ? '#10b981' : 'var(--primary)', fontFamily: 'var(--font-mono)', background: 'var(--bg-surface)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                            [{sec.section_type}]
                          </span>
                          <span style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            background: isVisible ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                            color: isVisible ? '#10b981' : '#f43f5e',
                            border: `1px solid ${isVisible ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`
                          }}>
                            {isVisible ? 'VISIBLE ON STOREFRONT' : 'HIDDEN FROM STOREFRONT'}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={() => jumpToSectionEditor(sec.section_type)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '5px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}
                          title="Jump directly to edit this section's content"
                        >
                          <Edit3 size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => moveSection(idx, -1)}
                          disabled={idx === 0}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '5px 8px' }}
                          title="Move Up"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveSection(idx, 1)}
                          disabled={idx === sections.length - 1}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '5px 8px' }}
                          title="Move Down"
                        >
                          <ArrowDown size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => duplicateSection(idx)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '5px 8px' }}
                          title="Duplicate Section"
                        >
                          <Copy size={13} />
                        </button>
                        {isCustom && (
                          <button
                            type="button"
                            onClick={() => deleteSection(idx)}
                            className="btn btn-outline btn-sm"
                            style={{ color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)', padding: '5px 8px' }}
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

              {/* SUB-TAB 15: After Purchase / Onboarding Experience (Section 19) */}
              {activeFeatureSubTab === 'after_purchase' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                        What Happens After You Buy? (Section 19 Timeline)
                      </h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                        Configure the post-purchase onboarding workflow steps and instructions displayed to customers.
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setAfterPurchaseSteps(defaultAfterPurchaseSteps)}
                        className="btn btn-secondary btn-sm"
                      >
                        Reset Defaults
                      </button>
                      <button
                        type="button"
                        onClick={() => setAfterPurchaseSteps([
                          ...afterPurchaseSteps,
                          {
                            step: `0${afterPurchaseSteps.length + 1}`,
                            title: 'New Step',
                            description: 'Clear description of what the buyer receives or executes next.'
                          }
                        ])}
                        className="btn btn-primary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Plus size={14} /> Add Timeline Step
                      </button>
                    </div>
                  </div>

                  <div className="ab-form-grid" style={{ marginBottom: '1.25rem' }}>
                    <div className="ab-form-group">
                      <label className="ab-form-label">Section Kicker</label>
                      <input
                        type="text"
                        value={afterPurchaseData.kicker}
                        onChange={(e) => setAfterPurchaseData(prev => ({ ...prev, kicker: e.target.value }))}
                        placeholder="Onboarding Experience"
                        className="ab-input"
                      />
                    </div>
                    <div className="ab-form-group">
                      <label className="ab-form-label">Section Heading Title</label>
                      <input
                        type="text"
                        value={afterPurchaseData.title}
                        onChange={(e) => setAfterPurchaseData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="What Happens After You Buy?"
                        className="ab-input"
                        style={{ fontWeight: 600 }}
                      />
                    </div>
                  </div>

                  <div className="ab-form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="ab-form-label">Section Subtitle</label>
                    <input
                      type="text"
                      value={afterPurchaseData.subtitle}
                      onChange={(e) => setAfterPurchaseData(prev => ({ ...prev, subtitle: e.target.value }))}
                      placeholder="Instant fulfillment with everything needed to immediately begin development."
                      className="ab-input"
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {afterPurchaseSteps.map((st, idx) => (
                      <div
                        key={idx}
                        className="ab-item-row"
                        style={{
                          flexDirection: 'column',
                          alignItems: 'stretch',
                          gap: '8px',
                          background: 'var(--bg-surface-elevated)',
                          padding: '12px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-medium)'
                        }}
                      >
                        <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr auto', gap: '8px', alignItems: 'center' }}>
                          <input
                            type="text"
                            value={st.step || `0${idx + 1}`}
                            onChange={(e) => {
                              const updated = [...afterPurchaseSteps];
                              updated[idx].step = e.target.value;
                              setAfterPurchaseSteps(updated);
                            }}
                            placeholder="01"
                            className="ab-input"
                            style={{ fontWeight: 700, textAlign: 'center' }}
                          />
                          <input
                            type="text"
                            value={st.title || ''}
                            onChange={(e) => {
                              const updated = [...afterPurchaseSteps];
                              updated[idx].title = e.target.value;
                              setAfterPurchaseSteps(updated);
                            }}
                            placeholder="Step Title (e.g. Complete Purchase)"
                            className="ab-input"
                            style={{ fontWeight: 600 }}
                          />
                          <button
                            type="button"
                            onClick={() => setAfterPurchaseSteps(afterPurchaseSteps.filter((_, i) => i !== idx))}
                            className="btn btn-outline btn-sm"
                            style={{ color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <textarea
                          rows={2}
                          value={st.description || ''}
                          onChange={(e) => {
                            const updated = [...afterPurchaseSteps];
                            updated[idx].description = e.target.value;
                            setAfterPurchaseSteps(updated);
                          }}
                          placeholder="Detailed instructions for this step..."
                          className="ab-textarea"
                          style={{ resize: 'vertical' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: FAQS, REVIEWS & SUPPORT */}
          {activeTab === 'faqs' && (
            <div>
              <div className="ab-section-title">FAQs, Verified Ratings & Customer Support</div>
              <div className="ab-section-desc">Manage buyer credibility scores, pre-sales support channels, FAQs and customer testimonials.</div>

              {/* Verified Ratings & Review Badge (Section 23) */}
              <div style={{ marginBottom: '2.5rem', padding: '16px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      Product Ratings & Verified Buyer Reviews (Section 23)
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                      Configure the rating score badge (e.g. 5.0) and verified purchaser count displayed on the page.
                    </p>
                  </div>
                </div>

                <div className="ab-form-grid" style={{ marginBottom: '1rem' }}>
                  <div className="ab-form-group">
                    <label className="ab-form-label">Rating Kicker</label>
                    <input
                      type="text"
                      value={reviewsConfig.kicker || 'Product Ratings'}
                      onChange={(e) => setReviewsConfig(prev => ({ ...prev, kicker: e.target.value }))}
                      placeholder="Product Ratings"
                      className="ab-input"
                    />
                  </div>
                  <div className="ab-form-group">
                    <label className="ab-form-label">Review Card Heading</label>
                    <input
                      type="text"
                      value={reviewsConfig.title || 'Verified Buyer Reviews'}
                      onChange={(e) => setReviewsConfig(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Verified Buyer Reviews"
                      className="ab-input"
                      style={{ fontWeight: 600 }}
                    />
                  </div>
                  <div className="ab-form-group">
                    <label className="ab-form-label">Average Rating Score (1.0 to 5.0)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      value={reviewsConfig.average_rating !== undefined ? reviewsConfig.average_rating : 5.0}
                      onChange={(e) => setReviewsConfig(prev => ({ ...prev, average_rating: parseFloat(e.target.value) || 5.0 }))}
                      className="ab-input"
                      style={{ fontWeight: 800, color: 'var(--primary)' }}
                    />
                  </div>
                  <div className="ab-form-group">
                    <label className="ab-form-label">Total Verified Ratings Count</label>
                    <input
                      type="number"
                      min="0"
                      value={reviewsConfig.review_count !== undefined ? reviewsConfig.review_count : 24}
                      onChange={(e) => setReviewsConfig(prev => ({ ...prev, review_count: parseInt(e.target.value, 10) || 0 }))}
                      className="ab-input"
                      style={{ fontWeight: 800 }}
                    />
                  </div>
                </div>

                <div className="ab-form-group">
                  <label className="ab-form-label">Subtitle Description</label>
                  <input
                    type="text"
                    value={reviewsConfig.subtitle || 'Based on verified orders and customer reviews.'}
                    onChange={(e) => setReviewsConfig(prev => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="Based on verified orders and customer reviews."
                    className="ab-input"
                  />
                </div>
              </div>

              {/* Dedicated Assistance & Support (Section 26) */}
              <div style={{ marginBottom: '2.5rem', padding: '16px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      Questions Before Purchasing? / Dedicated Assistance (Section 26)
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                      Configure pre-sales contact buttons (Email, WhatsApp Chat, and Documentation).
                    </p>
                  </div>
                </div>

                <div className="ab-form-grid" style={{ marginBottom: '1rem' }}>
                  <div className="ab-form-group">
                    <label className="ab-form-label">Support Kicker</label>
                    <input
                      type="text"
                      value={supportConfig.kicker || 'Dedicated Assistance'}
                      onChange={(e) => setSupportConfig(prev => ({ ...prev, kicker: e.target.value }))}
                      placeholder="Dedicated Assistance"
                      className="ab-input"
                    />
                  </div>
                  <div className="ab-form-group">
                    <label className="ab-form-label">Heading Title</label>
                    <input
                      type="text"
                      value={supportConfig.title || 'Questions Before Purchasing?'}
                      onChange={(e) => setSupportConfig(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Questions Before Purchasing?"
                      className="ab-input"
                      style={{ fontWeight: 600 }}
                    />
                  </div>
                  <div className="ab-form-group">
                    <label className="ab-form-label">Support Email Address</label>
                    <input
                      type="email"
                      value={supportConfig.email || ''}
                      onChange={(e) => setSupportConfig(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="e.g. support@rollixia.com"
                      className="ab-input"
                    />
                  </div>
                  <div className="ab-form-group">
                    <label className="ab-form-label">WhatsApp Contact Number (with country code)</label>
                    <input
                      type="text"
                      value={supportConfig.whatsapp || ''}
                      onChange={(e) => setSupportConfig(prev => ({ ...prev, whatsapp: e.target.value }))}
                      placeholder="e.g. +91 98765 43210"
                      className="ab-input"
                    />
                  </div>
                  <div className="ab-form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="ab-form-label">Documentation / Knowledgebase Link URL</label>
                    <input
                      type="text"
                      value={supportConfig.docs_url || ''}
                      onChange={(e) => setSupportConfig(prev => ({ ...prev, docs_url: e.target.value }))}
                      placeholder="https://docs.rollixia.com/your-product"
                      className="ab-input"
                    />
                  </div>
                </div>

                <div className="ab-form-group">
                  <label className="ab-form-label">Assistance Description Paragraph</label>
                  <textarea
                    rows={2}
                    value={supportConfig.description || ''}
                    onChange={(e) => setSupportConfig(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Have a pre-sale question or need custom architecture assistance? Our engineering team is ready to help."
                    className="ab-textarea"
                  />
                </div>
              </div>

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
