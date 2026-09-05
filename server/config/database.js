const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'database.sqlite');

let dbInstance = null;

async function getDatabase() {
  if (dbInstance) return dbInstance;

  const SQL = await initSqlJs();
  let db;

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  function save() {
    try {
      const data = db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(DB_PATH, buffer);
    } catch (err) {
      console.error('Failed to save database to disk:', err);
    }
  }

  const sanitizeParams = (params) => {
    if (!params || !Array.isArray(params)) return [];
    return params.map(v => (v !== undefined ? v : null));
  };

  const helper = {
    _raw: db,
    save,

    query(sql, params = []) {
      const cleanParams = sanitizeParams(params);
      const stmt = db.prepare(sql);
      if (cleanParams && cleanParams.length > 0) {
        stmt.bind(cleanParams);
      }
      const results = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      stmt.free();
      return results;
    },

    get(sql, params = []) {
      const rows = this.query(sql, params);
      return rows.length > 0 ? rows[0] : null;
    },

    run(sql, params = []) {
      const cleanParams = sanitizeParams(params);
      db.run(sql, cleanParams);
      const lastIdRes = db.exec("SELECT last_insert_rowid() as id");
      const changesRes = db.exec("SELECT changes() as changes");
      const lastInsertRowid = (lastIdRes[0] && lastIdRes[0].values[0]) ? lastIdRes[0].values[0][0] : 0;
      const changes = (changesRes[0] && changesRes[0].values[0]) ? changesRes[0].values[0][0] : 0;
      save();
      return { lastInsertRowid, changes };
    },

    exec(sql) {
      db.exec(sql);
      save();
    }
  };

  initSchema(helper);
  dbInstance = helper;
  return helper;
}

