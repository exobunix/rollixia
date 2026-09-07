const express = require('express');
const router = express.Router();
const { getDatabase } = require('../../config/database');
const { authenticateUser, requireAdmin } = require('../../middleware/auth');
const { logAdminActivity } = require('../../services/auditService');
const { sendProductFileEmail } = require('../../services/emailService');
const { generateDownloadToken } = require('../../services/downloadService');

router.use(authenticateUser, requireAdmin);

// GET /api/admin/orders
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const { status, q, limit = 50, offset = 0 } = req.query;

    let sql = `
      SELECT o.*,
             (SELECT count(*) FROM order_items WHERE order_id = o.id) as item_count,
             (SELECT COALESCE(sum(download_count), 0) FROM downloads WHERE order_id = o.id) as total_downloads
      FROM orders o
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      sql += ' AND o.payment_status = ?';
      params.push(status);
    }

    if (q && q.trim()) {
      const search = `%${q.trim()}%`;
      sql += ' AND (o.order_number LIKE ? OR o.customer_email LIKE ? OR o.customer_name LIKE ? OR o.payment_id LIKE ?)';
      params.push(search, search, search, search);
    }

    sql += ' ORDER BY o.id DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const orders = db.query(sql, params);
    const countRow = db.get('SELECT count(*) as total FROM orders');

    res.json({ orders, total: countRow ? countRow.total : orders.length });
  } catch (err) {
    console.error('Admin fetch orders error:', err);
    res.status(500).json({ error: 'Failed to retrieve orders' });
  }
});

// GET /api/admin/orders/:id
router.get('/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    const order = db.get('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const items = db.query(`
      SELECT oi.*, p.slug, pf.version,
             (SELECT media_url FROM product_media WHERE product_id = oi.product_id AND is_thumbnail = 1 LIMIT 1) as thumbnail
      FROM order_items oi
      LEFT JOIN products p ON p.id = oi.product_id
      LEFT JOIN product_files pf ON pf.product_id = oi.product_id AND pf.is_active = 1
      WHERE oi.order_id = ?
    `, [order.id]);

    let downloads = db.query(`
      SELECT d.*, pf.file_name, pf.version, p.title as product_title, p.slug as product_slug
      FROM downloads d
      JOIN product_files pf ON pf.id = d.product_file_id
      JOIN products p ON p.id = pf.product_id
      WHERE d.order_id = ?
    `, [order.id]);

    // If order has no downloads yet (e.g. instant access or mock created), generate them
    if (downloads.length === 0 && items.length > 0) {
      const tomorrow = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
      for (const item of items) {
        let file = db.get('SELECT * FROM product_files WHERE product_id = ? AND is_active = 1', [item.product_id]);
        if (!file) {
          const fileRes = db.run(
            `INSERT INTO product_files (product_id, version, file_name, file_size, is_active)
             VALUES (?, '1.0.0', ?, 15485760, 1)`,
            [item.product_id, `${item.slug || 'deliverable'}-v1.0.0.zip`]
          );
          file = { id: fileRes.lastInsertRowid, file_name: `${item.slug || 'deliverable'}-v1.0.0.zip`, version: '1.0.0' };
        }
        const token = generateDownloadToken(order.id, order.user_id || 0, file.id);
        db.run(
          `INSERT INTO downloads (order_id, user_id, product_file_id, token, expires_at, max_downloads, download_count)
           VALUES (?, ?, ?, ?, ?, 10, 0)`,
          [order.id, order.user_id || 0, file.id, token, tomorrow]
        );
      }
      downloads = db.query(`
        SELECT d.*, pf.file_name, pf.version, p.title as product_title, p.slug as product_slug
        FROM downloads d
        JOIN product_files pf ON pf.id = d.product_file_id
        JOIN products p ON p.id = pf.product_id
        WHERE d.order_id = ?
      `, [order.id]);
    }

    res.json({ order, items, downloads });
  } catch (err) {
    console.error('Fetch order details error:', err);
    res.status(500).json({ error: 'Failed to retrieve order details' });
  }
});

const { uploadProtected } = require('../../middleware/upload');

// POST /api/admin/orders/:id/send-file (Send or Upload Product File / Deliverable to Customer)
router.post('/:id/send-file', uploadProtected.single('file'), async (req, res) => {
  try {
    const { recipientEmail, productFileId, customMessage, renewWindow = true } = req.body;
    const db = await getDatabase();
    const order = db.get('SELECT * FROM orders WHERE id = ?', [req.params.id]);

    if (!order) return res.status(404).json({ error: 'Order not found' });

    const targetEmail = (recipientEmail && recipientEmail.trim()) || order.customer_email;
    if (!targetEmail) {
      return res.status(400).json({ error: 'Valid recipient email address is required' });
    }

    const orderItems = db.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    const firstItem = orderItems[0] || {};
    let targetProductId = firstItem.product_id || 1;

    // 1. If a new deliverable file is uploaded with the request
    let uploadedFileRecord = null;
    if (req.file) {
      const originalName = req.file.originalname;
      const storedPath = req.file.filename;
      const fileSize = req.file.size;
      const version = req.body.version || '1.0.0-custom';

      const fileRes = db.run(
        `INSERT INTO product_files (product_id, version, file_name, file_size, file_path, changelog, is_active)
         VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [
          targetProductId,
          version,
          originalName,
          fileSize,
          storedPath,
          customMessage || 'Deliverable package uploaded directly by administrator for order'
        ]
      );
      uploadedFileRecord = {
        id: fileRes.lastInsertRowid,
        product_id: targetProductId,
        file_name: originalName,
        file_size: fileSize,
        version
      };

      // Create or update download entitlement for this order
      const token = generateDownloadToken(order.id, order.user_id || 0, uploadedFileRecord.id);
      const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

      const existingDl = db.get('SELECT id FROM downloads WHERE order_id = ? LIMIT 1', [order.id]);
      if (existingDl) {
        db.run(
          `UPDATE downloads SET product_file_id = ?, token = ?, expires_at = ?, max_downloads = 10, download_count = 0 WHERE id = ?`,
          [uploadedFileRecord.id, token, expiresAt, existingDl.id]
        );
      } else {
        db.run(
          `INSERT INTO downloads (order_id, user_id, product_file_id, token, expires_at, max_downloads, download_count)
           VALUES (?, ?, ?, ?, ?, 10, 0)`,
          [order.id, order.user_id || 0, uploadedFileRecord.id, token, expiresAt]
        );
      }
    }

    // Retrieve downloads for this order
    let downloads = db.query(`
      SELECT d.*, pf.file_name, pf.version, p.title as product_title, p.slug as product_slug
      FROM downloads d
      JOIN product_files pf ON pf.id = d.product_file_id
      JOIN products p ON p.id = pf.product_id
      WHERE d.order_id = ?
    `, [order.id]);

    // Renew download window if requested or if expired
    if (renewWindow || downloads.some(d => new Date(d.expires_at) < new Date())) {
      const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
      db.run('UPDATE downloads SET expires_at = ? WHERE order_id = ?', [expiresAt, order.id]);
      downloads.forEach(d => { d.expires_at = expiresAt; });
    }

    // Filter target download if specific file requested and no new file was uploaded
    let targetDownloads = downloads;
    if (!req.file && productFileId && productFileId !== 'all') {
      const filtered = downloads.filter(d => String(d.product_file_id) === String(productFileId) || String(d.id) === String(productFileId));
      if (filtered.length > 0) targetDownloads = filtered;
    }

    const primaryDl = targetDownloads[0] || downloads[0] || {};
    const origin = req.get('origin') || process.env.CLIENT_URL || 'https://rollixia.com';
    const downloadUrl = primaryDl.token
      ? `${origin}/api/downloads/file/${primaryDl.token}`
      : `${origin}/dashboard`;

    const productTitle = firstItem.product_title || primaryDl.product_title || 'Digital Deliverable Package';
    const fileName = req.file ? req.file.originalname : (primaryDl.file_name || 'deliverable.zip');

    // Create in-app customer notification for this order and product
    try {
      db.run(
        `INSERT INTO customer_notifications (user_id, customer_email, order_id, order_number, product_id, product_title, file_name, message, download_url, is_read)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [
          order.user_id || 0,
          targetEmail,
          order.id,
          order.order_number,
          targetProductId,
          productTitle,
          fileName,
          `Your deliverable file "${fileName}" for "${productTitle}" (Order #${order.order_number}) is ready to download now!`,
          downloadUrl
        ]
      );
    } catch (notifErr) {
      console.warn('Customer notification insert warning:', notifErr.message);
    }

    // Send email with file details and download links
    const emailResult = await sendProductFileEmail({
      to: targetEmail,
      customerName: order.customer_name || 'Valued Customer',
      orderNumber: order.order_number,
      productTitle,
      fileName,
      downloadUrl,
      customMessage: customMessage || '',
      expiresInHours: 48
    });

    // Record admin activity log
    logAdminActivity(db, req.user.id, 'PRODUCT_FILE_SENT', 'order', order.id, {
      orderNumber: order.order_number,
      recipientEmail: targetEmail,
      productTitle,
      fileName,
      downloadUrl,
      isUploadedCustomFile: Boolean(req.file)
    });

    res.json({
      success: true,
      message: req.file
        ? `New deliverable file "${fileName}" uploaded and sent to ${targetEmail}!`
        : `Product file package sent successfully to ${targetEmail}`,
      recipientEmail: targetEmail,
      fileName,
      productTitle,
      downloadUrl,
      emailResult
    });
  } catch (err) {
    console.error('Send product file error:', err);
    res.status(500).json({ error: err.message || 'Failed to send product file' });
  }
});

