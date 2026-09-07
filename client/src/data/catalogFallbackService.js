import { FALLBACK_CATEGORIES, FALLBACK_PRODUCTS } from './fallbackCatalog.js';
import { handleAdminFallbackRoute } from './adminFallbackService.js';

export { FALLBACK_CATEGORIES, FALLBACK_PRODUCTS };

function enrichProductBadge(p) {
  if (!p) return p;
  if (p.badge) return p;
  let badge = null;
  if (p.is_trending === 1) badge = 'TRENDING';
  else if (p.sale_price === 0 || p.regular_price === 0) badge = 'FREE';
  else if (p.is_bestseller === 1) badge = 'BESTSELLER';
  else if (p.sale_price !== null && p.sale_price !== undefined && p.sale_price < p.regular_price) badge = 'DEAL';
  return badge ? { ...p, badge } : p;
}

export function getEffectiveProducts() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem('rollixia_admin_products');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map();
          FALLBACK_PRODUCTS.forEach(p => map.set(String(p.id), { ...p }));
          parsed.forEach(p => {
            const key = String(p.id);
            const existing = map.get(key) || {};
            map.set(key, { ...existing, ...p });
          });
          return Array.from(map.values()).map(enrichProductBadge);
        }
      }
    }
  } catch (e) {}
  return FALLBACK_PRODUCTS.map(enrichProductBadge);
}

export function getFallbackFeatured() {
  const all = [...getEffectiveProducts()];
  const bestsellers = all.filter(p => (p.sales_count > 0 || p.is_bestseller === 1 || p.badge === 'BESTSELLER' || p.badge === 'TOP SELLER')).slice(0, 14);
  const trending = all.filter(p => (p.badge === 'TRENDING' || p.badge === 'POPULAR' || p.badge === 'DEAL' || p.is_trending === 1 || (p.sale_price !== null && p.sale_price < p.regular_price))).slice(0, 14);
  const topRated = all.filter(p => (p.rating_avg >= 4.5)).slice(0, 14);
  const freeDeals = all.filter(p => (p.badge === 'FREE' || p.sale_price === 0 || p.regular_price === 0)).slice(0, 14);
  const newArrivals = all.slice(0, 14);

  return {
    all,
    bestsellers: bestsellers.length ? bestsellers : all,
    trending: trending.length ? trending : all,
    topRated: topRated.length ? topRated : all,
    freeDeals: freeDeals.length ? freeDeals : all.slice(0, 6),
    newArrivals: newArrivals.length ? newArrivals : all
  };
}

