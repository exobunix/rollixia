import { FALLBACK_PRODUCTS, FALLBACK_CATEGORIES } from './fallbackCatalog.js';
import { storeDeliverableBlob } from '../utils/fileStorage.js';
import { syncProductImageToStorage } from '../utils/imageCompressor.js';

// Local storage keys for persistent admin actions
const STORAGE_KEYS = {
  PRODUCTS: 'rollixia_admin_products',
  FILES: 'rollixia_admin_files',
  REVIEWS: 'rollixia_admin_reviews',
  ORDERS: 'rollixia_orders',
  COUPONS: 'rollixia_admin_coupons',
  SETTINGS: 'rollixia_admin_settings',
  CUSTOMERS: 'rollixia_admin_customers',
  LOGS: 'rollixia_admin_logs'
};

function getStored(key, defaultVal) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
}

function setStored(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.warn(`[adminFallbackService] Failed to set ${key} in localStorage:`, e);
    // If quota exceeded and saving products, prune down to only modified items
    if (key === STORAGE_KEYS.PRODUCTS && Array.isArray(val)) {
      try {
        const deltaOnly = val.filter(p => p && (
          (p.hero_image && !p.hero_image.endsWith('-cover.svg')) ||
          p.hero_secondary_image ||
          p.demo_links ||
          p.updated_at
        ));
        localStorage.setItem(key, JSON.stringify(deltaOnly.length > 0 ? deltaOnly : val.slice(0, 2)));
      } catch (quotaErr) {
        console.error('[adminFallbackService] Critical LocalStorage full:', quotaErr);
      }
    }
  }
}

function extractFormValue(body, key) {
  if (!body) return null;
  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    return body.get(key);
  }
  return body[key];
}

function extractFormFile(body) {
  if (!body) return null;
  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    return body.get('file') || body.get('package') || null;
  }
  return body.file || body.package || null;
}

// 1. Initial Pre-seeded Deliverable Files
function getInitialFiles() {
  return FALLBACK_PRODUCTS.map((p, idx) => ({
    id: p.id || (100 + idx),
    product_id: p.id,
    product_title: p.title,
    product_slug: p.slug,
    file_name: `${p.slug || 'product'}-v${p.version || '1.0.0'}.zip`,
    file_size: 14500000 + (idx * 3200000),
    version: p.version || '1.0.0',
    changelog: 'Production master release: Source code, documentation, production bundle, and commercial license assets.',
    download_count: (p.sales_count || 10) * 3,
    created_at: new Date(Date.now() - (idx + 1) * 86400000 * 2).toISOString()
  }));
}

// 2. Initial Pre-seeded Customer Reviews Queue
function getInitialReviews() {
  const reviewsSeed = [
    { id: 1, product_title: 'Apex — Enterprise SaaS Next.js 14 Template', rating: 5, title: 'Outstanding template & code quality', comment: 'Saved our engineering team at least 3 months of boilerplate work. The auth flows and responsive dashboards are top notch.', author_name: 'Rahul Sharma', author_email: 'rahul@matrixtech.io', status: 'approved', is_featured: 1, created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: 2, product_title: 'Lumina 3D — Photorealistic Glassmorphic UI Kit', rating: 5, title: 'Breathtaking 3D assets', comment: 'The frosted glass refractions and Blender scene files look ultra premium on our new hero section.', author_name: 'Vikram Mehta', author_email: 'vikram.m@designstudio.in', status: 'approved', is_featured: 1, created_at: new Date(Date.now() - 172800000).toISOString() },
    { id: 3, product_title: 'Pulse UI — Fintech & Mobile Banking Design System', rating: 5, title: 'Remarkable Figma tokens and structure', comment: 'Every financial screen state (KYC, crypto wallets, statements) is meticulously designed. Essential tool for mobile builders.', author_name: 'Sarah Jenkins', author_email: 'sjenkins@finpay.co', status: 'approved', is_featured: 1, created_at: new Date(Date.now() - 259200000).toISOString() },
    { id: 4, product_title: 'Nexus DevTools — Developer Productivity Suite', rating: 5, title: '10x productivity booster', comment: 'The API visualizer and regex debugger are indispensable for our engineers daily work.', author_name: 'Devon Vance', author_email: 'devon.v@cloudscale.net', status: 'approved', is_featured: 0, created_at: new Date(Date.now() - 345600000).toISOString() },
    { id: 5, product_title: 'Aura Icons — 4,000+ Multi-Style Vector Glyphs', rating: 5, title: 'Crisp at any resolution', comment: 'Sharp, clean vector glyphs across all 5 styles. Replaced our entire icon system with Aura.', author_name: 'Priya Sharma', author_email: 'priya.s@techpulse.org', status: 'approved', is_featured: 1, created_at: new Date(Date.now() - 432000000).toISOString() },
    { id: 6, product_title: 'Zenith — Minimalist Personal Portfolio & Blog', rating: 5, title: 'Score 100 on PageSpeed Insights', comment: 'Blazing fast performance, clean MDX blog, and dark mode out of the box. Absolutely worth every rupee.', author_name: 'Marcus Chen', author_email: 'marcus@chencreative.com', status: 'approved', is_featured: 0, created_at: new Date(Date.now() - 518400000).toISOString() },
    { id: 7, product_title: 'CyberPulse — Sci-Fi Gaming HUD & Stream Overlay', rating: 4, title: 'Incredible futuristic animations', comment: 'Used this for our Twitch tournament stream overlays. Viewers loved the high-tech holographic widgets.', author_name: 'Alex Rivera', author_email: 'alex.rivera@esports.gg', status: 'approved', is_featured: 0, created_at: new Date(Date.now() - 604800000).toISOString() },
    { id: 8, product_title: 'Nova — AI Prompt Engineering & Workflow Kit', rating: 5, title: 'Supercharged our LLM pipeline', comment: 'The structured chain-of-thought prompts and system message recipes boosted our model output accuracy substantially.', author_name: 'Elena Rostova', author_email: 'elena@novalabs.ai', status: 'approved', is_featured: 0, created_at: new Date(Date.now() - 691200000).toISOString() },
    { id: 9, product_title: 'HyperDrive — React 19 Fullstack SaaS Boilerplate', rating: 5, title: 'Modern tech stack with zero fluff', comment: 'App Router, Server Actions, Stripe, and Postgres already wired together. Deployed our MVP in 48 hours.', author_name: 'Kavita Rao', author_email: 'kavita@synthetix.io', status: 'pending', is_featured: 0, created_at: new Date(Date.now() - 7200000).toISOString() },
    { id: 10, product_title: 'CryptoFlow — Real-Time Web3 Trading Terminal', rating: 4, title: 'Real-time charting handles high volume', comment: 'Websocket trade feeds and candlestick indicators are smooth and performant.', author_name: 'Julian Thorne', author_email: 'julian@blocktrader.io', status: 'pending', is_featured: 0, created_at: new Date(Date.now() - 14400000).toISOString() },
    { id: 11, product_title: 'Genesis — 3D Low-Poly Game Environments', rating: 5, title: 'Ready for Unity & Unreal Engine 5', comment: 'Prefabs and materials are organized cleanly. Saved us weeks in level design for our indie game.', author_name: 'David Miller', author_email: 'david@pixelcraft.dev', status: 'approved', is_featured: 0, created_at: new Date(Date.now() - 864000000).toISOString() },
    { id: 12, product_title: 'Velox — High-Converting SaaS Landing Pages', rating: 5, title: 'Our conversion rate jumped 42%', comment: 'The copywriting framework and micro-interactions on the pricing tiers are genius.', author_name: 'Ananya Sengupta', author_email: 'ananya@growthscale.com', status: 'approved', is_featured: 0, created_at: new Date(Date.now() - 950400000).toISOString() },
    { id: 13, product_title: 'Titan — Design System for Enterprise Web Apps', rating: 5, title: 'Enterprise grade accessibility', comment: 'All components meet WCAG AAA standards. Tokens export effortlessly to Tailwind and CSS Modules.', author_name: 'Michael Zhang', author_email: 'mzhang@enterpriseui.org', status: 'approved', is_featured: 0, created_at: new Date(Date.now() - 1036800000).toISOString() },
    { id: 14, product_title: 'SoundWave — Lo-Fi Audio Samples & Synth Presets', rating: 5, title: 'Authentic analog warmth', comment: 'The tape-saturated chords and drum one-shots sound lush and ready for mixdown.', author_name: 'Chris Evans', author_email: 'chris@beatmaster.fm', status: 'approved', is_featured: 0, created_at: new Date(Date.now() - 1123200000).toISOString() },
    { id: 15, product_title: 'SaaS Metrics — CFO Analytics Dashboard Kit', rating: 4, title: 'Comprehensive churn and MRR projections', comment: 'Very easy to plug in Stripe Webhook revenue data and forecast cash flow.', author_name: 'Jessica Taylor', author_email: 'jtaylor@cfoinsights.com', status: 'pending', is_featured: 0, created_at: new Date(Date.now() - 21600000).toISOString() },
    { id: 16, product_title: 'Mockup Studio — Photorealistic Device Mockups', rating: 5, title: 'Stunning App Store presentation assets', comment: 'High resolution PSD and Figma smart objects with dynamic shadows. Looks incredible on our product hunt page.', author_name: 'Amitabh Joshi', author_email: 'amitabh@brandcraft.agency', status: 'rejected', is_featured: 0, created_at: new Date(Date.now() - 1209600000).toISOString() }
  ];
  return reviewsSeed;
}

