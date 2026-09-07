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

// POST /api/admin/orders/:id/send-file (Send Product File / Deliverable to Customer)
router.post('/:id/send-file', async (req, res) => {
  try {
    const { recipientEmail, productFileId, customMessage, renewWindow = true } = req.body;
    const db = await getDatabase();
    const order = db.get('SELECT * FROM orders WHERE id = ?', [req.params.id]);

    if (!order) return res.status(404).json({ error: 'Order not found' });

    const targetEmail = (recipientEmail && recipientEmail.trim()) || order.customer_email;
    if (!targetEmail) {
      return res.status(400).json({ error: 'Valid recipient email address is required' });
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

    // Filter target download if specific file requested
    let targetDownloads = downloads;
    if (productFileId && productFileId !== 'all') {
      const filtered = downloads.filter(d => String(d.product_file_id) === String(productFileId) || String(d.id) === String(productFileId));
      if (filtered.length > 0) targetDownloads = filtered;
    }

    const primaryDl = targetDownloads[0] || downloads[0] || {};
    const origin = req.get('origin') || process.env.CLIENT_URL || 'https://rollixia.com';
    const downloadUrl = primaryDl.token
      ? `${origin}/api/downloads/file/${primaryDl.token}`
      : `${origin}/dashboard`;

    const productTitle = targetDownloads.length > 1
      ? `${targetDownloads.length} Digital Products Package`
      : (primaryDl.product_title || 'Digital Deliverable Package');

    const fileName = targetDownloads.length > 1
      ? targetDownloads.map(d => d.file_name).join(', ')
      : (primaryDl.file_name || 'package.zip');

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
      downloadUrl
    });

    res.json({
      success: true,
      message: `Product file package sent successfully to ${targetEmail}`,
      recipientEmail: targetEmail,
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
