const express = require('express');
const router = express.Router();
const { getDatabase } = require('../config/database');

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const categories = db.query(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id AND p.status = 'published'
      WHERE c.status = 'active'
      GROUP BY c.id
      ORDER BY c.sort_order ASC
    `);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/categories/:slug
router.get('/:slug', async (req, res) => {
  try {
    const db = await getDatabase();
    const category = db.get('SELECT * FROM categories WHERE slug = ? AND status = "active"', [req.params.slug]);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    const products = db.query(`
      SELECT p.*, (SELECT media_url FROM product_media WHERE product_id = p.id AND is_thumbnail = 1 LIMIT 1) as thumbnail
      FROM products p
      WHERE p.category_id = ? AND p.status = 'published'
      ORDER BY p.sales_count DESC
    `, [category.id]);

    res.json({ category, products });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch category details' });
  }
});

module.exports = router;