// 3. Initial Pre-seeded Customers
function getInitialCustomers() {
  return [
    { id: 1, full_name: 'Alex Morgan', email: 'alex@example.com', total_orders: 4, total_spent: 12496, status: 'active', joined_at: '2026-01-15T08:30:00.000Z' },
    { id: 2, full_name: 'Sarah Jenkins', email: 'sjenkins@finpay.co', total_orders: 3, total_spent: 9997, status: 'active', joined_at: '2026-02-01T11:20:00.000Z' },
    { id: 3, full_name: 'Devon Vance', email: 'devon.v@cloudscale.net', total_orders: 2, total_spent: 7498, status: 'active', joined_at: '2026-02-18T14:45:00.000Z' },
    { id: 4, full_name: 'Priya Sharma', email: 'priya.s@techpulse.org', total_orders: 3, total_spent: 6997, status: 'active', joined_at: '2026-03-05T09:15:00.000Z' },
    { id: 5, full_name: 'Marcus Chen', email: 'marcus@chencreative.com', total_orders: 2, total_spent: 5998, status: 'active', joined_at: '2026-04-10T16:00:00.000Z' },
    { id: 6, full_name: 'Rahul Sharma', email: 'rahul@matrixtech.io', total_orders: 5, total_spent: 18495, status: 'active', joined_at: '2026-05-22T10:30:00.000Z' },
    { id: 7, full_name: 'Elena Rostova', email: 'elena@novalabs.ai', total_orders: 2, total_spent: 4998, status: 'active', joined_at: '2026-06-12T13:10:00.000Z' },
    { id: 8, full_name: 'Julian Thorne', email: 'julian@blocktrader.io', total_orders: 1, total_spent: 2499, status: 'active', joined_at: '2026-07-04T17:40:00.000Z' }
  ];
}

// 4. Initial Pre-seeded Coupons
function getInitialCoupons() {
  return [
    { id: 1, code: 'LAUNCH50', discount_type: 'percentage', discount_value: 50, min_order_amount: 1499, max_discount_amount: 5000, usage_limit: 500, usage_count: 142, is_active: 1, created_at: '2026-01-01T00:00:00.000Z' },
    { id: 2, code: 'SAVE20', discount_type: 'percentage', discount_value: 20, min_order_amount: 999, max_discount_amount: 2000, usage_limit: 1000, usage_count: 89, is_active: 1, created_at: '2026-02-01T00:00:00.000Z' },
    { id: 3, code: 'WELCOME10', discount_type: 'percentage', discount_value: 10, min_order_amount: 499, max_discount_amount: 1000, usage_limit: 2000, usage_count: 210, is_active: 1, created_at: '2026-03-01T00:00:00.000Z' },
    { id: 4, code: 'VIPCREATOR', discount_type: 'percentage', discount_value: 30, min_order_amount: 2499, max_discount_amount: 4000, usage_limit: 150, usage_count: 45, is_active: 1, created_at: '2026-04-15T00:00:00.000Z' }
  ];
}

