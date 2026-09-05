const express = require('express');
const router = express.Router();
const { getDatabase } = require('../config/database');

// GET /api/settings
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const rows = db.query('SELECT key, value FROM site_settings');
    const settings = {};
    rows.forEach(r => { settings[r.key] = r.value; });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// GET /api/settings/banners
router.get('/banners', async (req, res) => {
  try {
    const db = await getDatabase();
    const banners = db.query('SELECT * FROM banners WHERE is_active = 1 ORDER BY id DESC');
    res.json(banners);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch banners' });
  }
});

module.exports = router;
