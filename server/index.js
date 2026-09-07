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

let initPromise = null;
async function ensureInit() {
  if (!initPromise) {
    initPromise = Promise.all([
      getDatabase().catch(err => {
        console.error('SQLite init error:', err);
        return null;
      }),
      connectMongoDB().catch(err => {
        console.warn('MongoDB Atlas connect warning:', err.message);
        return null;
      })
    ]);
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
    next();
  }
});

// Serverless URL normalization middleware
app.use((req, res, next) => {
  // Strip internal Vercel script path prefixes if present
  if (req.url.startsWith('/api/index.js')) {
    req.url = req.url.replace('/api/index.js', '') || '/';
  }
  if (req.url.startsWith('/api/[...all].js') || req.url.startsWith('/api/[...path].js')) {
    req.url = req.url.replace(/^\/api\/\[\.\.\.[^\]]+\]\.js/, '') || '/';
  }
  next();
});

// Health Check
const healthHandler = (req, res) => {
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
};
app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// Storefront API Routes
const authRoutes = require('./routes/auth');
const categoriesRoutes = require('./routes/categories');
const productsRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const ordersRoutes = require('./routes/orders');
const paymentsRoutes = require('./routes/payments');
const razorpayRoutes = require('./routes/razorpay');
const downloadsRoutes = require('./routes/downloads');
const reviewsRoutes = require('./routes/reviews');
const wishlistRoutes = require('./routes/wishlist');
const supportRoutes = require('./routes/support');
const settingsRoutes = require('./routes/settings');
const imagekitRoutes = require('./routes/imagekit');

// Helper to mount on both /api/path and /path
const mount = (basePath, router) => {
  app.use(`/api${basePath}`, router);
  app.use(basePath, router);
};

mount('/auth', authRoutes);
mount('/categories', categoriesRoutes);
mount('/products', productsRoutes);
mount('/cart', cartRoutes);
mount('/orders', ordersRoutes);
mount('/payments', paymentsRoutes);
mount('/razorpay', razorpayRoutes);
mount('/downloads', downloadsRoutes);
mount('/reviews', reviewsRoutes);
mount('/wishlist', wishlistRoutes);
mount('/support', supportRoutes);
mount('/settings', settingsRoutes);
mount('/imagekit', imagekitRoutes);
mount('/coupons', require('./routes/coupons'));
app.use('/api', razorpayRoutes);

// Admin API Routes
mount('/admin/dashboard', require('./routes/admin/dashboard'));
mount('/admin/products', require('./routes/admin/products'));
mount('/admin/orders', require('./routes/admin/orders'));
mount('/admin/customers', require('./routes/admin/customers'));
mount('/admin/reviews', require('./routes/admin/reviews'));
mount('/admin/coupons', require('./routes/admin/coupons'));
mount('/admin/categories', require('./routes/admin/categories'));
mount('/admin/files', require('./routes/admin/files'));
mount('/admin/settings', require('./routes/admin/settings'));
mount('/admin/logs', require('./routes/admin/logs'));

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
