const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { getRazorpayInstance } = require('../config/razorpay');
const { getDatabase } = require('../config/database');
const { generateDownloadToken } = require('../services/downloadService');

/**
 * POST /api/create-order
 * Creates a Razorpay order
 * Request: { amount (paise), currency, receipt, notes }
 * Return: { order_id, amount, currency, key_id }
 */
router.post('/create-order', async (req, res) => {
  try {
    const rawAmount = req.body.amount;
    const currency = req.body.currency || 'INR';
    const receipt = req.body.receipt || `rcpt_${Date.now()}`;
    const notes = req.body.notes || {};

    // Validate amount
    const amount = Number(rawAmount);
    if (isNaN(amount) || amount < 100) {
      return res.status(400).json({
        error: 'Invalid amount. Minimum amount is 100 paise (₹1.00).'
      });
    }

    // Check auth / credentials
    let razorpay;
    try {
      razorpay = getRazorpayInstance();
    } catch (authErr) {
      return res.status(401).json({
        error: authErr.message || 'Razorpay authentication failed: missing credentials'
      });
    }

    // Create order with Razorpay API
    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(amount),
      currency,
      receipt: String(receipt).substring(0, 40),
      notes
    });

    return res.status(200).json({
      order_id: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    console.error('Razorpay create-order error:', err);

    // Handle authentication / API failure
    if (err.statusCode === 401 || err.code === 'BAD_REQUEST_ERROR' && err.error?.description?.toLowerCase().includes('authenticate')) {
      return res.status(401).json({ error: 'Razorpay authentication failed' });
    }

    return res.status(500).json({
      error: err.error?.description || err.message || 'Failed to create Razorpay order'
    });
  }
});

/**
 * POST /api/verify-payment
 * Verifies Razorpay payment signature using HMAC-SHA256
 * Request: { order_id / razorpay_order_id, payment_id / razorpay_payment_id, razorpay_signature / signature, orderNumber }
 * Return: { success: true/false, message, payment_id, order_id }
 */
router.post('/verify-payment', async (req, res) => {
  try {
    const order_id = req.body.order_id || req.body.razorpay_order_id;
    const payment_id = req.body.payment_id || req.body.razorpay_payment_id;
    const razorpay_signature = req.body.razorpay_signature || req.body.signature;
    const orderNumber = req.body.orderNumber || req.body.order_number;

    // Validate required fields
    if (!order_id || !payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required payment verification fields (order_id, payment_id, razorpay_signature)'
      });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return res.status(500).json({
        success: false,
        error: 'Razorpay secret key not configured on server'
      });
    }

    // Verify HMAC-SHA256 signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${order_id}|${payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      // If associated with a store order, do NOT mark as paid (mark failed)
      if (orderNumber) {
        try {
          const db = await getDatabase();
          const order = db.get('SELECT id FROM orders WHERE order_number = ?', [orderNumber]);
          if (order) {
            db.run('UPDATE orders SET payment_status = "failed" WHERE id = ?', [order.id]);
          }
        } catch (dbErr) {
          console.error('Error updating failed order status in DB:', dbErr);
        }
      }

      return res.status(400).json({
        success: false,
        error: 'Payment verification failed: signature mismatch'
      });
    }

    // Signatures match! If associated with an order in the database, complete order
    if (orderNumber) {
      try {
        const db = await getDatabase();
        const order = db.get('SELECT * FROM orders WHERE order_number = ?', [orderNumber]);

        if (order && order.payment_status !== 'paid') {
          // Update order status
          db.run(
            `UPDATE orders SET
              payment_id = ?,
              payment_status = 'paid',
              order_status = 'completed'
             WHERE id = ?`,
            [payment_id, order.id]
          );

          // Generate digital download entitlements
          const orderItems = db.query('SELECT product_id FROM order_items WHERE order_id = ?', [order.id]);
          const expiryDate = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

          for (const item of orderItems) {
            const activeFile = db.get(
              'SELECT id FROM product_files WHERE product_id = ? AND is_active = 1 ORDER BY id DESC LIMIT 1',
              [item.product_id]
            );

            if (activeFile) {
              const existingDownload = db.get(
                'SELECT id FROM downloads WHERE order_id = ? AND product_file_id = ?',
                [order.id, activeFile.id]
              );

              if (!existingDownload) {
                const downloadToken = generateDownloadToken(order.id, order.user_id || 0, activeFile.id);
                db.run(
                  `INSERT INTO downloads (order_id, user_id, product_file_id, token, expires_at, max_downloads)
                   VALUES (?, ?, ?, ?, ?, 10)`,
                  [order.id, order.user_id, activeFile.id, downloadToken, expiryDate]
                );
              }
            }

            db.run('UPDATE products SET sales_count = sales_count + 1 WHERE id = ?', [item.product_id]);
          }
        }
      } catch (dbErr) {
        console.error('Database update error during Razorpay payment completion:', dbErr);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      payment_id,
      order_id,
      orderNumber: orderNumber || null
    });
  } catch (err) {
    console.error('Razorpay verify-payment error:', err);
    return res.status(500).json({
      success: false,
      error: 'Server error during payment verification'
    });
  }
});

module.exports = router;
