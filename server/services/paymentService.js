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
  async createPaymentSession(order, customer) {
    const amountInPaise = Math.max(100, Math.round(order.totalAmount * 100));
    try {
      const { getRazorpayInstance } = require('../config/razorpay');
      const razorpay = getRazorpayInstance();
      const rzpOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: order.currency || 'INR',
        receipt: (order.orderNumber || `rcpt_${Date.now()}`).substring(0, 40),
        notes: {
          orderNumber: order.orderNumber || '',
          orderId: String(order.orderId || '')
        }
      });

      return {
        success: true,
        provider: 'razorpay',
        orderId: rzpOrder.id,
        keyId: process.env.RAZORPAY_KEY_ID,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency
      };
    } catch (err) {
      console.error('Razorpay SDK order creation error in paymentService:', err);
      throw err;
    }
  }

  async verifyPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return { verified: false, reason: 'Missing required Razorpay fields' };
    }
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return { verified: false, reason: 'RAZORPAY_KEY_SECRET is not configured' };
    }
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex');
    const verified = (expectedSignature === razorpay_signature);
    return {
      verified,
      provider: 'razorpay',
      transactionId: razorpay_payment_id,
      reason: verified ? null : 'Payment signature mismatch'
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
