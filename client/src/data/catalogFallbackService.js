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

export function handleFallbackRoute(endpoint) {
  const clean = endpoint.replace(/^\/?api\/?/, '').split('?')[0];
  const queryStr = endpoint.includes('?') ? endpoint.substring(endpoint.indexOf('?')) : '';

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