// 5. Initial Pre-seeded Audit Logs
function getInitialLogs() {
  return [
    { id: 1, admin_name: 'System Administrator', action: 'UPDATE_PRODUCT', entity_type: 'Product', entity_id: '1', details: 'Updated pricing, licensing tiers, and canonical features for Apex SaaS Template', ip_address: '127.0.0.1', created_at: new Date(Date.now() - 1800000).toISOString() },
    { id: 2, admin_name: 'System Administrator', action: 'UPLOAD_FILE', entity_type: 'ProductFile', entity_id: '1', details: 'Uploaded deliverable archive apex-saas-dashboard-v2.1.0.zip (42.8 MB)', ip_address: '127.0.0.1', created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: 3, admin_name: 'System Administrator', action: 'APPROVE_REVIEW', entity_type: 'Review', entity_id: '1', details: 'Approved 5-star customer review from Rahul Sharma and pinned to hero', ip_address: '127.0.0.1', created_at: new Date(Date.now() - 7200000).toISOString() },
    { id: 4, admin_name: 'System Administrator', action: 'CREATE_COUPON', entity_type: 'Coupon', entity_id: '1', details: 'Created flash deal promotion coupon LAUNCH50 (50% discount)', ip_address: '127.0.0.1', created_at: new Date(Date.now() - 14400000).toISOString() },
    { id: 5, admin_name: 'System Administrator', action: 'UPDATE_SETTINGS', entity_type: 'StoreSettings', entity_id: '1', details: 'Configured live payment provider credentials and tax rate to 18%', ip_address: '127.0.0.1', created_at: new Date(Date.now() - 28800000).toISOString() },
    { id: 6, admin_name: 'System Administrator', action: 'LOGIN', entity_type: 'AdminUser', entity_id: '1', details: 'Super Admin successfully authenticated from Chrome on Windows', ip_address: '127.0.0.1', created_at: new Date(Date.now() - 43200000).toISOString() }
  ];
}

// --- Handler Functions ---

export function getFallbackAdminDashboard() {
  const products = getStored(STORAGE_KEYS.PRODUCTS, FALLBACK_PRODUCTS);
  const orders = getStored(STORAGE_KEYS.ORDERS, []);

  let totalSales = 0;
  let totalOrderCount = 420;
  orders.forEach(o => {
    totalSales += (o.order?.total_amount || 0);
    totalOrderCount += 1;
  });

  const baseRevenue = 1245800 + totalSales;

  return {
    kpis: {
      todaySales: 48990,
      todayOrders: 18,
      totalRevenue: baseRevenue,
      totalOrders: totalOrderCount,
      customers: 388 + orders.length,
      downloads: 1420 + orders.length * 2,
      conversionRate: '4.2'
    },
    revenueChart: [
      { date: 'Aug 31', revenue: 36500, orders: 12 },
      { date: 'Sep 01', revenue: 42000, orders: 15 },
      { date: 'Sep 02', revenue: 51200, orders: 19 },
      { date: 'Sep 03', revenue: 39800, orders: 14 },
      { date: 'Sep 04', revenue: 64500, orders: 23 },
      { date: 'Sep 05', revenue: 58000, orders: 21 },
      { date: 'Sep 06', revenue: 48990, orders: 18 }
    ],
    topProducts: products.slice(0, 5).map(p => ({
      id: p.id,
      title: p.title,
      sales_count: p.sales_count || 45,
      total_revenue: (p.sales_count || 45) * (p.sale_price || p.regular_price || 2499)
    })),
    recentOrders: [
      ...orders.slice(0, 5).map(o => ({
        id: o.order?.id || Date.now(),
        order_number: o.order?.order_number || 'ORD-ROX-001',
        customer_name: o.order?.customer_name || 'Valued Customer',
        total_amount: o.order?.total_amount || 2499,
        payment_status: o.order?.payment_status || 'paid',
        order_status: o.order?.order_status || 'completed',
        created_at: o.order?.created_at || new Date().toISOString()
      })),
      { id: 9824, order_number: 'ORD-ROX-9824', customer_name: 'Alex Morgan', total_amount: 3499, payment_status: 'paid', order_status: 'completed', created_at: new Date(Date.now() - 3600000).toISOString() },
      { id: 9823, order_number: 'ORD-ROX-9823', customer_name: 'Sarah Jenkins', total_amount: 2499, payment_status: 'paid', order_status: 'completed', created_at: new Date(Date.now() - 7200000).toISOString() },
      { id: 9822, order_number: 'ORD-ROX-9822', customer_name: 'Devon Vance', total_amount: 4999, payment_status: 'paid', order_status: 'completed', created_at: new Date(Date.now() - 14400000).toISOString() },
      { id: 9821, order_number: 'ORD-ROX-9821', customer_name: 'Priya Sharma', total_amount: 1499, payment_status: 'paid', order_status: 'completed', created_at: new Date(Date.now() - 28800000).toISOString() },
      { id: 9820, order_number: 'ORD-ROX-9820', customer_name: 'Marcus Chen', total_amount: 3999, payment_status: 'paid', order_status: 'completed', created_at: new Date(Date.now() - 43200000).toISOString() }
    ].slice(0, 8)
  };
}

export function getFallbackAdminProducts(queryStr = '') {
  const stored = getStored(STORAGE_KEYS.PRODUCTS, []);
  const map = new Map();
  FALLBACK_PRODUCTS.forEach(p => map.set(String(p.id), { ...p }));
  if (Array.isArray(stored)) {
    stored.forEach(p => {
      if (p && p.id) {
        const key = String(p.id);
        const existing = map.get(key) || {};
        map.set(key, { ...existing, ...p });
      }
    });
  }
  const customProducts = Array.from(map.values());

  const params = new URLSearchParams(queryStr.replace(/^\?/, ''));
  const q = (params.get('q') || '').toLowerCase().trim();
  const badge = params.get('badge');
  const status = params.get('status');

  let filtered = customProducts.filter(p => {
    if (badge && p.badge !== badge) return false;
    if (status && status !== 'all' && p.status !== status) return false;
    if (q) {
      const match = (
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.short_description && p.short_description.toLowerCase().includes(q))
      );
      if (!match) return false;
    }
    return true;
  });

  return {
    products: filtered,
    total: filtered.length
  };
}