export function getFallbackProducts(searchParams = '') {
  let params = searchParams;
  if (typeof searchParams === 'string') {
    const qIndex = searchParams.indexOf('?');
    params = new URLSearchParams(qIndex >= 0 ? searchParams.substring(qIndex + 1) : searchParams);
  }

  const category = params.get ? params.get('category') : null;
  const q = params.get ? (params.get('q') || '').toLowerCase().trim() : '';
  const badge = params.get ? params.get('badge') : null;
  const sort = params.get ? (params.get('sort') || 'popular') : 'popular';
  const maxPrice = params.get && params.get('max_price') ? parseFloat(params.get('max_price')) : null;

  const catalog = getEffectiveProducts();
  let filtered = catalog.filter(p => {
    if (category && p.category_slug !== category && String(p.category_id) !== category) {
      return false;
    }
    if (badge) {
      const bUpper = String(badge).trim().toUpperCase();
      if (bUpper === 'TRENDING' || bUpper === 'DEAL' || bUpper === 'DEALS') {
        const isDeal = (
          p.badge === 'TRENDING' ||
          p.badge === 'DEAL' ||
          p.badge === 'DEALS' ||
          p.badge === 'POPULAR' ||
          p.is_trending === 1 ||
          (p.sale_price !== null && p.sale_price !== undefined && p.sale_price < p.regular_price)
        );
        if (!isDeal) return false;
      } else if (bUpper === 'FREE') {
        const isFree = (
          p.badge === 'FREE' ||
          p.sale_price === 0 ||
          p.regular_price === 0
        );
        if (!isFree) return false;
      } else if (bUpper === 'BESTSELLER' || bUpper === 'TOP SELLER') {
        const isBestseller = (
          p.badge === 'BESTSELLER' ||
          p.badge === 'TOP SELLER' ||
          p.is_bestseller === 1 ||
          (p.sales_count && p.sales_count > 0)
        );
        if (!isBestseller) return false;
      } else if (bUpper === 'TOP RATED') {
        const isTop = (
          p.badge === 'TOP RATED' ||
          (p.rating_avg && p.rating_avg >= 4.5)
        );
        if (!isTop) return false;
      } else {
        const match = (
          (p.badge && p.badge.toUpperCase() === bUpper) ||
          (p.badge && p.badge.toUpperCase().includes(bUpper))
        );
        if (!match) return false;
      }
    }
    if (q) {
      const match = (
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.short_description && p.short_description.toLowerCase().includes(q)) ||
        (p.category_name && p.category_name.toLowerCase().includes(q))
      );
      if (!match) return false;
    }
    if (maxPrice !== null && !isNaN(maxPrice)) {
      const price = p.sale_price !== null && p.sale_price !== undefined ? p.sale_price : p.regular_price;
      if (price > maxPrice) return false;
    }
    return true;
  });

  if (sort === 'newest') {
    filtered.sort((a, b) => b.id - a.id);
  } else if (sort === 'price_asc') {
    filtered.sort((a, b) => (a.sale_price ?? a.regular_price) - (b.sale_price ?? b.regular_price));
  } else if (sort === 'price_desc') {
    filtered.sort((a, b) => (b.sale_price ?? b.regular_price) - (a.sale_price ?? a.regular_price));
  } else if (sort === 'rating') {
    filtered.sort((a, b) => (b.rating_avg || 0) - (a.rating_avg || 0));
  } else {
    filtered.sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0));
  }

  return {
    products: filtered,
    total: filtered.length
  };
}

