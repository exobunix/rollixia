const multer = require('multer');
const path = require('path');
const fs = require('fs');

const publicDir = path.join(__dirname, '..', 'storage', 'public');
const protectedDir = path.join(__dirname, '..', 'storage', 'protected');

if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
if (!fs.existsSync(protectedDir)) fs.mkdirSync(protectedDir, { recursive: true });

const mediaStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, publicDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `media_${Date.now()}_${cleanName}${ext}`);
  }
});

const protectedStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, protectedDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `pkg_${Date.now()}_${cleanName}${ext}`);
  }
});

const uploadMedia = multer({
  storage: mediaStorage,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB
});

const uploadProtected = multer({
  storage: protectedStorage,
  limits: { fileSize: 250 * 1024 * 1024 } // 250MB
});

module.exports = {
  uploadMedia,
  uploadProtected,
  publicDir,
  protectedDir
};
