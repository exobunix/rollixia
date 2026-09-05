const express = require('express');
const router = express.Router();
const { getDatabase } = require('../../config/database');
const { authenticateUser, requireAdmin } = require('../../middleware/auth');
const { logAdminActivity } = require('../../services/auditService');

router.use(authenticateUser, requireAdmin);

function generateSlug(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// POST /api/admin/categories
router.post('/', async (req, res) => {
  try {
    const { name, slug: customSlug, description, icon = 'Layout', image_url, sort_order = 0 } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });

    const finalSlug = customSlug ? generateSlug(customSlug) : generateSlug(name);
    const db = await getDatabase();

    const existing = db.get('SELECT id FROM categories WHERE slug = ?', [finalSlug]);
    if (existing) return res.status(400).json({ error: 'Category slug already exists' });

    const result = db.run(
      `INSERT INTO categories (name, slug, description, icon, image_url, sort_order, status)
       VALUES (?, ?, ?, ?, ?, ?, 'active')`,
      [name.trim(), finalSlug, description || '', icon, image_url || '', parseInt(sort_order) || 0]
    );

    logAdminActivity(db, req.user.id, 'CATEGORY_CREATED', 'category', result.lastInsertRowid, { name });
    res.status(201).json({ message: 'Category created successfully', categoryId: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// PUT /api/admin/categories/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, slug, description, icon, image_url, sort_order, status } = req.body;
    const db = await getDatabase();

    db.run(
      `UPDATE categories SET
        name = COALESCE(?, name),
        slug = COALESCE(?, slug),
        description = COALESCE(?, description),
        icon = COALESCE(?, icon),
        image_url = COALESCE(?, image_url),
        sort_order = COALESCE(?, sort_order),
        status = COALESCE(?, status)
       WHERE id = ?`,
      [name, slug, description, icon, image_url, sort_order, status, req.params.id]
    );

    logAdminActivity(db, req.user.id, 'CATEGORY_UPDATED', 'category', req.params.id);
    res.json({ message: 'Category updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// DELETE /api/admin/categories/:id
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    // Check if products exist in category
    const count = db.get('SELECT count(*) as c FROM products WHERE category_id = ?', [req.params.id])?.c || 0;
    if (count > 0) {
      return res.status(400).json({ error: `Cannot delete category: ${count} products are currently assigned to it.` });
    }

    db.run('DELETE FROM categories WHERE id = ?', [req.params.id]);
    logAdminActivity(db, req.user.id, 'CATEGORY_DELETED', 'category', req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

module.exports = router;