export function getFallbackProductBySlug(slug) {
  if (!slug) return null;
  let cleanSlug = '';
  try {
    cleanSlug = decodeURIComponent(String(slug)).trim().toLowerCase().replace(/\/+$/, '');
  } catch (e) {
    cleanSlug = String(slug).trim().toLowerCase().replace(/\/+$/, '');
  }

  const catalog = getEffectiveProducts();
  const p = catalog.find(item => {
    if (!item) return false;
    const itemSlug = String(item.slug || '').trim().toLowerCase();
    const itemId = String(item.id || '').trim();
    return (
      itemSlug === cleanSlug ||
      itemSlug.replace(/-/g, '') === cleanSlug.replace(/-/g, '') ||
      itemId === cleanSlug
    );
  });
  if (!p) return null;

  const parsedSections = (p.sections || []).map(sec => {
    let parsedContent = sec.content;
    let parsedSettings = sec.settings;
    if (typeof sec.content === 'string') {
      try {
        parsedContent = JSON.parse(sec.content);
        if (typeof parsedContent === 'string') {
          try { parsedContent = JSON.parse(parsedContent); } catch (e) {}
        }
      } catch (e) {}
    }
    if (typeof sec.settings === 'string') {
      try { parsedSettings = JSON.parse(sec.settings); } catch (e) {}
    }
    return {
      ...sec,
      content: parsedContent,
      settings: parsedSettings
    };
  });

  let parsedTechnicalSpecs = p.technical_specs;
  if (typeof p.technical_specs === 'string') {
    try { parsedTechnicalSpecs = JSON.parse(p.technical_specs); } catch (e) {}
  }

  // Ensure licenses array contains updated prices and descriptions
  const effectiveLicenses = (p.licenses && p.licenses.length > 0) ? p.licenses : [
    {
      id: 1,
      license_name: 'Commercial License',
      price: p.sale_price !== null && p.sale_price !== undefined ? p.sale_price : p.regular_price,
      regular_price: p.regular_price,
      description: 'Full commercial license for personal & client projects.'
    }
  ];

  let effectiveMedia = Array.isArray(p.media) && p.media.length > 0 ? [...p.media] : [];
  if (p.hero_image) {
    const isCustomHero = !p.hero_image.endsWith('-cover.svg');
    if (isCustomHero) {
      effectiveMedia = effectiveMedia.filter(m => !m.media_url || !m.media_url.endsWith('-cover.svg'));
    }
    const thumbIdx = effectiveMedia.findIndex(m => m.is_thumbnail === 1 || m.is_thumbnail === true);
    if (thumbIdx >= 0) {
      effectiveMedia[thumbIdx] = { ...effectiveMedia[thumbIdx], media_url: p.hero_image };
    } else {
      effectiveMedia.unshift({ id: 1, media_url: p.hero_image, is_thumbnail: 1, media_type: 'image' });
    }
  }
  if (p.hero_secondary_image && !effectiveMedia.some(m => m.media_url === p.hero_secondary_image)) {
    effectiveMedia.push({ id: 2, media_url: p.hero_secondary_image, is_thumbnail: 0, media_type: 'image' });
  }

  return {
    product: {
      ...p,
      regular_price: p.regular_price,
      sale_price: p.sale_price,
      licenses: effectiveLicenses,
      technical_specs: parsedTechnicalSpecs
    },
    ...p,
    regular_price: p.regular_price,
    sale_price: p.sale_price,
    technical_specs: parsedTechnicalSpecs,
    media: effectiveMedia.length > 0 ? effectiveMedia : (p.hero_image ? [{ media_url: p.hero_image, is_thumbnail: 1 }] : []),
    licenses: effectiveLicenses,
    pricingPlans: effectiveLicenses,
    features: p.features || [],
    compatibility: p.compatibility || [],
    faqs: p.faqs || [],
    reviews: p.reviews || [],
    testimonials: p.testimonials || [],
    sections: parsedSections,
    ratingBreakdown: { 5: 14, 4: 1, 3: 0, 2: 0, 1: 0 },
    activeFile: (() => {
      const adminFiles = (() => {
        try {
          const raw = localStorage.getItem('rollixia_admin_files');
          return raw ? JSON.parse(raw) : [];
        } catch (e) { return []; }
      })();
      const attached = adminFiles.find(f =>
        (p && String(f.product_id) === String(p.id)) ||
        (p && f.product_slug && f.product_slug === p.slug) ||
        (p && f.product_title && f.product_title.toLowerCase() === p.title.toLowerCase())
      );
      return {
        id: attached ? attached.id : 1,
        file_name: (attached && attached.file_name) || p.deliverable_name || `${p.slug}-v1.0.0.zip`,
        file_size: (attached && attached.file_size) || 15485760,
        version: (attached && attached.version) || p.deliverable_version || '1.0.0'
      };
    })()
  };
}

export function getFallbackRelated(slug) {
  const current = getFallbackProductBySlug(slug);
  const currentId = current?.product?.id || current?.id;
  const currentCatId = current?.product?.category_id || current?.category_id;
  const catalog = getEffectiveProducts();
  if (!currentId) return catalog.slice(0, 4);
  return catalog.filter(p => p.id !== currentId && p.category_id === currentCatId).slice(0, 4);
}

export const FALLBACK_SETTINGS = {
  store_name: 'Rollixia',
  tagline: 'Premium Digital Assets, Source Code & Software Ecosystem',
  support_email: 'support@rollixia.com',
  currency: 'INR',
  currency_symbol: '₹',
  allow_guest_checkout: true,
  tax_rate: 0
};

export const FALLBACK_PAYTM_CONFIG = {
  mid: 'DEFAULT_MID',
  website: 'DEFAULT',
  isConfigured: true,
  hasKey: false,
  checkoutJsUrl: 'https://securegw.paytm.in/merchantpgpui/checkoutjs/merchants/oCtvhv27957773497297.js'
};

