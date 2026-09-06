const express = require('express');
const router = express.Router();
const { getDatabase } = require('../../config/database');
const { authenticateUser, requireAdmin } = require('../../middleware/auth');
const { logAdminActivity } = require('../../services/auditService');

router.use(authenticateUser, requireAdmin);

// Helper to generate clean URL slug
function generateSlug(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// GET /api/admin/products
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const { status, category, badge, q, limit = 50, offset = 0 } = req.query;

    let sql = `
      SELECT p.*, c.name as category_name,
             (SELECT media_url FROM product_media WHERE product_id = p.id AND is_thumbnail = 1 LIMIT 1) as thumbnail,
             (SELECT version FROM product_files WHERE product_id = p.id AND is_active = 1 ORDER BY id DESC LIMIT 1) as active_version,
             (SELECT count(*) FROM product_licenses WHERE product_id = p.id) as license_count
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      sql += ' AND p.status = ?';
      params.push(status);
    }

    if (category) {
      sql += ' AND p.category_id = ?';
      params.push(category);
    }

    if (badge) {
      if (badge.toUpperCase() === 'FREE') {
        sql += " AND (p.badge = 'FREE' OR p.sale_price = 0 OR p.regular_price = 0)";
      } else if (badge.toUpperCase() === 'DEAL') {
        sql += " AND (p.badge = 'DEAL' OR p.badge = 'TRENDING' OR p.is_trending = 1 OR (p.sale_price IS NOT NULL AND p.sale_price < p.regular_price))";
      } else {
        sql += ' AND p.badge = ?';
        params.push(badge.toUpperCase());
      }
    }

    if (q && q.trim()) {
      const search = `%${q.trim()}%`;
      sql += ' AND (p.title LIKE ? OR p.sku LIKE ? OR p.short_description LIKE ?)';
      params.push(search, search, search);
    }

    sql += ' ORDER BY p.id DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const products = db.query(sql, params);
    const countRow = db.get('SELECT count(*) as total FROM products');

    res.json({ products, total: countRow ? countRow.total : products.length });
  } catch (err) {
    console.error('Admin fetch products error:', err);
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
});

// GET /api/admin/products/:id
router.get('/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    const product = db.get('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const media = db.query('SELECT * FROM product_media WHERE product_id = ? ORDER BY sort_order ASC, id ASC', [product.id]);
    const licenses = db.query('SELECT * FROM product_licenses WHERE product_id = ? ORDER BY price ASC', [product.id]);
    const features = db.query('SELECT * FROM product_features WHERE product_id = ? ORDER BY sort_order ASC, id ASC', [product.id]);
    const compatibility = db.query('SELECT * FROM product_compatibility WHERE product_id = ?', [product.id]);
    const faqs = db.query('SELECT * FROM product_faqs WHERE product_id = ? ORDER BY sort_order ASC, id ASC', [product.id]);
    const files = db.query('SELECT * FROM product_files WHERE product_id = ? ORDER BY id DESC', [product.id]);

    res.json({
      product,
      media,
      licenses,
      features,
      compatibility,
      faqs,
      files
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve product details' });
  }
});

// POST /api/admin/products (Add new digital product - Complete Wizard)
router.post('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const title = req.body.title;
    const customSlug = req.body.slug;
    const sku = req.body.sku || `SKU-${Date.now().toString().slice(-6)}`;
    const category_id = req.body.category_id || req.body.categoryId;
    const short_description = req.body.short_description || req.body.shortDescription || '';
    const full_description = req.body.full_description || req.body.fullDescription || '';
    const product_type = req.body.product_type || req.body.productType || 'Digital Download';
    const author = req.body.author || 'Platform Creator';
    const regular_price = parseFloat(req.body.regular_price || req.body.regularPrice || req.body.originalPrice || req.body.price || 0);
    const sale_price = req.body.sale_price !== undefined ? (req.body.sale_price === null ? null : parseFloat(req.body.sale_price)) : (req.body.salePrice !== undefined ? (req.body.salePrice === null ? null : parseFloat(req.body.salePrice)) : null);
    const badge = req.body.badge || null;
    const status = req.body.status || 'published';
    const demo_url = req.body.demo_url || req.body.demoUrl || null;
    const video_url = req.body.video_url || req.body.videoUrl || null;
    const media = req.body.media || (req.body.mediaUrl ? [req.body.mediaUrl] : []);
    const licenses = req.body.licenses || [];
    const features = req.body.features || [];
    const faqs = req.body.faqs || [];
    const testimonials = req.body.testimonials || [];
    const file = req.body.file || (req.body.deliverableFileName ? { file_name: req.body.deliverableFileName, version: req.body.version || '1.0.0', changelog: 'Initial release', download_limit: 10 } : null);

    if (!title || !category_id) {
      return res.status(400).json({ error: 'Product title and category are required' });
    }

    let finalSlug = customSlug ? generateSlug(customSlug) : generateSlug(title);
    // Ensure slug uniqueness
    const existingSlug = db.get('SELECT id FROM products WHERE slug = ?', [finalSlug]);
    if (existingSlug) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }

    let finalSku = sku ? sku.toUpperCase().trim() : `SKU-${Date.now().toString().slice(-6)}`;
    const existingSku = db.get('SELECT id FROM products WHERE sku = ?', [finalSku]);
    if (existingSku) {
      finalSku = `${finalSku}-${Date.now().toString().slice(-4)}`;
    }

    const prodRes = db.run(
      `INSERT INTO products (
        title, slug, sku, category_id, short_description, full_description, product_type,
        author, regular_price, sale_price, badge, status, demo_url, video_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        finalSlug,
        finalSku,
        category_id,
        short_description || '',
        full_description || '',
        product_type,
        author,
        parseFloat(regular_price) || 0,
        sale_price !== null && sale_price !== '' ? parseFloat(sale_price) : null,
        badge || null,
        status,
        demo_url || null,
        video_url || null
      ]
    );
    const productId = prodRes.lastInsertRowid;

    // Media
    if (Array.isArray(media)) {
      media.forEach((m, idx) => {
        const url = typeof m === 'string' ? m : m.url;
        if (url) {
          db.run(
            `INSERT INTO product_media (product_id, media_url, media_type, is_thumbnail, sort_order)
             VALUES (?, ?, 'image', ?, ?)`,
            [productId, url, idx === 0 ? 1 : 0, idx]
          );
        }
      });
    }

    // Licenses
    if (Array.isArray(licenses) && licenses.length > 0) {
      for (const lic of licenses) {
        const licRegPrice = lic.regular_price !== undefined && lic.regular_price !== null && lic.regular_price !== '' ? parseFloat(lic.regular_price) : null;
        const licOfferPrice = parseFloat(lic.price !== undefined ? lic.price : lic.sale_price) || 0;
        db.run(
          `INSERT INTO product_licenses (product_id, license_name, price, regular_price, description, permissions, restrictions)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            productId,
            lic.name || lic.license_name || 'Standard License',
            licOfferPrice,
            licRegPrice,
            lic.description || '',
            lic.permissions || '',
            lic.restrictions || ''
          ]
        );
      }
    } else {
      // Default license matching base price
      db.run(
        `INSERT INTO product_licenses (product_id, license_name, price, regular_price, description, permissions, restrictions)
         VALUES (?, 'Standard Commercial License', ?, ?, 'Commercial license for client and personal projects', 'Unlimited commercial use, Lifetime updates', 'Cannot resell as raw asset')`,
        [productId, parseFloat(sale_price !== null && sale_price !== '' ? sale_price : regular_price) || 0, regular_price || 0]
      );
    }

    // Features
    if (Array.isArray(features)) {
      features.forEach((feat, idx) => {
        if (feat.title) {
          db.run(
            `INSERT INTO product_features (product_id, title, description, icon, sort_order)
             VALUES (?, ?, ?, ?, ?)`,
            [productId, feat.title, feat.description || '', feat.icon || 'CheckCircle', idx]
          );
        }
      });
    }

    // Compatibility
    if (Array.isArray(compatibility)) {
      for (const comp of compatibility) {
        if (comp.platform) {
          db.run(
            `INSERT INTO product_compatibility (product_id, platform, version)
             VALUES (?, ?, ?)`,
            [productId, comp.platform, comp.version || 'Latest']
          );
        }
      }
    }

    // FAQs
    if (Array.isArray(faqs)) {
      faqs.forEach((faq, idx) => {
        if (faq.question && faq.answer) {
          db.run(
            `INSERT INTO product_faqs (product_id, question, answer, sort_order)
             VALUES (?, ?, ?, ?)`,
            [productId, faq.question, faq.answer, idx]
          );
        }
      });
    }

    // Testimonials
    if (Array.isArray(testimonials)) {
      testimonials.forEach((t, idx) => {
        const authorName = t.name || t.user_name || t.author_name;
        const reviewText = t.text || t.quote || t.review || '';
        if (authorName && reviewText) {
          db.run(
            `INSERT INTO product_testimonials (product_id, name, avatar_url, designation, rating, text, is_verified, is_featured, sort_order, is_visible)
             VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, 1)`,
            [
              productId,
              authorName.trim(),
              t.avatar_url || null,
              t.designation || t.role || '',
              t.rating !== undefined ? t.rating : 5,
              reviewText.trim(),
              t.is_verified !== undefined ? (t.is_verified ? 1 : 0) : 1,
              idx
            ]
          );
        }
      });
    }

    // File / Deliverable
    if (file && file.file_name) {
      db.run(
        `INSERT INTO product_files (product_id, file_name, file_path, file_size, version, changelog, download_limit, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          productId,
          file.file_name,
          file.file_path || file.file_name,
          file.file_size || 1024000,
          file.version || '1.0.0',
          file.changelog || 'Initial release',
          file.download_limit || 10
        ]
      );
    } else {
      // Default file bundle placeholder in storage
      const defaultFileName = `${finalSlug}-v1.0.0.zip`;
      db.run(
        `INSERT INTO product_files (product_id, file_name, file_path, file_size, version, changelog, download_limit, is_active)
         VALUES (?, ?, ?, ?, '1.0.0', 'Initial release', 10, 1)`,
        [productId, defaultFileName, defaultFileName, 15000000]
      );
    }

    logAdminActivity(db, req.user.id, 'PRODUCT_CREATED', 'product', productId, { title, slug: finalSlug });

    res.status(201).json({
      message: 'Product created successfully and published to catalog!',
      productId,
      slug: finalSlug
    });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// GET /api/admin/products/:id/full (Complete data for Product Page Builder)
