const express = require('express');
const router = express.Router();
const { getDatabase } = require('../config/database');
const { authenticateUser } = require('../middleware/auth');

// GET /api/wishlist
router.get('/', authenticateUser, async (req, res) => {
  try {
    const db = await getDatabase();
    const items = db.query(`
      SELECT p.*, w.created_at as added_at,
             (SELECT media_url FROM product_media WHERE product_id = p.id AND is_thumbnail = 1 LIMIT 1) as thumbnail
      FROM wishlists w
      JOIN products p ON p.id = w.product_id
      WHERE w.user_id = ?
      ORDER BY w.id DESC
    `, [req.user.id]);

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

// POST /api/wishlist/toggle
router.post('/toggle', authenticateUser, async (req, res) => {
  try {
    const { product_id } = req.body;
    if (!product_id) return res.status(400).json({ error: 'Product ID is required' });

    const db = await getDatabase();
    const existing = db.get(
      'SELECT id FROM wishlists WHERE user_id = ? AND product_id = ?',
      [req.user.id, product_id]
    );

    if (existing) {
      db.run('DELETE FROM wishlists WHERE id = ?', [existing.id]);
      return res.json({ action: 'removed', in_wishlist: false });
    } else {
      db.run('INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)', [req.user.id, product_id]);
      return res.json({ action: 'added', in_wishlist: true });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle wishlist item' });
  }
});

module.exports = router;
