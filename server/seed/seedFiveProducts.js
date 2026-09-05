const { getDatabase } = require('../config/database');
const fs = require('fs');
const path = require('path');

// Ensure protected directory exists for file deliverables
const protectedDir = path.join(__dirname, '..', 'storage', 'protected');
if (!fs.existsSync(protectedDir)) {
  fs.mkdirSync(protectedDir, { recursive: true });
}

// Create sample archives for the 5 products if not already present
const sampleFiles = [
  { name: 'festive-5000-all-in-one-bundle.zip', content: 'Festive 5000+ Digital Bundle Package: Courses, Prompts, Templates, Resell Kit.' },
  { name: '10000-n8n-workflows-mega-pack.zip', content: '10,000 n8n Automation Workflows: JSON exports and documentation.' },
  { name: 'worlds-biggest-video-editing-assets.zip', content: 'World\'s Biggest Video Editing Bundle: LUTs, Presets, Sound FX, Motion Graphics.' },
  { name: '5000-seo-backlinks-directory.zip', content: '5000+ High Quality SEO Backlinks Master Directory (Spreadsheet and Guide).' },
  { name: '2000-cartoon-stories-hd-collection.zip', content: '2000+ USA & India Cartoon Stories HD Video Collection.' }
];

sampleFiles.forEach(f => {
  const filePath = path.join(protectedDir, f.name);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, f.content);
  }
});

