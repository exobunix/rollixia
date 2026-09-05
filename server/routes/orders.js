const express = require('express');
const router = express.Router();
const { getDatabase } = require('../config/database');
const { authenticateUser, optionalUser } = require('../middleware/auth');
const { generateOrderNumber, getPaymentProvider } = require('../services/paymentService');
const { generateDownloadToken } = require('../services/downloadService');

// POST /api/orders (Create order)
router.post('/', optionalUser, async (req, res) => {
  try {
    const customer_email = req.body.customer_email || req.body.customerEmail;
    const customer_name = req.body.customer_name || req.body.customerName;
    const items = req.body.items || [];
    const coupon_code = req.body.coupon_code || req.body.couponCode;
    const payment_provider = req.body.payment_provider || req.body.paymentProvider || 'simulated';
    const currency = req.body.currency || 'INR';

    if (!customer_email || !customer_name || !items.length) {
      return res.status(400).json({ error: 'Customer details and cart items are required' });
    }

    const db = await getDatabase();
    let subtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const pid = item.productId || item.product_id;
      const lid = item.licenseId || item.license_id || null;
      const product = db.get('SELECT * FROM products WHERE id = ? AND status = "published"', [pid]);
      if (!product) continue;

      let price = product.sale_price !== null && product.sale_price !== undefined ? product.sale_price : product.regular_price;
      let licenseName = 'Standard License';
      let licenseId = lid;

      if (lid) {
        const license = db.get('SELECT * FROM product_licenses WHERE id = ? AND product_id = ?', [lid, product.id]);
        if (license) {
          price = license.price;
          licenseName = license.license_name;
        }
      }

      subtotal += price;
      verifiedItems.push({
        productId: product.id,
        licenseId,
        productTitle: product.title,
        licenseName,
        price
      });
    }

    if (!verifiedItems.length) {
      return res.status(400).json({ error: 'No valid products in cart' });
    }

    // Coupon verification
    let discount = 0;
    let couponId = null;
    if (coupon_code && coupon_code.trim()) {
      const coupon = db.get(
        'SELECT * FROM coupons WHERE UPPER(code) = ? AND is_active = 1',
        [coupon_code.trim().toUpperCase()]
      );
      if (coupon && subtotal >= coupon.min_order_value && coupon.times_used < coupon.usage_limit) {
        couponId = coupon.id;
        if (coupon.discount_type === 'percentage') {
          discount = (subtotal * coupon.discount_value) / 100;
          if (coupon.max_discount && discount > coupon.max_discount) {
            discount = coupon.max_discount;
          }
        } else {
          discount = coupon.discount_value;
        }
        if (discount > subtotal) discount = subtotal;
      }
    }

    const discountedSubtotal = Math.max(0, subtotal - discount);
    const taxAmount = Math.round(discountedSubtotal * 0.18 * 100) / 100;
    const totalAmount = Math.round((discountedSubtotal + taxAmount) * 100) / 100;

    const orderNumber = generateOrderNumber();
    const userId = req.user ? req.user.id : null;

    // Is this a 100% free order? (e.g. ₹0 freebie)
    const isFree = totalAmount === 0;
    const paymentStatus = isFree ? 'paid' : 'pending';
    const orderStatus = isFree ? 'completed' : 'pending';

    const orderRes = db.run(
      `INSERT INTO orders (
        order_number, user_id, customer_email, customer_name, subtotal, discount_amount,
        tax_amount, total_amount, currency, payment_provider, payment_status, order_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderNumber,
        userId,
        customer_email.trim().toLowerCase(),
        customer_name.trim(),
        subtotal,
        discount,
        taxAmount,
        totalAmount,
        currency,
        payment_provider,
        paymentStatus,
        orderStatus
      ]
    );

    const orderId = orderRes.lastInsertRowid;

    // Insert Order Items
    for (const vItem of verifiedItems) {
      db.run(
        `INSERT INTO order_items (order_id, product_id, license_id, product_title, license_name, price)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, vItem.productId, vItem.licenseId, vItem.productTitle, vItem.licenseName, vItem.price]
      );
    }

    // If free order, grant instant download access and bump counters immediately
    let instantDownloads = [];
    if (isFree) {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      for (const vItem of verifiedItems) {
        const file = db.get('SELECT id FROM product_files WHERE product_id = ? AND is_active = 1', [vItem.productId]);
        if (file) {
          const token = generateDownloadToken(orderId, userId || 0, file.id);
          db.run(
            `INSERT INTO downloads (order_id, user_id, product_file_id, token, expires_at, max_downloads)
             VALUES (?, ?, ?, ?, ?, 10)`,
            [orderId, userId, file.id, token, tomorrow]
          );
          instantDownloads.push({
            productId: vItem.productId,
            productTitle: vItem.productTitle,
            token
          });
        }
        db.run('UPDATE products SET sales_count = sales_count + 1 WHERE id = ?', [vItem.productId]);
      }
      if (couponId) {
        db.run('UPDATE coupons SET times_used = times_used + 1 WHERE id = ?', [couponId]);
      }

      return res.status(201).json({
        orderNumber,
        orderId,
        totalAmount: 0,
        isFree: true,
        paymentStatus: 'paid',
        instantDownloads
      });
    }

    // Initialize payment session with provider
    const provider = getPaymentProvider(payment_provider);
    const paymentSession = await provider.createPaymentSession({
      orderId,
      orderNumber,
      totalAmount,
      currency,
      user_id: userId
    }, {
      email: customer_email,
      name: customer_name
    });

    res.status(201).json({
      orderNumber,
      orderId,
      totalAmount,
      currency,
      isFree: false,
      paymentSession
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// GET /api/orders/my-orders (Customer order history)
router.get('/my-orders', authenticateUser, async (req, res) => {
  try {
    const db = await getDatabase();
    const orders = db.query(
      `SELECT o.*,
              (SELECT count(*) FROM order_items WHERE order_id = o.id) as item_count
       FROM orders o
       WHERE o.user_id = ? OR o.customer_email = ?
       ORDER BY o.id DESC`,
      [req.user.id, req.user.email]
    );

    // Attach items to each order
    const enrichedOrders = orders.map(order => {
      const items = db.query(
        `SELECT oi.*, p.slug,
                (SELECT media_url FROM product_media WHERE product_id = oi.product_id AND is_thumbnail = 1 LIMIT 1) as thumbnail
         FROM order_items oi
         LEFT JOIN products p ON p.id = oi.product_id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      return { ...order, items };
    });

    res.json(enrichedOrders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch customer orders' });
  }
});

// GET /api/orders/:orderNumber
router.get('/:orderNumber', async (req, res) => {
  try {
    const db = await getDatabase();
    const order = db.get('SELECT * FROM orders WHERE order_number = ?', [req.params.orderNumber]);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const items = db.query(`
      SELECT oi.*, p.slug,
             (SELECT media_url FROM product_media WHERE product_id = oi.product_id AND is_thumbnail = 1 LIMIT 1) as thumbnail,
             pf.id as file_id, pf.file_name, pf.file_size, pf.version
      FROM order_items oi
      LEFT JOIN products p ON p.id = oi.product_id
      LEFT JOIN product_files pf ON pf.product_id = oi.product_id AND pf.is_active = 1
      WHERE oi.order_id = ?
    `, [order.id]);

    // If paid, get active download tokens
    let downloads = [];
    if (order.payment_status === 'paid') {
      downloads = db.query(`
        SELECT d.id, d.product_file_id, d.token, d.expires_at, d.download_count, d.max_downloads,
               pf.file_name, pf.file_size, pf.version, p.title as product_title, p.slug
        FROM downloads d
        JOIN product_files pf ON pf.id = d.product_file_id
        JOIN products p ON p.id = pf.product_id
        WHERE d.order_id = ?
      `, [order.id]);
    }

    res.json({ order, items, downloads });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
});

module.exports = router;
