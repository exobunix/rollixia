const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadToImageKit, getAuthenticationParameters, DEFAULT_FOLDER } = require('../services/imagekitService');
const { optionalUser } = require('../middleware/auth');

const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB
});

// GET /api/imagekit/auth - Client-side upload token & signature
router.get('/auth', (req, res) => {
  try {
    const authParams = getAuthenticationParameters();
    res.json({
      ...authParams,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY || 'public_uzSklsoDFlGNoIPGFtTdcYJU32Y=',
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/avdarinn',
      folder: DEFAULT_FOLDER
    });
  } catch (err) {
    console.error('ImageKit auth error:', err);
    res.status(500).json({ error: 'Failed to generate ImageKit auth parameters' });
  }
});

// POST /api/imagekit/upload - Server-side upload to ImageKit folder /digitalverse
router.post('/upload', memoryUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const folder = req.body.folder || DEFAULT_FOLDER;
    const result = await uploadToImageKit(req.file.buffer, req.file.originalname, folder);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.status(201).json({
      message: 'Uploaded to ImageKit successfully',
      url: result.url,
      thumbnailUrl: result.thumbnailUrl,
      fileId: result.fileId,
      name: result.name,
      folder: folder
    });
  } catch (err) {
    console.error('ImageKit upload route error:', err);
    res.status(500).json({ error: 'Failed to upload to ImageKit: ' + err.message });
  }
});

module.exports = router;
