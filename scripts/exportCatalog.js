const fs = require('fs');
const path = require('path');
const { getDatabase } = require('../server/config/database');

async function exportCatalog() {
  const db = await getDatabase();
  const categories = db.query("SELECT * FROM categories WHERE status = 'active' ORDER BY sort_order ASC");
  const products = db.query("SELECT * FROM products WHERE status = 'published' ORDER BY id DESC");

  const fullProducts = products.map(p => {
    const media = db.query("SELECT id, media_url, media_type, is_thumbnail, sort_order FROM product_media WHERE product_id = ? ORDER BY sort_order ASC, id ASC", [p.id]);
    const licenses = db.query("SELECT id, license_name, price, regular_price, description, permissions, restrictions FROM product_licenses WHERE product_id = ? ORDER BY price ASC", [p.id]);
    const features = db.query("SELECT id, title, description, icon, sort_order FROM product_features WHERE product_id = ? ORDER BY sort_order ASC, id ASC", [p.id]);
    const compatibility = db.query("SELECT id, platform, version FROM product_compatibility WHERE product_id = ?", [p.id]);
    const faqs = db.query("SELECT id, question, answer, sort_order FROM product_faqs WHERE product_id = ? ORDER BY sort_order ASC, id ASC", [p.id]);
    const reviews = db.query("SELECT r.*, u.full_name as author_name FROM reviews r LEFT JOIN users u ON u.id = r.user_id WHERE r.product_id = ? AND r.status = 'approved' ORDER BY r.id DESC", [p.id]);
    
    let testimonials = [];
    try {
      testimonials = db.query("SELECT * FROM product_testimonials WHERE product_id = ? ORDER BY sort_order ASC", [p.id]);
    } catch (e) {}

    let sections = [];
    try {
      sections = db.query("SELECT * FROM product_sections WHERE product_id = ? ORDER BY sort_order ASC", [p.id]);
    } catch (e) {}

    const cat = categories.find(c => c.id === p.category_id);
    const thumbMedia = media.find(m => m.is_thumbnail === 1) || media[0];
    const thumbnail = (thumbMedia && thumbMedia.media_url) || p.hero_image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80';

    return {
      ...p,
      category_name: cat ? cat.name : 'Digital Products',
      category_slug: cat ? cat.slug : 'digital-products',
      thumbnail,
      media,
      licenses,
      features,
      compatibility,
      faqs,
      reviews,
      testimonials,
      sections
    };
  });

  const outDir = path.join(__dirname, '..', 'client', 'src', 'data');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const catalogContent = `/* Auto-generated Fallback Catalog for Offline / Static / Vercel */
export const FALLBACK_CATEGORIES = ${JSON.stringify(categories, null, 2)};

export const FALLBACK_PRODUCTS = ${JSON.stringify(fullProducts, null, 2)};
`;

  fs.writeFileSync(path.join(outDir, 'fallbackCatalog.js'), catalogContent, 'utf8');
  console.log(`Exported ${fullProducts.length} products and ${categories.length} categories to client/src/data/fallbackCatalog.js`);
}

exportCatalog().catch(err => {
  console.error('Export failed:', err);
  process.exit(1);
});