function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      avatar TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      icon TEXT,
      image_url TEXT,
      sort_order INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active'
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      sku TEXT UNIQUE NOT NULL,
      category_id INTEGER REFERENCES categories(id),
      short_description TEXT,
      full_description TEXT,
      product_type TEXT DEFAULT 'digital',
      author TEXT DEFAULT 'Platform Creator',
      regular_price REAL NOT NULL DEFAULT 0,
      sale_price REAL,
      badge TEXT,
      status TEXT DEFAULT 'published',
      demo_url TEXT,
      video_url TEXT,
      rating_avg REAL DEFAULT 5.0,
      review_count INTEGER DEFAULT 0,
      sales_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS product_media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      media_url TEXT NOT NULL,
      media_type TEXT DEFAULT 'image',
      is_thumbnail INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS product_licenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      license_name TEXT NOT NULL,
      price REAL NOT NULL,
      regular_price REAL,
      description TEXT,
      permissions TEXT,
      restrictions TEXT
    );

    CREATE TABLE IF NOT EXISTS product_features (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      icon TEXT DEFAULT 'CheckCircle',
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS product_compatibility (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      platform TEXT NOT NULL,
      version TEXT
    );

    CREATE TABLE IF NOT EXISTS product_faqs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS product_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER DEFAULT 0,
      version TEXT DEFAULT '1.0.0',
      changelog TEXT,
      download_limit INTEGER DEFAULT 10,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      user_id INTEGER REFERENCES users(id),
      customer_email TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      subtotal REAL NOT NULL,
      discount_amount REAL DEFAULT 0,
      tax_amount REAL DEFAULT 0,
      total_amount REAL NOT NULL,
      currency TEXT DEFAULT 'INR',
      payment_provider TEXT DEFAULT 'simulated',
      payment_id TEXT,
      payment_status TEXT DEFAULT 'pending',
      order_status TEXT DEFAULT 'completed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id),
      license_id INTEGER REFERENCES product_licenses(id),
      product_title TEXT NOT NULL,
      license_name TEXT NOT NULL,
      price REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS downloads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER REFERENCES orders(id),
      user_id INTEGER REFERENCES users(id),
      product_file_id INTEGER REFERENCES product_files(id),
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      download_count INTEGER DEFAULT 0,
      max_downloads INTEGER DEFAULT 10,
      last_downloaded_at DATETIME,
      last_ip TEXT
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id),
      rating INTEGER NOT NULL,
      title TEXT NOT NULL,
      comment TEXT NOT NULL,
      is_verified_purchase INTEGER DEFAULT 1,
      status TEXT DEFAULT 'approved',
      is_featured INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS wishlists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, product_id)
    );

    CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      discount_type TEXT DEFAULT 'percentage',
      discount_value REAL NOT NULL,
      min_order_value REAL DEFAULT 0,
      max_discount REAL,
      usage_limit INTEGER DEFAULT 1000,
      times_used INTEGER DEFAULT 0,
      expires_at DATETIME,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS coupon_usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      coupon_id INTEGER REFERENCES coupons(id),
      user_id INTEGER REFERENCES users(id),
      order_id INTEGER REFERENCES orders(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS support_tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      order_id INTEGER REFERENCES orders(id),
      subject TEXT NOT NULL,
      status TEXT DEFAULT 'open',
      priority TEXT DEFAULT 'normal',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS support_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id INTEGER REFERENCES support_tickets(id) ON DELETE CASCADE,
      sender_id INTEGER REFERENCES users(id),
      sender_role TEXT DEFAULT 'customer',
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admin_activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER REFERENCES users(id),
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id INTEGER,
      details TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS banners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      subtitle TEXT,
      image_url TEXT,
      cta_text TEXT,
      cta_url TEXT,
      badge TEXT,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS product_sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      section_type TEXT NOT NULL,
      title TEXT,
      subtitle TEXT,
      content TEXT,
      settings TEXT,
      sort_order INTEGER DEFAULT 0,
      is_visible INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS product_bonuses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      subtitle TEXT,
      description TEXT,
      image_url TEXT,
      value_amount REAL DEFAULT 0,
      badge TEXT,
      access_type TEXT DEFAULT 'download',
      access_url TEXT,
      file_id INTEGER REFERENCES product_files(id),
      sort_order INTEGER DEFAULT 0,
      is_visible INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS product_testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      avatar_url TEXT,
      designation TEXT,
      rating INTEGER DEFAULT 5,
      text TEXT NOT NULL,
      is_verified INTEGER DEFAULT 1,
      is_featured INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      is_visible INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS product_access_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      access_type TEXT NOT NULL DEFAULT 'download',
      url TEXT,
      product_file_id INTEGER REFERENCES product_files(id),
      instructions TEXT,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS product_upsells (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      upsell_product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      title TEXT,
      description TEXT,
      discount_percentage REAL DEFAULT 0,
      special_price REAL,
      is_active INTEGER DEFAULT 1
    );
  `);

  // Run dynamic column migrations for products table
  try {
    const cols = db.query("PRAGMA table_info(products)").map(c => c.name);
    const newCols = [
      { name: 'eyebrow', def: 'TEXT' },
      { name: 'subtitle', def: 'TEXT' },
      { name: 'cta_text', def: 'TEXT' },
      { name: 'secondary_cta_text', def: 'TEXT' },
      { name: 'cta_url', def: 'TEXT' },
      { name: 'urgency_text', def: 'TEXT' },
      { name: 'offer_expires_at', def: 'DATETIME' },
      { name: 'access_type', def: "TEXT DEFAULT 'download'" },
      { name: 'external_access_url', def: 'TEXT' },
      { name: 'asset_availability', def: "TEXT DEFAULT 'Available'" },
      { name: 'disclaimer', def: 'TEXT' },
      { name: 'technical_specs', def: 'TEXT' },
      { name: 'how_it_works', def: 'TEXT' },
      { name: 'hero_image', def: 'TEXT' },
      { name: 'theme_style', def: "TEXT DEFAULT 'default'" },
      { name: 'is_featured', def: 'INTEGER DEFAULT 0' },
      { name: 'is_trending', def: 'INTEGER DEFAULT 0' },
      { name: 'is_bestseller', def: 'INTEGER DEFAULT 0' },
      { name: 'is_new', def: 'INTEGER DEFAULT 0' },
      { name: 'is_staff_pick', def: 'INTEGER DEFAULT 0' },
      { name: 'seo_title', def: 'TEXT' },
      { name: 'seo_description', def: 'TEXT' },
      { name: 'seo_keywords', def: 'TEXT' },
      { name: 'og_image', def: 'TEXT' }
    ];

    for (const col of newCols) {
      if (!cols.includes(col.name)) {
        try {
          db.exec(`ALTER TABLE products ADD COLUMN ${col.name} ${col.def}`);
        } catch (colErr) {
          // ignore if already added
        }
      }
    }
  } catch (migErr) {
    console.warn('Migration warning:', migErr.message);
  }
}

module.exports = { getDatabase };