export function simulateCalculateCart(payload = {}) {
  const items = payload.items || [];
  const couponCode = payload.couponCode;

  let subtotal = 0;
  const catalog = getEffectiveProducts();
  const calculatedItems = items.map(cartItem => {
    const product = catalog.find(p => String(p.id) === String(cartItem.productId) || p.slug === cartItem.productSlug) || catalog[0];
    let license = null;
    if (product && product.licenses && product.licenses.length > 0) {
      license = product.licenses.find(l => l.id === cartItem.licenseId) || product.licenses[0];
    }
    const price = license ? license.price : (product.sale_price !== null && product.sale_price !== undefined ? product.sale_price : product.regular_price);
    subtotal += Number(price || 0);

    return {
      productId: product.id,
      licenseId: license ? license.id : null,
      productTitle: product.title,
      productSlug: product.slug,
      licenseName: license ? license.license_name : 'Standard Commercial License',
      price: Number(price || 0)
    };
  });

  let discount = 0;
  let coupon = null;
  if (couponCode) {
    const code = couponCode.toUpperCase().trim();
    if (code === 'SAVE20') {
      discount = Math.round(subtotal * 0.2);
      coupon = { code: 'SAVE20', discount_type: 'percentage', discount_value: 20 };
    } else if (code === 'LAUNCH50') {
      discount = Math.round(subtotal * 0.5);
      coupon = { code: 'LAUNCH50', discount_type: 'percentage', discount_value: 50 };
    }
  }

  const total = Math.max(0, subtotal - discount);

  return {
    items: calculatedItems,
    subtotal,
    discount,
    tax: 0,
    total,
    coupon
  };
}

