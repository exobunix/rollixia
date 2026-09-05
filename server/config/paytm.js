/**
 * Paytm for Business Gateway Configuration
 * Merchant ID: oCtvhv27957773497297
 */

const paytmConfig = {
  mid: process.env.PAYTM_MERCHANT_ID || 'oCtvhv27957773497297',
  key: process.env.PAYTM_MERCHANT_KEY || '',
  website: process.env.PAYTM_WEBSITE || 'DEFAULT',
  environment: process.env.PAYTM_ENVIRONMENT || 'production',

  getHost() {
    return this.environment === 'staging' ? 'securegw-stage.paytm.in' : 'securegw.paytm.in';
  },

  getBaseUrl() {
    return `https://${this.getHost()}`;
  },

  getCheckoutJsUrl() {
    return `https://${this.getHost()}/merchantpgpui/checkoutjs/merchants/${this.mid}.js`;
  }
};

module.exports = paytmConfig;
