require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { getDatabase } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static uploads directory for media
app.use('/uploads', express.static(path.join(__dirname, 'storage', 'public')));

const { connectMongoDB, getMongoStatus } = require('./config/mongodb');
const { DEFAULT_FOLDER } = require('./config/imagekit');

// Health Check
app.get('/api/health', (req, res) => {
  const mongoStatus = getMongoStatus();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Digital Products Platform API',
    databases: {
      sqlite: 'connected',
      mongodb: mongoStatus
    },
    storage: {
      provider: 'imagekit',
      folder: DEFAULT_FOLDER,
      endpoint: process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/avdarinn'
    }
  });
});

// Storefront API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api', require('./routes/razorpay'));
app.use('/api/razorpay', require('./routes/razorpay'));
app.use('/api/downloads', require('./routes/downloads'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/support', require('./routes/support'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/imagekit', require('./routes/imagekit'));

// Admin API Routes
app.use('/api/admin/dashboard', require('./routes/admin/dashboard'));
app.use('/api/admin/products', require('./routes/admin/products'));
app.use('/api/admin/orders', require('./routes/admin/orders'));
app.use('/api/admin/customers', require('./routes/admin/customers'));
app.use('/api/admin/reviews', require('./routes/admin/reviews'));
app.use('/api/admin/coupons', require('./routes/admin/coupons'));
app.use('/api/admin/categories', require('./routes/admin/categories'));
app.use('/api/admin/files', require('./routes/admin/files'));
app.use('/api/admin/settings', require('./routes/admin/settings'));
app.use('/api/admin/logs', require('./routes/admin/logs'));

// Serve static client build if dist exists
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDistPath));

// 404 Handler for API
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `API route not found: ${req.originalUrl}` });
});

// Fallback for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

let initPromise = null;
async function ensureInit() {
  if (!initPromise) {
    initPromise = Promise.all([getDatabase(), connectMongoDB()]);
  }
  return initPromise;
}

// Ensure database connections for both traditional and serverless runtimes
app.use(async (req, res, next) => {
  try {
    await ensureInit();
    next();
  } catch (err) {
    console.error('Database connection error in request:', err);
    next(err);
  }
});

// Start Server
async function start() {
  try {
    await ensureInit();

    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`  ROLLIXIA MARKETPLACE BACKEND ACTIVE`);
      console.log(`  Port: ${PORT}`);
      console.log(`  URL: http://localhost:${PORT}`);
      console.log(`  ImageKit CDN: https://ik.imagekit.io/avdarinn/digitalverse`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Failed to initialize server database:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}

module.exports = app;