router.get('/:id/full', async (req, res) => {
  try {
    const db = await getDatabase();
    const product = db.get('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const media = db.query('SELECT * FROM product_media WHERE product_id = ? ORDER BY sort_order ASC, id ASC', [product.id]);
    const licenses = db.query('SELECT * FROM product_licenses WHERE product_id = ? ORDER BY price ASC', [product.id]);
    const features = db.query('SELECT * FROM product_features WHERE product_id = ? ORDER BY sort_order ASC, id ASC', [product.id]);
    const compatibility = db.query('SELECT * FROM product_compatibility WHERE product_id = ?', [product.id]);
    const faqs = db.query('SELECT * FROM product_faqs WHERE product_id = ? ORDER BY sort_order ASC, id ASC', [product.id]);
    const files = db.query('SELECT * FROM product_files WHERE product_id = ? ORDER BY id DESC', [product.id]);
    const rawSections = db.query('SELECT *, section_type as type FROM product_sections WHERE product_id = ? ORDER BY sort_order ASC, id ASC', [product.id]);
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
    const bonuses = db.query('SELECT * FROM product_bonuses WHERE product_id = ? ORDER BY sort_order ASC, id ASC', [product.id]);
    const testimonials = db.query('SELECT * FROM product_testimonials WHERE product_id = ? ORDER BY sort_order ASC, id ASC', [product.id]);
    const accessItems = db.query('SELECT * FROM product_access_items WHERE product_id = ? ORDER BY sort_order ASC', [product.id]);
    const upsells = db.query('SELECT * FROM product_upsells WHERE product_id = ?', [product.id]);

    res.json({
      product,
      media,
      licenses,
      features,
      compatibility,
      faqs,
      files,
      sections,
      bonuses,
      testimonials,
      accessItems,
      upsells
    });
  } catch (err) {
    console.error('Fetch full product error:', err);
    res.status(500).json({ error: 'Failed to retrieve full product details' });
  }
});

// PUT /api/admin/products/:id (Complete Synchronized Update)
router.put('/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    const productId = parseInt(req.params.id);
    const {
      title,
      slug,
      sku,
      category_id,
      short_description,
      full_description,
      product_type,
      author,
      regular_price,
      sale_price,
      badge,
      status,
      demo_url,
      video_url,
      video_type,
      video_thumbnail,
      video_title,
      video_description,
      customer_demo_url,
      partner_demo_url,
      admin_demo_url,
      web_demo_url,
      docs_url,
      eyebrow,
      subtitle,
      cta_text,
      secondary_cta_text,
      theme_style,
      access_type,
      external_access_url,
      asset_availability,
      disclaimer,
      technical_specs,
      how_it_works,
      is_featured,
      is_trending,
      is_bestseller,
      is_new,
      is_staff_pick,
      seo_title,
      seo_description,
      seo_keywords,
      og_image,
      hero_image,
      thumbnail,
      media,
      licenses,
      features,
      faqs,
      testimonials,
      deliverable_name,
      deliverable_version
    } = req.body;

    const existing = db.get('SELECT * FROM products WHERE id = ?', [productId]);
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    const finalHeroImage = hero_image || thumbnail || existing.hero_image;
    const finalRegularPrice = regular_price !== undefined ? parseFloat(regular_price) : existing.regular_price;
    const finalSalePrice = sale_price !== undefined ? (sale_price === null || sale_price === '' ? null : parseFloat(sale_price)) : existing.sale_price;

    // 1. Update Core Product Record
    db.run(
      `UPDATE products SET
        title = ?,
        slug = ?,
        sku = ?,
        category_id = ?,
        short_description = ?,
        full_description = ?,
        product_type = ?,
        author = ?,
        regular_price = ?,
        sale_price = ?,
        badge = ?,
        status = ?,
        demo_url = ?,
        video_url = ?,
        video_type = ?,
        video_thumbnail = ?,
        video_title = ?,
        video_description = ?,
        customer_demo_url = ?,
        partner_demo_url = ?,
        admin_demo_url = ?,
        web_demo_url = ?,
        docs_url = ?,
        hero_image = ?,
        eyebrow = ?,
        subtitle = ?,
        cta_text = ?,
        secondary_cta_text = ?,
        asset_availability = ?,
        disclaimer = ?,
        technical_specs = ?,
        how_it_works = ?,
        seo_title = ?,
        seo_description = ?,
        seo_keywords = ?,
        og_image = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        title !== undefined ? title : existing.title,
        slug !== undefined && slug.trim() ? slug.trim() : existing.slug,
        sku !== undefined ? sku : existing.sku,
        category_id !== undefined ? parseInt(category_id) : existing.category_id,
        short_description !== undefined ? short_description : existing.short_description,
        full_description !== undefined ? full_description : existing.full_description,
        product_type !== undefined ? product_type : existing.product_type,
        author !== undefined ? author : existing.author,
        finalRegularPrice,
        finalSalePrice,
        badge !== undefined ? (badge ? badge.trim() : null) : existing.badge,
        status !== undefined ? status : existing.status,
        demo_url !== undefined ? (demo_url || null) : existing.demo_url,
        video_url !== undefined ? (video_url || null) : existing.video_url,
        video_type !== undefined ? (video_type || 'auto') : (existing.video_type || 'auto'),
        video_thumbnail !== undefined ? (video_thumbnail || null) : existing.video_thumbnail,
        video_title !== undefined ? (video_title || null) : existing.video_title,
        video_description !== undefined ? (video_description || null) : existing.video_description,
        customer_demo_url !== undefined ? (customer_demo_url || null) : existing.customer_demo_url,
        partner_demo_url !== undefined ? (partner_demo_url || null) : existing.partner_demo_url,
        admin_demo_url !== undefined ? (admin_demo_url || null) : existing.admin_demo_url,
        web_demo_url !== undefined ? (web_demo_url || null) : existing.web_demo_url,
        docs_url !== undefined ? (docs_url || null) : existing.docs_url,
        finalHeroImage || null,
        eyebrow !== undefined ? eyebrow : existing.eyebrow,
        subtitle !== undefined ? subtitle : existing.subtitle,
        cta_text !== undefined ? cta_text : existing.cta_text,
        secondary_cta_text !== undefined ? secondary_cta_text : existing.secondary_cta_text,
        asset_availability !== undefined ? asset_availability : existing.asset_availability,
        disclaimer !== undefined ? disclaimer : existing.disclaimer,
        technical_specs !== undefined ? (typeof technical_specs === 'object' ? JSON.stringify(technical_specs) : technical_specs) : existing.technical_specs,
        how_it_works !== undefined ? (typeof how_it_works === 'object' ? JSON.stringify(how_it_works) : how_it_works) : existing.how_it_works,
        seo_title !== undefined ? seo_title : existing.seo_title,
        seo_description !== undefined ? seo_description : existing.seo_description,
        seo_keywords !== undefined ? seo_keywords : existing.seo_keywords,
        og_image !== undefined ? og_image : existing.og_image,
        productId
      ]
    );

    // 2. Update Media Gallery & Thumbnail in product_media
    const activeThumbUrl = thumbnail || hero_image || finalHeroImage;
    if (activeThumbUrl || (Array.isArray(media) && media.length > 0)) {
      db.run('DELETE FROM product_media WHERE product_id = ?', [productId]);
      
      // Insert primary thumbnail
      if (activeThumbUrl) {
        db.run(
          'INSERT INTO product_media (product_id, media_url, media_type, is_thumbnail, sort_order) VALUES (?, ?, ?, 1, 0)',
          [productId, activeThumbUrl, 'image']
        );
      }

      // Insert extra gallery images
      if (Array.isArray(media)) {
        media.forEach((m, idx) => {
          const mUrl = typeof m === 'string' ? m : (m && m.media_url ? m.media_url : null);
          if (mUrl && mUrl !== activeThumbUrl) {
            db.run(
              'INSERT INTO product_media (product_id, media_url, media_type, is_thumbnail, sort_order) VALUES (?, ?, ?, 0, ?)',
              [productId, mUrl, (m && m.media_type) || 'image', idx + 1]
            );
          }
        });
      }
    }

    // 3. Update Product Licenses
    if (Array.isArray(licenses) && licenses.length > 0) {
      db.run('DELETE FROM product_licenses WHERE product_id = ?', [productId]);
      licenses.forEach(lic => {
        const licName = lic.name || lic.license_name;
        if (licName) {
          const licRegPrice = lic.regular_price !== undefined && lic.regular_price !== null && lic.regular_price !== '' ? parseFloat(lic.regular_price) : null;
          const licOfferPrice = parseFloat(lic.price !== undefined ? lic.price : lic.sale_price) || 0;
          db.run(
            `INSERT INTO product_licenses (product_id, license_name, price, regular_price, description, permissions, restrictions)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              productId,
              licName,
              licOfferPrice,
              licRegPrice,
              lic.description || '',
              lic.permissions || 'Commercial use allowed',
              lic.restrictions || ''
            ]
          );
        }
      });
    } else {
      // Keep or sync default license with current price
      const effectivePrice = finalSalePrice !== null ? finalSalePrice : finalRegularPrice;
      const existingLicense = db.get('SELECT id FROM product_licenses WHERE product_id = ? LIMIT 1', [productId]);
      if (existingLicense) {
        db.run('UPDATE product_licenses SET price = ?, regular_price = ? WHERE id = ?', [effectivePrice, finalRegularPrice, existingLicense.id]);
      } else {
        db.run(
          `INSERT INTO product_licenses (product_id, license_name, price, regular_price, description, permissions, restrictions)
           VALUES (?, 'Standard Commercial License', ?, ?, 'Commercial license for client and personal projects', 'Unlimited commercial use, Lifetime updates', 'Cannot resell as raw asset')`,
          [productId, effectivePrice, finalRegularPrice]
        );
      }
    }

    // 4. Update Product Features
    if (Array.isArray(features)) {
      db.run('DELETE FROM product_features WHERE product_id = ?', [productId]);
      features.forEach((feat, idx) => {
        if (feat.title) {
          db.run(
            `INSERT INTO product_features (product_id, title, description, icon, sort_order)
             VALUES (?, ?, ?, ?, ?)`,
            [productId, feat.title, feat.description || '', feat.icon || 'CheckCircle', idx]
          );
        }
      });
    }

    // 5. Update Product FAQs
    if (Array.isArray(faqs)) {
      db.run('DELETE FROM product_faqs WHERE product_id = ?', [productId]);
      faqs.forEach((faq, idx) => {
        if (faq.question) {
          db.run(
            `INSERT INTO product_faqs (product_id, question, answer, sort_order)
             VALUES (?, ?, ?, ?)`,
            [productId, faq.question, faq.answer || '', idx]
          );
        }
      });
    }

    // 6. Update Product Testimonials
    if (Array.isArray(testimonials)) {
      db.run('DELETE FROM product_testimonials WHERE product_id = ?', [productId]);
      testimonials.forEach((t, idx) => {
        const authorName = t.name || t.user_name || t.author_name;
        const reviewText = t.text || t.quote || t.review || '';
        if (authorName && reviewText) {
          db.run(
            `INSERT INTO product_testimonials (product_id, name, avatar_url, designation, rating, text, is_verified, is_featured, sort_order, is_visible)
             VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, 1)`,
            [
              productId,
              authorName.trim(),
              t.avatar_url || null,
              t.designation || t.role || '',
              t.rating !== undefined ? t.rating : 5,
              reviewText.trim(),
              t.is_verified !== undefined ? (t.is_verified ? 1 : 0) : 1,
              idx
            ]
          );
        }
      });
    }

    // 7. Update Digital Deliverable Association
    if (deliverable_name) {
      const existingFile = db.get('SELECT id FROM product_files WHERE product_id = ? AND is_active = 1', [productId]);
      if (existingFile) {
        db.run(
          'UPDATE product_files SET file_name = ?, file_path = ?, version = ? WHERE id = ?',
          [deliverable_name, deliverable_name, deliverable_version || '1.0.0', existingFile.id]
        );
      } else {
        db.run(
          `INSERT INTO product_files (product_id, file_name, file_path, file_size, version, changelog, download_limit, is_active)
           VALUES (?, ?, ?, ?, ?, 'Standard release', 10, 1)`,
          [productId, deliverable_name, deliverable_name, 2500000, deliverable_version || '1.0.0']
        );
      }
    }

    logAdminActivity(db, req.user.id, 'PRODUCT_UPDATED', 'product', productId, { title: title || existing.title, status: status || existing.status });
    res.json({ message: 'Product updated successfully across catalog and store!' });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ error: 'Failed to update product: ' + err.message });
  }
});

