const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { getDatabase } = require('../../config/database');
const { authenticateUser, requireAdmin } = require('../../middleware/auth');
const { uploadMedia, uploadProtected, protectedDir } = require('../../middleware/upload');
const { logAdminActivity } = require('../../services/auditService');
const { uploadToImageKit, DEFAULT_FOLDER } = require('../../services/imagekitService');

router.use(authenticateUser, requireAdmin);

// GET /api/admin/files (List all digital asset files & versions)
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const files = db.query(`
      SELECT pf.*, p.title as product_title, p.slug as product_slug,
             COALESCE((SELECT SUM(download_count) FROM downloads WHERE product_file_id = pf.id), 0) as download_count
      FROM product_files pf
      JOIN products p ON p.id = pf.product_id
      ORDER BY pf.id DESC
    `);
    res.json(files);
  } catch (err) {
    console.error('Error fetching admin files:', err);
    res.status(500).json({ error: 'Failed to retrieve file records' });
  }
});

// POST /api/admin/files/upload-media (Upload public image/media to ImageKit with local backup)
router.post('/upload-media', uploadMedia.single('media'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No media file provided' });
  }

  const localPath = req.file.path;
  const relativeUrl = `/uploads/${req.file.filename}`;

  try {
    // Upload to ImageKit folder /digitalverse
    const ikResult = await uploadToImageKit(localPath, req.file.filename, DEFAULT_FOLDER);
    if (ikResult && ikResult.success && ikResult.url) {
      return res.status(201).json({
        message: 'Media uploaded successfully to ImageKit CDN',
        url: ikResult.url,
        thumbnailUrl: ikResult.thumbnailUrl || ikResult.url,
        fileId: ikResult.fileId,
        provider: 'imagekit',
        filename: req.file.filename,
        size: req.file.size
      });
    }
  } catch (ikErr) {
    console.warn('ImageKit direct upload warning, using local file:', ikErr.message);
  }

  // Fallback to local file URL
  res.status(201).json({
    message: 'Media uploaded successfully (local storage)',
    url: relativeUrl,
    provider: 'local',
    filename: req.file.filename,
    size: req.file.size
  });
});

// POST /api/admin/files/upload-deliverable (Upload protected digital package)
router.post('/upload-deliverable', uploadProtected.single('package'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No package file provided' });
  }
  res.status(201).json({
    message: 'Protected deliverable uploaded successfully',
    filename: req.file.originalname,
    filePath: req.file.filename,
    size: req.file.size
  });
});

// POST /api/admin/files/version (Upload new deliverable file or new version for a product)
router.post('/version', uploadProtected.single('file'), async (req, res) => {
  try {
    const { product_id, version = '1.0.0', release_notes = '' } = req.body;
    if (!product_id) {
      return res.status(400).json({ error: 'Target product ID is required' });
    }

    const db = await getDatabase();
    const product = db.get('SELECT id, title FROM products WHERE id = ?', [product_id]);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let fileName = req.file ? req.file.originalname : req.body.file_name;
    let filePath = req.file ? req.file.filename : req.body.file_path;
    let fileSize = req.file ? req.file.size : (parseInt(req.body.file_size) || 1024000);

    if (!fileName) {
      fileName = `${product.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-v${version}.zip`;
      filePath = fileName;
    }

    // Mark previous versions for this product as inactive if releasing new active version
    db.run('UPDATE product_files SET is_active = 0 WHERE product_id = ?', [product_id]);

    const result = db.run(
      `INSERT INTO product_files (product_id, file_name, file_path, file_size, version, changelog, download_limit, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 10, 1, CURRENT_TIMESTAMP)`,
      [product_id, fileName, filePath, fileSize, version.trim(), release_notes.trim()]
    );

    db.save();

    logAdminActivity(db, req.user.id, 'PRODUCT_FILE_UPLOADED', 'product_file', result.lastInsertRowid, {
      productTitle: product.title,
      fileName,
      version
    });

    res.status(201).json({
      message: `Deliverable package uploaded successfully for "${product.title}"`,
      fileId: result.lastInsertRowid
    });
  } catch (err) {
    console.error('File version upload error:', err);
    res.status(500).json({ error: err.message || 'Failed to upload deliverable file' });
  }
});

// PUT /api/admin/files/:id (Update or replace existing product upload)
router.put('/:id', uploadProtected.single('file'), async (req, res) => {
  try {
    const fileId = req.params.id;
    const db = await getDatabase();
    const existingFile = db.get('SELECT * FROM product_files WHERE id = ?', [fileId]);
    if (!existingFile) {
      return res.status(404).json({ error: 'File record not found' });
    }

    const {
      product_id = existingFile.product_id,
      version = existingFile.version,
      changelog = existingFile.changelog,
      file_name = existingFile.file_name,
      is_active = existingFile.is_active
    } = req.body;

    let updatedFileName = file_name;
    let updatedFilePath = existingFile.file_path;
    let updatedFileSize = existingFile.file_size;

    // If a new physical archive file was attached, replace the existing deliverable details
    if (req.file) {
      updatedFileName = req.file.originalname;
      updatedFilePath = req.file.filename;
      updatedFileSize = req.file.size;
    }

    db.run(
      `UPDATE product_files
       SET product_id = ?, file_name = ?, file_path = ?, file_size = ?, version = ?, changelog = ?, is_active = ?
       WHERE id = ?`,
      [
        product_id,
        updatedFileName,
        updatedFilePath,
        updatedFileSize,
        version ? version.trim() : existingFile.version,
        changelog !== undefined ? changelog.trim() : existingFile.changelog,
        parseInt(is_active) !== undefined ? parseInt(is_active) : 1,
        fileId
      ]
    );

    db.save();

    logAdminActivity(db, req.user.id, 'PRODUCT_FILE_UPDATED', 'product_file', fileId, {
      fileName: updatedFileName,
      version
    });

    res.json({
      message: 'Product deliverable file updated successfully',
      file: {
        id: fileId,
        file_name: updatedFileName,
        version,
        file_size: updatedFileSize
      }
    });
  } catch (err) {
    console.error('File update error:', err);
    res.status(500).json({ error: err.message || 'Failed to update file record' });
  }
});

// DELETE /api/admin/files/:id (Delete deliverable file record)
router.delete('/:id', async (req, res) => {
  try {
    const fileId = req.params.id;
    const db = await getDatabase();
    const existingFile = db.get('SELECT * FROM product_files WHERE id = ?', [fileId]);
    if (!existingFile) {
      return res.status(404).json({ error: 'File record not found' });
    }

    db.run('DELETE FROM product_files WHERE id = ?', [fileId]);
    db.save();

    logAdminActivity(db, req.user.id, 'PRODUCT_FILE_DELETED', 'product_file', fileId, {
      fileName: existingFile.file_name
    });

    res.json({ message: 'Deliverable file deleted successfully' });
  } catch (err) {
    console.error('File delete error:', err);
    res.status(500).json({ error: 'Failed to delete file record' });
  }
});

module.exports = router;
