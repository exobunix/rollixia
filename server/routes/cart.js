const express = require('express');
const router = express.Router();
const { getDatabase } = require('../config/database');

// POST /api/cart/calculate
router.post('/calculate', async (req, res) => {
  try {
    const { items = [], couponCode } = req.body;
    const db = await getDatabase();

    if (!Array.isArray(items) || items.length === 0) {
      return res.json({
        items: [],
        subtotal: 0,
        discount: 0,
        tax: 0,
        total: 0,
        coupon: null
      });
    }

    const verifiedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = db.get(
        `SELECT id, title, slug, regular_price, sale_price, status,
                (SELECT media_url FROM product_media WHERE product_id = products.id AND is_thumbnail = 1 LIMIT 1) as thumbnail
         FROM products WHERE id = ?`,
        [item.productId]
      );

      if (!product || product.status !== 'published') {
        continue; // skip unpublished or deleted products
      }

      let price = product.sale_price !== null && product.sale_price !== undefined ? product.sale_price : product.regular_price;
      let licenseName = 'Standard License';
      let licenseId = item.licenseId;

      if (item.licenseId) {
        const license = db.get(
          'SELECT id, license_name, price FROM product_licenses WHERE id = ? AND product_id = ?',
          [item.licenseId, product.id]
        );
        if (license) {
          price = license.price;
          licenseName = license.license_name;
        }
      }

      subtotal += price;
      verifiedItems.push({
        productId: product.id,
        title: product.title,
        slug: product.slug,
        thumbnail: product.thumbnail,
        licenseId,
        licenseName,
        price
      });
    }

    // Coupon calculation
    let discount = 0;
    let appliedCoupon = null;

    if (couponCode && couponCode.trim()) {
      const coupon = db.get(
        `SELECT * FROM coupons WHERE UPPER(code) = ? AND is_active = 1`,
        [couponCode.trim().toUpperCase()]
      );

      if (coupon) {
        let isValid = true;
        let rejectReason = '';

        if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
          isValid = false;
          rejectReason = 'Coupon has expired';
        } else if (coupon.times_used >= coupon.usage_limit) {
          isValid = false;
          rejectReason = 'Coupon usage limit reached';
        } else if (subtotal < coupon.min_order_value) {
          isValid = false;
          rejectReason = `Minimum order amount of ₹${coupon.min_order_value} required`;
        }

        if (isValid) {
          if (coupon.discount_type === 'percentage') {
            discount = (subtotal * coupon.discount_value) / 100;
            if (coupon.max_discount && discount > coupon.max_discount) {
              discount = coupon.max_discount;
            }
          } else {
            discount = coupon.discount_value;
          }

          if (discount > subtotal) discount = subtotal;

          appliedCoupon = {
            code: coupon.code,
            discountType: coupon.discount_type,
            discountValue: coupon.discount_value,
            discountAmount: Math.round(discount * 100) / 100
          };
        } else {
          appliedCoupon = { code: couponCode, invalid: true, reason: rejectReason };
        }
      } else {
        appliedCoupon = { code: couponCode, invalid: true, reason: 'Invalid coupon code' };
      }
    }

    const discountedSubtotal = Math.max(0, subtotal - discount);
    // 18% Tax (GST / standard digital tax)
    const tax = Math.round(discountedSubtotal * 0.18 * 100) / 100;
    const total = Math.round((discountedSubtotal + tax) * 100) / 100;

    res.json({
      items: verifiedItems,
      subtotal: Math.round(subtotal * 100) / 100,
      discount: Math.round(discount * 100) / 100,
      tax,
      total,
      coupon: appliedCoupon
    });
  } catch (err) {
    console.error('Cart calculation error:', err);
    res.status(500).json({ error: 'Failed to calculate cart totals' });
  }
});

module.exports = router;