// PUT /api/admin/products/:id/sections (Bulk update & reorder sections)
router.put('/:id/sections', async (req, res) => {
  try {
    const db = await getDatabase();
    const productId = req.params.id;
    const { sections = [] } = req.body;

    db.run('DELETE FROM product_sections WHERE product_id = ?', [productId]);
    sections.forEach((sec, idx) => {
      db.run(
        `INSERT INTO product_sections (
          product_id, section_type, title, subtitle, content, settings, sort_order, is_visible
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          productId,
          sec.section_type || sec.type,
          sec.title || '',
          sec.subtitle || null,
          typeof sec.content === 'object' ? JSON.stringify(sec.content) : (sec.content || null),
          typeof sec.settings === 'object' ? JSON.stringify(sec.settings) : (sec.settings || null),
          sec.sort_order !== undefined ? sec.sort_order : idx,
          sec.is_visible !== undefined ? (sec.is_visible ? 1 : 0) : 1
        ]
      );
    });

    logAdminActivity(db, req.user.id, 'PRODUCT_SECTIONS_UPDATED', 'product', productId, { count: sections.length });
    res.json({ message: 'Product sections updated successfully' });
  } catch (err) {
    console.error('Update sections error:', err);
    res.status(500).json({ error: 'Failed to update sections' });
  }
});

// PUT /api/admin/products/:id/bonuses
router.put('/:id/bonuses', async (req, res) => {
  try {
    const db = await getDatabase();
    const productId = req.params.id;
    const { bonuses = [] } = req.body;

    db.run('DELETE FROM product_bonuses WHERE product_id = ?', [productId]);
    bonuses.forEach((b, idx) => {
      db.run(
        `INSERT INTO product_bonuses (
          product_id, title, subtitle, description, image_url, value_amount, badge, sort_order, is_visible
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          productId,
          b.title,
          b.subtitle || null,
          b.description || '',
          b.image_url || null,
          parseFloat(b.value_amount) || 0,
          b.badge || 'FREE',
          idx,
          b.is_visible !== undefined ? (b.is_visible ? 1 : 0) : 1
        ]
      );
    });

    res.json({ message: 'Bonuses updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update bonuses' });
  }
});

