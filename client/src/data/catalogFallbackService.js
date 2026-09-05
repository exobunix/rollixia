import { FALLBACK_CATEGORIES, FALLBACK_PRODUCTS } from './fallbackCatalog.js';

export { FALLBACK_CATEGORIES, FALLBACK_PRODUCTS };

export function getFallbackFeatured() {
  const all = [...FALLBACK_PRODUCTS];
  const bestsellers = all.filter(p => (p.sales_count > 0 || p.is_bestseller === 1)).slice(0, 14);
  const trending = all.filter(p => (p.badge === 'TRENDING' || p.badge === 'POPULAR' || p.is_trending === 1)).slice(0, 14);
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

  let filtered = FALLBACK_PRODUCTS.filter(p => {
    if (category && p.category_slug !== category && String(p.category_id) !== category) {
      return false;
    }
    if (badge && p.badge !== badge) {
      return false;
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
  return FALLBACK_PRODUCTS.find(p => p.slug === slug || String(p.id) === slug) || null;
}

export function getFallbackRelated(slug) {
  const current = getFallbackProductBySlug(slug);
  if (!current) return FALLBACK_PRODUCTS.slice(0, 4);
  return FALLBACK_PRODUCTS.filter(p => p.id !== current.id && p.category_id === current.category_id).slice(0, 4);
}

export const FALLBACK_SETTINGS = {
  store_name: 'Rollixia',
  store_tagline: 'Premium Digital Products, Software Starters & UI Kits',
  support_email: 'support@rollixia.com',
  currency: 'INR',
  currency_symbol: '₹'
};

export const FALLBACK_PAYTM_CONFIG = {
  mid: 'oCtvhv27957773497297',
  environment: 'production',
  website: 'DEFAULT',
  isConfigured: true,
  hasKey: false,
  checkoutJsUrl: 'https://securegw.paytm.in/merchantpgpui/checkoutjs/merchants/oCtvhv27957773497297.js'
};

export function simulateCalculateCart(payload = {}) {
  const items = payload.items || [];
  const couponCode = payload.couponCode;

  let subtotal = 0;
  const calculatedItems = items.map(cartItem => {
    const product = FALLBACK_PRODUCTS.find(p => p.id === cartItem.productId) || FALLBACK_PRODUCTS[0];
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

  const downloads = calculation.items.map((item, idx) => {
    const p = FALLBACK_PRODUCTS.find(prod => prod.id === item.productId) || FALLBACK_PRODUCTS[0];
    return {
      id: 1000 + idx,
      order_id: order.id,
      product_title: item.productTitle,
      file_name: `${p.slug || 'product'}-v1.0.0.zip`,
      file_size: 15485760,
      version: '1.0.0',
      token: `DL_TOKEN_${Date.now()}_${idx}`
    };
  });

  const fullOrderData = { order, items: orderItems, downloads };

  try {
    const existing = JSON.parse(localStorage.getItem('rollixia_orders') || '[]');
    existing.unshift(fullOrderData);
    localStorage.setItem('rollixia_orders', JSON.stringify(existing));
  } catch (e) {}

  return {
    order,
    orderNumber,
    isFree: calculation.total === 0,
    paymentSession: {
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
      localStorage.setItem('rollixia_orders', JSON.stringify(existing));
    }
  } catch (e) {}

  return {
    success: true,
    status: 'TXN_SUCCESS',
    orderNumber,
    message: 'Paytm Business transaction verified successfully'
  };
}

export function simulateGetOrder(orderNumber) {
  try {
    const existing = JSON.parse(localStorage.getItem('rollixia_orders') || '[]');
    const target = existing.find(o => o.order.order_number === orderNumber);
    if (target) return target;
  } catch (e) {}

  const p = FALLBACK_PRODUCTS[0];
  return {
    order: {
      id: 9999,
      order_number: orderNumber,
      customer_name: 'Valued Customer',
      customer_email: 'customer@example.com',
      total_amount: p.sale_price ?? p.regular_price ?? 2499,
      currency: 'INR',
      payment_provider: 'paytm',
      payment_status: 'paid',
      order_status: 'completed',
      created_at: new Date().toISOString()
    },
    items: [
      {
        product_title: p.title,
        license_name: 'Standard Commercial License',
        price: p.sale_price ?? p.regular_price ?? 2499
      }
    ],
    downloads: [
      {
        id: 1001,
        product_title: p.title,
        file_name: `${p.slug}-v1.0.0.zip`,
        file_size: 15485760,
        version: '1.0.0',
        token: `DL_TOKEN_${Date.now()}`
      }
    ]
  };
}

export function handleFallbackRoute(endpoint, options = {}, requestBody = null) {
  const clean = endpoint.replace(/^\/?api\/?/, '').split('?')[0];
  const queryStr = endpoint.includes('?') ? endpoint.substring(endpoint.indexOf('?')) : '';
  const method = (options.method || 'GET').toUpperCase();

  // POST Handlers
  if (method === 'POST') {
    if (clean === 'cart/calculate' || clean === 'cart/calculate/') {
      return simulateCalculateCart(requestBody);
    }
    if (clean === 'orders' || clean === 'orders/') {
      return simulateCreateOrder(requestBody);
    }
    if (clean === 'payments/verify' || clean === 'payments/verify/') {
      return simulateVerifyPayment(requestBody);
    }
    if (clean === 'payments/paytm/initiate' || clean === 'payments/paytm/initiate/') {
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
      return {
        token: `TOKEN_SIM_${Date.now()}`,
        user: {
          id: 1,
          full_name: requestBody?.full_name || 'Rollixia Member',
          email: requestBody?.email || 'user@rollixia.com',
          role: 'customer'
        }
      };
    }
  }

  // GET Handlers
  if (clean === 'categories' || clean === 'categories/') {
    return FALLBACK_CATEGORIES;
  }
  if (clean === 'products/featured' || clean === 'products/featured/') {
    return getFallbackFeatured();
  }
  if (clean === 'products' || clean === 'products/') {
    return getFallbackProducts(queryStr);
  }
  if (clean.startsWith('products/') && clean.endsWith('/related')) {
    const slug = clean.replace(/^products\//, '').replace(/\/related$/, '');
    return getFallbackRelated(slug);
  }
  if (clean.startsWith('products/')) {
    const slug = clean.replace(/^products\//, '');
    const product = getFallbackProductBySlug(slug);
    if (product) return product;
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
  if (clean === 'cart' || clean === 'wishlist') {
    return [];
  }

  return null;
}