export function getFallbackAdminFiles() {
  const stored = getStored(STORAGE_KEYS.FILES, null);
  if (stored && Array.isArray(stored) && stored.length > 0) {
    return stored;
  }
  const initial = getInitialFiles();
  setStored(STORAGE_KEYS.FILES, initial);
  return initial;
}

export function getFallbackAdminReviews(queryStr = '') {
  let stored = getStored(STORAGE_KEYS.REVIEWS, null);
  if (!stored || !Array.isArray(stored) || stored.length === 0) {
    stored = getInitialReviews();
    setStored(STORAGE_KEYS.REVIEWS, stored);
  }

  const params = new URLSearchParams(queryStr.replace(/^\?/, ''));
  const status = params.get('status');

  if (status && status !== 'all') {
    return stored.filter(r => r.status === status);
  }
  return stored;
}

export function getFallbackAdminOrders(queryStr = '') {
  const localOrders = getStored(STORAGE_KEYS.ORDERS, []);
  const preSeeded = [
    { id: 9824, order_number: 'ORD-ROX-9824', customer_name: 'Alex Morgan', customer_email: 'alex@example.com', total_amount: 3499, currency: 'INR', payment_status: 'paid', order_status: 'completed', created_at: new Date(Date.now() - 3600000).toISOString(), items_count: 1 },
    { id: 9823, order_number: 'ORD-ROX-9823', customer_name: 'Sarah Jenkins', customer_email: 'sjenkins@finpay.co', total_amount: 2499, currency: 'INR', payment_status: 'paid', order_status: 'completed', created_at: new Date(Date.now() - 7200000).toISOString(), items_count: 1 },
    { id: 9822, order_number: 'ORD-ROX-9822', customer_name: 'Devon Vance', customer_email: 'devon.v@cloudscale.net', total_amount: 4999, currency: 'INR', payment_status: 'paid', order_status: 'completed', created_at: new Date(Date.now() - 14400000).toISOString(), items_count: 2 },
    { id: 9821, order_number: 'ORD-ROX-9821', customer_name: 'Priya Sharma', customer_email: 'priya.s@techpulse.org', total_amount: 1499, currency: 'INR', payment_status: 'paid', order_status: 'completed', created_at: new Date(Date.now() - 28800000).toISOString(), items_count: 1 },
    { id: 9820, order_number: 'ORD-ROX-9820', customer_name: 'Marcus Chen', customer_email: 'marcus@chencreative.com', total_amount: 3999, currency: 'INR', payment_status: 'paid', order_status: 'completed', created_at: new Date(Date.now() - 43200000).toISOString(), items_count: 1 },
    { id: 9819, order_number: 'ORD-ROX-9819', customer_name: 'Rahul Sharma', customer_email: 'rahul@matrixtech.io', total_amount: 18495, currency: 'INR', payment_status: 'paid', order_status: 'completed', created_at: new Date(Date.now() - 86400000).toISOString(), items_count: 3 },
    { id: 9818, order_number: 'ORD-ROX-9818', customer_name: 'Elena Rostova', customer_email: 'elena@novalabs.ai', total_amount: 4998, currency: 'INR', payment_status: 'paid', order_status: 'completed', created_at: new Date(Date.now() - 172800000).toISOString(), items_count: 2 }
  ];

  const formattedLocal = localOrders.map(o => ({
    id: o.order?.id || Date.now(),
    order_number: o.order?.order_number || 'ORD-ROX-001',
    customer_name: o.order?.customer_name || 'Valued Customer',
    customer_email: o.order?.customer_email || 'customer@example.com',
    total_amount: o.order?.total_amount || 2499,
    currency: o.order?.currency || 'INR',
    payment_status: o.order?.payment_status || 'paid',
    order_status: o.order?.order_status || 'completed',
    created_at: o.order?.created_at || new Date().toISOString(),
    items_count: (o.items && o.items.length) || 1
  }));

  const all = [...formattedLocal, ...preSeeded];

  const params = new URLSearchParams(queryStr.replace(/^\?/, ''));
  const q = (params.get('q') || '').toLowerCase().trim();
  if (q) {
    const filtered = all.filter(o =>
      o.order_number.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_email.toLowerCase().includes(q)
    );
    return { orders: filtered, total: filtered.length };
  }

  return { orders: all, total: all.length };
}

