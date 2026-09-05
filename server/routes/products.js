const express = require('express');
const router = express.Router();
const { getDatabase } = require('../config/database');

// GET /api/products/search/suggestions
router.get('/search/suggestions', async (req, res) => {
  try {
    const q = req.query.q ? `%${req.query.q.trim()}%` : '';
    if (!q || q.length < 2) return res.json({ suggestions: [], categories: [] });

    const db = await getDatabase();
    const suggestions = db.query(
      `SELECT p.title, p.slug, p.regular_price, p.sale_price, p.badge,
              (SELECT media_url FROM product_media WHERE product_id = p.id AND is_thumbnail = 1 LIMIT 1) as thumbnail
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.status = 'published' AND (
         LOWER(p.title) LIKE LOWER(?) OR 
         LOWER(p.short_description) LIKE LOWER(?) OR 
         LOWER(p.technical_specs) LIKE LOWER(?) OR
         LOWER(c.name) LIKE LOWER(?)
       )
       LIMIT 6`,
      [q, q, q, q]
    );

    const categories = db.query(
      `SELECT name, slug FROM categories WHERE status = 'active' AND LOWER(name) LIKE LOWER(?) LIMIT 3`,
      [q]
    );

    res.json({ suggestions, categories });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

// GET /api/products/featured
router.get('/featured', async (req, res) => {
  try {
    const db = await getDatabase();
    const baseQuery = `
      SELECT p.*, c.name as category_name, c.slug as category_slug,
             (SELECT media_url FROM product_media WHERE product_id = p.id AND is_thumbnail = 1 LIMIT 1) as thumbnail
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.status = 'published'
    `;

    const all = db.query(`${baseQuery} ORDER BY p.id DESC`);
    const bestsellers = db.query(`${baseQuery} ORDER BY p.sales_count DESC, p.rating_avg DESC LIMIT 14`);
    const trending = db.query(`${baseQuery} AND (p.badge = 'TRENDING' OR p.badge = 'POPULAR' OR p.is_trending = 1) ORDER BY p.sales_count DESC LIMIT 14`);
    const topRated = db.query(`${baseQuery} ORDER BY p.rating_avg DESC, p.review_count DESC LIMIT 14`);
    const freeDeals = db.query(`${baseQuery} AND (p.badge = 'FREE' OR p.sale_price = 0 OR p.regular_price = 0) ORDER BY p.sales_count DESC LIMIT 14`);
    const newArrivals = db.query(`${baseQuery} ORDER BY p.id DESC LIMIT 14`);

    res.json({
      all,
      bestsellers: bestsellers.length ? bestsellers : all,
      trending: trending.length ? trending : all,
      topRated: topRated.length ? topRated : all,
      freeDeals: freeDeals.length ? freeDeals : all.filter(p => p.badge === 'FREE' || p.sale_price === 0 || p.regular_price === 0),
      newArrivals: newArrivals.length ? newArrivals : all
    });
  } catch (err) {
    console.error('Featured query error:', err);
    res.status(500).json({ error: 'Failed to fetch featured products' });
  }
});

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const {
      category,
      q,
      badge,
      min_price,
      max_price,
      sort = 'popular',
      limit = 24,
      offset = 0
    } = req.query;

    let whereClauses = "WHERE p.status = 'published'";
    const whereParams = [];

    if (category) {
      whereClauses += ' AND (c.slug = ? OR c.id = ?)';
      whereParams.push(category, category);
    }

    if (q && q.trim()) {
      const search = `%${q.trim().toLowerCase()}%`;
      whereClauses += ' AND (LOWER(p.title) LIKE ? OR LOWER(p.short_description) LIKE ? OR LOWER(p.full_description) LIKE ? OR LOWER(p.sku) LIKE ? OR LOWER(p.technical_specs) LIKE ? OR LOWER(c.name) LIKE ?)';
      whereParams.push(search, search, search, search, search, search);
    }

    if (badge) {
      const bUpper = badge.toUpperCase();
      if (bUpper === 'FREE') {
        whereClauses += " AND (p.badge = 'FREE' OR p.sale_price = 0 OR p.regular_price = 0)";
      } else if (bUpper === 'TRENDING' || bUpper === 'DEAL' || bUpper === 'DEALS') {
        whereClauses += " AND (p.badge = 'TRENDING' OR p.badge = 'DEAL' OR p.badge = 'DEALS' OR p.badge = 'POPULAR' OR p.is_trending = 1 OR (p.sale_price IS NOT NULL AND p.sale_price < p.regular_price))";
      } else if (bUpper === 'BESTSELLER') {
        whereClauses += " AND (p.badge = 'BESTSELLER' OR p.badge = 'TOP SELLER' OR p.is_bestseller = 1 OR p.sales_count > 50)";
      } else if (bUpper === 'TOP RATED') {
        whereClauses += " AND (p.badge = 'TOP RATED' OR p.rating_avg >= 4.7)";
      } else {
        whereClauses += ' AND (p.badge = ? OR p.badge LIKE ?)';
        whereParams.push(bUpper, `%${bUpper}%`);
      }
    }

    if (min_price !== undefined && min_price !== '') {
      whereClauses += ' AND COALESCE(p.sale_price, p.regular_price) >= ?';
      whereParams.push(parseFloat(min_price));
    }

    if (max_price !== undefined && max_price !== '') {
      whereClauses += ' AND COALESCE(p.sale_price, p.regular_price) <= ?';
      whereParams.push(parseFloat(max_price));
    }

    let sql = `
      SELECT p.*, c.name as category_name, c.slug as category_slug,
             (SELECT media_url FROM product_media WHERE product_id = p.id AND is_thumbnail = 1 LIMIT 1) as thumbnail,
             (SELECT count(*) FROM product_licenses WHERE product_id = p.id) as license_count
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      ${whereClauses}
    `;

    switch (sort) {
      case 'newest':
        sql += ' ORDER BY p.id DESC';
        break;
      case 'price-asc':
        sql += ' ORDER BY COALESCE(p.sale_price, p.regular_price) ASC';
        break;
      case 'price-desc':
        sql += ' ORDER BY COALESCE(p.sale_price, p.regular_price) DESC';
        break;
      case 'rating':
        sql += ' ORDER BY p.rating_avg DESC, p.review_count DESC';
        break;
      case 'popular':
      default:
        sql += ' ORDER BY p.sales_count DESC, p.id DESC';
        break;
    }

    sql += ' LIMIT ? OFFSET ?';
    const queryParams = [...whereParams, parseInt(limit), parseInt(offset)];

    const products = db.query(sql, queryParams);

    // Total count for pagination
    const countSql = `
      SELECT count(*) as total
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      ${whereClauses}
    `;
    const totalRow = db.get(countSql, whereParams);

    res.json({
      products,
      total: totalRow ? totalRow.total : products.length
    });
  } catch (err) {
    console.error('Fetch products error:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/:slug
router.get('/:slug', async (req, res) => {
  try {
    const db = await getDatabase();
    const product = db.get(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.slug = ?
    `, [req.params.slug]);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const media = db.query(
      'SELECT id, media_url, media_type, is_thumbnail, sort_order FROM product_media WHERE product_id = ? ORDER BY sort_order ASC, id ASC',
      [product.id]
    );

    const licenses = db.query(
      'SELECT id, license_name, price, regular_price, description, permissions, restrictions FROM product_licenses WHERE product_id = ? ORDER BY price ASC',
      [product.id]
    );

    const features = db.query(
      'SELECT id, title, description, icon, sort_order FROM product_features WHERE product_id = ? ORDER BY sort_order ASC, id ASC',
      [product.id]
    );

    const compatibility = db.query(
      'SELECT id, platform, version FROM product_compatibility WHERE product_id = ?',
      [product.id]
    );

    const faqs = db.query(
      'SELECT id, question, answer, sort_order FROM product_faqs WHERE product_id = ? ORDER BY sort_order ASC, id ASC',
      [product.id]
    );

    const activeFile = db.get(
      'SELECT id, file_name, file_size, version, changelog, download_limit FROM product_files WHERE product_id = ? AND is_active = 1 ORDER BY id DESC LIMIT 1',
      [product.id]
    );

    const thumbMedia = media.find(m => m.is_thumbnail === 1) || media[0];
    product.thumbnail = (thumbMedia && thumbMedia.media_url) || product.hero_image || null;
    if (!product.hero_image && thumbMedia) {
      product.hero_image = thumbMedia.media_url;
    }

    const reviews = db.query(`
      SELECT r.*, u.full_name as author_name, u.avatar as author_avatar
      FROM reviews r
      LEFT JOIN users u ON u.id = r.user_id
      WHERE r.product_id = ? AND r.status = 'approved'
      ORDER BY r.is_featured DESC, r.id DESC
    `, [product.id]);

    // Calculate rating breakdown (5, 4, 3, 2, 1 stars)
    const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      if (ratingBreakdown[r.rating] !== undefined) {
        ratingBreakdown[r.rating]++;
      }
    });

    // Sections (Ordered by admin sort_order, filtered by is_visible)
    const rawSections = db.query(
      'SELECT id, section_type, title, subtitle, content, settings, sort_order, is_visible FROM product_sections WHERE product_id = ? AND is_visible = 1 ORDER BY sort_order ASC, id ASC',
      [product.id]
    );

    const sections = rawSections.map(sec => {
      let parsedContent = sec.content;
      let parsedSettings = sec.settings;
      if (typeof sec.content === 'string') {
        try { parsedContent = JSON.parse(sec.content); } catch (e) { parsedContent = sec.content; }
      }
      if (typeof sec.settings === 'string') {
        try { parsedSettings = JSON.parse(sec.settings); } catch (e) { parsedSettings = sec.settings; }
      }
      return {
        ...sec,
        content: parsedContent,
        settings: parsedSettings
      };
    });

    // Bonuses
    const bonuses = db.query(
      'SELECT id, title, subtitle, description, image_url, value_amount, badge, sort_order FROM product_bonuses WHERE product_id = ? AND is_visible = 1 ORDER BY sort_order ASC, id ASC',
      [product.id]
    );

    // Testimonials
    const testimonials = db.query(
      'SELECT id, name, avatar_url, designation, rating, text, is_verified FROM product_testimonials WHERE product_id = ? AND is_visible = 1 ORDER BY sort_order ASC, id ASC',
      [product.id]
    );

    // Access items
    const accessItems = db.query(
      'SELECT id, title, access_type, url, instructions FROM product_access_items WHERE product_id = ? AND is_active = 1 ORDER BY sort_order ASC',
      [product.id]
    );

    // Upsell bundle
    const upsells = db.query(`
      SELECT u.*, p.title as upsell_title, p.slug as upsell_slug, p.regular_price, p.sale_price,
             (SELECT media_url FROM product_media WHERE product_id = p.id AND is_thumbnail = 1 LIMIT 1) as thumbnail
      FROM product_upsells u
      JOIN products p ON p.id = u.upsell_product_id
      WHERE u.product_id = ? AND u.is_active = 1
    `, [product.id]);

    res.json({
      product,
      media,
      licenses,
      features,
      compatibility,
      faqs,
      fileInfo: activeFile,
      reviews,
      ratingBreakdown,
      sections,
      bonuses,
      testimonials,
      accessItems,
      upsells
    });
  } catch (err) {
    console.error('Fetch product detail error:', err);
    res.status(500).json({ error: 'Failed to fetch product details' });
  }
});

// GET /api/products/:slug/related
router.get('/:slug/related', async (req, res) => {
  try {
    const db = await getDatabase();
    const current = db.get('SELECT id, category_id FROM products WHERE slug = ?', [req.params.slug]);
    if (!current) return res.json([]);

    let related = db.query(`
      SELECT p.*, c.name as category_name, c.slug as category_slug,
             (SELECT media_url FROM product_media WHERE product_id = p.id AND is_thumbnail = 1 LIMIT 1) as thumbnail
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.status = 'published' AND p.id != ? AND p.category_id = ?
      ORDER BY p.sales_count DESC
      LIMIT 4
    `, [current.id, current.category_id]);

    // Fallback: If fewer than 4 related in the exact same category, fill with other published products
    if (related.length < 4) {
      const existingIds = [current.id, ...related.map(r => r.id)];
      const placeholders = existingIds.map(() => '?').join(',');
      const remainingLimit = 4 - related.length;
      const additional = db.query(`
        SELECT p.*, c.name as category_name, c.slug as category_slug,
               (SELECT media_url FROM product_media WHERE product_id = p.id AND is_thumbnail = 1 LIMIT 1) as thumbnail
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE p.status = 'published' AND p.id NOT IN (${placeholders})
        ORDER BY p.sales_count DESC, p.id DESC
        LIMIT ?
      `, [...existingIds, remainingLimit]);
      related = [...related, ...additional];
    }

    res.json(related);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch related products' });
  }
});

module.exports = router;
