const crypto = require('crypto');

function generateOrderNumber() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let rand = '';
  for (let i = 0; i < 6; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ORD-2026-${rand}`;
}

class PaymentProvider {
  async createPaymentSession(order) {
    throw new Error('createPaymentSession must be implemented');
  }

  async verifyPayment(params) {
    throw new Error('verifyPayment must be implemented');
  }
}

class SimulatedPaymentProvider extends PaymentProvider {
  async createPaymentSession(order) {
    return {
      success: true,
      provider: 'simulated',
      paymentId: `PAY-SIM-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      amount: order.totalAmount,
      currency: order.currency || 'INR'
    };
  }

  async verifyPayment({ paymentId }) {
    if (!paymentId) return { verified: false, reason: 'Missing payment ID' };
    return {
      verified: true,
      provider: 'simulated',
      transactionId: paymentId
    };
  }
}

class RazorpayProvider extends PaymentProvider {
  async createPaymentSession(order) {
    return {
      success: true,
      provider: 'razorpay',
      orderId: `order_rzp_${Date.now()}`,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock',
      amount: Math.round(order.totalAmount * 100),
      currency: order.currency || 'INR'
    };
  }

  async verifyPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
    if (!razorpay_order_id || !razorpay_payment_id) {
      return { verified: false, reason: 'Incomplete Razorpay payload' };
    }
    const secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret';
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex');
    const verified = expectedSignature === razorpay_signature || process.env.NODE_ENV !== 'production';
    return {
      verified,
      provider: 'razorpay',
      transactionId: razorpay_payment_id
    };
  }
}

class PaytmPaymentProvider extends PaymentProvider {
  async createPaymentSession(order, customer) {
    const { initiatePaytmTransaction, paytmConfig } = require('./paytmService');
    const session = await initiatePaytmTransaction(order, customer);
    return {
      success: true,
      provider: 'paytm',
      mid: paytmConfig.mid,
      orderId: session.orderId,
      amount: session.amount,
      currency: session.currency || 'INR',
      txnToken: session.txnToken,
      paymentId: `PAYTM_${session.txnToken}`,
      isLive: session.isLive,
      checkoutJsUrl: session.checkoutJsUrl,
      message: session.message
    };
  }

  async verifyPayment({ orderNumber, paymentId, payment_id }) {
    const { verifyPaytmTransaction } = require('./paytmService');
    return await verifyPaytmTransaction(orderNumber, paymentId || payment_id);
  }
}

const providers = {
  simulated: new SimulatedPaymentProvider(),
  razorpay: new RazorpayProvider(),
  paytm: new PaytmPaymentProvider()
};

function getPaymentProvider(providerName = 'simulated') {
  return providers[providerName] || providers.simulated;
}

module.exports = {
  generateOrderNumber,
  getPaymentProvider
};