export function getFallbackAdminCustomers(queryStr = '') {
  let stored = getStored(STORAGE_KEYS.CUSTOMERS, null);
  if (!stored || !Array.isArray(stored) || stored.length === 0) {
    stored = getInitialCustomers();
    setStored(STORAGE_KEYS.CUSTOMERS, stored);
  }

  const params = new URLSearchParams(queryStr.replace(/^\?/, ''));
  const q = (params.get('q') || '').toLowerCase().trim();
  if (q) {
    return stored.filter(c =>
      c.full_name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  }
  return stored;
}

export function getFallbackAdminCoupons() {
  let stored = getStored(STORAGE_KEYS.COUPONS, null);
  if (!stored || !Array.isArray(stored) || stored.length === 0) {
    stored = getInitialCoupons();
    setStored(STORAGE_KEYS.COUPONS, stored);
  }
  return stored;
}

export function getFallbackAdminCategories() {
  return FALLBACK_CATEGORIES;
}

export function getFallbackAdminSettings() {
  const stored = getStored(STORAGE_KEYS.SETTINGS, null);
  return {
    store_name: 'Rollixia Marketplace',
    tagline: 'World-Class Digital Assets, UI Kits & Software for Creators',
    support_email: 'support@rollixia.com',
    support_phone: '+91 98765 43210',
    currency: 'INR',
    tax_rate: '18',
    max_downloads: '10',
    hero_title: 'World-Class Digital Products Built for Modern Creators',
    hero_subtitle: 'Discover production-ready templates, software, UI kits, and AI tools designed by global engineers to help you ship 10x faster.',
    announcement_banner: '⚡ FLASH SALE: Get 20% OFF everything with code SAVE20 at checkout!',
    banner_active: 'true',
    refund_policy_days: '14',
    paytm_mid: 'oCtvhv27957773497297',
    paytm_key: '',
    paytm_env: 'production',
    paytm_active: 'true',
    ...(stored || {})
  };
}

export function getFallbackAdminLogs() {
  const stored = getStored(STORAGE_KEYS.LOGS, null);
  if (stored && Array.isArray(stored) && stored.length > 0) {
    return stored;
  }
  const initial = getInitialLogs();
  setStored(STORAGE_KEYS.LOGS, initial);
  return initial;
}

// Master Router for Admin Fallback Endpoints
export function handleAdminFallbackRoute(clean, method, options = {}, requestBody = null, queryStr = '') {
  // GET admin/dashboard
  if (clean === 'admin/dashboard') {
    return getFallbackAdminDashboard();
  }

  // admin/products
  if (clean === 'admin/products') {
    if (method === 'GET') {
      return getFallbackAdminProducts(queryStr);
    }
    if (method === 'POST') {
      const products = getStored(STORAGE_KEYS.PRODUCTS, [...FALLBACK_PRODUCTS]);
      const newId = Date.now();
      const newProduct = {
        ...requestBody,
        id: newId,
        slug: requestBody?.slug || `product-${newId}`,
        sales_count: 0,
        rating_avg: 5.0,
        rating_count: 0,
        created_at: new Date().toISOString()
      };
      products.unshift(newProduct);
      setStored(STORAGE_KEYS.PRODUCTS, products);
      return { success: true, message: 'Product created successfully', productId: newId, product: newProduct };
    }
  }

  if (clean.startsWith('admin/products/') && method === 'GET') {
    let id = clean.replace(/^admin\/products\//, '');
    if (id.endsWith('/full')) id = id.replace(/\/full$/, '');
    const stored = getStored(STORAGE_KEYS.PRODUCTS, []);
    const modified = Array.isArray(stored) ? stored.find(p => String(p.id) === String(id) || p.slug === id) : null;
    const fallback = FALLBACK_PRODUCTS.find(p => String(p.id) === String(id) || p.slug === id) || FALLBACK_PRODUCTS[0];
    const found = modified ? { ...fallback, ...modified } : fallback;
    if (found) {
      return {
        product: found,
        media: found.media || (found.hero_image ? [{ media_url: found.hero_image, caption: found.title }] : []),
        licenses: found.licenses || [],
        features: found.features || [],
        sections: found.sections || [],
        faqs: found.faqs || [],
        testimonials: found.testimonials || [],
        files: []
      };
    }
  }

  if (clean.startsWith('admin/products/') && clean.endsWith('/duplicate') && method === 'POST') {
    const id = clean.replace(/^admin\/products\//, '').replace(/\/duplicate$/, '');
    const stored = getStored(STORAGE_KEYS.PRODUCTS, []);
    const fallback = FALLBACK_PRODUCTS.find(p => String(p.id) === String(id) || p.slug === id);
    const existing = (Array.isArray(stored) && stored.find(p => String(p.id) === String(id) || p.slug === id)) || fallback;
    if (existing) {
      const dup = {
        ...existing,
        id: Date.now(),
        title: `${existing.title} (Draft Copy)`,
        slug: `${existing.slug}-copy-${Date.now().toString().slice(-4)}`,
        status: 'draft',
        sales_count: 0,
        created_at: new Date().toISOString()
      };
      const nextList = Array.isArray(stored) ? [dup, ...stored] : [dup];
      setStored(STORAGE_KEYS.PRODUCTS, nextList);
      return { success: true, message: 'Product duplicated', product: dup };
    }
    return { success: true };
  }

  if (clean.startsWith('admin/products/') && clean.endsWith('/status') && method === 'PATCH') {
    const id = clean.replace(/^admin\/products\//, '').replace(/\/status$/, '');
    let stored = getStored(STORAGE_KEYS.PRODUCTS, []);
    if (!Array.isArray(stored)) stored = [];
    let idx = stored.findIndex(p => String(p.id) === String(id) || p.slug === id);
    const fallback = FALLBACK_PRODUCTS.find(p => String(p.id) === String(id) || p.slug === id) || {};
    if (idx >= 0) {
      stored[idx] = { ...stored[idx], status: requestBody?.status || 'draft' };
    } else {
      stored.push({ ...fallback, status: requestBody?.status || 'draft' });
    }
    setStored(STORAGE_KEYS.PRODUCTS, stored);
    return { success: true, message: 'Product status updated' };
  }

  if (clean.startsWith('admin/products/') && clean.endsWith('/sections') && (method === 'PUT' || method === 'POST')) {
    const id = clean.replace(/^admin\/products\//, '').replace(/\/sections$/, '');
    let stored = getStored(STORAGE_KEYS.PRODUCTS, []);
    if (!Array.isArray(stored)) stored = [];
    let idx = stored.findIndex(p => String(p.id) === String(id) || p.slug === id);
    const fallback = FALLBACK_PRODUCTS.find(p => String(p.id) === String(id) || p.slug === id) || {};
    
    const updatedObj = {
      ...fallback,
      ...(idx >= 0 ? stored[idx] : {}),
      sections: requestBody?.sections || [],
      updated_at: new Date().toISOString()
    };

    if (idx >= 0) {
      stored[idx] = updatedObj;
    } else {
      stored.push(updatedObj);
    }
    setStored(STORAGE_KEYS.PRODUCTS, stored);

    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('rollixia_catalog_updated', {
          detail: { productId: id, sections: requestBody.sections, product: updatedObj }
        }));
      } catch (e) {}
    }
    return { success: true, message: 'Product sections saved successfully' };
  }

  if (clean.startsWith('admin/products/') && (method === 'PUT' || method === 'PATCH')) {
    const id = clean.replace(/^admin\/products\//, '');
    let stored = getStored(STORAGE_KEYS.PRODUCTS, []);
    if (!Array.isArray(stored)) stored = [];
    let idx = stored.findIndex(p => String(p.id) === String(id) || p.slug === id);
    const fallback = FALLBACK_PRODUCTS.find(p => String(p.id) === String(id) || p.slug === id) || {};

    if (requestBody) {
      const updatedProduct = {
        ...fallback,
        ...(idx >= 0 ? stored[idx] : {}),
        ...requestBody,
        updated_at: new Date().toISOString()
      };

      // Ensure licenses array contains properly typed numbers
      if (requestBody.licenses && Array.isArray(requestBody.licenses)) {
        updatedProduct.licenses = requestBody.licenses.map(lic => ({
          ...lic,
          price: lic.price !== undefined ? parseFloat(lic.price) : (lic.sale_price !== undefined ? parseFloat(lic.sale_price) : 0),
          regular_price: lic.regular_price !== undefined && lic.regular_price !== null && lic.regular_price !== '' ? parseFloat(lic.regular_price) : null
        }));
      }

      // Ensure regular_price and sale_price numbers
      if (requestBody.regular_price !== undefined) {
        updatedProduct.regular_price = parseFloat(requestBody.regular_price) || 0;
      }
      if (requestBody.sale_price !== undefined) {
        updatedProduct.sale_price = requestBody.sale_price !== null && requestBody.sale_price !== '' ? parseFloat(requestBody.sale_price) : null;
      }

      if (idx >= 0) {
        stored[idx] = updatedProduct;
      } else {
        stored.push(updatedProduct);
      }
      setStored(STORAGE_KEYS.PRODUCTS, stored);

      // Sync dedicated image overrides directly
      syncProductImageToStorage(id, updatedProduct.slug, {
        hero_image: updatedProduct.hero_image,
        hero_secondary_image: updatedProduct.hero_secondary_image,
        thumbnail: updatedProduct.thumbnail
      });

      // Trigger cross-component notification
      if (typeof window !== 'undefined') {
        try {
          window.dispatchEvent(new CustomEvent('rollixia_catalog_updated', {
            detail: { productId: id, product: updatedProduct }
          }));
        } catch (e) {}
      }

      return { success: true, message: 'Product updated successfully', product: updatedProduct };
    }
    return { success: true, message: 'Product updated successfully' };
  }

  if (clean.startsWith('admin/products/') && method === 'DELETE') {
    const id = clean.replace(/^admin\/products\//, '');
    let products = getStored(STORAGE_KEYS.PRODUCTS, [...FALLBACK_PRODUCTS]);
    products = products.filter(p => String(p.id) !== String(id));
    setStored(STORAGE_KEYS.PRODUCTS, products);
    return { success: true, message: 'Product deleted' };
  }

  // admin/files
  if (clean === 'admin/files' || clean === 'admin/files/') {
    if (method === 'GET') {
      return getFallbackAdminFiles();
    }
  }

  // PUT /api/admin/files/:id (Update or replace deliverable file package)
  if (clean.startsWith('admin/files/') && (method === 'PUT' || method === 'PATCH')) {
    const id = clean.replace(/^admin\/files\//, '');
    const fileObj = extractFormFile(requestBody);
    const productId = extractFormValue(requestBody, 'product_id');
    const version = extractFormValue(requestBody, 'version') || '1.0.0';
    const changelog = extractFormValue(requestBody, 'changelog') || '';

    let files = getStored(STORAGE_KEYS.FILES, null);
    if (!files || !Array.isArray(files) || files.length === 0) {
      files = getInitialFiles();
    }

    const idx = files.findIndex(f => String(f.id) === String(id) || (productId && String(f.product_id) === String(productId)));
    let targetFile = idx >= 0 ? files[idx] : null;

    const fileName = (fileObj && (fileObj.name || fileObj.originalname)) || (targetFile && targetFile.file_name) || 'deliverable-package.zip';
    const fileSize = (fileObj && fileObj.size) || (targetFile && targetFile.file_size) || 15485760;

    if (fileObj && typeof fileObj === 'object' && (fileObj.size > 0 || fileObj.name)) {
      const meta = {
        fileName,
        fileSize,
        fileType: fileObj.type || 'application/octet-stream',
        version
      };
      storeDeliverableBlob(id, fileObj, meta);
      storeDeliverableBlob(`file_${id}`, fileObj, meta);
      if (productId) {
        storeDeliverableBlob(productId, fileObj, meta);
        storeDeliverableBlob(`product_${productId}`, fileObj, meta);
      }
    }

    const updated = {
      ...(targetFile || {
        id: Number(id) || Date.now(),
        product_id: Number(productId) || 1,
        product_title: 'Digital Deliverable Package',
        product_slug: 'digital-package',
        download_count: 0,
        created_at: new Date().toISOString()
      }),
      product_id: Number(productId) || (targetFile ? targetFile.product_id : 1),
      version: version || (targetFile ? targetFile.version : '1.0.0'),
      changelog: changelog !== undefined && changelog !== null ? changelog : (targetFile ? targetFile.changelog : ''),
      file_name: fileName,
      file_size: fileSize,
      updated_at: new Date().toISOString()
    };

    if (idx >= 0) {
      files[idx] = updated;
    } else {
      files.unshift(updated);
    }
    setStored(STORAGE_KEYS.FILES, files);

    // Also synchronize deliverable_name on product in rollixia_admin_products
    const effectiveProdId = Number(productId) || (targetFile ? targetFile.product_id : null);
    if (effectiveProdId) {
      const products = getStored(STORAGE_KEYS.PRODUCTS, [...FALLBACK_PRODUCTS]);
      const pIdx = products.findIndex(p => Number(p.id) === effectiveProdId);
      if (pIdx >= 0) {
        products[pIdx] = {
          ...products[pIdx],
          deliverable_name: fileName,
          deliverable_version: version
        };
        setStored(STORAGE_KEYS.PRODUCTS, products);
      }
    }

    return {
      success: true,
      message: 'Product deliverable file updated successfully',
      file: updated
    };
  }

  // POST /api/admin/files/version (Upload new deliverable file or new version for a product)
  if (clean === 'admin/files/version' && method === 'POST') {
    const fileObj = extractFormFile(requestBody);
    const productId = Number(extractFormValue(requestBody, 'product_id')) || 1;
    const version = extractFormValue(requestBody, 'version') || '1.0.0';
    const changelog = extractFormValue(requestBody, 'changelog') || 'Production master release bundle.';

    const products = getStored(STORAGE_KEYS.PRODUCTS, [...FALLBACK_PRODUCTS]);
    const targetProduct = products.find(p => Number(p.id) === productId) || FALLBACK_PRODUCTS.find(p => Number(p.id) === productId) || products[0];

    const fileName = (fileObj && (fileObj.name || fileObj.originalname)) || `${targetProduct?.slug || 'package'}-v${version}.zip`;
    const fileSize = (fileObj && fileObj.size) || 18450000;
    const newId = Date.now();

    if (fileObj && typeof fileObj === 'object' && (fileObj.size > 0 || fileObj.name)) {
      const meta = {
        fileName,
        fileSize,
        fileType: fileObj.type || 'application/octet-stream',
        version
      };
      storeDeliverableBlob(newId, fileObj, meta);
      storeDeliverableBlob(`file_${newId}`, fileObj, meta);
      if (productId) {
        storeDeliverableBlob(productId, fileObj, meta);
        storeDeliverableBlob(`product_${productId}`, fileObj, meta);
      }
    }

    let files = getStored(STORAGE_KEYS.FILES, null);
    if (!files || !Array.isArray(files) || files.length === 0) {
      files = getInitialFiles();
    }

    const newFile = {
      id: newId,
      product_id: productId,
      product_title: targetProduct?.title || 'Updated Deliverable Package',
      product_slug: targetProduct?.slug || 'digital-package',
      file_name: fileName,
      file_size: fileSize,
      version,
      changelog,
      download_count: 0,
      created_at: new Date().toISOString()
    };
    files.unshift(newFile);
    setStored(STORAGE_KEYS.FILES, files);

    // Update target product deliverable details
    const pIdx = products.findIndex(p => Number(p.id) === productId);
    if (pIdx >= 0) {
      products[pIdx] = {
        ...products[pIdx],
        deliverable_name: fileName,
        deliverable_version: version
      };
      setStored(STORAGE_KEYS.PRODUCTS, products);
    }

    return {
      success: true,
      message: 'File version created successfully',
      file: newFile
    };
  }

  // GET /api/admin/files/:id
  if (clean.startsWith('admin/files/') && method === 'GET') {
    const id = clean.replace(/^admin\/files\//, '');
    const files = getStored(STORAGE_KEYS.FILES, getInitialFiles());
    const file = files.find(f => String(f.id) === String(id) || String(f.product_id) === String(id));
    return file || files[0] || null;
  }

  // DELETE /api/admin/files/:id
  if (clean.startsWith('admin/files/') && method === 'DELETE') {
    const id = clean.replace(/^admin\/files\//, '');
    let files = getStored(STORAGE_KEYS.FILES, null);
    if (!files || !Array.isArray(files)) files = getInitialFiles();
    files = files.filter(f => String(f.id) !== String(id));
    setStored(STORAGE_KEYS.FILES, files);
    return { success: true, message: 'File deleted' };
  }

  // admin/reviews
  if (clean === 'admin/reviews') {
    return getFallbackAdminReviews(queryStr);
  }

  if (clean.startsWith('admin/reviews/') && clean.endsWith('/status') && method === 'PATCH') {
    const id = clean.replace(/^admin\/reviews\//, '').replace(/\/status$/, '');
    const reviews = getStored(STORAGE_KEYS.REVIEWS, getInitialReviews());
    const target = reviews.find(r => String(r.id) === String(id));
    if (target && requestBody?.status) {
      target.status = requestBody.status;
      setStored(STORAGE_KEYS.REVIEWS, reviews);
    }
    return { success: true, message: 'Review status updated' };
  }

  if (clean.startsWith('admin/reviews/') && clean.endsWith('/feature') && method === 'PATCH') {
    const id = clean.replace(/^admin\/reviews\//, '').replace(/\/feature$/, '');
    const reviews = getStored(STORAGE_KEYS.REVIEWS, getInitialReviews());
    const target = reviews.find(r => String(r.id) === String(id));
    if (target && requestBody?.is_featured !== undefined) {
      target.is_featured = requestBody.is_featured ? 1 : 0;
      setStored(STORAGE_KEYS.REVIEWS, reviews);
    }
    return { success: true, message: 'Review feature status updated' };
  }

  if (clean.startsWith('admin/reviews/') && method === 'DELETE') {
    const id = clean.replace(/^admin\/reviews\//, '');
    let reviews = getStored(STORAGE_KEYS.REVIEWS, getInitialReviews());
    reviews = reviews.filter(r => String(r.id) !== String(id));
    setStored(STORAGE_KEYS.REVIEWS, reviews);
    return { success: true, message: 'Review deleted' };
  }

  // admin/orders
  if (clean === 'admin/orders') {
    return getFallbackAdminOrders(queryStr);
  }

  if (clean.startsWith('admin/orders/') && clean.endsWith('/send-file') && method === 'POST') {
    const targetOrderId = clean.replace(/^admin\/orders\//, '').replace(/\/send-file$/, '');
    const fileObj = extractFormFile(requestBody);
    const recipient = extractFormValue(requestBody, 'recipientEmail') || 'customer';
    const customMessage = extractFormValue(requestBody, 'customMessage') || '';
    const allOrders = getFallbackAdminOrders().orders;
    const targetOrder = allOrders.find(o => String(o.id) === String(targetOrderId) || o.order_number === targetOrderId) || allOrders[0];
    const targetTitle = (targetOrder && targetOrder.items_summary) || 'Apex — Enterprise SaaS Next.js 14 Template';

    let fileName = (fileObj && (fileObj.name || fileObj.originalname)) || 'apex-saas-dashboard-v2.1.0.zip';
    let fileSize = (fileObj && fileObj.size) || 15485760;

    // If file was uploaded by admin, store in IndexedDB
    if (fileObj && typeof fileObj === 'object' && (fileObj.size > 0 || fileObj.name)) {
      const meta = {
        fileName,
        fileSize,
        fileType: fileObj.type || 'application/octet-stream',
        version: '1.0.0-custom',
        orderId: targetOrderId,
        orderNumber: targetOrder?.order_number,
        productTitle: targetTitle
      };
      storeDeliverableBlob(targetOrderId, fileObj, meta);
      storeDeliverableBlob(`order_${targetOrderId}`, fileObj, meta);
      if (targetOrder?.order_number) {
        storeDeliverableBlob(targetOrder.order_number, fileObj, meta);
      }
    }

    // Save deliverable to rollixia_order_files map
    const orderFiles = getStored('rollixia_order_files', {});
    orderFiles[String(targetOrderId)] = {
      orderId: targetOrderId,
      orderNumber: targetOrder?.order_number,
      productTitle: targetTitle,
      fileName,
      fileSize,
      token: `DL_TOKEN_${Date.now()}`,
      updatedAt: new Date().toISOString()
    };
    setStored('rollixia_order_files', orderFiles);

    // Create customer notification
    const notifications = getStored('rollixia_customer_notifications', []);
    const newNotif = {
      id: Date.now(),
      user_email: recipient,
      order_id: targetOrderId,
      order_number: targetOrder?.order_number,
      product_id: 1,
      product_title: targetTitle,
      file_name: fileName,
      message: `Your file for "${targetTitle}" (Order #${targetOrder?.order_number || targetOrderId}) is ready to download now!`,
      download_url: `https://rollixia.com/api/downloads/file/DL_TOKEN_${Date.now()}`,
      is_read: false,
      created_at: new Date().toISOString()
    };
    notifications.unshift(newNotif);
    setStored('rollixia_customer_notifications', notifications);

    // Dispatch global window event for real-time reactivity across tabs/components
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('rollixia_file_delivered', {
          detail: newNotif
        }));
      } catch (e) {}
    }

    // Log to admin activity logs
    const logs = getStored(STORAGE_KEYS.LOGS, []);
    logs.unshift({
      id: Date.now(),
      action: 'PRODUCT_FILE_SENT',
      target: 'order',
      target_id: targetOrderId,
      details: `Product file "${fileName}" delivered to ${recipient}`,
      timestamp: new Date().toISOString()
    });
    setStored(STORAGE_KEYS.LOGS, logs);

    return {
      success: true,
      message: fileObj
        ? `New deliverable "${fileName}" uploaded and sent to ${recipient}!`
        : `Product file deliverable successfully sent to ${recipient}!`,
      recipientEmail: recipient,
      fileName,
      productTitle: targetTitle,
      downloadUrl: `https://rollixia.com/api/downloads/file/DL_TOKEN_${Date.now()}`
    };
  }

  if (clean.startsWith('admin/orders/') && clean.endsWith('/refund') && method === 'POST') {
    return { success: true, message: 'Refund issued and access revoked' };
  }

  if (clean.startsWith('admin/orders/') && clean.endsWith('/downloads') && method === 'PATCH') {
    return { success: true, message: 'Download permissions updated' };
  }

  if (clean.startsWith('admin/orders/')) {
    const orderId = clean.replace(/^admin\/orders\//, '');
    const all = getFallbackAdminOrders().orders;
    const target = all.find(o => String(o.id) === String(orderId) || o.order_number === orderId) || all[0];
    const targetTitle = (target && target.items_summary) || 'Apex — Enterprise SaaS Next.js 14 Template';
    
    // Check if a custom file was uploaded for this order
    const orderFiles = getStored('rollixia_order_files', {});
    const customUploaded = orderFiles[String(orderId)] || (target && orderFiles[String(target.id)]);
    const activeFileName = customUploaded ? customUploaded.fileName : 'apex-saas-dashboard-v2.1.0.zip';
    const activeFileSize = customUploaded ? customUploaded.fileSize : 15485760;

    return {
      order: target,
      items: [
        {
          id: 1,
          product_id: 1,
          product_title: targetTitle,
          license_name: 'Standard Commercial License',
          price: target.total_amount
        }
      ],
      downloads: [
        {
          id: 101,
          product_id: 1,
          product_title: targetTitle,
          product_slug: 'apex-saas-dashboard',
          file_name: activeFileName,
          file_size: activeFileSize,
          version: customUploaded ? 'Custom Release' : '2.1.0',
          download_count: 0,
          max_downloads: 10,
          token: customUploaded ? customUploaded.token : `DL_TOKEN_${Date.now()}`,
          expires_at: new Date(Date.now() + 48 * 3600 * 1000).toISOString()
        }
      ]
    };
  }

  // admin/customers
  if (clean === 'admin/customers') {
    return getFallbackAdminCustomers(queryStr);
  }

  if (clean.startsWith('admin/customers/') && clean.endsWith('/status') && method === 'PATCH') {
    const id = clean.replace(/^admin\/customers\//, '').replace(/\/status$/, '');
    const customers = getStored(STORAGE_KEYS.CUSTOMERS, getInitialCustomers());
    const target = customers.find(c => String(c.id) === String(id));
    if (target && requestBody?.status) {
      target.status = requestBody.status;
      setStored(STORAGE_KEYS.CUSTOMERS, customers);
    }
    return { success: true, message: 'Customer status updated' };
  }

  // admin/coupons
  if (clean === 'admin/coupons') {
    if (method === 'GET') {
      return getFallbackAdminCoupons();
    }
    if (method === 'POST') {
      const coupons = getStored(STORAGE_KEYS.COUPONS, getInitialCoupons());
      const newCoupon = {
        id: Date.now(),
        code: (requestBody?.code || 'DEAL').toUpperCase().trim(),
        discount_type: requestBody?.discount_type || 'percentage',
        discount_value: Number(requestBody?.discount_value) || 20,
        min_order_amount: Number(requestBody?.min_order_amount) || 0,
        max_discount_amount: Number(requestBody?.max_discount_amount) || 0,
        usage_limit: Number(requestBody?.usage_limit) || 100,
        usage_count: 0,
        is_active: 1,
        created_at: new Date().toISOString()
      };
      coupons.unshift(newCoupon);
      setStored(STORAGE_KEYS.COUPONS, coupons);
      return { success: true, message: 'Coupon created successfully', coupon: newCoupon };
    }
  }

  if (clean.startsWith('admin/coupons/') && method === 'DELETE') {
    const id = clean.replace(/^admin\/coupons\//, '');
    let coupons = getStored(STORAGE_KEYS.COUPONS, getInitialCoupons());
    coupons = coupons.filter(c => String(c.id) !== String(id));
    setStored(STORAGE_KEYS.COUPONS, coupons);
    return { success: true, message: 'Coupon deleted' };
  }

  // admin/categories
  if (clean === 'admin/categories') {
    return getFallbackAdminCategories();
  }

  // admin/settings
  if (clean === 'admin/settings') {
    if (method === 'GET') {
      return getFallbackAdminSettings();
    }
    if (method === 'POST' || method === 'PUT') {
      const current = getFallbackAdminSettings();
      const updated = { ...current, ...requestBody };
      setStored(STORAGE_KEYS.SETTINGS, updated);
      return { success: true, message: 'Settings saved successfully', settings: updated };
    }
  }

  // admin/logs
  if (clean === 'admin/logs') {
    return getFallbackAdminLogs();
  }

  return null;
}
