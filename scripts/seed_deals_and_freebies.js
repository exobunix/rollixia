const { getDatabase } = require('../server/config/database');

async function seedDealsAndFreebies() {
  const db = await getDatabase();

  console.log('--- Updating 5 Deals in DB ---');
  // Update IDs 11, 12, 13, 14, 15 as DEAL & is_trending = 1
  db.run(`UPDATE products SET badge = 'DEAL', is_trending = 1 WHERE id IN (11, 12, 13, 14, 15)`);
  console.log('5 existing bundle products updated to badge = DEAL and is_trending = 1');

  console.log('--- Inserting 5 Freebies ---');
  const freebies = [
    {
      title: 'NextUI SaaS Starter Boilerplate (React 19 & Next.js)',
      slug: 'nextui-saas-starter-boilerplate',
      sku: 'FREE-NEXT-01',
      category_id: 1, // Software & SaaS
      product_type: 'Full-Stack Codebase',
      regular_price: 0,
      sale_price: 0,
      badge: 'FREE',
      status: 'published',
      is_featured: 1,
      is_trending: 1,
      sales_count: 840,
      rating_avg: 4.9,
      review_count: 56,
      short_description: 'Complete open-source Next.js 15 starter with clean auth architecture, TailwindCSS, dark mode, and responsive dashboard.',
      full_description: 'Kickstart your next software venture with our production-ready NextUI SaaS Starter Boilerplate. Engineered for performance with Next.js 15 App Router, TypeScript, Tailwind CSS, Lucide Icons, and pre-built authentication layouts.',
      hero_image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      technical_specs: JSON.stringify([
        { label: 'Framework', value: 'Next.js 15 App Router' },
        { label: 'Language', value: 'TypeScript 5.x' },
        { label: 'Styling', value: 'Tailwind CSS 3.4' },
        { label: 'License', value: '100% Free MIT License' }
      ]),
      highlights: [
        { icon: 'Zap', title: '100% Free Download', description: 'Instant repository and ZIP access with zero card required.' },
        { icon: 'ShieldCheck', title: 'Commercial Use Allowed', description: 'Deploy for personal projects or client commercial software.' },
        { icon: 'RefreshCw', title: 'Regular Updates', description: 'Continuously updated alongside new Next.js releases.' },
        { icon: 'FileCode', title: 'Clean TypeScript', description: 'Zero boilerplate clutter, strictly typed throughout.' }
      ]
    },
    {
      title: '500+ Essential SVG & Figma Vector Icon Kit',
      slug: '500-essential-svg-figma-icon-kit',
      sku: 'FREE-ICONS-02',
      category_id: 3, // UI Kits & Design Systems
      product_type: 'Vector Design Kit',
      regular_price: 0,
      sale_price: 0,
      badge: 'FREE',
      status: 'published',
      is_featured: 1,
      is_trending: 1,
      sales_count: 1250,
      rating_avg: 5.0,
      review_count: 89,
      short_description: 'Over 500 pixel-perfect SVG and Figma vector icons organized into 18 categories for web and mobile interfaces.',
      full_description: 'A comprehensive vector icon library designed on a 24x24 pixel grid with consistent 2px stroke weight. Fully compatible with Figma, Sketch, Adobe XD, Illustrator, and web SVG code.',
      hero_image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      technical_specs: JSON.stringify([
        { label: 'Total Icons', value: '500+ Vector Assets' },
        { label: 'Formats', value: 'Figma (.fig), SVG, PNG' },
        { label: 'Grid Size', value: '24x24px Pixel Perfect' },
        { label: 'License', value: 'Personal & Commercial Use' }
      ]),
      highlights: [
        { icon: 'DownloadCloud', title: 'Instant Vector Assets', description: 'Direct ZIP download with organized folders by category.' },
        { icon: 'ShieldCheck', title: 'Commercial Friendly', description: 'Use in unlimited client and personal web/mobile projects.' },
        { icon: 'CheckCircle2', title: 'Figma Auto-Layout', description: 'Componentized Figma library ready to copy and paste.' },
        { icon: 'Headphones', title: 'Documentation', description: 'Includes symbol guide and SVG code embedding tips.' }
      ]
    },
    {
      title: 'Freelancer Notion Operating System (OS)',
      slug: 'freelancer-notion-operating-system',
      sku: 'FREE-NOTION-03',
      category_id: 6, // Business & Notion Systems
      product_type: 'Notion Workspace Template',
      regular_price: 0,
      sale_price: 0,
      badge: 'FREE',
      status: 'published',
      is_featured: 1,
      is_trending: 0,
      sales_count: 910,
      rating_avg: 4.8,
      review_count: 42,
      short_description: 'An all-in-one Notion workspace for freelance developers and designers to manage clients, invoices, deadlines, and project deliverables.',
      full_description: 'Streamline your independent client business with the Freelancer Notion OS. Includes integrated CRM, automated invoice calculation tables, proposal generators, project milestone kanban boards, and tax trackers.',
      hero_image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
      technical_specs: JSON.stringify([
        { label: 'Platform', value: 'Notion Official Workspace' },
        { label: 'Compatibility', value: 'Free & Plus Notion Plans' },
        { label: 'Pages Included', value: '14 Connected Databases' },
        { label: 'License', value: 'Free Lifetime Access' }
      ]),
      highlights: [
        { icon: 'Zap', title: '1-Click Duplicate', description: 'Instantly duplicate to your own Notion account with one click.' },
        { icon: 'CheckCircle2', title: 'Client CRM Included', description: 'Track leads, closed deals, and contract history.' },
        { icon: 'ShieldCheck', title: 'Lifetime Updates', description: 'Free template additions and layout updates.' },
        { icon: 'Headphones', title: 'Setup Guide', description: '5-minute step-by-step video setup walkthrough.' }
      ]
    },
    {
      title: '100+ ChatGPT & Claude Master Prompts for Developers',
      slug: '100-chatgpt-claude-master-prompts',
      sku: 'FREE-AI-04',
      category_id: 5, // AI Prompts & Tools
      product_type: 'AI Prompt Vault',
      regular_price: 0,
      sale_price: 0,
      badge: 'FREE',
      status: 'published',
      is_featured: 1,
      is_trending: 1,
      sales_count: 1540,
      rating_avg: 4.9,
      review_count: 112,
      short_description: 'Engineered prompt templates for full-stack developers, software architects, code refactoring, SQL optimization, and debugging.',
      full_description: 'Supercharge your daily coding workflow with 100+ carefully crafted prompt engineering templates. Tested on GPT-4o, Claude 3.5 Sonnet, and Gemini 1.5 Pro to produce accurate, production-grade code snippets.',
      hero_image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
      technical_specs: JSON.stringify([
        { label: 'Prompt Count', value: '100+ Curated Prompts' },
        { label: 'Formats', value: 'PDF, Markdown, Notion' },
        { label: 'Compatible Models', value: 'GPT-4o, Claude 3.5, Gemini' },
        { label: 'License', value: 'Personal & Team Use' }
      ]),
      highlights: [
        { icon: 'Zap', title: 'Instant Productivity', description: 'Copy and paste prompt patterns directly into your AI assistant.' },
        { icon: 'CheckCircle2', title: 'Tested on Production Code', description: 'Prompts formatted with strict system role constraints.' },
        { icon: 'ShieldCheck', title: 'Always Free', description: 'Community resource shared with the developer ecosystem.' },
        { icon: 'DownloadCloud', title: 'Markdown & PDF', description: 'Available in raw GitHub Markdown and styled PDF.' }
      ]
    },
    {
      title: 'Modern Minimalist Tailwind Portfolio Template',
      slug: 'modern-minimalist-tailwind-portfolio',
      sku: 'FREE-PORT-05',
      category_id: 2, // Website Templates
      product_type: 'Frontend Website Template',
      regular_price: 0,
      sale_price: 0,
      badge: 'FREE',
      status: 'published',
      is_featured: 1,
      is_trending: 0,
      sales_count: 730,
      rating_avg: 4.8,
      review_count: 38,
      short_description: 'Sleek, responsive personal portfolio template designed for software engineers, product designers, and creative makers.',
      full_description: 'Showcase your work with elegance. This modern minimalist portfolio template features a sticky navigation, project case study cards, interactive skill pills, timeline resume section, and functional contact form modal.',
      hero_image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
      technical_specs: JSON.stringify([
        { label: 'Stack', value: 'HTML5, Tailwind CSS, Vanilla JS' },
        { label: 'Lighthouse Score', value: '99/100 Mobile & Desktop' },
        { label: 'Responsiveness', value: 'Fluid Responsive Mobile-First' },
        { label: 'License', value: 'MIT Open Source License' }
      ]),
      highlights: [
        { icon: 'Zap', title: 'Blazing Fast Speed', description: 'Scores 99+ on Google PageSpeed Insights with zero framework bloat.' },
        { icon: 'ShieldCheck', title: '100% Free & Open Source', description: 'Free for personal and commercial usage.' },
        { icon: 'CheckCircle2', title: 'Easy Customization', description: 'Clean class architecture and intuitive layout structure.' },
        { icon: 'DownloadCloud', title: 'Instant ZIP Download', description: 'Ready-to-deploy static assets.' }
      ]
    }
  ];

  for (const item of freebies) {
    const existing = db.get('SELECT id FROM products WHERE slug = ?', [item.slug]);
    let prodId;
    if (existing) {
      prodId = existing.id;
      db.run(
        `UPDATE products SET
          title = ?,
          sku = ?,
          category_id = ?,
          product_type = ?,
          regular_price = ?,
          sale_price = ?,
          badge = ?,
          status = ?,
          is_featured = ?,
          is_trending = ?,
          sales_count = ?,
          rating_avg = ?,
          review_count = ?,
          short_description = ?,
          full_description = ?,
          hero_image = ?,
          technical_specs = ?
        WHERE id = ?`,
        [
          item.title,
          item.sku,
          item.category_id,
          item.product_type,
          item.regular_price,
          item.sale_price,
          item.badge,
          item.status,
          item.is_featured,
          item.is_trending,
          item.sales_count,
          item.rating_avg,
          item.review_count,
          item.short_description,
          item.full_description,
          item.hero_image,
          item.technical_specs,
          prodId
        ]
      );
      console.log(`Updated freebie: ${item.title}`);
    } else {
      const res = db.run(
        `INSERT INTO products (
          title, slug, sku, category_id, product_type, regular_price, sale_price, badge, status,
          is_featured, is_trending, sales_count, rating_avg, review_count, short_description, full_description, hero_image, technical_specs
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.title,
          item.slug,
          item.sku,
          item.category_id,
          item.product_type,
          item.regular_price,
          item.sale_price,
          item.badge,
          item.status,
          item.is_featured,
          item.is_trending,
          item.sales_count,
          item.rating_avg,
          item.review_count,
          item.short_description,
          item.full_description,
          item.hero_image,
          item.technical_specs
        ]
      );
      prodId = res.lastInsertRowid;
      console.log(`Created freebie: ${item.title} (ID: ${prodId})`);
    }

    // Ensure thumbnail media
    const existingMedia = db.get('SELECT id FROM product_media WHERE product_id = ? AND is_thumbnail = 1', [prodId]);
    if (!existingMedia) {
      db.run(
        `INSERT INTO product_media (product_id, media_type, media_url, is_thumbnail, sort_order) VALUES (?, 'image', ?, 1, 1)`,
        [prodId, item.hero_image]
      );
    }

    // Ensure license record
    const existingLicRow = db.get('SELECT id FROM product_licenses WHERE product_id = ?', [prodId]);
    if (!existingLicRow) {
      db.run(
        `INSERT INTO product_licenses (product_id, license_name, price, description, permissions, restrictions)
         VALUES (?, 'Free Community License', 0, '100% Free for commercial & personal projects', 'Unlimited use, Open source', 'None')`,
        [prodId]
      );
    }

    // Ensure downloadable file record
    const existingFileRow = db.get('SELECT id FROM product_files WHERE product_id = ?', [prodId]);
    if (!existingFileRow) {
      db.run(
        `INSERT INTO product_files (product_id, file_name, file_path, file_size, version, changelog, download_limit, is_active)
         VALUES (?, ?, ?, 2450000, 'v1.0.0', 'Official community release', 999, 1)`,
        [prodId, `${item.slug}-v1.0.zip`, `downloads/${item.slug}-v1.0.zip`]
      );
    }

    // Ensure highlights section
    const existingHl = db.get('SELECT id FROM product_sections WHERE product_id = ? AND section_type = ?', [prodId, 'highlights']);
    if (!existingHl) {
      db.run(
        `INSERT INTO product_sections (product_id, section_type, title, sort_order, is_visible, content) VALUES (?, 'highlights', 'Highlights & Benefits', 4, 1, ?)`,
        [prodId, JSON.stringify(item.highlights)]
      );
    }

    // Ensure license_delivery section
    const existingLic = db.get('SELECT id FROM product_sections WHERE product_id = ? AND section_type = ?', [prodId, 'license_delivery']);
    if (!existingLic) {
      db.run(
        `INSERT INTO product_sections (product_id, section_type, title, sort_order, is_visible, content) VALUES (?, 'license_delivery', 'License & Delivery Information', 18, 1, ?)`,
        [prodId, JSON.stringify({
          license_type: '100% Free Community License',
          delivery_method: 'Instant Direct Download',
          access: 'Lifetime Unlimited Access',
          support: 'Community Support & Documentation Included',
          disclaimer: 'Free digital asset provided for learning, personal, and commercial projects.'
        })]
      );
    }
  }

  console.log('--- Finished Deals and Freebies Seed ---');
}

seedDealsAndFreebies().catch(console.error);
