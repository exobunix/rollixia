const express = require('express');
const router = express.Router();
const { getDatabase } = require('../../config/database');
const { authenticateUser, requireAdmin } = require('../../middleware/auth');
const { logAdminActivity } = require('../../services/auditService');

router.use(authenticateUser, requireAdmin);

// GET /api/admin/reviews
router.get('/', async (req, res) => {
  try {
    const { status = 'all' } = req.query;
    const db = await getDatabase();

    let sql = `
      SELECT r.*, p.title as product_title, p.slug as product_slug,
             u.full_name as author_name, u.email as author_email
      FROM reviews r
      JOIN products p ON p.id = r.product_id
      LEFT JOIN users u ON u.id = r.user_id
      WHERE 1=1
    `;
    const params = [];

    if (status !== 'all') {
      sql += ' AND r.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY r.id DESC';
    const reviews = db.query(sql, params);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve reviews' });
  }
});

// PATCH /api/admin/reviews/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'pending', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid review status' });
    }
    const db = await getDatabase();
    db.run('UPDATE reviews SET status = ? WHERE id = ?', [status, req.params.id]);

    // Recalculate product rating
    const rev = db.get('SELECT product_id FROM reviews WHERE id = ?', [req.params.id]);
    if (rev) {
      const stats = db.get(
        'SELECT AVG(rating) as avg_rating, count(*) as count FROM reviews WHERE product_id = ? AND status = "approved"',
        [rev.product_id]
      );
      const avg = Math.round((stats?.avg_rating || 5.0) * 10) / 10;
      db.run('UPDATE products SET rating_avg = ?, review_count = ? WHERE id = ?', [avg, stats?.count || 0, rev.product_id]);
    }

    logAdminActivity(db, req.user.id, 'REVIEW_STATUS_CHANGED', 'review', req.params.id, { status });
    res.json({ message: `Review marked as ${status}` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update review status' });
  }
});

// PATCH /api/admin/reviews/:id/feature
router.patch('/:id/feature', async (req, res) => {
  try {
    const { is_featured } = req.body;
    const db = await getDatabase();
    db.run('UPDATE reviews SET is_featured = ? WHERE id = ?', [is_featured ? 1 : 0, req.params.id]);
    res.json({ message: is_featured ? 'Review pinned to featured showcase' : 'Review unpinned' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update review feature status' });
  }
});

// DELETE /api/admin/reviews/:id
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    db.run('DELETE FROM reviews WHERE id = ?', [req.params.id]);
    logAdminActivity(db, req.user.id, 'REVIEW_DELETED', 'review', req.params.id);
    res.json({ message: 'Review deleted permanently' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

module.exports = router;
