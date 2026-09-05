const express = require('express');
const router = express.Router();
const { getDatabase } = require('../../config/database');
const { authenticateUser, requireAdmin } = require('../../middleware/auth');
const { logAdminActivity } = require('../../services/auditService');

router.use(authenticateUser, requireAdmin);

// GET /api/admin/settings
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const rows = db.query('SELECT key, value FROM site_settings');
    const settings = {};
    rows.forEach(r => { settings[r.key] = r.value; });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve site settings' });
  }
});

// PUT /api/admin/settings
router.put('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const settings = req.body;

    for (const [key, value] of Object.entries(settings)) {
      const existing = db.get('SELECT key FROM site_settings WHERE key = ?', [key]);
      if (existing) {
        db.run('UPDATE site_settings SET value = ? WHERE key = ?', [String(value), key]);
      } else {
        db.run('INSERT INTO site_settings (key, value) VALUES (?, ?)', [key, String(value)]);
      }
    }

    logAdminActivity(db, req.user.id, 'SETTINGS_UPDATED', 'settings', null, settings);
    res.json({ message: 'Store settings updated successfully' });
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ error: 'Failed to update store settings' });
  }
});

module.exports = router;
