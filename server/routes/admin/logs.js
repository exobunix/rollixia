const express = require('express');
const router = express.Router();
const { getDatabase } = require('../../config/database');
const { authenticateUser, requireAdmin } = require('../../middleware/auth');

router.use(authenticateUser, requireAdmin);

// GET /api/admin/logs (Audit activity logs)
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const { action, limit = 100 } = req.query;

    let sql = `
      SELECT l.*, u.full_name as admin_name, u.email as admin_email
      FROM admin_activity_logs l
      LEFT JOIN users u ON u.id = l.admin_id
      WHERE 1=1
    `;
    const params = [];

    if (action) {
      sql += ' AND l.action = ?';
      params.push(action);
    }

    sql += ' ORDER BY l.id DESC LIMIT ?';
    params.push(parseInt(limit));

    const logs = db.query(sql, params);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve audit logs' });
  }
});

module.exports = router;
