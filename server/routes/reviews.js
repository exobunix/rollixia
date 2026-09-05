const express = require('express');
const router = express.Router();
const { getDatabase } = require('../config/database');
const { authenticateUser } = require('../middleware/auth');

// POST /api/reviews (Submit review)
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { product_id, rating, title, comment } = req.body;

    if (!product_id || !rating || !title || !comment) {
      return res.status(400).json({ error: 'Rating, title, and comment are required' });
    }

    const numericRating = parseInt(rating);
    if (numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const db = await getDatabase();

    // Check if user purchased this product
    const purchased = db.get(`
      SELECT oi.id
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE oi.product_id = ? AND o.user_id = ? AND o.payment_status = 'paid'
      LIMIT 1
    `, [product_id, req.user.id]);

    const isVerified = purchased ? 1 : 0;

    // Check if already reviewed
    const existing = db.get(
      'SELECT id FROM reviews WHERE product_id = ? AND user_id = ?',
      [product_id, req.user.id]
    );

    if (existing) {
      db.run(
        `UPDATE reviews SET
          rating = ?, title = ?, comment = ?, is_verified_purchase = ?, status = 'approved', created_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [numericRating, title.trim(), comment.trim(), isVerified, existing.id]
      );
    } else {
      db.run(
        `INSERT INTO reviews (product_id, user_id, rating, title, comment, is_verified_purchase, status)
         VALUES (?, ?, ?, ?, ?, ?, 'approved')`,
        [product_id, req.user.id, numericRating, title.trim(), comment.trim(), isVerified]
      );
    }

    // Recompute product rating_avg and review_count
    const stats = db.get(
      'SELECT AVG(rating) as avg_rating, count(*) as count FROM reviews WHERE product_id = ? AND status = "approved"',
      [product_id]
    );

    if (stats) {
      const avg = Math.round((stats.avg_rating || 5.0) * 10) / 10;
      db.run(
        'UPDATE products SET rating_avg = ?, review_count = ? WHERE id = ?',
        [avg, stats.count, product_id]
      );
    }

    res.status(201).json({
      message: 'Review submitted successfully! Thank you for your feedback.',
      is_verified: isVerified
    });
  } catch (err) {
    console.error('Submit review error:', err);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

module.exports = router;