export function simulateCreateOrder(payload = {}) {
  const orderNumber = `ORD-ROX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const items = payload.items || [];
  const calculation = simulateCalculateCart({ items, couponCode: payload.coupon_code });

  const order = {
    id: Date.now(),
    order_number: orderNumber,
    customer_name: payload.customer_name || 'Valued Customer',
    customer_email: payload.customer_email || 'customer@example.com',
    customer_phone: payload.customer_phone || '9876543210',
    subtotal: calculation.subtotal,
    discount_amount: calculation.discount,
    tax_amount: 0,
    total_amount: calculation.total,
    currency: payload.currency || 'INR',
    payment_provider: payload.payment_provider || 'paytm',
    payment_id: `PAYTM_${Date.now()}`,
    payment_status: calculation.total === 0 ? 'paid' : 'pending',
    order_status: 'completed',
    created_at: new Date().toISOString()
  };

  const orderItems = calculation.items.map(item => ({
    order_id: order.id,
    product_id: item.productId,
    license_id: item.licenseId,
    product_title: item.productTitle,
    license_name: item.licenseName,
    price: item.price
  }));

  const catalog = getEffectiveProducts();
  const adminFiles = (() => {
    try {
      const raw = localStorage.getItem('rollixia_admin_files');
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  })();

  const downloads = calculation.items.map((item, idx) => {
    const p = catalog.find(prod =>
      String(prod.id) === String(item.productId) ||
      prod.slug === item.productSlug ||
      prod.title === item.productTitle
    ) || catalog[0];

    const attachedFile = adminFiles.find(f =>
      (p && String(f.product_id) === String(p.id)) ||
      (String(f.id) === String(item.productId)) ||
      (p && f.product_slug && f.product_slug === p.slug) ||
      (p && f.product_title && f.product_title.toLowerCase() === p.title.toLowerCase())
    );

    const finalFileName = (attachedFile && attachedFile.file_name) || p.deliverable_name || `${p.slug || 'product'}-v1.0.0.zip`;
    const finalFileSize = (attachedFile && attachedFile.file_size) || 15485760;
    const finalVersion = (attachedFile && attachedFile.version) || p.deliverable_version || '1.0.0';

    return {
      id: 1000 + idx,
      order_id: order.id,
      product_id: p.id,
      file_id: attachedFile ? attachedFile.id : null,
      product_title: item.productTitle || p.title,
      product_slug: p.slug,
      file_name: finalFileName,
      file_size: finalFileSize,
      version: finalVersion,
      token: `DL_TOKEN_${Date.now()}_${idx}`
    };
  });

  const fullOrderData = { order, items: orderItems, downloads };

  try {
    const existing = JSON.parse(localStorage.getItem('rollixia_orders') || '[]');
    existing.unshift(fullOrderData);
    localStorage.setItem('rollixia_orders', JSON.stringify(existing));
  } catch (e) {}

  const provider = payload.payment_provider || 'razorpay';
  return {
    order,
    orderNumber,
    totalAmount: calculation.total,
    currency: payload.currency || 'INR',
    isFree: calculation.total === 0,
    paymentSession: {
      provider,
      orderId: null,
      keyId: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_TYeE4nMLmsPaCZ',
      amount: Math.round(calculation.total * 100),
      currency: payload.currency || 'INR',
      paymentId: order.payment_id,
      txnToken: `PAYTM_TOKEN_${Date.now()}`
    }
  };
}

export function simulateVerifyPayment(payload = {}) {
  const orderNumber = payload.orderNumber;
  try {
    const existing = JSON.parse(localStorage.getItem('rollixia_orders') || '[]');
    const target = existing.find(o => o.order.order_number === orderNumber);
    if (target) {
      target.order.payment_status = 'paid';
      target.order.order_status = 'completed';
      target.order.payment_id = payload.paymentId || payload.payment_id || payload.razorpay_payment_id || `PAY_${Date.now()}`;
      localStorage.setItem('rollixia_orders', JSON.stringify(existing));
    }
  } catch (e) {}

  return {
    success: true,
    status: 'TXN_SUCCESS',
    orderNumber,
    message: 'Payment verified successfully'
  };
}

export function simulateGetOrder(orderNumber) {
  const adminFiles = (() => {
    try {
      const raw = localStorage.getItem('rollixia_admin_files');
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  })();
  const catalog = getEffectiveProducts();

  let existing = [];
  try {
    existing = JSON.parse(localStorage.getItem('rollixia_orders') || '[]');
  } catch (e) {}

  let target = existing.find(o => o.order && o.order.order_number === orderNumber);

  if (!target) {
    const p = catalog[0];
    const attachedFile = adminFiles.find(f =>
      (p && String(f.product_id) === String(p.id)) ||
      (p && f.product_slug && f.product_slug === p.slug) ||
      (p && f.product_title && f.product_title.toLowerCase() === p.title.toLowerCase())
    );

    const finalFileName = (attachedFile && attachedFile.file_name) || p.deliverable_name || `${p.slug || 'product'}-v1.0.0.zip`;
    const finalFileSize = (attachedFile && attachedFile.file_size) || 15485760;
    const finalVersion = (attachedFile && attachedFile.version) || p.deliverable_version || '1.0.0';

    target = {
      order: {
        id: 9999,
        order_number: orderNumber,
        customer_name: 'Valued Customer',
        customer_email: 'customer@example.com',
        total_amount: p.sale_price ?? p.regular_price ?? 0,
        currency: 'INR',
        payment_provider: 'razorpay',
        payment_status: 'paid',
        order_status: 'completed',
        created_at: new Date().toISOString()
      },
      items: [
        {
          productId: p.id,
          product_id: p.id,
          product_title: p.title,
          license_name: 'Standard Commercial License',
          price: p.sale_price ?? p.regular_price ?? 0
        }
      ],
      downloads: [
        {
          id: attachedFile ? attachedFile.id : 1001,
          order_id: 9999,
          product_id: p.id,
          file_id: attachedFile ? attachedFile.id : null,
          product_title: p.title,
          product_slug: p.slug,
          file_name: finalFileName,
          file_size: finalFileSize,
          version: finalVersion,
          token: `DL_TOKEN_${Date.now()}_0`
        }
      ]
    };
  } else {
    // Target was found in localStorage, but let's re-synchronize its downloads with the latest admin files!
    if (Array.isArray(target.downloads)) {
      target.downloads = target.downloads.map(dl => {
        const prod = catalog.find(p =>
          (dl.product_id && String(p.id) === String(dl.product_id)) ||
          (dl.product_slug && p.slug === dl.product_slug) ||
          (dl.product_title && p.title === dl.product_title)
        ) || catalog[0];

        const attached = adminFiles.find(f =>
          (prod && String(f.product_id) === String(prod.id)) ||
          (dl.file_id && String(f.id) === String(dl.file_id)) ||
          (prod && f.product_slug && f.product_slug === prod.slug) ||
          (prod && f.product_title && f.product_title.toLowerCase() === prod.title.toLowerCase())
        );

        return {
          ...dl,
          product_id: prod ? prod.id : dl.product_id,
          file_id: attached ? attached.id : dl.file_id,
          product_title: prod ? prod.title : dl.product_title,
          product_slug: prod ? prod.slug : dl.product_slug,
          file_name: (attached && attached.file_name) || (prod && prod.deliverable_name) || dl.file_name || 'deliverable.zip',
          file_size: (attached && attached.file_size) || dl.file_size || 15485760,
          version: (attached && attached.version) || (prod && prod.deliverable_version) || dl.version || '1.0.0'
        };
      });

      try {
        localStorage.setItem('rollixia_orders', JSON.stringify(existing));
      } catch (e) {}
    }
  }

  return target;
}

export function simulateGetMyOrders() {
  try {
    const existing = JSON.parse(localStorage.getItem('rollixia_orders') || '[]');
    const orderFiles = (() => {
      try {
        const raw = localStorage.getItem('rollixia_order_files');
        return raw ? JSON.parse(raw) : {};
      } catch (e) { return {}; }
    })();

    if (Array.isArray(existing) && existing.length > 0) {
      return existing.map(item => {
        const orderId = item.order?.id;
        const orderNumber = item.order?.order_number;
        const customFile = (orderId && orderFiles[String(orderId)]) || (orderNumber && orderFiles[String(orderNumber)]);

        let downloads = Array.isArray(item.downloads) ? [...item.downloads] : [];
        if (customFile) {
          downloads = [
            {
              id: 101,
              order_id: orderId,
              file_name: customFile.fileName,
              file_size: customFile.fileSize,
              product_title: customFile.productTitle || item.items?.[0]?.product_title || 'Digital Deliverable',
              token: customFile.token || `DL_TOKEN_${Date.now()}`
            }
          ];
        } else if (downloads.length === 0 && Array.isArray(item.items) && item.items.length > 0) {
          downloads = item.items.map((it, idx) => ({
            id: 100 + idx,
            order_id: orderId,
            product_id: it.product_id || it.productId || 1,
            product_title: it.product_title || it.title || 'Digital Deliverable',
            file_name: `${(it.product_title || 'package').toLowerCase().replace(/[^a-z0-9]/g, '-')}-deliverable.zip`,
            file_size: 15485760,
            token: `DL_TOKEN_${Date.now()}_${idx}`
          }));
        }

        return {
          id: item.order?.id || Date.now(),
          order_number: item.order?.order_number || 'ORD-ROX-001',
          total_amount: item.order?.total_amount || 0,
          currency: item.order?.currency || 'INR',
          payment_status: item.order?.payment_status || 'paid',
          order_status: item.order?.order_status || 'completed',
          created_at: item.order?.created_at || new Date().toISOString(),
          items: Array.isArray(item.items) ? item.items : [],
          downloads
        };
      });
    }
  } catch (e) {}
  return [];
}

export function simulateGetMyDownloads() {
  try {
    const existing = JSON.parse(localStorage.getItem('rollixia_orders') || '[]');
    const adminFiles = (() => {
      try {
        const raw = localStorage.getItem('rollixia_admin_files');
        return raw ? JSON.parse(raw) : [];
      } catch (e) { return []; }
    })();
    const orderFiles = (() => {
      try {
        const raw = localStorage.getItem('rollixia_order_files');
        return raw ? JSON.parse(raw) : {};
      } catch (e) { return {}; }
    })();

    if (Array.isArray(existing) && existing.length > 0) {
      const allDownloads = [];
      existing.forEach(entry => {
        const orderDate = entry.order?.created_at || new Date().toISOString();
        const orderId = entry.order?.id;
        const orderNumber = entry.order?.order_number;
        const customFile = (orderId && orderFiles[String(orderId)]) || (orderNumber && orderFiles[String(orderNumber)]);

        if (customFile) {
          allDownloads.push({
            download_id: Date.now() + Math.floor(Math.random() * 1000),
            order_id: orderId,
            order_number: orderNumber,
            product_id: 1,
            product_title: customFile.productTitle || 'Custom Order Deliverable',
            product_slug: 'digital-deliverable',
            file_name: customFile.fileName,
            file_size: customFile.fileSize,
            license_name: 'Commercial Production License',
            purchased_version: 'Custom Release',
            latest_version: 'Custom Release',
            purchase_date: customFile.updatedAt || orderDate,
            downloads_remaining: 10,
            token: customFile.token || `DL_TOKEN_${Date.now()}`,
            has_update: false
          });
        }

        if (Array.isArray(entry.downloads)) {
          entry.downloads.forEach(dl => {
            const attachedFile = adminFiles.find(f =>
              (dl.file_id && Number(f.id) === Number(dl.file_id)) ||
              (dl.product_id && Number(f.product_id) === Number(dl.product_id))
            );

            allDownloads.push({
              download_id: dl.id || Date.now(),
              order_id: dl.order_id || entry.order?.id,
              order_number: orderNumber,
              product_id: dl.product_id,
              file_id: dl.file_id || (attachedFile ? attachedFile.id : null),
              product_title: dl.product_title || 'Digital Product',
              product_slug: dl.product_slug || dl.file_name?.split('-v')[0] || 'product',
              file_name: (attachedFile && attachedFile.file_name) || dl.file_name || 'deliverable.zip',
              file_size: (attachedFile && attachedFile.file_size) || dl.file_size || 15485760,
              license_name: 'Commercial License',
              purchased_version: dl.version || '1.0.0',
              latest_version: (attachedFile && attachedFile.version) || dl.version || '1.0.0',
              purchase_date: orderDate,
              downloads_remaining: 10,
              token: dl.token || `DL_TOKEN_${Date.now()}`,
              has_update: false
            });
          });
        }
      });
      return allDownloads;
    }
  } catch (e) {}
  return [];
}

export function handleFallbackRoute(endpoint, options = {}, requestBody = null) {
  const clean = endpoint.replace(/^\/?api\/?/, '').split('?')[0].replace(/\/+$/, '');
  const queryStr = endpoint.includes('?') ? endpoint.substring(endpoint.indexOf('?')) : '';
  const method = (options.method || 'GET').toUpperCase();

  // Route directly to Admin Fallback Service if route starts with admin
  if (clean.startsWith('admin')) {
    const adminRes = handleAdminFallbackRoute(clean, method, options, requestBody, queryStr);
    if (adminRes !== null) return adminRes;
  }

  // POST Handlers
  if (method === 'POST') {
    if (clean === 'cart/calculate') {
      return simulateCalculateCart(requestBody);
    }
    if (clean === 'orders') {
      return simulateCreateOrder(requestBody);
    }
    if (clean === 'payments/verify') {
      return simulateVerifyPayment(requestBody);
    }
    if (clean === 'create-order') {
      const amount = Number(requestBody?.amount) > 0 ? Math.round(Number(requestBody.amount)) : 100;
      return {
        order_id: null,
        amount,
        currency: requestBody?.currency || 'INR',
        key_id: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_TYeE4nMLmsPaCZ'
      };
    }
    if (clean === 'verify-payment') {
      const orderNumber = requestBody?.orderNumber;
      if (orderNumber) {
        try {
          const existing = JSON.parse(localStorage.getItem('rollixia_orders') || '[]');
          const target = existing.find(o => o.order.order_number === orderNumber);
          if (target) {
            target.order.payment_status = 'paid';
            target.order.order_status = 'completed';
            target.order.payment_id = requestBody?.payment_id || `pay_${Date.now()}`;
            localStorage.setItem('rollixia_orders', JSON.stringify(existing));
          }
        } catch (e) {}
      }
      return {
        success: true,
        message: 'Payment verified successfully',
        payment_id: requestBody?.payment_id || `pay_${Date.now()}`,
        order_id: requestBody?.order_id || `order_${Date.now()}`,
        orderNumber
      };
    }
    if (clean === 'payments/paytm/initiate') {
      return {
        txnToken: `SIMULATED_PAYTM_TOKEN_${Date.now()}`,
        orderId: requestBody?.orderId || `ORD-${Date.now()}`,
        amount: requestBody?.amount || 0,
        mid: 'oCtvhv27957773497297'
      };
    }
    if (clean === 'wishlist/toggle') {
      return { in_wishlist: true, action: 'added' };
    }
    if (clean === 'auth/login' || clean === 'auth/register') {
      const email = (requestBody?.email || 'user@rollixia.com').trim().toLowerCase();
      let name = requestBody?.full_name;
      if (!name) {
        const username = email.split('@')[0];
        name = username.replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      }
      const userObj = {
        id: Date.now(),
        full_name: name,
        email,
        role: email.includes('admin') ? 'admin' : 'customer'
      };
      try {
        localStorage.setItem('digitalstore_user', JSON.stringify(userObj));
      } catch (e) {}
      return {
        token: `TOKEN_SIM_${Date.now()}`,
        user: userObj
      };
    }
  }

  // GET Handlers
  if (clean === 'auth/me') {
    let activeUser = null;
    try {
      const saved = localStorage.getItem('digitalstore_user');
      if (saved) activeUser = JSON.parse(saved);
    } catch (e) {}
    if (!activeUser) {
      activeUser = {
        id: 1,
        full_name: 'Rollixia Customer',
        email: 'customer@rollixia.com',
        role: 'customer'
      };
    }
    return { user: activeUser };
  }
  if (clean === 'categories') {
    return FALLBACK_CATEGORIES;
  }
  if (clean === 'products/featured') {
    return getFallbackFeatured();
  }
  if (clean === 'products') {
    return getFallbackProducts(queryStr);
  }
  if (clean.startsWith('products/') && clean.endsWith('/related')) {
    const raw = clean.replace(/^products\//, '').replace(/\/related$/, '');
    return getFallbackRelated(raw);
  }
  if (clean.startsWith('products/')) {
    const raw = clean.replace(/^products\//, '');
    const product = getFallbackProductBySlug(raw);
    if (product) return product;
  }
  if (clean === 'orders/notifications') {
    try {
      return JSON.parse(localStorage.getItem('rollixia_customer_notifications') || '[]');
    } catch (e) { return []; }
  }
  if (clean.startsWith('orders/notifications/') && clean.endsWith('/read')) {
    const notifId = clean.replace(/^orders\/notifications\//, '').replace(/\/read$/, '');
    try {
      const notifs = JSON.parse(localStorage.getItem('rollixia_customer_notifications') || '[]');
      const target = notifs.find(n => String(n.id) === String(notifId));
      if (target) {
        target.is_read = true;
        localStorage.setItem('rollixia_customer_notifications', JSON.stringify(notifs));
      }
    } catch (e) {}
    return { success: true };
  }
  if (clean === 'orders/my-orders') {
    return simulateGetMyOrders();
  }
  if (clean === 'downloads/my-downloads') {
    return simulateGetMyDownloads();
  }
  if (clean === 'support/tickets' || clean.startsWith('support/tickets')) {
    return [];
  }
  if (clean === 'cart' || clean === 'wishlist') {
    return [];
  }
  if (clean.startsWith('orders/')) {
    const orderNum = clean.replace(/^orders\//, '');
    return simulateGetOrder(orderNum);
  }
  if (clean === 'settings' || clean === 'settings/') {
    return FALLBACK_SETTINGS;
  }
  if (clean === 'payments/paytm/config') {
    return FALLBACK_PAYTM_CONFIG;
  }

  return null;
}
