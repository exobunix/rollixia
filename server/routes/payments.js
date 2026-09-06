const express = require('express');
const router = express.Router();
const { getDatabase } = require('../config/database');
const { getPaymentProvider } = require('../services/paymentService');
const { generateDownloadToken } = require('../services/downloadService');

// POST /api/payments/verify
router.post('/verify', async (req, res) => {
  try {
    const orderNumber = req.body.orderNumber || req.body.order_number;
    const paymentId = req.body.paymentId || req.body.payment_id || req.body.razorpay_payment_id;
    const provider = req.body.provider || req.body.payment_provider || 'simulated';
    const signature = req.body.razorpay_signature || req.body.signature;
    const rzpOrderId = req.body.razorpay_order_id || req.body.order_id || req.body.rzpOrderId || req.body.rzp_order_id;

    if (!orderNumber || !paymentId) {
      return res.status(400).json({ error: 'Order number and payment reference required' });
    }

    const db = await getDatabase();
    const order = db.get('SELECT * FROM orders WHERE order_number = ?', [orderNumber]);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.payment_status === 'paid') {
      // Already paid and verified
      return res.json({
        success: true,
        message: 'Order already verified and paid',
        orderNumber: order.order_number
      });
    }

    const paymentProvider = getPaymentProvider(provider);
    const verificationResult = await paymentProvider.verifyPayment({
      orderNumber,
      paymentId,
      payment_id: paymentId,
      razorpay_order_id: rzpOrderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature
    });

    if (!verificationResult.verified) {
      db.run('UPDATE orders SET payment_status = "failed" WHERE id = ?', [order.id]);
      return res.status(400).json({
        success: false,
        error: verificationResult.reason || 'Payment verification failed'
      });
    }

    // Mark order as paid & completed
    db.run(
      `UPDATE orders SET
        payment_id = ?,
        payment_status = 'paid',
        order_status = 'completed'
       WHERE id = ?`,
      [paymentId, order.id]
    );

    // Generate digital download entitlements
    const orderItems = db.query('SELECT product_id FROM order_items WHERE order_id = ?', [order.id]);
    const tomorrow = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    for (const item of orderItems) {
      const activeFile = db.get(
        'SELECT id FROM product_files WHERE product_id = ? AND is_active = 1 ORDER BY id DESC LIMIT 1',
        [item.product_id]
      );

      if (activeFile) {
        // Check if download record already exists
        const existingDownload = db.get(
          'SELECT id FROM downloads WHERE order_id = ? AND product_file_id = ?',
          [order.id, activeFile.id]
        );

        if (!existingDownload) {
          const downloadToken = generateDownloadToken(order.id, order.user_id || 0, activeFile.id);
          db.run(
            `INSERT INTO downloads (order_id, user_id, product_file_id, token, expires_at, max_downloads)
             VALUES (?, ?, ?, ?, ?, 10)`,
            [order.id, order.user_id, activeFile.id, downloadToken, tomorrow]
          );
        }
      }

      // Increment product sales count
      db.run('UPDATE products SET sales_count = sales_count + 1 WHERE id = ?', [item.product_id]);
    }

    res.json({
      success: true,
      message: 'Payment verified and digital access granted!',
      orderNumber: order.order_number
    });
  } catch (err) {
    console.error('Payment verification error:', err);
    res.status(500).json({ error: 'Server error during payment verification' });
  }
});

// POST /api/payments/webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  // Webhook listener for Stripe / Razorpay / Paytm background events
  res.json({ received: true });
});

// GET /api/payments/paytm/config
router.get('/paytm/config', (req, res) => {
  const paytmConfig = require('../config/paytm');
  res.json({
    mid: paytmConfig.mid,
    environment: paytmConfig.environment,
    website: paytmConfig.website,
    isConfigured: Boolean(paytmConfig.mid),
    hasKey: Boolean(paytmConfig.key),
    checkoutJsUrl: paytmConfig.getCheckoutJsUrl()
  });
});

// POST /api/payments/paytm/initiate
router.post('/paytm/initiate', async (req, res) => {
  try {
    const orderNumber = req.body.orderNumber || req.body.order_number;
    if (!orderNumber) {
      return res.status(400).json({ error: 'orderNumber is required' });
    }

    const db = await getDatabase();
    const order = db.get('SELECT * FROM orders WHERE order_number = ?', [orderNumber]);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const { initiatePaytmTransaction } = require('../services/paytmService');
    const session = await initiatePaytmTransaction(order, {
      email: req.body.customerEmail || order.customer_email,
      phone: req.body.customerPhone || '9999999999'
    });

    res.json(session);
  } catch (err) {
    console.error('Paytm initiate error:', err);
    res.status(500).json({ error: 'Failed to initiate Paytm transaction' });
  }
});

// POST /api/payments/paytm/callback
router.post('/paytm/callback', express.urlencoded({ extended: true }), async (req, res) => {
  try {
    const orderNumber = req.body.ORDERID || req.body.orderId;
    const txnStatus = req.body.STATUS;
    const txnId = req.body.TXNID;

    const db = await getDatabase();
    const order = db.get('SELECT * FROM orders WHERE order_number = ?', [orderNumber]);

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

    if (!order) {
      return res.redirect(`${clientUrl}/#cart?error=OrderNotFound`);
    }

    if (txnStatus === 'TXN_SUCCESS' || !process.env.PAYTM_MERCHANT_KEY) {
      // Mark order as paid
      db.run('UPDATE orders SET payment_id = ?, payment_status = "paid", order_status = "completed" WHERE id = ?', [txnId || `PAYTM_${Date.now()}`, order.id]);
      return res.redirect(`${clientUrl}/#order-success?orderNumber=${orderNumber}`);
    } else {
      db.run('UPDATE orders SET payment_status = "failed" WHERE id = ?', [order.id]);
      return res.redirect(`${clientUrl}/#cart?error=PaymentFailed`);
    }
  } catch (err) {
    console.error('Paytm callback error:', err);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/#cart?error=CallbackError`);
  }
});

module.exports = router;
