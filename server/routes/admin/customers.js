const express = require('express');
const router = express.Router();
const { getDatabase } = require('../../config/database');
const { authenticateUser, requireAdmin } = require('../../middleware/auth');
const { logAdminActivity } = require('../../services/auditService');

router.use(authenticateUser, requireAdmin);

// GET /api/admin/customers
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const { q } = req.query;

    let sql = `
      SELECT u.id, u.email, u.full_name, u.role, u.status, u.created_at, u.avatar,
             COUNT(DISTINCT o.id) as total_orders,
             COALESCE(SUM(CASE WHEN o.payment_status = 'paid' THEN o.total_amount ELSE 0 END), 0) as lifetime_spend,
             (SELECT COUNT(*) FROM downloads WHERE user_id = u.id) as total_downloads
      FROM users u
      LEFT JOIN orders o ON o.user_id = u.id OR o.customer_email = u.email
      WHERE u.role = 'customer'
    `;
    const params = [];

    if (q && q.trim()) {
      sql += ' AND (u.email LIKE ? OR u.full_name LIKE ?)';
      params.push(`%${q.trim()}%`, `%${q.trim()}%`);
    }

    sql += ' GROUP BY u.id ORDER BY lifetime_spend DESC, u.id DESC';

    const customers = db.query(sql, params);
    res.json(customers);
  } catch (err) {
    console.error('Admin customers fetch error:', err);
    res.status(500).json({ error: 'Failed to retrieve customers' });
  }
});

// PATCH /api/admin/customers/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'disabled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const db = await getDatabase();
    db.run('UPDATE users SET status = ? WHERE id = ?', [status, req.params.id]);
    logAdminActivity(db, req.user.id, 'CUSTOMER_STATUS_CHANGED', 'user', req.params.id, { status });
    res.json({ message: `Customer account ${status}` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update customer status' });
  }
});

module.exports = router;