async function seedFiveProducts() {
  console.log('Seeding 5 core digital products with rich CMS sections & bonuses...');
  const db = await getDatabase();

  // 1. Categories
  const categoriesData = [
    { name: 'Digital Bundles', slug: 'digital-bundles', icon: 'Package', description: 'Massive all-in-one digital assets, courses, and creator kits' },
    { name: 'AI & Automation', slug: 'ai-automation', icon: 'Zap', description: 'n8n workflows, AI prompt packs, bots, and integration scripts' },
    { name: 'Video & Design', slug: 'video-design', icon: 'Film', description: 'Presets, LUTs, motion graphics, video templates, and sound effects' },
    { name: 'SEO & Marketing', slug: 'seo-marketing', icon: 'TrendingUp', description: 'Backlink directories, outreach lists, spreadsheets, and ranking tools' },
    { name: 'Kids & Education', slug: 'kids-education', icon: 'Smile', description: 'Animated cartoon stories, kids videos, moral tales, and learning packs' }
  ];

  const catMap = {};
  for (const cat of categoriesData) {
    let existing = db.get('SELECT id FROM categories WHERE slug = ?', [cat.slug]);
    if (!existing) {
      const res = db.run(
        'INSERT INTO categories (name, slug, icon, description, status) VALUES (?, ?, ?, ?, "active")',
        [cat.name, cat.slug, cat.icon, cat.description]
      );
      catMap[cat.slug] = res.lastInsertRowid;
    } else {
      catMap[cat.slug] = existing.id;
    }
  }

  // 2. The 5 Initial Products Specification
  const productsToSeed = [
    // PRODUCT #1: Festive Sale
    {
      title: 'FESTIVE SALE 🔥 5000+ ALL IN ONE Digital Courses, Bundle & More',
      slug: 'festive-sale-5000-all-in-one',
      sku: 'PRD-FESTIVE-5000',
      category_id: catMap['digital-bundles'],
      product_type: 'Digital Bundle',
      author: 'Digital Empire Studio',
      regular_price: 9999,
      sale_price: 29,
      badge: 'FESTIVE SALE',
      eyebrow: 'FESTIVE SALE 🔥',
      hero_copy: '₹29 MEIN EK NAHI… POORA DIGITAL EMPIRE! 🚀',
      subtitle: '5000+ PREMIUM COURSES • REELS • TEMPLATES • EBOOKS • PROMPTS & MORE',
      cta_text: 'UNLOCK NOW FOR ₹29',
      secondary_cta_text: 'VIEW EVERYTHING INCLUDED',
      theme_style: 'festive',
      access_type: 'download',
      is_featured: 1,
      is_trending: 1,
      is_bestseller: 1,
      rating_avg: 4.96,
      review_count: 342,
      short_description: 'Sirf ₹29/- mein unlock karo ek MASSIVE all-in-one collection — courses, reels, prompts, templates with 100% Free Resell Rights!',
      full_description: `## THE GREAT FESTIVE SALE IS LIVE! 🔥\n\nSirf ₹29/- mein unlock karo ek **MASSIVE all-in-one collection** — jo normally hundreds/thousands mein milta hai.\n\n### 🚀 Why This Digital Empire is Built for You:\n- **5000+ Premium Digital Assets**: Everything from trending viral reels, high-converting Canva templates, ebooks, AI prompts, and complete business tools.\n- **Free Resell Rights Included**: Resell karo & keep 100% of your profits directly in your bank account.\n- **One-Time Investment of ₹29**: Instant lifetime access, zero monthly subscriptions, and free bonus packs included.`,
      media_url: '/uploads/products/festive-sale-cover.svg',
      file_name: 'festive-5000-all-in-one-bundle.zip',
      file_size: 485000000,
      benefits: [
        { icon: 'Gift', title: 'Surprise Bonuses Worth ₹10,000+', description: 'Includes 5 high-income digital courses and toolkits' },
        { icon: 'Zap', title: 'Get Resell Rights FREE', description: 'Resell karo & keep 100% of your profits directly' },
        { icon: 'Infinity', title: 'Lifetime Access', description: 'One-time payment with unlimited cloud access' },
        { icon: 'CreditCard', title: 'One-Time Payment', description: 'No hidden fees or recurring subscriptions ever' },
        { icon: 'CheckCircle', title: 'Beginner Friendly', description: 'Step-by-step instructions and Canva ready templates' }
      ],
      features: [
        { icon: 'Layers', title: '5000+ Digital Resources', description: 'Comprehensive library of templates, reels, and digital assets' },
        { icon: 'Film', title: 'Ready-to-Post Reels Bundle', description: 'High-engagement viral reels templates across hot niches' },
        { icon: 'BookOpen', title: 'Ebooks & Guides', description: 'In-depth ebooks on marketing, finance, and online growth' },
        { icon: 'Sparkles', title: 'AI Prompts Vault', description: '1500+ tested ChatGPT and Midjourney prompts' },
        { icon: 'Briefcase', title: 'Business & Agency Kit', description: 'Client contracts, invoice templates, and Notion workspaces' }
      ],
      included: [
        '5000+ Main Product Bundle & Resources',
        'Bonus #1: Instagram Growth Mastery Course',
        'Bonus #2: 90+ Powerful Set of Hashtags',
        'Bonus #3: 75+ Instagram Highlight Covers',
        'Bonus #4: Ultimate Canva Keyword Guide',
        'Bonus #5: Digital Product Selling Course',
        'Resell Rights Certificate & Marketing Kit',
        'Lifetime Cloud Access & Free Updates'
      ],
      bonuses: [
        { title: 'Instagram Growth Mastery Course', subtitle: 'Bonus #1', description: 'Complete step-by-step masterclass to grow your Instagram audience rapidly.', value_amount: 1999, badge: 'FREE' },
        { title: '90+ Powerful Set of Hashtags', subtitle: 'Bonus #2', description: 'Curated high-performing hashtag sets for viral reach and engagement.', value_amount: 499, badge: 'FREE' },
        { title: '75+ Instagram Highlight Covers', subtitle: 'Bonus #3', description: 'Aesthetic, editable Canva highlight covers for a professional profile.', value_amount: 799, badge: 'FREE' },
        { title: 'Ultimate Canva Keyword Guide', subtitle: 'Bonus #4', description: 'Secret keyword search terms to uncover hidden elements in Canva.', value_amount: 699, badge: 'FREE' },
        { title: 'Digital Product Selling Course', subtitle: 'Bonus #5', description: 'Blueprint to packaging, marketing, and selling digital downloads online.', value_amount: 2499, badge: 'FREE' }
      ],
      compatibility: [
        { platform: 'Canva', version: 'Free & Pro' },
        { platform: 'Mobile & Desktop', version: 'Android, iOS, Windows, Mac' },
        { platform: 'Instagram & Socials', version: 'Reels, Posts, Stories' }
      ],
      faqs: [
        { question: 'What do I receive immediately after paying ₹29?', answer: 'You receive instant access to download the full 5000+ bundle, all 5 bonus courses, and cloud folder links right on your order confirmation screen and customer dashboard.' },
        { question: 'Can I resell these products and keep the profit?', answer: 'Yes! Resell rights are included FREE with this Festive Offer. You can sell the digital assets and retain 100% of the proceeds.' },
        { question: 'Are there any hidden monthly charges?', answer: 'None. This is a 100% genuine one-time payment of ₹29 with lifetime access.' },
        { question: 'Do I need paid software to edit the templates?', answer: 'No. The templates work seamlessly with the 100% free version of Canva.' }
      ],
      testimonials: [
        { name: 'Rohit Sharma', designation: 'Content Creator', rating: 5, text: 'Unbelievable value for just ₹29! The Instagram Growth course and Canva templates alone are worth thousands.' },
        { name: 'Priya Patel', designation: 'Freelancer', rating: 5, text: 'The resell rights are a game changer. I set up my shop on weekend and already made my first sale.' }
      ]
    },

    // PRODUCT #2: 10,000 n8n Automation Workflows
    {
      title: '10,000 n8n Automation Workflows Mega Pack',
      slug: '10000-n8n-automation-workflows',
      sku: 'PRD-N8N-10K',
      category_id: catMap['ai-automation'],
      product_type: 'Automation / Workflow Bundle',
      author: 'AutomateScale Labs',
      regular_price: 2999,
      sale_price: 299,
      badge: 'AUTOMATION MEGA PACK',
      eyebrow: 'AUTOMATION MEGA PACK ⚡',
      hero_copy: '10,000 n8n AUTOMATION WORKFLOWS',
      subtitle: '10,000 n8n Workflows — Yours for the Price of a Coffee',
      cta_text: 'GET 10,000 WORKFLOWS',
      secondary_cta_text: 'EXPLORE WORKFLOW CATEGORIES',
      theme_style: 'tech',
      access_type: 'download',
      is_featured: 1,
      is_trending: 1,
      is_bestseller: 1,
      rating_avg: 4.94,
      review_count: 184,
      short_description: 'Ready-to-use production n8n workflows for AI agents, webhooks, CRM sync, marketing, and business automation.',
      full_description: `## 10,000 n8n Automation Workflows — Yours for the Price of a Coffee\n\nScale your operations, automate repetitive tasks, and build complex AI agent systems in minutes instead of months.\n\n### ⚡ Built for Builders, Agencies & Founders:\n- **Plug & Play JSON Files**: Import directly into your cloud or self-hosted n8n instance.\n- **Covers 80+ Integrations**: OpenAI, Claude, Telegram, WhatsApp, Stripe, Google Sheets, Airtable, Notion, Slack, and HubSpot.\n- **Lifetime Updates**: New workflows added monthly with zero recurring fees.`,
      media_url: '/uploads/products/n8n-workflows-cover.svg',
      file_name: '10000-n8n-workflows-mega-pack.zip',
      file_size: 145000000,
      benefits: [
        { icon: 'Zap', title: '10,000+ Battle-Tested Workflows', description: 'Production-ready JSON blueprints for every business process' },
        { icon: 'Clock', title: 'Save 100s of Engineering Hours', description: 'Skip writing manual glue code and complex webhook listeners' },
        { icon: 'Infinity', title: 'Lifetime Access & Updates', description: 'Download latest iterations and new workflow additions free' }
      ],
      features: [
        { icon: 'Cpu', title: 'AI Agent & LLM Pipelines', description: 'Autonomous multi-step reasoning, RAG routers, and summarizers' },
        { icon: 'Database', title: 'CRM & Database Syncs', description: 'Seamless real-time pipelines between PostgreSQL, Airtable, and HubSpot' },
        { icon: 'Share2', title: 'Social & Marketing Automations', description: 'Auto-posters, lead scrapers, and automated email sequences' }
      ],
      included: [
        'Complete 10,000+ n8n Workflows Collection (JSON)',
        'Node Configuration Guides & API Credential Blueprints',
        'AI Agent Tooling & LangChain Nodes Collection',
        'Troubleshooting & Webhook Debugging Cheat Sheet'
      ],
      bonuses: [
        { title: 'Self-Hosted n8n Docker Setup Guide', subtitle: 'Tech Bonus #1', description: 'One-click Docker Compose configuration with SSL for $5/mo VPS.', value_amount: 1499, badge: 'FREE' },
        { title: '50+ Custom Webhook Secret Templates', subtitle: 'Tech Bonus #2', description: 'HMAC signature verification scripts for security.', value_amount: 999, badge: 'FREE' }
      ],
      compatibility: [
        { platform: 'n8n Cloud', version: 'Latest' },
        { platform: 'n8n Self-Hosted', version: 'Docker / npm' },
        { platform: 'Node.js', version: '18+' }
      ],
      faqs: [
        { question: 'How do I import these workflows into n8n?', answer: 'In n8n, simply click "Import from File" or paste the workflow JSON. All nodes, connections, and logic populate automatically.' },
        { question: 'Can I use this for client consulting and agency projects?', answer: 'Yes, commercial client implementation is fully allowed.' }
      ],
      testimonials: [
        { name: 'David Chen', designation: 'AI Automation Consultant', rating: 5, text: 'This mega pack paid for itself in the first 10 minutes of my client project. Essential toolkit.' }
      ]
    },

    // PRODUCT #3: World's Biggest Video Editing Bundle!
    {
      title: 'World\'s Biggest Video Editing Bundle!',
      slug: 'worlds-biggest-video-editing-bundle',
      sku: 'PRD-VIDEO-BIG',
      category_id: catMap['video-design'],
      product_type: 'Video Editing Bundle',
      author: 'CineVisuals Pro',
      regular_price: 3999,
      sale_price: 399,
      badge: 'BIGGEST VIDEO EDITING BUNDLE',
      eyebrow: 'CREATOR ESSENTIALS 🎬',
      hero_copy: 'THE WORLD\'S BIGGEST VIDEO EDITING BUNDLE',
      subtitle: '2000+ FX Presets • 1000+ Sound FX • 500+ LUTs • Stock Video & Titles',
      cta_text: 'GET THE VIDEO EDITING BUNDLE',
      secondary_cta_text: 'VIEW PRESETS & ASSETS',
      theme_style: 'cinematic',
      access_type: 'download',
      is_featured: 1,
      is_trending: 1,
      is_bestseller: 1,
      rating_avg: 4.98,
      review_count: 421,
      short_description: 'Massive collection of video editing presets, sound FX, cinematic LUTs, motion graphics, and animated titles for creators.',
      full_description: `## THE WORLD'S BIGGEST VIDEO EDITING BUNDLE\n\nElevate your YouTube videos, Reels, commercial projects, and client edits with cinema-grade assets.\n\n### 🎬 Comprehensive Asset Collection:\n- **2000+ FX Presets**: Glitch, zoom, seamless transitions, light leaks, and camera shakes.\n- **1000+ High-Definition Sound FX**: Cinematic risers, whooshes, impacts, and ambient tracks.\n- **500+ Cinematic LUTs**: Film emulation, teal & orange, vintage mood, and vlog color grades.\n- **Motion Graphics & Titles**: 4K animated titles, YouTube essentials pack, wedding packs, and kinetic typography.`,
      media_url: '/uploads/products/video-editing-cover.svg',
      file_name: 'worlds-biggest-video-editing-assets.zip',
      file_size: 980000000,
      benefits: [
        { icon: 'Film', title: '2000+ FX & Transitions', description: 'Drag-and-drop presets for Premiere, DaVinci, and FCP' },
        { icon: 'Volume2', title: '1000+ Lossless Sound Effects', description: 'High-definition audio designed for impact and pacing' },
        { icon: 'Sparkles', title: '500+ Cinematic LUTs', description: 'Transform flat camera footage into rich film tones' }
      ],
      features: [
        { icon: 'Video', title: '4K Stock Footage & Overlays', description: 'Dust, particles, lens flares, and cinematic bokeh' },
        { icon: 'Type', title: 'Animated Titles & Lower Thirds', description: 'Customizable typography for professional branding' },
        { icon: 'Heart', title: 'Wedding & Event Suite', description: 'Elegant romantic titles, frames, and transition effects' }
      ],
      included: [
        '2000+ Video FX Presets (Premiere Pro, DaVinci, FCPX)',
        '1000+ Sound FX (WAV & MP3 Lossless)',
        '500+ Cinematic LUTs (.cube files for all editors)',
        '500+ Stock Videos, Bokeh & Particle Overlays',
        'Wedding Invitation & Title Pack',
        'Mega Kinetic Typography & Animation Pack'
      ],
      bonuses: [
        { title: 'YouTube Thumbnail Click-Through Masterclass', subtitle: 'Creator Bonus #1', description: 'Formula for creating 10%+ CTR video thumbnails.', value_amount: 1499, badge: 'FREE' },
        { title: 'Royalty-Free Background Music Vault', subtitle: 'Creator Bonus #2', description: 'Monetization-safe background music tracks for content creators.', value_amount: 1999, badge: 'FREE' }
      ],
      compatibility: [
        { platform: 'Adobe Premiere Pro', version: 'CC 2020+' },
        { platform: 'DaVinci Resolve', version: '17 / 18 / 19' },
        { platform: 'Final Cut Pro', version: 'X' },
        { platform: 'CapCut & Mobile', version: 'All versions' }
      ],
      faqs: [
        { question: 'Will these LUTs and presets work on CapCut or mobile?', answer: 'Yes! The LUTs are standard .cube files and sound effects are universal WAV/MP3 files that work across desktop and mobile editors.' },
        { question: 'Are the assets royalty-free for client videos and YouTube monetization?', answer: 'Yes, 100% royalty-free for personal and commercial client videos.' }
      ],
      testimonials: [
        { name: 'Vikram Sengupta', designation: 'YouTuber (450K Subs)', rating: 5, text: 'The sound effects and cinematic LUTs immediately improved the production quality of my long-form videos.' }
      ]
    },

    // PRODUCT #4: 5000+ High Quality SEO Backlinks Package
    {
      title: '5000+ High Quality SEO Backlinks Package',
      slug: '5000-high-quality-seo-backlinks-package',
      sku: 'PRD-SEO-5000',
      category_id: catMap['seo-marketing'],
      product_type: 'SEO Resource',
      author: 'RankMaster Agency',
      regular_price: 999,
      sale_price: 49,
      badge: 'SEO BACKLINKS PACK',
      eyebrow: 'SEARCH ENGINE DOMINANCE 📈',
      hero_copy: '5000+ HIGH QUALITY SEO BACKLINKS',
      subtitle: 'High DA / Do Follow Backlinks Resource for SEO',
      cta_text: 'GET THE BACKLINKS PACK',
      secondary_cta_text: 'VIEW DIRECTORY SAMPLES',
      theme_style: 'seo',
      access_type: 'google_drive',
      external_access_url: 'https://docs.google.com/spreadsheets/d/1_5000_SEO_BACKLINKS_MASTER_DIRECTORY/edit?usp=sharing',
      is_featured: 1,
      is_trending: 1,
      is_bestseller: 1,
      rating_avg: 4.88,
      review_count: 156,
      short_description: 'Curated directory of High DA 50-90+ Do-Follow backlink sites across profile creation, web 2.0, business listings, and edu resources.',
      full_description: `## 5000+ HIGH QUALITY SEO BACKLINKS RESOURCE\n\nRank your websites, client projects, and niche affiliate blogs on Google Page 1 with verified high-authority link sources.\n\n### 📈 What You Get Inside the Google Sheet Directory:\n- **High DA 50-90+ Sites**: Filtered by Domain Authority, Page Authority, and spam scores.\n- **Do-Follow Profile Backlinks (1500+)**: Fast indexing profiles on trusted authority domains.\n- **Web 2.0 & Content Sites (1000+)**: Medium, Substack, WordPress, and article directories.\n- **Business & Local Citation Directories (1500+)**: Perfect for local SEO and Google Maps ranking.\n- **Edu & Gov Resource Links (500+)**: Rare high-trust authority signals.`,
      media_url: '/uploads/products/seo-backlinks-cover.svg',
      file_name: '5000-seo-backlinks-directory.zip',
      file_size: 15000000,
      benefits: [
        { icon: 'TrendingUp', title: 'High DA (50 to 90+)', description: 'Verified sites with high domain trust to pass powerful link juice' },
        { icon: 'FileSpreadsheet', title: 'Live Google Sheet Access', description: 'Direct searchable spreadsheet with submission steps and category filters' },
        { icon: 'ShieldCheck', title: 'Safe & White-Hat Friendly', description: 'Manual profile and citation opportunities that avoid Google penalties' }
      ],
      features: [
        { icon: 'CheckSquare', title: 'Categorized Directory', description: 'Profiles, Web 2.0, Local citations, and Edu resources separated' },
        { icon: 'Clock', title: 'Fast Indexing Guide', description: 'Includes proven tips to get backlinks indexed by Google in 48 hours' },
        { icon: 'Users', title: 'Agency Multi-Project Use', description: 'Use across unlimited client websites and affiliate blogs' }
      ],
      included: [
        '5000+ High DA SEO Backlinks Master Google Sheet',
        'Submission Guidelines & Profile Setup Blueprint',
        'Anchor Text Optimization Strategy Document',
        'Backlink Indexing Accelerator Guide'
      ],
      bonuses: [
        { title: 'On-Page SEO Checklist (75 Points)', subtitle: 'SEO Bonus #1', description: 'Audit checklist to fix technical issues before link building.', value_amount: 999, badge: 'FREE' },
        { title: 'Keyword Research Golden Ratio Guide', subtitle: 'SEO Bonus #2', description: 'Methodology to find zero-competition keywords.', value_amount: 1299, badge: 'FREE' }
      ],
      compatibility: [
        { platform: 'Google Sheets', version: 'Cloud Web & App' },
        { platform: 'Microsoft Excel', version: 'XLSX & CSV' },
        { platform: 'Browsers', version: 'Chrome, Safari, Firefox' }
      ],
      faqs: [
        { question: 'How do I access the backlinks list?', answer: 'Immediately after checkout, you get a direct link to open and copy the master Google Sheet, plus a downloadable Excel/CSV backup.' },
        { question: 'Are these safe from Google algorithm updates?', answer: 'Yes. These are natural business citation, profile, and community platforms designed for organic authority building.' }
      ],
      testimonials: [
        { name: 'Amit Verma', designation: 'Digital Agency Owner', rating: 5, text: 'Saved my outreach team dozens of hours. The sheet is properly organized with high DA metrics.' }
      ]
    },

    // PRODUCT #5: 2000+ USA & India Cartoon Stories Bundle
    {
      title: '2000+ USA & India Cartoon Stories Bundle + FREE Bonus Pack',
      slug: '2000-usa-india-cartoon-stories-bundle',
      sku: 'PRD-CARTOON-2K',
      category_id: catMap['kids-education'],
      product_type: 'Video Bundle',
      author: 'AnimateKids Studio',
      regular_price: 1499,
      sale_price: 99,
      badge: '2000+ VIDEO BUNDLE',
      eyebrow: 'VIRAL KIDS ANIMATION 🧸',
      hero_copy: '2000+ USA & INDIA CARTOON STORIES BUNDLE',
      subtitle: 'Ready-to-upload HD animated moral stories, fairy tales, and educational cartoons',
      cta_text: 'GET THE CARTOON VIDEO BUNDLE',
      secondary_cta_text: 'VIEW CARTOON EPISODES',
      theme_style: 'playful',
      access_type: 'download',
      is_featured: 1,
      is_trending: 1,
      is_bestseller: 1,
      rating_avg: 4.92,
      review_count: 278,
      short_description: '2000+ HD animated moral stories, fairy tales, and kids cartoon videos ready to upload for YouTube creators and educators.',
      full_description: `## 2000+ USA & India Cartoon Stories Video Bundle\n\nTap into the highest-paying and most-watched niche on YouTube and social platforms: **Kids Entertainment & Education**.\n\n### 🧸 What is Included:\n- **2000+ HD Animated Videos**: Complete moral stories, traditional Panchatantra tales, folk tales, and American bedtime classics.\n- **Dual Language Options**: Engaging English & Hindi voiceovers with lively background scores.\n- **Ready for YouTube**: 100% finished episodes ready for uploading to your channel, Facebook, or educational platform.\n- **Instant Cloud Download**: Organized by story length and character themes.`,
      media_url: '/uploads/products/cartoon-stories-cover.svg',
      file_name: '2000-cartoon-stories-hd-collection.zip',
      file_size: 780000000,
      benefits: [
        { icon: 'Smile', title: '2000+ HD Animated Videos', description: 'Crystal-clear animation episodes with dialogue and sound' },
        { icon: 'Youtube', title: 'Ready to Monetize on YouTube', description: 'High watch-time content tailored for massive kids channel views' },
        { icon: 'Infinity', title: 'Lifetime Access & Instant Download', description: 'Download immediately with no bandwidth restrictions' }
      ],
      features: [
        { icon: 'Film', title: 'HD 1080p Quality', description: 'Rendered in crisp widescreen MP4 format' },
        { icon: 'BookOpen', title: 'Moral & Educational Stories', description: 'Values, animals, fairy tales, and preschool adventures' },
        { icon: 'Gift', title: 'FREE Bonus Sound Pack', description: 'Kids background music, laugh tracks, and cartoon sound FX' }
      ],
      included: [
        '2000+ Full HD Cartoon Video Episodes (MP4)',
        'English & Hindi Audio Tracks',
        'FREE Bonus Kids Sound FX & Musical Jingles Pack',
        'YouTube Thumbnail Templates for Kids Channels',
        'Commercial Monetization License'
      ],
      bonuses: [
        { title: 'Kids Channel SEO & Tagging Master Blueprint', subtitle: 'Bonus #1', description: 'How to rank kids videos and get suggested by the algorithm.', value_amount: 1499, badge: 'FREE' },
        { title: '500+ Cartoon Character Sound FX Library', subtitle: 'Bonus #2', description: 'Boings, slips, funny whistles, and cartoon laughs.', value_amount: 999, badge: 'FREE' }
      ],
      compatibility: [
        { platform: 'YouTube & Socials', version: 'Ready to Upload' },
        { platform: 'Video Players', version: 'VLC, QuickTime, Windows Media' },
        { platform: 'Video Editors', version: 'Premiere, CapCut, DaVinci' }
      ],
      faqs: [
        { question: 'Can I monetize these cartoon videos on my YouTube channel?', answer: 'Yes! The bundle includes commercial publishing rights so you can build and monetize your kids channels.' },
        { question: 'What resolution are the cartoon files in?', answer: 'All 2000+ episodes are provided in High-Definition 1080p MP4 format.' }
      ],
      testimonials: [
        { name: 'Kavita Das', designation: 'Kids Channel Creator (120K Subs)', rating: 5, text: 'Started my channel with these stories and gained 50,000 subscribers in 2 months. Kids love the animations!' }
      ]
    }
  ];

  // 3. Seed Each Product
  for (const item of productsToSeed) {
    let existing = db.get('SELECT id FROM products WHERE slug = ?', [item.slug]);
    let productId;

    if (existing) {
      productId = existing.id;
      db.run(`
        UPDATE products SET
          title = ?, sku = ?, category_id = ?, short_description = ?, full_description = ?,
          product_type = ?, author = ?, regular_price = ?, sale_price = ?, badge = ?,
          status = 'published', eyebrow = ?, subtitle = ?, cta_text = ?, secondary_cta_text = ?,
          theme_style = ?, access_type = ?, external_access_url = ?, is_featured = ?,
          is_trending = ?, is_bestseller = ?, rating_avg = ?, review_count = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [
        item.title, item.sku, item.category_id, item.short_description, item.full_description,
        item.product_type, item.author, item.regular_price, item.sale_price, item.badge,
        item.eyebrow, item.subtitle, item.cta_text, item.secondary_cta_text,
        item.theme_style, item.access_type, item.external_access_url || null, item.is_featured,
        item.is_trending, item.is_bestseller, item.rating_avg, item.review_count, productId
      ]);
      console.log(`Updated product: ${item.title}`);
    } else {
      const res = db.run(`
        INSERT INTO products (
          title, slug, sku, category_id, short_description, full_description,
          product_type, author, regular_price, sale_price, badge, status,
          eyebrow, subtitle, cta_text, secondary_cta_text, theme_style,
          access_type, external_access_url, is_featured, is_trending, is_bestseller,
          rating_avg, review_count
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        item.title, item.slug, item.sku, item.category_id, item.short_description, item.full_description,
        item.product_type, item.author, item.regular_price, item.sale_price, item.badge,
        item.eyebrow, item.subtitle, item.cta_text, item.secondary_cta_text, item.theme_style,
        item.access_type, item.external_access_url || null, item.is_featured, item.is_trending, item.is_bestseller,
        item.rating_avg, item.review_count
      ]);
      productId = res.lastInsertRowid;
      console.log(`Created product: ${item.title} (ID: ${productId})`);
    }

    // Media
    db.run('DELETE FROM product_media WHERE product_id = ?', [productId]);
    db.run(
      'INSERT INTO product_media (product_id, media_url, media_type, is_thumbnail, sort_order) VALUES (?, ?, "image", 1, 0)',
      [productId, item.media_url]
    );

    // Licenses
    db.run('DELETE FROM product_licenses WHERE product_id = ?', [productId]);
    const licensePrice = item.sale_price || item.regular_price;
    const licenseText = item.slug === 'festive-sale-5000-all-in-one'
      ? 'Get Resell Rights FREE • Resell karo & keep 100% of your profits'
      : 'Full commercial license for personal & client projects';

    db.run(`
      INSERT INTO product_licenses (product_id, license_name, price, description, permissions, restrictions)
      VALUES (?, 'Commercial License', ?, ?, 'Unlimited commercial use, Lifetime updates, 100% profit retention', 'Cannot claim raw authorship')
    `, [productId, licensePrice, licenseText]);

    // Features
    db.run('DELETE FROM product_features WHERE product_id = ?', [productId]);
    item.features.forEach((feat, idx) => {
      db.run(
        'INSERT INTO product_features (product_id, title, description, icon, sort_order) VALUES (?, ?, ?, ?, ?)',
        [productId, feat.title, feat.description, feat.icon, idx]
      );
    });

    // Bonuses
    db.run('DELETE FROM product_bonuses WHERE product_id = ?', [productId]);
    if (item.bonuses) {
      item.bonuses.forEach((b, idx) => {
        db.run(`
          INSERT INTO product_bonuses (product_id, title, subtitle, description, value_amount, badge, sort_order, is_visible)
          VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        `, [productId, b.title, b.subtitle, b.description, b.value_amount, b.badge, idx]);
      });
    }

    // Compatibility
    db.run('DELETE FROM product_compatibility WHERE product_id = ?', [productId]);
    item.compatibility.forEach(c => {
      db.run(
        'INSERT INTO product_compatibility (product_id, platform, version) VALUES (?, ?, ?)',
        [productId, c.platform, c.version]
      );
    });

    // FAQs
    db.run('DELETE FROM product_faqs WHERE product_id = ?', [productId]);
    item.faqs.forEach((faq, idx) => {
      db.run(
        'INSERT INTO product_faqs (product_id, question, answer, sort_order) VALUES (?, ?, ?, ?)',
        [productId, faq.question, faq.answer, idx]
      );
    });

    // Testimonials
    db.run('DELETE FROM product_testimonials WHERE product_id = ?', [productId]);
    if (item.testimonials) {
      item.testimonials.forEach((t, idx) => {
        db.run(`
          INSERT INTO product_testimonials (product_id, name, designation, rating, text, is_verified, sort_order, is_visible)
          VALUES (?, ?, ?, ?, ?, 1, ?, 1)
        `, [productId, t.name, t.designation, t.rating, t.text, idx]);
      });
    }

    // Digital Files & Access Items
    db.run('DELETE FROM product_files WHERE product_id = ?', [productId]);
    const fileRes = db.run(`
      INSERT INTO product_files (product_id, file_name, file_path, file_size, version, is_active, download_limit)
      VALUES (?, ?, ?, ?, '1.0.0', 1, 10)
    `, [productId, item.file_name, path.join(protectedDir, item.file_name), item.file_size]);
    const fileId = fileRes.lastInsertRowid;

    db.run('DELETE FROM product_access_items WHERE product_id = ?', [productId]);
    db.run(`
      INSERT INTO product_access_items (product_id, title, access_type, url, product_file_id, instructions, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `, [
      productId,
      item.access_type === 'google_drive' ? 'Master Google Sheet Access' : 'Full Deliverables Archive (ZIP)',
      item.access_type,
      item.external_access_url || null,
      fileId,
      'Click below to access your digital package.'
    ]);

    // Product Sections (Order configured for maximum sales conversion)
    db.run('DELETE FROM product_sections WHERE product_id = ?', [productId]);
    const defaultSections = [
      { type: 'hero', title: 'Hero Banner', is_visible: 1 },
      { type: 'trust_badges', title: 'Trust Guarantee Badges', is_visible: 1 },
      { type: 'benefits', title: 'Core Value Benefits', is_visible: 1, content: JSON.stringify(item.benefits) },
      { type: 'included', title: 'What\'s Included Checklist', is_visible: 1, content: JSON.stringify(item.included) },
      { type: 'features', title: 'Product Highlights & Features', is_visible: 1 },
      { type: 'gallery', title: 'Product Previews & Gallery', is_visible: 1 },
      { type: 'bonuses', title: 'Surprise Bonus Stack', is_visible: item.bonuses && item.bonuses.length > 0 ? 1 : 0 },
      { type: 'compatibility', title: 'Software & Platform Compatibility', is_visible: 1 },
      { type: 'license', title: 'Commercial & Resell License Terms', is_visible: 1 },
      { type: 'pricing', title: 'Limited Time Offer Purchase Box', is_visible: 1 },
      { type: 'testimonials', title: 'Customer Testimonials', is_visible: item.testimonials ? 1 : 0 },
      { type: 'faq', title: 'Frequently Asked Questions', is_visible: 1 },
      { type: 'guarantee', title: 'Purchase Guarantee', is_visible: 1 },
      { type: 'final_cta', title: 'Final Action Callout', is_visible: 1 }
    ];

    defaultSections.forEach((sec, idx) => {
      db.run(`
        INSERT INTO product_sections (product_id, section_type, title, content, sort_order, is_visible)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [productId, sec.type, sec.title, sec.content || null, idx, sec.is_visible]);
    });
  }

  console.log('✅ Successfully seeded all 5 core digital products with sections & bonuses!');
}

if (require.main === module) {
  seedFiveProducts().then(() => process.exit(0)).catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
}

module.exports = { seedFiveProducts };
