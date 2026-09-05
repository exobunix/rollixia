const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { getDatabase } = require('../config/database');
const { authenticateUser } = require('../middleware/auth');
const { verifyDownloadToken } = require('../services/downloadService');
const { protectedDir } = require('../middleware/upload');

// Customer downloads list (support both / and /my-downloads)
const getCustomerDownloads = async (req, res) => {
  try {
    const db = await getDatabase();
    const downloads = db.query(`
      SELECT d.id as download_id, d.token, d.expires_at, d.download_count, d.max_downloads, d.last_downloaded_at,
             o.order_number, o.created_at as purchase_date,
             p.id as product_id, p.title as product_title, p.slug as product_slug,
             p.access_type, p.external_access_url,
             (SELECT url FROM product_access_items WHERE product_id = p.id LIMIT 1) as access_item_url,
             (SELECT media_url FROM product_media WHERE product_id = p.id AND is_thumbnail = 1 LIMIT 1) as thumbnail,
             (SELECT license_name FROM order_items WHERE order_id = o.id AND product_id = p.id LIMIT 1) as license_name,
             pf.version as purchased_version, pf.file_name, pf.file_size,
             (SELECT version FROM product_files WHERE product_id = p.id AND is_active = 1 ORDER BY id DESC LIMIT 1) as latest_version,
             (SELECT changelog FROM product_files WHERE product_id = p.id AND is_active = 1 ORDER BY id DESC LIMIT 1) as latest_changelog
      FROM downloads d
      JOIN orders o ON o.id = d.order_id
      JOIN product_files pf ON pf.id = d.product_file_id
      JOIN products p ON p.id = pf.product_id
      WHERE o.payment_status = 'paid' AND (o.user_id = ? OR o.customer_email = ?)
      ORDER BY d.id DESC
    `, [req.user.id, req.user.email]);

    // Format remaining downloads and version update indicator
    const enriched = downloads.map(item => {
      const remaining = Math.max(0, item.max_downloads - item.download_count);
      const hasUpdate = item.latest_version && item.latest_version !== item.purchased_version;
      return {
        ...item,
        downloads_remaining: remaining,
        is_limit_reached: remaining <= 0,
        has_update: hasUpdate
      };
    });

    res.json(enriched);
  } catch (err) {
    console.error('Fetch downloads error:', err);
    res.status(500).json({ error: 'Failed to retrieve downloads' });
  }
};

router.get('/', authenticateUser, getCustomerDownloads);
router.get('/my-downloads', authenticateUser, getCustomerDownloads);

// GET /api/downloads/file/:token (Execute secure tokenized file delivery)
router.get('/file/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const verifiedToken = verifyDownloadToken(token);

    if (!verifiedToken) {
      return res.status(403).json({ error: 'Invalid or tampered download token' });
    }

    const db = await getDatabase();
    const downloadRecord = db.get(
      `SELECT d.*, o.payment_status, o.order_status, pf.file_name, pf.file_path, p.title as product_title
       FROM downloads d
       JOIN orders o ON o.id = d.order_id
       JOIN product_files pf ON pf.id = d.product_file_id
       JOIN products p ON p.id = pf.product_id
       WHERE d.token = ?`,
      [token]
    );

    if (!downloadRecord) {
      return res.status(404).json({ error: 'Download entitlement record not found' });
    }

    if (downloadRecord.payment_status !== 'paid') {
      return res.status(403).json({ error: 'Order payment is not completed or has been refunded' });
    }

    // Check expiration
    if (new Date(downloadRecord.expires_at) < new Date()) {
      return res.status(410).json({
        error: 'Download token has expired (valid 48 hours). Please generate a fresh link from your Customer Dashboard.'
      });
    }

    // Check download limit
    if (downloadRecord.download_count >= downloadRecord.max_downloads) {
      return res.status(429).json({
        error: 'DOWNLOAD LIMIT REACHED. You have reached the maximum allowed downloads (10) for this asset. Please contact support@digitalstore.com to reset your limit.'
      });
    }

    const absoluteFilePath = path.isAbsolute(downloadRecord.file_path)
      ? downloadRecord.file_path
      : path.join(protectedDir, downloadRecord.file_path);
    if (!fs.existsSync(absoluteFilePath)) {
      return res.status(404).json({ error: 'Download asset file is currently being packaged. Please try again shortly.' });
    }

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

    // Increment download count, record timestamp & IP
    db.run(
      `UPDATE downloads SET
        download_count = download_count + 1,
        last_downloaded_at = CURRENT_TIMESTAMP,
        last_ip = ?
       WHERE id = ?`,
      [clientIp, downloadRecord.id]
    );

    res.download(absoluteFilePath, downloadRecord.file_name);
  } catch (err) {
    console.error('Download delivery error:', err);
    res.status(500).json({ error: 'Failed to deliver digital product file' });
  }
});

module.exports = router;