// POST /api/admin/orders/:id/refund
router.post('/:id/refund', async (req, res) => {
  try {
    const { reason = 'Customer request' } = req.body;
    const db = await getDatabase();
    const order = db.get('SELECT * FROM orders WHERE id = ?', [req.params.id]);

    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.payment_status === 'refunded') {
      return res.status(400).json({ error: 'Order has already been refunded' });
    }

    db.run(
      'UPDATE orders SET payment_status = "refunded", order_status = "refunded" WHERE id = ?',
      [order.id]
    );

    // Invalidate/expire download tokens
    db.run(
      'UPDATE downloads SET expires_at = CURRENT_TIMESTAMP WHERE order_id = ?',
      [order.id]
    );

    logAdminActivity(db, req.user.id, 'ORDER_REFUNDED', 'order', order.id, {
      orderNumber: order.order_number,
      amount: order.total_amount,
      reason
    });

    res.json({ message: `Order ${order.order_number} marked as refunded and downloads revoked` });
  } catch (err) {
    console.error('Refund order error:', err);
    res.status(500).json({ error: 'Failed to process refund' });
  }
});

// PATCH /api/admin/orders/:id/downloads (Toggle download access)
router.patch('/:id/downloads', async (req, res) => {
  try {
    const { enable } = req.body;
    const db = await getDatabase();
    const expiresAt = enable
      ? new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
      : new Date(Date.now() - 1000).toISOString();

    db.run('UPDATE downloads SET expires_at = ? WHERE order_id = ?', [expiresAt, req.params.id]);
    logAdminActivity(db, req.user.id, enable ? 'DOWNLOAD_ENABLED' : 'DOWNLOAD_REVOKED', 'order', req.params.id);

    res.json({ message: enable ? 'Download access renewed for 48 hours' : 'Download access suspended' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update download access' });
  }
});

module.exports = router;