// GET /api/admin/products/:id/analytics
router.get('/:id/analytics', async (req, res) => {
  try {
    const db = await getDatabase();
    const productId = req.params.id;

    const prod = db.get('SELECT * FROM products WHERE id = ?', [productId]);
    if (!prod) return res.status(404).json({ error: 'Product not found' });

    const orderCountRow = db.get('SELECT count(*) as total_orders, COALESCE(sum(price), 0) as total_revenue FROM order_items WHERE product_id = ?', [productId]);
    const downloadsRow = db.get('SELECT count(*) as total_downloads FROM downloads d JOIN product_files pf ON pf.id = d.product_file_id WHERE pf.product_id = ?', [productId]);
    const reviewsRow = db.get('SELECT count(*) as review_count, COALESCE(avg(rating), 5) as avg_rating FROM reviews WHERE product_id = ? AND status = "approved"', [productId]);

    const views = (prod.sales_count * 25) + 120; // Estimated realistic visitor impressions
    const orders = orderCountRow ? orderCountRow.total_orders : prod.sales_count;
    const revenue = orderCountRow ? orderCountRow.total_revenue : (prod.sales_count * (prod.sale_price || prod.regular_price));
    const conversionRate = views > 0 ? (orders / views) * 100 : 0;

    res.json({
      productId,
      title: prod.title,
      views,
      orders,
      revenue,
      conversionRate: Math.round(conversionRate * 100) / 100,
      downloads: downloadsRow ? downloadsRow.total_downloads : 0,
      avgRating: reviewsRow ? Math.round(reviewsRow.avg_rating * 10) / 10 : prod.rating_avg,
      reviewCount: reviewsRow ? reviewsRow.review_count : prod.review_count
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// POST /api/admin/products/:id/duplicate
router.post('/:id/duplicate', async (req, res) => {
  try {
    const db = await getDatabase();
    const orig = db.get('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!orig) return res.status(404).json({ error: 'Product not found' });

    const newTitle = `${orig.title} (Copy)`;
    const newSlug = `${orig.slug}-copy-${Date.now().toString().slice(-4)}`;
    const newSku = `SKU-COPY-${Date.now().toString().slice(-5)}`;

    const newProdRes = db.run(
      `INSERT INTO products (
        title, slug, sku, category_id, short_description, full_description, product_type,
        author, regular_price, sale_price, badge, status, demo_url, video_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?)`,
      [
        newTitle,
        newSlug,
        newSku,
        orig.category_id,
        orig.short_description,
        orig.full_description,
        orig.product_type,
        orig.author,
        orig.regular_price,
        orig.sale_price,
        orig.badge,
        orig.demo_url,
        orig.video_url
      ]
    );
    const newId = newProdRes.lastInsertRowid;

    // Duplicate media
    const mediaList = db.query('SELECT * FROM product_media WHERE product_id = ?', [orig.id]);
    mediaList.forEach(m => {
      db.run(
        'INSERT INTO product_media (product_id, media_url, media_type, is_thumbnail, sort_order) VALUES (?, ?, ?, ?, ?)',
        [newId, m.media_url, m.media_type, m.is_thumbnail, m.sort_order]
      );
    });

    // Duplicate licenses
    const licenses = db.query('SELECT * FROM product_licenses WHERE product_id = ?', [orig.id]);
    licenses.forEach(l => {
      db.run(
        'INSERT INTO product_licenses (product_id, license_name, price, description, permissions, restrictions) VALUES (?, ?, ?, ?, ?, ?)',
        [newId, l.license_name, l.price, l.description, l.permissions, l.restrictions]
      );
    });

    // Duplicate features
    const features = db.query('SELECT * FROM product_features WHERE product_id = ?', [orig.id]);
    features.forEach(f => {
      db.run(
        'INSERT INTO product_features (product_id, title, description, icon, sort_order) VALUES (?, ?, ?, ?, ?)',
        [newId, f.title, f.description, f.icon, f.sort_order]
      );
    });

    // Duplicate compatibility
    const comps = db.query('SELECT * FROM product_compatibility WHERE product_id = ?', [orig.id]);
    comps.forEach(c => {
      db.run(
        'INSERT INTO product_compatibility (product_id, platform, version) VALUES (?, ?, ?)',
        [newId, c.platform, c.version]
      );
    });

    // Duplicate FAQs
    const faqs = db.query('SELECT * FROM product_faqs WHERE product_id = ?', [orig.id]);
    faqs.forEach(fq => {
      db.run(
        'INSERT INTO product_faqs (product_id, question, answer, sort_order) VALUES (?, ?, ?, ?)',
        [newId, fq.question, fq.answer, fq.sort_order]
      );
    });

    // Duplicate active file definition
    const activeFile = db.get('SELECT * FROM product_files WHERE product_id = ? AND is_active = 1 LIMIT 1', [orig.id]);
    if (activeFile) {
      db.run(
        'INSERT INTO product_files (product_id, file_name, file_path, file_size, version, changelog, download_limit, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
        [newId, activeFile.file_name, activeFile.file_path, activeFile.file_size, activeFile.version, activeFile.changelog, activeFile.download_limit]
      );
    }

    logAdminActivity(db, req.user.id, 'PRODUCT_DUPLICATED', 'product', newId, { originalId: orig.id, newTitle });
    res.status(201).json({ message: 'Product duplicated successfully as draft', newProductId: newId, newSlug });
  } catch (err) {
    console.error('Duplicate product error:', err);
    res.status(500).json({ error: 'Failed to duplicate product' });
  }
});

// PATCH /api/admin/products/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['draft', 'published', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const db = await getDatabase();
    db.run('UPDATE products SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, req.params.id]);
    logAdminActivity(db, req.user.id, 'PRODUCT_STATUS_CHANGED', 'product', req.params.id, { status });
    res.json({ message: `Product status changed to ${status}` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to change product status' });
  }
});

// DELETE /api/admin/products/:id
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    db.run('DELETE FROM products WHERE id = ?', [req.params.id]);
    logAdminActivity(db, req.user.id, 'PRODUCT_DELETED', 'product', req.params.id);
    res.json({ message: 'Product deleted permanently' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// POST /api/admin/products/bulk (Bulk operations)
router.post('/bulk', async (req, res) => {
  try {
    const { action, ids = [] } = req.body;
    if (!ids.length) return res.status(400).json({ error: 'No product IDs specified' });

    const db = await getDatabase();
    for (const id of ids) {
      if (action === 'publish') {
        db.run('UPDATE products SET status = "published" WHERE id = ?', [id]);
      } else if (action === 'unpublish') {
        db.run('UPDATE products SET status = "draft" WHERE id = ?', [id]);
      } else if (action === 'archive') {
        db.run('UPDATE products SET status = "archived" WHERE id = ?', [id]);
      } else if (action === 'delete') {
        db.run('DELETE FROM products WHERE id = ?', [id]);
      }
    }

    logAdminActivity(db, req.user.id, 'PRODUCT_BULK_ACTION', 'product', null, { action, count: ids.length });
    res.json({ message: `Bulk ${action} completed on ${ids.length} products` });
  } catch (err) {
    res.status(500).json({ error: 'Bulk action failed' });
  }
});

module.exports = router;
