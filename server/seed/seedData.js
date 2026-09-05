const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { getDatabase } = require('../config/database');

async function seed() {
  console.log('--- Starting Database Seeding ---');
  const db = await getDatabase();

  const protectedDir = path.join(__dirname, '..', 'storage', 'protected');
  if (!fs.existsSync(protectedDir)) fs.mkdirSync(protectedDir, { recursive: true });

  // Clean existing tables
  db.exec(`
    DELETE FROM banners;
    DELETE FROM site_settings;
    DELETE FROM admin_activity_logs;
    DELETE FROM support_messages;
    DELETE FROM support_tickets;
    DELETE FROM coupon_usage;
    DELETE FROM coupons;
    DELETE FROM wishlists;
    DELETE FROM reviews;
    DELETE FROM downloads;
    DELETE FROM order_items;
    DELETE FROM orders;
    DELETE FROM product_files;
    DELETE FROM product_faqs;
    DELETE FROM product_compatibility;
    DELETE FROM product_features;
    DELETE FROM product_licenses;
    DELETE FROM product_media;
    DELETE FROM products;
    DELETE FROM categories;
    DELETE FROM users;
  `);

  // 1. Users
  const adminPasswordHash = bcrypt.hashSync('AdminPassword123!', 10);
  const customerPasswordHash = bcrypt.hashSync('CustomerPassword123!', 10);

  const adminResult = db.run(
    `INSERT INTO users (email, password_hash, full_name, role, status)
     VALUES (?, ?, ?, ?, ?)`,
    ['admin@digitalstore.com', adminPasswordHash, 'System Administrator', 'super_admin', 'active']
  );
  const adminId = adminResult.lastInsertRowid;

  const customerResult = db.run(
    `INSERT INTO users (email, password_hash, full_name, role, status)
     VALUES (?, ?, ?, ?, ?)`,
    ['alex@example.com', customerPasswordHash, 'Alex Morgan', 'customer', 'active']
  );
  const customerId = customerResult.lastInsertRowid;

  console.log('Created Users: Admin & Customer');

  // 2. Categories
  const categoriesData = [
    {
      name: 'Software & SaaS',
      slug: 'software-saas',
      description: 'Production-ready web apps, microservices, and full-stack SaaS starters.',
      icon: 'Cpu',
      image_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
      sort_order: 1
    },
    {
      name: 'Website Templates',
      slug: 'website-templates',
      description: 'Blazing-fast responsive templates built with Next.js, React, and modern HTML/CSS.',
      icon: 'Layout',
      image_url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
      sort_order: 2
    },
    {
      name: 'UI Kits & Design Systems',
      slug: 'ui-kits-design-systems',
      description: 'Figma components, design tokens, dashboards, and production design libraries.',
      icon: 'Palette',
      image_url: 'https://images.unsplash.com/photo-1581291518655-9523c932edcf?auto=format&fit=crop&w=800&q=80',
      sort_order: 3
    },
    {
      name: 'Mobile Applications',
      slug: 'mobile-applications',
      description: 'Cross-platform Flutter & React Native source code for iOS and Android.',
      icon: 'Smartphone',
      image_url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80',
      sort_order: 4
    },
    {
      name: 'AI Prompts & Tools',
      slug: 'ai-prompts-tools',
      description: 'Battle-tested system prompts, automation workflows, and AI integration packs.',
      icon: 'Sparkles',
      image_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80',
      sort_order: 5
    },
    {
      name: 'Business & Notion Systems',
      slug: 'business-notion-systems',
      description: 'Operating systems, client portals, financial spreadsheets, and growth kits.',
      icon: 'TrendingUp',
      image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
      sort_order: 6
    }
  ];

  const categoryMap = {};
  for (const cat of categoriesData) {
    const res = db.run(
      `INSERT INTO categories (name, slug, description, icon, image_url, sort_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [cat.name, cat.slug, cat.description, cat.icon, cat.image_url, cat.sort_order]
    );
    categoryMap[cat.slug] = res.lastInsertRowid;
  }

  // 3. Products
  const products = [
    {
      title: 'Apex SaaS Dashboard & Analytics UI Kit',
      slug: 'apex-saas-dashboard-analytics-kit',
      sku: 'APX-SAAS-01',
      category_id: categoryMap['ui-kits-design-systems'],
      short_description: 'Comprehensive React & Figma design system with 65+ dark-mode dashboard screens, modular charts, and complete auth layouts.',
      full_description: `Apex is an ultra-premium dashboard UI kit built meticulously for modern SaaS applications. It features atomic Figma components, production React components, responsive mobile views, and seamless dark-mode design tokens.

### Key Highlights:
- **65+ Ready-to-use Screens**: Overview, Revenue Metrics, User Management, Billing & Subscription, Security Logs, and Settings.
- **Tailored Design System**: Includes typography scales, elevation shadows, 240+ hand-crafted SVG icons, and vibrant data visualization states.
- **Production-Ready Code**: Written in clean React 18 with zero unnecessary heavy dependencies.

### What is in the download?
You receive the complete .fig source file with organized auto-layout frames, interactive components, token definitions, and a React project boilerplate with working mock charts and responsive navigation.`,
      product_type: 'UI Kit',
      author: 'Antigravity Studio',
      regular_price: 3999,
      sale_price: 1999,
      badge: 'BESTSELLER',
      rating_avg: 4.9,
      review_count: 128,
      sales_count: 540,
      demo_url: 'https://preview.digitalstore.com/apex-saas',
      video_url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
      media: [
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1200&q=85'
      ],
      licenses: [
        { name: 'Personal License', price: 1999, desc: 'For single personal projects or learning purposes. 1 developer seat.', permissions: 'Use in 1 personal project, Lifetime updates, Community support', restrictions: 'No commercial client work, No reselling' },
        { name: 'Commercial License', price: 3999, desc: 'For commercial client projects, client SaaS apps, or company tools. 5 developer seats.', permissions: 'Unlimited commercial projects, Lifetime updates, Priority email support, Full source rights', restrictions: 'Cannot resell as a standalone template or UI kit' },
        { name: 'Extended / Agency', price: 7999, desc: 'For agencies and unlimited teams. Unlimited developer seats and redistributable SaaS integrations.', permissions: 'Unlimited client websites, SaaS end-products for paying customers, Direct Discord support, Dedicated architecture review', restrictions: 'Cannot redistribute raw Figma/code assets freely' }
      ],
      features: [
        { title: '65+ Dashboard Layouts', desc: 'Pre-built screens for analytics, CRM, billing, and team settings.', icon: 'Layout' },
        { title: 'Figma Auto-Layout 5.0', desc: 'Fully responsive autolayout components with nested variants.', icon: 'CheckCircle' },
        { title: 'Vibrant Dark Mode Theme', desc: 'High-contrast accessible dark palette with glassmorphic accents.', icon: 'Moon' },
        { title: 'Interactive Chart Components', desc: 'Ready-to-use revenue graphs, user funnels, and retention charts.', icon: 'BarChart3' },
        { title: 'Clean Component Architecture', desc: 'Reusable modular React components with zero bloat.', icon: 'ShieldCheck' }
      ],
      compatibility: [
        { platform: 'Figma', version: '2025+' },
        { platform: 'React', version: '18 / 19' },
        { platform: 'Modern Browsers', version: 'Chrome, Safari, Edge, Firefox' },
        { platform: 'Operating System', version: 'macOS, Windows, Linux' }
      ],
      faqs: [
        { question: 'Do I get free lifetime updates?', answer: 'Yes! All purchasers receive lifetime access to future updates, new screens, and maintenance fixes.' },
        { question: 'Is the React source code included?', answer: 'Yes, both the Figma source design file and the React boilerplate project are included in the downloadable bundle.' },
        { question: 'Can I use this for a paying SaaS product?', answer: 'Yes! With the Commercial or Extended license you can build and launch commercial apps for paying users.' },
        { question: 'How do I download updates after purchasing?', answer: 'Simply log into your account dashboard, navigate to "My Downloads", and click "Download Update".' }
      ],
      filename: 'apex-saas-dashboard-v2.1.0.zip',
      filesize: 48500000,
      version: '2.1.0',
      changelog: 'Added 12 new billing and invoice screens, updated to React 19 compatibility, optimized chart render performance.'
    },
    {
      title: 'Nova Minimalist Portfolio Next.js Theme',
      slug: 'nova-minimalist-portfolio-nextjs',
      sku: 'NVA-NEXT-02',
      category_id: categoryMap['website-templates'],
      short_description: 'High-converting portfolio & agency template built with Next.js 15, React, Framer-like smooth micro-interactions, and MDX blog.',
      full_description: `Nova is an ultra-fast, minimalist portfolio and digital showcase template crafted for designers, developers, agency founders, and digital creators.

### Why Nova Stands Out:
- **100/100 Google Lighthouse Score**: Optimized for sub-second page loads, instant visual stability, and flawless SEO metadata.
- **Fluid Layouts & Micro-interactions**: Elegant hover states, interactive project showcases, and slick drawer navigation.
- **Built-in MDX Case Studies**: Write rich project breakdowns with Markdown, interactive code blocks, and embedded media.`,
      product_type: 'Website Template',
      author: 'PixelCraft',
      regular_price: 2499,
      sale_price: 1299,
      badge: 'TRENDING',
      rating_avg: 5.0,
      review_count: 84,
      sales_count: 320,
      demo_url: 'https://preview.digitalstore.com/nova-portfolio',
      media: [
        'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=85'
      ],
      licenses: [
        { name: 'Personal License', price: 1299, desc: 'For your personal portfolio website. Single domain.', permissions: 'Use on 1 live domain, 1 year updates, standard email support', restrictions: 'No client usage' },
        { name: 'Commercial License', price: 2999, desc: 'For agency use or client websites. Up to 5 client sites.', permissions: 'Use on up to 5 commercial websites, Lifetime updates, Priority support', restrictions: 'Cannot resell template' },
        { name: 'Extended / Unlimited', price: 5499, desc: 'Unlimited client installations and developer access.', permissions: 'Unlimited commercial sites, Whitelabel rights, Dedicated support', restrictions: 'No resale' }
      ],
      features: [
        { title: 'Next.js 15 App Router', desc: 'Engineered on the latest server components architecture.', icon: 'Cpu' },
        { title: 'Dynamic MDX Blog', desc: 'Effortlessly write case studies and articles with Markdown syntax.', icon: 'FileText' },
        { title: 'Interactive Project Slider', desc: 'Fluid drag-and-swipe visual gallery for case studies.', icon: 'Smartphone' },
        { title: 'Automated SEO & OpenGraph', desc: 'Pre-configured JSON-LD structured data and dynamic social preview cards.', icon: 'ShieldCheck' }
      ],
      compatibility: [
        { platform: 'Next.js', version: '14 / 15' },
        { platform: 'Node.js', version: 'v18+' },
        { platform: 'Deployments', version: 'Vercel, Netlify, Cloudflare, AWS' }
      ],
      faqs: [
        { question: 'Is this easy to customize for beginners?', answer: 'Yes! All configuration (your bio, project links, social handles) is handled in a single clean config.js file.' },
        { question: 'Can I host this on Vercel for free?', answer: 'Absolutely. Nova deploys on Vercel in 60 seconds with zero backend configuration needed.' }
      ],
      filename: 'nova-nextjs-portfolio-v1.4.0.zip',
      filesize: 14200000,
      version: '1.4.0',
      changelog: 'Added dark/light auto-detection, updated to Next.js 15 App Router, improved mobile menu accessibility.'
    },
    {
      title: 'FlowPay - Full-Stack Mobile Banking App (Flutter & Node)',
      slug: 'flowpay-fullstack-mobile-banking-app',
      sku: 'FLP-FLUT-03',
      category_id: categoryMap['mobile-applications'],
      short_description: 'Complete fintech & mobile banking solution with 40+ Flutter screens, biometrics, card management, and Node.js REST API.',
      full_description: `FlowPay is a production-grade fintech mobile application template. Built with Google Flutter for silky smooth 60fps performance across iOS and Android, accompanied by a clean Node.js Express backend with JWT security.

### Features Included:
- **Biometric Authentication**: Touch ID / Face ID authentication integration.
- **Virtual & Physical Cards**: Interactive 3D flip cards with freeze, CVV reveal, and spending limits.
- **Money Transfers**: Quick contact transfers, QR code pay, transaction history filtering, and PDF receipt generator.`,
      product_type: 'Mobile App',
      author: 'FintechForge',
      regular_price: 6999,
      sale_price: 3499,
      badge: 'TOP RATED',
      rating_avg: 4.95,
      review_count: 67,
      sales_count: 215,
      demo_url: 'https://preview.digitalstore.com/flowpay-flutter',
      media: [
        'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1200&q=85'
      ],
      licenses: [
        { name: 'Standard License', price: 3499, desc: 'For single fintech project or MVP startup launch.', permissions: 'Single app ID on App Store & Play Store, Source code included, 1 year updates', restrictions: 'No resale of source code' },
        { name: 'Extended Commercial', price: 8999, desc: 'For enterprise fintech apps and multi-client deployments.', permissions: 'Unlimited app IDs, Full backend database schemas, Priority technical onboarding', restrictions: 'Cannot resell on marketplaces' }
      ],
      features: [
        { title: 'Flutter 3.24+ & Dart 3', desc: 'Modern null-safe codebase optimized for 60fps animations.', icon: 'Smartphone' },
        { title: 'Node.js & SQLite/Postgres Backend', desc: 'Secure REST API with token authentication and audit logs.', icon: 'Cpu' },
        { title: 'Biometrics & Pin Security', desc: 'Native FaceID, TouchID, and custom secure PIN pad.', icon: 'Lock' },
        { title: 'Interactive Card Flip Animation', desc: '3D card flipping with dynamic CVV security toggle.', icon: 'CreditCard' }
      ],
      compatibility: [
        { platform: 'iOS', version: 'iOS 14.0+' },
        { platform: 'Android', version: 'Android 8.0+ (API 26)' },
        { platform: 'Flutter', version: '3.24+' }
      ],
      faqs: [
        { question: 'Does this come with the backend API?', answer: 'Yes, the download package includes both the complete Flutter mobile application and the Express API server with database schemas.' },
        { question: 'Is real payment gateway integration ready?', answer: 'Yes! The codebase contains pre-wired hooks for Stripe, Razorpay, and Plaid.' }
      ],
      filename: 'flowpay-flutter-fintech-v3.0.1.zip',
      filesize: 82300000,
      version: '3.0.1',
      changelog: 'Upgraded to Flutter 3.24, added biometric fallback for iOS 18, optimized QR scanner.'
    },
    {
      title: 'PromptMaster - 1,500+ Engineered AI Prompts for Marketers & Founders',
      slug: 'promptmaster-1500-ai-prompts-pack',
      sku: 'PRM-AI-04',
      category_id: categoryMap['ai-prompts-tools'],
      short_description: 'Precision-crafted prompt library for GPT-4o, Claude 3.5 Sonnet, and Midjourney to accelerate marketing, sales, copywriting, and coding.',
      full_description: `Stop getting generic AI responses. PromptMaster delivers 1,500+ battle-tested, structured prompt templates developed with few-shot prompting, persona anchoring, and chain-of-thought instructions.

### Included Domains:
- **High-Converting Copywriting**: Landing page hooks, VSL scripts, email sequences, and ad headlines that convert.
- **SaaS Growth & Marketing**: Product hunt launch checklists, cold outreach sequences, viral LinkedIn hooks, and SEO pillar content outlines.
- **Software Engineering & Debugging**: Architecture blueprints, code refactoring prompts, unit test generators, and security audits.
- **Midjourney & Flux Prompts**: 350+ photo-realistic product mockup prompts with aspect ratios, lighting parameters, and camera styles.`,
      product_type: 'AI Prompts & Resources',
      author: 'PromptWorks Labs',
      regular_price: 1999,
      sale_price: 799,
      badge: 'LIMITED DEAL',
      rating_avg: 4.88,
      review_count: 192,
      sales_count: 850,
      demo_url: 'https://preview.digitalstore.com/promptmaster',
      media: [
        'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=85'
      ],
      licenses: [
        { name: 'Individual Creator', price: 799, desc: 'Single user license for solo founders and freelancers.', permissions: 'Personal and commercial work, Lifetime prompt updates, Notion database access', restrictions: 'Cannot re-package or publish prompts publicly' },
        { name: 'Team / Agency License', price: 1999, desc: 'For agencies and marketing teams up to 15 members.', permissions: 'Share with full agency team, Notion workspace duplicate rights, Client deliverables', restrictions: 'No public redistribution' }
      ],
      features: [
        { title: '1,500+ Categorized Prompts', desc: 'Organized by Marketing, Sales, Code, Design, and Strategy.', icon: 'CheckCircle' },
        { title: 'Notion Database Included', desc: 'Filterable, searchable Notion template for one-click copying.', icon: 'Layout' },
        { title: 'Optimized for GPT-4o & Claude 3.5', desc: 'Tested with latest model reasoning capabilities.', icon: 'Sparkles' },
        { title: 'JSON & CSV Export Formats', desc: 'Easily import into your internal company workflows or custom tools.', icon: 'Download' }
      ],
      compatibility: [
        { platform: 'AI Models', version: 'ChatGPT, Claude 3.5, Gemini 1.5, DeepSeek, Midjourney' },
        { platform: 'Tools', version: 'Notion, Obsidian, Excel, Google Sheets' }
      ],
      faqs: [
        { question: 'How is this delivered?', answer: 'Instantly via a private download link containing both the complete PDF guide, JSON/CSV exports, and 1-click Notion template link.' },
        { question: 'Do you add new prompts?', answer: 'Yes! We release monthly prompt additions free of charge to all existing buyers.' }
      ],
      filename: 'promptmaster-ai-arsenal-v2.5.zip',
      filesize: 8900000,
      version: '2.5.0',
      changelog: 'Added 200 new Claude 3.5 Sonnet Artifact prompts and 100 Midjourney v6.1 aesthetic parameters.'
    },
    {
      title: 'CreatorOS - The Ultimate Notion Workspace for Solopreneurs',
      slug: 'creatoros-ultimate-notion-workspace',
      sku: 'NOT-COS-05',
      category_id: categoryMap['business-notion-systems'],
      short_description: 'All-in-one operating system to manage content, client projects, digital product sales, finances, and daily productivity in Notion.',
      full_description: `CreatorOS is the operating system built specifically for one-person businesses, freelancers, creators, and digital entrepreneurs.

### Systems Included:
1. **Content Engine**: Multi-platform content scheduler, script bank, sponsor tracker, and asset manager.
2. **Client Portal & CRM**: Lead pipeline, client workspaces, automated onboarding forms, and invoice tracker.
3. **Product Launch Dashboard**: Pre-launch checklists, affiliate management, sales metrics, and refund tracking.
4. **Finance Tracker**: Monthly recurring revenue, subscription audits, profit & loss summary, and tax reserve calculator.`,
      product_type: 'Notion Template',
      author: 'FocusCraft',
      regular_price: 2999,
      sale_price: 1499,
      badge: 'BEST VALUE',
      rating_avg: 4.92,
      review_count: 145,
      sales_count: 610,
      demo_url: 'https://preview.digitalstore.com/creatoros',
      media: [
        'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&w=1200&q=85'
      ],
      licenses: [
        { name: 'Solopreneur License', price: 1499, desc: 'For individual solopreneurs and freelancers.', permissions: 'Personal business operations, Lifetime updates, Video onboarding course', restrictions: 'Single user workspace' },
        { name: 'Company & Team License', price: 3499, desc: 'For agencies and teams up to 10 collaborators.', permissions: 'Unlimited team members, Team permissions setup guide, Custom formula support', restrictions: 'Cannot resell' }
      ],
      features: [
        { title: '12 Integrated Dashboards', desc: 'From daily tasks to quarterly revenue forecasts.', icon: 'Layout' },
        { title: 'Automated Formula 2.0', desc: 'Upgraded with Notion latest dynamic formulas and relations.', icon: 'CheckCircle' },
        { title: 'Video Walkthrough Included', desc: '45-minute step-by-step masterclass on setting up your OS.', icon: 'Video' },
        { title: 'Mobile-Optimized Views', desc: 'Dedicated quick-capture dashboard for your phone.', icon: 'Smartphone' }
      ],
      compatibility: [
        { platform: 'Notion', version: 'Free or Plus Plan' },
        { platform: 'Devices', version: 'iOS, Android, Web, macOS, Windows' }
      ],
      faqs: [
        { question: 'Do I need a paid Notion plan?', answer: 'No! CreatorOS functions 100% smoothly on the free Notion plan.' },
        { question: 'How do I install it?', answer: 'Click the duplicate link in your download instructions, and it clones into your workspace within seconds.' }
      ],
      filename: 'creatoros-notion-bundle-v3.2.zip',
      filesize: 6400000,
      version: '3.2.0',
      changelog: 'Added Formula 2.0 progress bars, updated client portal templates, added quarterly tax estimator.'
    },
    {
      title: 'Lumina 3D Glassmorphic Icon & Asset Pack',
      slug: 'lumina-3d-glassmorphic-icon-pack',
      sku: 'LUM-3D-06',
      category_id: categoryMap['ui-kits-design-systems'],
      short_description: '450+ ultra-high-resolution 3D glassmorphic icons in PNG, Blender source files, and Figma components for apps and landing pages.',
      full_description: `Bring your user interfaces and marketing landing pages to life with Lumina. Each icon is rendered in photorealistic 4K resolution with gorgeous frosted glass refractions, vibrant gradient glows, and transparent alpha channels.

### What is Included:
- **450+ 3D Assets**: Spanning Finance, Communication, Cloud, Security, Analytics, AI, Developer Tools, and E-Commerce.
- **Blender 4.0 Source Files**: Adjust materials, change lighting colors, modify camera angles, or animate with ease.
- **Figma Library**: Component library with premade color styles and thumbnail sizes.`,
      product_type: 'Design Assets',
      author: 'Studio Glow',
      regular_price: 3499,
      sale_price: 1799,
      badge: 'POPULAR',
      rating_avg: 4.96,
      review_count: 53,
      sales_count: 290,
      demo_url: 'https://preview.digitalstore.com/lumina-3d',
      media: [
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=85'
      ],
      licenses: [
        { name: 'Standard Creative', price: 1799, desc: 'For digital products, websites, and apps.', permissions: 'Unlimited commercial projects, PNG 4K assets, Figma library', restrictions: 'Blender source not included' },
        { name: 'Full Studio Edition', price: 3499, desc: 'Includes all original Blender 4.0 3D scene files and animation renders.', permissions: 'Full Blender source files, 4K alpha PNGs, 60fps loop animations, Commercial usage', restrictions: 'No raw file resale' }
      ],
      features: [
        { title: '450+ Unique Icons', desc: 'Handcrafted with intricate glass and neon lighting.', icon: 'CheckCircle' },
        { title: '4000 x 4000px Ultra HD', desc: 'Crystal-clear transparent PNGs ready for retina screens.', icon: 'Image' },
        { title: 'Blender 4.0 Scene Included', desc: 'Complete Cycles & Eevee materials with customizable lighting.', icon: 'Cpu' },
        { title: 'Figma Drag-and-Drop Library', desc: 'Search and place icons directly inside your design canvas.', icon: 'Palette' }
      ],
      compatibility: [
        { platform: 'Blender', version: '4.0+' },
        { platform: 'Figma', version: 'All versions' },
        { platform: 'Image Editors', version: 'Photoshop, Illustrator, Canva, Web' }
      ],
      faqs: [
        { question: 'Are the backgrounds transparent?', answer: 'Yes! Every icon is rendered on a transparent alpha background.' },
        { question: 'Can I change the colors in Blender?', answer: 'Yes, all materials use customizable shader nodes so you can tint them to your exact brand color palette in seconds.' }
      ],
      filename: 'lumina-3d-glass-icons-v2.0.zip',
      filesize: 145000000,
      version: '2.0.0',
      changelog: 'Added 75 new AI and cybersecurity icons, upgraded Blender scenes to 4.2 LTS materials.'
    },
    {
      title: 'CloudScale DevOps Automation Scripts & Terraform Modules',
      slug: 'cloudscale-devops-automation-terraform',
      sku: 'DEV-OPS-07',
      category_id: categoryMap['software-saas'],
      short_description: 'Production-ready infrastructure as code: multi-region AWS/GCP Terraform modules, Docker Compose stacks, and GitHub Actions CI/CD.',
      full_description: `CloudScale saves DevOps engineers and CTOs 150+ hours of infrastructure scaffolding. Deploy scalable, secure, HIPAA/SOC-2 ready cloud infrastructure with a single "terraform apply".

### What You Get:
- **Multi-Cloud Terraform Modules**: VPC with private subnets, Kubernetes (EKS/GKE), RDS Aurora PostgreSQL, Redis Cluster, and Cloudflare WAF integration.
- **GitHub Actions Workflows**: Automated linting, test suites, Docker image builds, container vulnerability scans, and zero-downtime rolling deploys.
- **Monitoring & Observability**: Preconfigured Grafana dashboards, Prometheus metrics collectors, and Loki log aggregators.`,
      product_type: 'Source Code & Scripts',
      author: 'InfraWorks Tech',
      regular_price: 5999,
      sale_price: 2999,
      badge: 'STAFF PICK',
      rating_avg: 5.0,
      review_count: 42,
      sales_count: 180,
      demo_url: 'https://preview.digitalstore.com/cloudscale',
      media: [
        'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=85'
      ],
      licenses: [
        { name: 'Startup License', price: 2999, desc: 'For a single company infrastructure and team.', permissions: 'Internal company deployments, Terraform source code, 1 year updates', restrictions: 'Cannot resell scripts' },
        { name: 'Consultancy License', price: 6999, desc: 'For cloud consultants and MSPs deploying for multiple clients.', permissions: 'Deploy for unlimited client infrastructures, Lifetime module updates, Architecture advisory session', restrictions: 'No public open-sourcing' }
      ],
      features: [
        { title: 'AWS & GCP Compatible', desc: 'Tested battle-hardened modules for AWS and Google Cloud.', icon: 'Cpu' },
        { title: 'SOC-2 Compliance Presets', desc: 'Enforced encryption at rest, in transit, and least-privilege IAM.', icon: 'ShieldCheck' },
        { title: 'Turnkey CI/CD Workflows', desc: 'Complete GitHub Actions pipelines with automated staging and prod.', icon: 'CheckCircle' },
        { title: 'Comprehensive Docs', desc: 'Markdown architecture diagrams and disaster recovery step guides.', icon: 'FileText' }
      ],
      compatibility: [
        { platform: 'Terraform', version: 'v1.6+' },
        { platform: 'Clouds', version: 'AWS, GCP, Azure, Cloudflare' },
        { platform: 'Docker & K8s', version: 'Kubernetes 1.28+, Docker 24+' }
      ],
      faqs: [
        { question: 'Do I need deep Terraform expertise?', answer: 'Basic knowledge of CLI commands (terraform plan / apply) is sufficient. Each module includes copy-paste terraform.tfvars examples.' },
        { question: 'Is support available if I get stuck?', answer: 'Yes, our engineering team provides direct email support for configuration questions.' }
      ],
      filename: 'cloudscale-infra-modules-v1.8.zip',
      filesize: 22100000,
      version: '1.8.0',
      changelog: 'Updated AWS provider to v5.x, added automated CloudWatch alarm configurations, added OpenTofu compatibility.'
    },
    {
      title: 'DevResume & Tech Portfolio Figma Kit (Free Edition)',
      slug: 'devresume-tech-portfolio-figma-kit',
      sku: 'RES-FREE-08',
      category_id: categoryMap['ui-kits-design-systems'],
      short_description: 'Clean ATS-friendly resume templates and developer portfolio wireframes for tech professionals. Completely free.',
      full_description: `Stand out in tech hiring with this recruiter-approved, ATS-friendly resume and portfolio kit designed in Figma.

### Includes:
- **3 ATS-Friendly Resume Layouts**: Clean typography, single and two-column layouts, verified for automated applicant tracking systems.
- **Cover Letter Template**: Matching aesthetic for professional cover letters.
- **Portfolio Wireframes**: Wireframes for software engineers, product designers, and engineering managers.`,
      product_type: 'UI Kit / Freebie',
      author: 'CareerCraft',
      regular_price: 999,
      sale_price: 0,
      badge: 'FREE',
      rating_avg: 4.9,
      review_count: 310,
      sales_count: 1420,
      demo_url: 'https://preview.digitalstore.com/devresume-free',
      media: [
        'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1200&q=85'
      ],
      licenses: [
        { name: 'Free Community License', price: 0, desc: 'Free for everyone to create their personal resume and portfolio.', permissions: 'Unlimited personal use, Lifetime free downloads', restrictions: 'No resale' }
      ],
      features: [
        { title: '100% Free Forever', desc: 'Zero cost, instant access without credit card.', icon: 'CheckCircle' },
        { title: 'ATS-Tested Formatting', desc: 'Engineered for smooth parsing by Workday, Greenhouse, and Lever.', icon: 'ShieldCheck' },
        { title: 'Figma Auto-Layout', desc: 'Easily expand or reorganize sections with automatic spacing.', icon: 'Layout' }
      ],
      compatibility: [
        { platform: 'Figma', version: 'All versions' },
        { platform: 'PDF Export', version: 'Ready for print & digital submission' }
      ],
      faqs: [
        { question: 'Is this genuinely 100% free?', answer: 'Yes! Simply check out with ₹0 and receive instant digital download access.' }
      ],
      filename: 'devresume-free-figma-v1.0.zip',
      filesize: 4200000,
      version: '1.0.0',
      changelog: 'Initial public release.'
    }
  ];

  for (const prod of products) {
    const pResult = db.run(
      `INSERT INTO products (
        title, slug, sku, category_id, short_description, full_description, product_type,
        author, regular_price, sale_price, badge, status, demo_url, video_url, rating_avg,
        review_count, sales_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        prod.title,
        prod.slug,
        prod.sku,
        prod.category_id,
        prod.short_description,
        prod.full_description,
        prod.product_type,
        prod.author,
        prod.regular_price,
        prod.sale_price,
        prod.badge,
        'published',
        prod.demo_url,
        prod.video_url || null,
        prod.rating_avg,
        prod.review_count,
        prod.sales_count
      ]
    );
    const productId = pResult.lastInsertRowid;

    // Media
    prod.media.forEach((url, idx) => {
      db.run(
        `INSERT INTO product_media (product_id, media_url, media_type, is_thumbnail, sort_order)
         VALUES (?, ?, 'image', ?, ?)`,
        [productId, url, idx === 0 ? 1 : 0, idx]
      );
    });

    // Licenses
    for (const lic of prod.licenses) {
      db.run(
        `INSERT INTO product_licenses (product_id, license_name, price, description, permissions, restrictions)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [productId, lic.name, lic.price, lic.desc, lic.permissions, lic.restrictions]
      );
    }

    // Features
    prod.features.forEach((feat, idx) => {
      db.run(
        `INSERT INTO product_features (product_id, title, description, icon, sort_order)
         VALUES (?, ?, ?, ?, ?)`,
        [productId, feat.title, feat.desc, feat.icon, idx]
      );
    });

    // Compatibility
    for (const comp of prod.compatibility) {
      db.run(
        `INSERT INTO product_compatibility (product_id, platform, version)
         VALUES (?, ?, ?)`,
        [productId, comp.platform, comp.version]
      );
    }

    // FAQs
    prod.faqs.forEach((faq, idx) => {
      db.run(
        `INSERT INTO product_faqs (product_id, question, answer, sort_order)
         VALUES (?, ?, ?, ?)`,
        [productId, faq.question, faq.answer, idx]
      );
    });

    // Physical mock sample deliverable file in protected directory
    const packageFilePath = path.join(protectedDir, prod.filename);
    const sampleContent = `# ${prod.title}\nVersion: ${prod.version}\nAuthor: ${prod.author}\n\nThank you for purchasing ${prod.title}!\n\nThis archive contains your verified production files, licenses, documentation, and asset components.\n\nRelease Notes:\n${prod.changelog}\n\nFor support, visit: https://digitalstore.com/dashboard/support\n`;
    fs.writeFileSync(packageFilePath, sampleContent, 'utf-8');

    db.run(
      `INSERT INTO product_files (product_id, file_name, file_path, file_size, version, changelog, download_limit, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [productId, prod.filename, prod.filename, prod.filesize, prod.version, prod.changelog, 10]
    );

    // Seed realistic verified customer reviews
    db.run(
      `INSERT INTO reviews (product_id, user_id, rating, title, comment, is_verified_purchase, status, is_featured)
       VALUES (?, ?, 5, 'Exceptional quality and cleanly structured!', 'Saved our team dozens of hours. Documentation is crystal clear and the design system feels world class.', 1, 'approved', 1)`,
      [productId, customerId]
    );
    db.run(
      `INSERT INTO reviews (product_id, user_id, rating, title, comment, is_verified_purchase, status, is_featured)
       VALUES (?, ?, 5, 'Worth every penny', 'Seamless download and instant access. The customer dashboard makes downloading future updates effortless.', 1, 'approved', 0)`,
      [productId, customerId]
    );
  }

  console.log(`Seeded ${products.length} comprehensive digital products.`);

  // 4. Coupons
  const coupons = [
    { code: 'SAVE20', discount_type: 'percentage', discount_value: 20, min_order_value: 1000, max_discount: 2000, usage_limit: 500 },
    { code: 'WELCOME10', discount_type: 'percentage', discount_value: 10, min_order_value: 500, max_discount: 1000, usage_limit: 1000 },
    { code: 'FLASHSALE', discount_type: 'fixed', discount_value: 500, min_order_value: 1500, max_discount: 500, usage_limit: 200 }
  ];
  for (const c of coupons) {
    db.run(
      `INSERT INTO coupons (code, discount_type, discount_value, min_order_value, max_discount, usage_limit, times_used, is_active)
       VALUES (?, ?, ?, ?, ?, ?, 0, 1)`,
      [c.code, c.discount_type, c.discount_value, c.min_order_value, c.max_discount, c.usage_limit]
    );
  }

  // 5. Site Settings
  const settings = [
    { key: 'store_name', value: 'Rollixia' },
    { key: 'store_tagline', value: 'Premium Digital Marketplace for Creators, Developers & Teams' },
    { key: 'currency', value: 'INR' },
    { key: 'currency_symbol', value: '₹' },
    { key: 'tax_rate', value: '18' },
    { key: 'support_email', value: 'support@rollixia.com' },
    { key: 'hero_title', value: 'Premium Digital Products Built to Help You Create Faster.' },
    { key: 'hero_subtitle', value: 'Discover high-quality software, UI kits, templates, AI prompts, and developer tools crafted by top industry engineers.' },
    { key: 'announcement', value: '🔥 Flash Sale: Use code SAVE20 for an instant 20% off all commercial kits!' }
  ];
  for (const s of settings) {
    db.run(`INSERT INTO site_settings (key, value) VALUES (?, ?)`, [s.key, s.value]);
  }

  // 6. Banners
  db.run(
    `INSERT INTO banners (title, subtitle, image_url, cta_text, cta_url, badge, is_active)
     VALUES (?, ?, ?, ?, ?, ?, 1)`,
    [
      'Exclusive Launch: FlowPay Fintech Suite',
      'Get complete cross-platform Flutter & Node.js source code with 50% launch discount.',
      'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
      'Explore Suite',
      '/products/flowpay-fullstack-mobile-banking-app',
      'SPECIAL DEAL'
    ]
  );

  // 7. Seed an initial real order for Alex Morgan to demo instant downloads
  const firstProd = db.get(`SELECT id, title, regular_price, sale_price FROM products WHERE slug = 'apex-saas-dashboard-analytics-kit'`);
  const firstLic = db.get(`SELECT id, license_name, price FROM product_licenses WHERE product_id = ?`, [firstProd.id]);
  const firstFile = db.get(`SELECT id FROM product_files WHERE product_id = ?`, [firstProd.id]);

  const sampleOrderRes = db.run(
    `INSERT INTO orders (
      order_number, user_id, customer_email, customer_name, subtotal, discount_amount,
      tax_amount, total_amount, currency, payment_provider, payment_id, payment_status, order_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'ORD-2026-8F92K7',
      customerId,
      'alex@example.com',
      'Alex Morgan',
      1999,
      0,
      359.82,
      2358.82,
      'INR',
      'simulated',
      'PAY-SIM-INIT-8F92K7',
      'paid',
      'completed'
    ]
  );
  const sampleOrderId = sampleOrderRes.lastInsertRowid;

  db.run(
    `INSERT INTO order_items (order_id, product_id, license_id, product_title, license_name, price)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [sampleOrderId, firstProd.id, firstLic.id, firstProd.title, firstLic.license_name, 1999]
  );

  // Create initial download record
  const { generateDownloadToken } = require('../services/downloadService');
  const initialToken = generateDownloadToken(sampleOrderId, customerId, firstFile.id);
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  db.run(
    `INSERT INTO downloads (order_id, user_id, product_file_id, token, expires_at, download_count, max_downloads)
     VALUES (?, ?, ?, ?, ?, 1, 10)`,
    [sampleOrderId, customerId, firstFile.id, initialToken, tomorrow]
  );

  // Seed sample support ticket
  const ticketRes = db.run(
    `INSERT INTO support_tickets (user_id, order_id, subject, status, priority)
     VALUES (?, ?, 'Inquiry regarding React 19 tokens', 'open', 'normal')`,
    [customerId, sampleOrderId]
  );
  db.run(
    `INSERT INTO support_messages (ticket_id, sender_id, sender_role, message)
     VALUES (?, ?, 'customer', 'Hello! Are the new React 19 component tokens compatible with Vite 6? Thanks!')`,
    [ticketRes.lastInsertRowid, customerId]
  );

  console.log('--- Database Seeding Finished Successfully ---');
}

if (require.main === module) {
  seed().then(() => process.exit(0)).catch(err => {
    console.error('Seeding error:', err);
    process.exit(1);
  });
}

module.exports = { seed };
