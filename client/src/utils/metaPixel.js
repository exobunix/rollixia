/**
 * Meta Pixel Tracking Utilities
 * Pixel ID: 1086620953873919
 */

export function isPixelAvailable() {
  return typeof window !== 'undefined' && typeof window.fbq === 'function';
}

/**
 * Track SPA Route PageView
 */
export function trackPixelPageView() {
  if (!isPixelAvailable()) return;
  try {
    window.fbq('track', 'PageView');
  } catch (err) {
    console.debug('[MetaPixel] PageView tracking failed', err);
  }
}

/**
 * Track Standard Meta Event (e.g. 'AddToCart', 'Purchase', 'ViewContent', 'InitiateCheckout')
 * @param {string} eventName
 * @param {object} params
 */
export function trackPixelEvent(eventName, params = {}) {
  if (!isPixelAvailable()) return;
  try {
    window.fbq('track', eventName, params);
  } catch (err) {
    console.debug(`[MetaPixel] Event "${eventName}" tracking failed`, err);
  }
}

/**
 * Track Custom Event
 * @param {string} customEventName
 * @param {object} params
 */
export function trackPixelCustom(customEventName, params = {}) {
  if (!isPixelAvailable()) return;
  try {
    window.fbq('trackCustom', customEventName, params);
  } catch (err) {
    console.debug(`[MetaPixel] Custom event "${customEventName}" tracking failed`, err);
  }
}
