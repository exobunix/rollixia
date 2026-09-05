/**
 * ImageKit Client Utilities
 * Configured with ImagekitID: avdarinn, URL endpoint: https://ik.imagekit.io/avdarinn, folder: digitalverse
 */

export const IMAGEKIT_CONFIG = {
  id: import.meta.env.VITE_IMAGEKIT_ID || 'avdarinn',
  urlEndpoint: import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/avdarinn',
  publicKey: import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY || 'public_uzSklsoDFlGNoIPGFtTdcYJU32Y=',
  folder: import.meta.env.VITE_IMAGEKIT_FOLDER || 'digitalverse'
};

/**
 * Generate an ImageKit CDN URL with responsive image transformations
 * @param {string} pathOrUrl - File path (e.g. "product.jpg" or full URL)
 * @param {Object} [transformations={}] - E.g. { width: 600, height: 400, quality: 80, format: 'webp' }
 * @returns {string} Transformed ImageKit URL
 */
export function getImageKitUrl(pathOrUrl, transformations = {}) {
  if (!pathOrUrl) return '';

  // If it's already an ImageKit URL or relative path
  let cleanPath = pathOrUrl;
  const endpoint = IMAGEKIT_CONFIG.urlEndpoint.replace(/\/$/, '');

  if (cleanPath.startsWith(endpoint)) {
    cleanPath = cleanPath.replace(endpoint, '');
  }

  // Ensure path starts with slash
  if (!cleanPath.startsWith('/') && !cleanPath.startsWith('http')) {
    cleanPath = `/${IMAGEKIT_CONFIG.folder}/${cleanPath}`;
  }

  // Build transform string
  const trParts = [];
  if (transformations.width) trParts.push(`w-${transformations.width}`);
  if (transformations.height) trParts.push(`h-${transformations.height}`);
  if (transformations.quality) trParts.push(`q-${transformations.quality}`);
  if (transformations.format) trParts.push(`f-${transformations.format}`);
  if (transformations.crop) trParts.push(`c-${transformations.crop}`);

  if (trParts.length > 0) {
    const trString = `tr:${trParts.join(',')}`;
    if (cleanPath.startsWith('http')) {
      return `${cleanPath}?tr=${trParts.join(',')}`;
    }
    return `${endpoint}/${trString}${cleanPath}`;
  }

  if (cleanPath.startsWith('http')) {
    return cleanPath;
  }
  return `${endpoint}${cleanPath}`;
}

/**
 * Upload a media file directly to ImageKit via backend auth
 * @param {File} file - Browser File object
 * @param {string} [folder=digitalverse] - Destination folder
 * @returns {Promise<Object>} Upload response with URL
 */
export async function uploadToImageKit(file, folder = IMAGEKIT_CONFIG.folder) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await fetch('/api/imagekit/upload', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(err.error || 'Failed to upload to ImageKit');
  }

  return response.json();
}
