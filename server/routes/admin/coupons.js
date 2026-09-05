const express = require('express');
const router = express.Router();
const { getDatabase } = require('../../config/database');
const { authenticateUser, requireAdmin } = require('../../middleware/auth');
const { logAdminActivity } = require('../../services/auditService');

router.use(authenticateUser, requireAdmin);

// GET /api/admin/coupons
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const coupons = db.query(`
      SELECT c.*,
             COALESCE((SELECT SUM(discount_amount) FROM orders WHERE discount_amount > 0 AND UPPER(order_number) LIKE '%'), 0) as estimated_savings
      FROM coupons c
      ORDER BY c.id DESC
    `);
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve coupons' });
  }
});

// POST /api/admin/coupons
router.post('/', async (req, res) => {
  try {
    const {
      code,
      discount_type = 'percentage',
      discount_value,
      min_order_value = 0,
      max_discount = null,
      usage_limit = 1000,
      expires_at = null,
      is_active = 1
    } = req.body;

    if (!code || discount_value === undefined) {
      return res.status(400).json({ error: 'Coupon code and discount value are required' });
    }

    const cleanCode = code.trim().toUpperCase();
    const db = await getDatabase();

    const existing = db.get('SELECT id FROM coupons WHERE UPPER(code) = ?', [cleanCode]);
    if (existing) {
      return res.status(400).json({ error: 'Coupon code already exists' });
    }

    const result = db.run(
      `INSERT INTO coupons (code, discount_type, discount_value, min_order_value, max_discount, usage_limit, expires_at, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cleanCode,
        discount_type,
        parseFloat(discount_value),
        parseFloat(min_order_value) || 0,
        max_discount ? parseFloat(max_discount) : null,
        parseInt(usage_limit) || 1000,
        expires_at || null,
        is_active ? 1 : 0
      ]
    );

    logAdminActivity(db, req.user.id, 'COUPON_CREATED', 'coupon', result.lastInsertRowid, { code: cleanCode });
    res.status(201).json({ message: 'Coupon created successfully', couponId: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create coupon' });
  }
});

// PUT /api/admin/coupons/:id
router.put('/:id', async (req, res) => {
  try {
    const { discount_type, discount_value, min_order_value, max_discount, usage_limit, expires_at, is_active } = req.body;
    const db = await getDatabase();

    db.run(
      `UPDATE coupons SET
        discount_type = COALESCE(?, discount_type),
        discount_value = COALESCE(?, discount_value),
        min_order_value = COALESCE(?, min_order_value),
        max_discount = ?,
        usage_limit = COALESCE(?, usage_limit),
        expires_at = ?,
        is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [discount_type, discount_value, min_order_value, max_discount, usage_limit, expires_at, is_active, req.params.id]
    );

    logAdminActivity(db, req.user.id, 'COUPON_UPDATED', 'coupon', req.params.id);
    res.json({ message: 'Coupon updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update coupon' });
  }
});

// DELETE /api/admin/coupons/:id
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    db.run('DELETE FROM coupons WHERE id = ?', [req.params.id]);
    logAdminActivity(db, req.user.id, 'COUPON_DELETED', 'coupon', req.params.id);
    res.json({ message: 'Coupon deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete coupon' });
  }
});

module.exports = router;
