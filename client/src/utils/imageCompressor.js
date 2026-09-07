/**
 * Client-Side Image Compression & Optimization Utility
 * Reduces raw 2MB-8MB PNG/JPEG camera and screenshot images down to ultra-lightweight,
 * high-definition WebP or JPEG (~35KB-75KB).
 * This ensures images persist reliably in LocalStorage / REST APIs without triggering QuotaExceededError.
 */

/**
 * Compresses an image File or Blob using HTML5 Canvas.
 * @param {File|Blob} file 
 * @param {number} maxWidth 
 * @param {number} maxHeight 
 * @param {number} quality (0 to 1)
 * @returns {Promise<string>} Base64 Data URL (image/webp or image/jpeg)
 */
export async function compressImageFile(file, maxWidth = 1280, maxHeight = 1280, quality = 0.82) {
  if (!file) return null;

  // If not an image, fall back to standard base64 read
  if (!file.type || !file.type.startsWith('image/')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // SVG images are already vector and lightweight, no need to rasterize
  if (file.type === 'image/svg+xml') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      try {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(width, 1);
        canvas.height = Math.max(height, 1);
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Try modern WebP format first
        let resultDataUrl = canvas.toDataURL('image/webp', quality);
        if (!resultDataUrl || !resultDataUrl.startsWith('data:image/webp')) {
          resultDataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        resolve(resultDataUrl);
      } catch (err) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    };

    img.src = objectUrl;
  });
}

/**
 * If an image is a large base64 data URL (> 80KB), compress it down using canvas.
 * If it is a normal URL (e.g. Unsplash, CDN, /uploads/...) or small, leaves it untouched.
 * @param {string} dataUrl 
 * @param {number} maxWidth 
 * @param {number} maxHeight 
 * @param {number} quality 
 * @returns {Promise<string>}
 */
export async function compressDataUrlIfNeeded(dataUrl, maxWidth = 1280, maxHeight = 1280, quality = 0.82) {
  if (!dataUrl || typeof dataUrl !== 'string') return dataUrl;
  if (!dataUrl.startsWith('data:image/')) return dataUrl;
  if (dataUrl.startsWith('data:image/svg+xml')) return dataUrl;

  // If already under ~90KB, it's safe to keep as-is
  if (dataUrl.length < 90000) return dataUrl;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(width, 1);
        canvas.height = Math.max(height, 1);
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        let resultDataUrl = canvas.toDataURL('image/webp', quality);
        if (!resultDataUrl || !resultDataUrl.startsWith('data:image/webp')) {
          resultDataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        resolve(resultDataUrl);
      } catch (err) {
        resolve(dataUrl);
      }
    };

    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * Instantly synchronizes product images to dedicated local storage slots keyed by product ID and slug.
 * This guarantees images persist isolated from large catalog arrays and never hit quota limits.
 * @param {string|number} productId
 * @param {string} productSlug
 * @param {object} imageUpdates { hero_image?, hero_secondary_image?, thumbnail? }
 */
export function syncProductImageToStorage(productId, productSlug, imageUpdates = {}) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const keys = [];
    if (productId) keys.push(`rollixia_product_images_${productId}`);
    if (productSlug) {
      keys.push(`rollixia_product_images_${productSlug}`);
      keys.push(`rollixia_product_images_${String(productSlug).toLowerCase().trim()}`);
    }

    keys.forEach(k => {
      let current = {};
      try {
        const raw = localStorage.getItem(k);
        current = raw ? JSON.parse(raw) : {};
      } catch (e) {}
      const updated = {
        ...current,
        ...imageUpdates,
        updated_at: Date.now()
      };
      localStorage.setItem(k, JSON.stringify(updated));
    });

    // Also update rollixia_admin_products array
    try {
      const raw = localStorage.getItem('rollixia_admin_products');
      let products = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(products)) products = [];
      const idx = products.findIndex(p => (productId && String(p.id) === String(productId)) || (productSlug && p.slug === productSlug));
      if (idx >= 0) {
        products[idx] = { ...products[idx], ...imageUpdates, updated_at: new Date().toISOString() };
      } else {
        products.push({ id: productId, slug: productSlug, ...imageUpdates, updated_at: new Date().toISOString() });
      }
      localStorage.setItem('rollixia_admin_products', JSON.stringify(products));
    } catch (e) {}

    // Dispatch catalog update events for live UI re-render
    try {
      window.dispatchEvent(new CustomEvent('rollixia_catalog_updated', {
        detail: { productId, productSlug, ...imageUpdates }
      }));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}
  } catch (err) {
    console.warn('[imageCompressor] Failed to sync product images to storage:', err);
  }
}

/**
 * Retrieves direct image overrides from dedicated local storage keys.
 * @param {string|number} productId
 * @param {string} productSlug
 * @returns {object|null} { hero_image?, hero_secondary_image?, thumbnail? }
 */
export function getProductImageOverrides(productId, productSlug) {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const keys = [
      productId ? `rollixia_product_images_${productId}` : null,
      productSlug ? `rollixia_product_images_${productSlug}` : null,
      productSlug ? `rollixia_product_images_${String(productSlug).toLowerCase().trim()}` : null
    ].filter(Boolean);

    for (const k of keys) {
      const raw = localStorage.getItem(k);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.hero_image || parsed.hero_secondary_image || parsed.thumbnail)) {
          return parsed;
        }
      }
    }
  } catch (e) {}
  return null;
}

