const express = require('express');
const router = express.Router();
const { getDatabase } = require('../config/database');

// GET /api/coupons/upsell - Public route for checkout upselling popups
router.get('/upsell', async (req, res) => {
  try {
    const db = await getDatabase();
    const upsellCoupons = db.query(`
      SELECT id, code, coupon_type, upsell_step, timer_seconds, popup_title, popup_desc, discount_type, discount_value, min_order_value, max_discount, is_active
      FROM coupons
      WHERE coupon_type = 'upselling' AND is_active = 1
      ORDER BY upsell_step ASC, id DESC
    `);
    res.json(upsellCoupons);
  } catch (err) {
    console.error('Error fetching upsell coupons:', err);
    res.json([
      {
        id: 1,
        code: 'DEAL10',
        coupon_type: 'upselling',
        upsell_step: 1,
        discount_type: 'percentage',
        discount_value: 10,
        timer_seconds: 30,
        popup_title: 'Wait! Limited Time Deal Only For You 🎁',
        popup_desc: 'Deciding not to purchase? We have an exclusive 10% extra discount waiting for you! Click below to apply instantly.',
        is_active: 1
      },
      {
        id: 2,
        code: 'LASTCHANCE15',
        coupon_type: 'upselling',
        upsell_step: 2,
        discount_type: 'percentage',
        discount_value: 15,
        timer_seconds: 30,
        popup_title: '🔥 Final Chance: Additional 15% OFF!',
        popup_desc: 'Here is our absolute best offer: an additional 15% OFF your entire cart. Don\'t miss out before this session expires!',
        is_active: 1
      }
    ]);
  }
});

// GET /api/coupons - Public route for validating or listing active coupons
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const coupons = db.query(`
      SELECT id, code, coupon_type, upsell_step, discount_type, discount_value, min_order_value, max_discount, is_active
      FROM coupons
      WHERE is_active = 1
    `);
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve active coupons' });
  }
});

module.exports = router;
