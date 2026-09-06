const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDatabase } = require('../config/database');
const { JWT_SECRET, authenticateUser, optionalUser } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name } = req.body;
    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, password, and full name are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const db = await getDatabase();
    const existing = db.get('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const result = db.run(
      `INSERT INTO users (email, password_hash, full_name, role, status)
       VALUES (?, ?, ?, 'customer', 'active')`,
      [email.toLowerCase().trim(), passwordHash, full_name.trim()]
    );

    const newUserId = result.lastInsertRowid;
    const token = jwt.sign({ id: newUserId, role: 'customer' }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: newUserId,
        email: email.toLowerCase().trim(),
        full_name: full_name.trim(),
        role: 'customer'
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = await getDatabase();
    const user = db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account has been disabled. Please contact support.' });
    }

    const validPassword = bcrypt.compareSync(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// GET /api/auth/me
router.get('/me', optionalUser, async (req, res) => {
  try {
    if (!req.user) {
      return res.json({
        user: null,
        stats: { orders: 0, downloads: 0, wishlist: 0 }
      });
    }

    const db = await getDatabase();
    const ordersCount = db.get('SELECT count(*) as c FROM orders WHERE user_id = ?', [req.user.id])?.c || 0;
    const downloadsCount = db.get('SELECT sum(download_count) as c FROM downloads WHERE user_id = ?', [req.user.id])?.c || 0;
    const wishlistCount = db.get('SELECT count(*) as c FROM wishlists WHERE user_id = ?', [req.user.id])?.c || 0;

    res.json({
      user: req.user,
      stats: {
        orders: ordersCount,
        downloads: downloadsCount || 0,
        wishlist: wishlistCount
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// PUT /api/auth/profile
router.put('/profile', authenticateUser, async (req, res) => {
  try {
    const { full_name, avatar } = req.body;
    const db = await getDatabase();
    db.run(
      'UPDATE users SET full_name = COALESCE(?, full_name), avatar = COALESCE(?, avatar), updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [full_name, avatar, req.user.id]
    );
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// PUT /api/auth/change-password
router.put('/change-password', authenticateUser, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password || new_password.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const db = await getDatabase();
    const user = db.get('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    if (!bcrypt.compareSync(current_password, user.password_hash)) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const newHash = bcrypt.hashSync(new_password, 10);
    db.run('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newHash, req.user.id]);
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to change password' });
  }
});

module.exports = router;
