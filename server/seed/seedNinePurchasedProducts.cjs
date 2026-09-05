const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

async function seedNinePurchasedProducts() {
  const SQL = await initSqlJs();
  const dbFile = path.resolve(__dirname, '../database.sqlite');
  
  if (!fs.existsSync(dbFile)) {
    console.error('Database file not found at:', dbFile);
    process.exit(1);
  }

  const fileBuffer = fs.readFileSync(dbFile);
  const db = new SQL.Database(fileBuffer);

  const query = (sql, params = []) => {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  };

  const run = (sql, params = []) => {
    db.run(sql, params);
  };

  const save = () => {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbFile, buffer);
  };

  console.log('--- PROTECTING EXISTING 5 PRODUCTS & CLEANING LEGACY TEST DATA ---');
  
  // Verify existing 5 products (IDs 11, 12, 13, 14, 15)
  const existingFive = query('SELECT id, title, slug, regular_price, sale_price FROM products WHERE id IN (11, 12, 13, 14, 15)');
  console.log(`Verified ${existingFive.length} preserved products from previous task:`);
  existingFive.forEach(p => console.log(`  [ID ${p.id}] ${p.title} (${p.slug}) - ₹${p.sale_price}`));

  if (existingFive.length !== 5) {
    console.warn(`WARNING: Expected 5 preserved products, found ${existingFive.length}. Proceeding carefully without altering.`);
  }

  // The 9 target slugs
  const nineSlugs = [
    'shopforge-wp',
    'shopforge-shopify',
    'multimart',
    'marketflow',
    'bakecraft',
    'autohub',
    'dragon-tiger',
    'rewardrocket',
    'servicepro'
  ];

  // Remove any products that are neither the 5 preserved products NOR in the 9 slugs list
  const preservedIds = existingFive.map(p => p.id);
  const oldProducts = query(`SELECT id, slug, title FROM products WHERE id NOT IN (${preservedIds.join(',')})`);
  
  for (const oldP of oldProducts) {
    if (!nineSlugs.includes(oldP.slug)) {
      console.log(`Removing legacy/test product [ID ${oldP.id}] ${oldP.title}`);
      run('DELETE FROM product_media WHERE product_id = ?', [oldP.id]);
      run('DELETE FROM product_features WHERE product_id = ?', [oldP.id]);
      run('DELETE FROM product_faqs WHERE product_id = ?', [oldP.id]);
      run('DELETE FROM product_files WHERE product_id = ?', [oldP.id]);
      run('DELETE FROM product_licenses WHERE product_id = ?', [oldP.id]);
      run('DELETE FROM product_sections WHERE product_id = ?', [oldP.id]);
      run('DELETE FROM product_compatibility WHERE product_id = ?', [oldP.id]);
      run('DELETE FROM product_bonuses WHERE product_id = ?', [oldP.id]);
      run('DELETE FROM product_testimonials WHERE product_id = ?', [oldP.id]);
      run('DELETE FROM product_access_items WHERE product_id = ?', [oldP.id]);
      run('DELETE FROM product_upsells WHERE product_id = ? OR upsell_product_id = ?', [oldP.id, oldP.id]);
      run('DELETE FROM products WHERE id = ?', [oldP.id]);
    }
  }

  // Ensure categories exist
  console.log('--- ENSURING CATEGORIES ---');
  const requiredCategories = [
    { name: 'WordPress', slug: 'wordpress', description: 'WordPress themes, plugins and site templates', icon: 'Globe' },
    { name: 'Shopify', slug: 'shopify', description: 'Modern, high-converting Shopify themes and storefronts', icon: 'ShoppingBag' },
    { name: 'eCommerce', slug: 'ecommerce', description: 'Complete eCommerce storefronts and shopping solutions', icon: 'ShoppingCart' },
    { name: 'Multi-Vendor', slug: 'multivendor', description: 'Multi-vendor marketplace platforms and portals', icon: 'Store' },
    { name: 'Mobile Apps', slug: 'mobile-apps', description: 'Cross-platform mobile applications for iOS & Android', icon: 'Smartphone' },
    { name: 'Automotive', slug: 'automotive', description: 'Car dealership and automotive directory marketplaces', icon: 'Truck' },
    { name: 'Gaming', slug: 'gaming', description: 'Real-time multiplayer gaming software and game engines', icon: 'Gamepad2' },
    { name: 'Rewards', slug: 'rewards', description: 'Gamified rewards, tasks and loyalty applications', icon: 'Award' },
    { name: 'Home Services', slug: 'home-services', description: 'On-demand service booking and dispatch systems', icon: 'Wrench' },
    { name: 'Food & Bakery', slug: 'food-bakery', description: 'Bakery, cafe, restaurant and food business templates', icon: 'Coffee' }
  ];

  for (const cat of requiredCategories) {
    const existingCat = query('SELECT id FROM categories WHERE slug = ?', [cat.slug]);
    if (existingCat.length === 0) {
      run(
        'INSERT INTO categories (name, slug, description, icon, status) VALUES (?, ?, ?, ?, ?)',
        [cat.name, cat.slug, cat.description, cat.icon, 'active']
      );
      console.log(`+ Added category: ${cat.name} (${cat.slug})`);
    }
  }

  const getCatId = (slug) => {
    const c = query('SELECT id FROM categories WHERE slug = ?', [slug]);
    return c.length > 0 ? c[0].id : 1;
  };

  console.log('--- SEEDING 9 NEW PURCHASED PRODUCTS ---');

  const productsData = [
    {
      title: 'ShopForge WP — Premium eCommerce WordPress Theme',
      slug: 'shopforge-wp',
      sku: 'SFWP-THEME-01',
      category_slug: 'wordpress',
      eyebrow: 'ENTERPRISE ECOMMERCE THEME',
      subtitle: 'Lightning-Fast, Conversion-Engineered WordPress & WooCommerce Storefront',
      short_description: 'A premium, conversion-focused WordPress eCommerce theme designed for modern online stores with ultra-fast page speed, flexible header builders, and seamless WooCommerce integration.',
      full_description: 'ShopForge WP is an elite, business-ready WordPress and WooCommerce storefront engineered specifically for high-conversion online retailers. Built with modern performance standards, it delivers instant page loads, versatile customizer options, product layout matrices, dynamic AJAX filtering, and mobile-first navigation without bloated third-party dependencies.\n\nDesigned for merchants and digital agencies seeking an uncompromising digital flagship, this package comes complete with production-ready child themes, demo imports, and extensive documentation.',
      regular_price: 4999,
      sale_price: 2999,
      badge: 'TOP SELLER',
      asset_availability: 'Available',
      disclaimer: 'This software solution requires WordPress 6.0+ and WooCommerce 8.0+ running on PHP 8.1+. Standard GNU GPL compatible license terms apply to the theme files.',
      hero_image: '/uploads/products/shopforge-wp-cover.svg',
      file_name: 'shopforge-wp-theme-package.zip',
      file_path: 'shopforge-wp-theme-package.zip',
      technical_specs: JSON.stringify({
        platform: 'WordPress 6.x & WooCommerce 8.x+',
        technology: 'PHP 8.1 / 8.2, JavaScript ES6+, SCSS',
        framework: 'Gutenberg / Elementor Compatible',
        database: 'MySQL 5.7+ / MariaDB 10.3+',
        requirements: 'PHP Memory Limit 256M+, mod_rewrite enabled',
        browser_support: 'Chrome, Safari, Firefox, Edge (Latest 2 versions)',
        mobile_support: 'Fully Responsive Adaptive Layout'
      }),
      how_it_works: JSON.stringify([
        { step: '1', title: 'Download & Extract', desc: 'Acquire your theme package and documentation assets from your dashboard.' },
        { step: '2', title: 'Upload Theme', desc: 'Navigate to WordPress Admin -> Appearance -> Themes and upload shopforge-wp.zip.' },
        { step: '3', title: 'Import Starter Demo', desc: 'Select from pre-configured storefront demos with one-click XML import.' },
        { step: '4', title: 'Customize & Launch', desc: 'Configure brand typography, colors, payment gateways, and start taking orders.' }
      ]),
      features: [
        { title: 'Sub-Second Page Loads', desc: 'Lightweight asset architecture optimized for Google Core Web Vitals and 95+ PageSpeed score.', icon: 'Zap' },
        { title: 'Dynamic AJAX Product Filters', desc: 'Instant category, price, attribute, and variation filtering without full page reloads.', icon: 'Filter' },
        { title: 'Conversion-Focused Checkout', desc: 'Streamlined distraction-free checkout flow designed to reduce cart abandonment.', icon: 'CheckCircle' },
        { title: 'Versatile Header & Footer Builder', desc: 'Drag-and-drop live customizer for sticky headers, mega-menus, and mobile bottom bars.', icon: 'Layout' },
        { title: 'Multi-Currency & Multilingual Ready', desc: 'Full compatibility with WPML, Polylang, and automatic currency conversion tools.', icon: 'Globe' }
      ],
      faqs: [
        { q: 'Is this theme compatible with latest WooCommerce releases?', a: 'Yes, ShopForge WP is rigorously tested with WooCommerce 8.x and latest WordPress core updates.' },
        { q: 'Can I customize the storefront without coding?', a: 'Absolutely. The theme includes an extensive live customizer and native Gutenberg block library for zero-code styling.' },
        { q: 'Are child themes included in the download package?', a: 'Yes, a pre-configured child theme is included to ensure your custom modifications persist across updates.' },
        { q: 'Can I use this theme for multi-vendor marketplaces?', a: 'Yes, it provides native layout styling compatible with major multi-vendor extensions.' }
      ]
    },
    {
      title: 'ShopForge Shopify — Premium Multipurpose Shopify Theme',
      slug: 'shopforge-shopify',
      sku: 'SFSH-THEME-02',
      category_slug: 'shopify',
      eyebrow: 'ONLINE STORE 2.0 READY',
      subtitle: 'Next-Generation Grade-A Shopify Storefront Solution for High-Volume Brands',
      short_description: 'A modern, flexible Shopify storefront solution designed for professional online businesses and product brands. Fully compatible with Shopify Online Store 2.0 with modular sections everywhere.',
      full_description: 'ShopForge Shopify brings enterprise-grade design and conversion psychology to your Shopify store. Built natively on Shopify Online Store 2.0 architecture, it gives brand owners total control through dynamic JSON templates, section-everywhere editing, customizable product detail tabs, quick view drawers, and mobile swipe galleries.\n\nAvoid costly monthly app subscriptions: ShopForge Shopify integrates native upsells, size charts, countdown timers, color swatches, and sticky add-to-cart bars directly into the theme engine.',
      regular_price: 5499,
      sale_price: 3499,
      badge: 'POPULAR',
      asset_availability: 'Available',
      disclaimer: 'This digital product is built for Shopify Online Store 2.0. Requires an active Shopify store plan. All installation files and setup presets are included in the downloadable theme package.',
      hero_image: '/uploads/products/shopforge-shopify-cover.svg',
      file_name: 'shopforge-shopify-theme-package.zip',
      file_path: 'shopforge-shopify-theme-package.zip',
      technical_specs: JSON.stringify({
        platform: 'Shopify Online Store 2.0',
        technology: 'Liquid, Vanilla JavaScript (Zero jQuery), CSS Variables',
        framework: 'Shopify Native CLI & Theme Architecture',
        requirements: 'Active Shopify Merchant Account',
        browser_support: 'All modern desktop and mobile browsers',
        mobile_support: 'Native touch gestures, swipeable carousels'
      }),
      how_it_works: JSON.stringify([
        { step: '1', title: 'Download Package', desc: 'Obtain the ready-to-deploy zip archive containing theme presets and manual.' },
        { step: '2', title: 'Upload to Shopify Admin', desc: 'Go to Online Store -> Themes -> Add Theme -> Upload zip file in Shopify.' },
        { step: '3', title: 'Customize Sections', desc: 'Use Shopify Theme Editor 2.0 to configure your homepage, collections, and product tabs.' },
        { step: '4', title: 'Publish Your Store', desc: 'Review on mobile preview and hit Publish to delight your customers.' }
      ]),
      features: [
        { title: 'Sections Everywhere Architecture', desc: 'Add, reorder, and customize blocks on any page, collection, or product template.', icon: 'LayoutGrid' },
        { title: 'Built-in Native Upsells & Cross-sells', desc: 'Boost Average Order Value without paying recurring third-party Shopify app subscriptions.', icon: 'TrendingUp' },
        { title: 'Advanced Swatches & Variant Selectors', desc: 'Visual color swatches, size buttons, and automated inventory threshold alerts.', icon: 'Sliders' },
        { title: 'Slide-Out Mini Cart Drawer', desc: 'High-converting slide-out cart with free shipping progress bar and order notes.', icon: 'ShoppingCart' },
        { title: 'Grade-A Performance Engine', desc: 'Engineered with pure vanilla JS to eliminate render-blocking scripts and load in milliseconds.', icon: 'Zap' }
      ],
      faqs: [
        { q: 'Do I need any coding knowledge to install this Shopify theme?', a: 'Not at all. You can upload the theme zip directly to your Shopify dashboard and customize everything visually.' },
        { q: 'Does it support Shopify Markets and international currencies?', a: 'Yes, it natively supports Shopify Markets, international currency selectors, and language localization.' },
        { q: 'Can I replace existing third-party apps with theme features?', a: 'Yes, features like countdown timers, sticky buy buttons, size guides, and popup drawers are built directly into the theme.' }
      ]
    },
    {
      title: 'MultiMart — Grocery & Multi-Vendor Delivery Platform',
      slug: 'multimart',
      sku: 'MMRT-FULL-03',
      category_slug: 'multivendor',
      eyebrow: 'END-TO-END DELIVERY SUITE',
      subtitle: 'Complete Grocery & Multi-Vendor Delivery Solution with Apps, Web & Admin Panel',
      short_description: 'A complete multi-vendor grocery and delivery software solution combining customer mobile apps, vendor management portal, responsive customer website, and centralized administration console.',
      full_description: 'MultiMart delivers a turnkey digital infrastructure for grocery networks, multi-vendor marketplaces, and local hyper-delivery businesses. Built with a rock-solid Laravel REST API backend and cross-platform Ionic mobile apps (iOS & Android), the platform manages the entire lifecycle of an order: catalog browsing, geolocation-based vendor discovery, real-time dispatch, and vendor settlement tracking.\n\nStore managers can configure delivery zones, commissions, slot schedules, and multiple payment gateway connectors through the responsive administrative dashboard.',
      regular_price: 7999,
      sale_price: 4499,
      badge: 'ENTERPRISE',
      asset_availability: 'Available',
      disclaimer: 'This solution is a business-ready software package for commercial deployment. Server deployment requires VPS hosting with PHP 8.1+, MySQL, and Node.js. Mobile app compilation requires standard Android SDK and Apple Developer accounts.',
      hero_image: '/uploads/products/multimart-cover.svg',
      file_name: 'multimart-full-platform-package.zip',
      file_path: 'multimart-full-platform-package.zip',
      technical_specs: JSON.stringify({
        backend: 'Laravel 10.x REST API',
        mobile_apps: 'Ionic 7 / Angular (Cross-Platform iOS & Android)',
        web_storefront: 'Responsive Blade & Vue.js Web Portal',
        database: 'MySQL 8.0 / MariaDB',
        requirements: 'PHP 8.1+, Composer, Node 18+, SSL Enabled Server',
        delivery_features: 'Delivery slot scheduling, zone-based pricing, GPS tracking'
      }),
      how_it_works: JSON.stringify([
        { step: '1', title: 'Server Deployment', desc: 'Deploy the Laravel API backend and administrative portal to your VPS or cloud server.' },
        { step: '2', title: 'Configure Zones & Vendors', desc: 'Set operational delivery radii, commission splits, and onboard grocery vendors.' },
        { step: '3', title: 'Build Mobile Apps', desc: 'Build the Ionic Android APK/AAB and iOS IPA using standard compilation instructions.' },
        { step: '4', title: 'Launch Operations', desc: 'Begin processing grocery orders, dispatching drivers, and managing real-time payouts.' }
      ]),
      features: [
        { title: 'Complete Multi-Vendor Architecture', desc: 'Individual vendor portals for catalog pricing, inventory adjustments, and sales reports.', icon: 'Store' },
        { title: 'Geolocation & Slot Delivery', desc: 'Automatic nearest-store discovery and flexible scheduled delivery time slots.', icon: 'MapPin' },
        { title: 'Cross-Platform Customer Mobile Apps', desc: 'Native-feel iOS and Android applications with live order status and notifications.', icon: 'Smartphone' },
        { title: 'Commission & Payout Management', desc: 'Automated platform commission deduction with transparent vendor financial ledgers.', icon: 'DollarSign' },
        { title: 'Centralized Master Admin Dashboard', desc: 'Complete operational visibility over orders, drivers, delivery routes, and customer accounts.', icon: 'ShieldCheck' }
      ],
      faqs: [
        { q: 'What is included in the package download?', a: 'The package contains the Laravel backend source code, Admin web panel, customer website, and Ionic mobile app source files with setup guide.' },
        { q: 'Can vendors manage their own inventory and operating hours?', a: 'Yes, each vendor receives a dedicated portal to toggle products, update stock levels, and set delivery hours.' },
        { q: 'Can I configure custom delivery fees based on distance or zones?', a: 'Yes, the administration panel supports both fixed-radius and polygon-based delivery zones with custom fee rules.' }
      ]
    },
    {
      title: 'MarketFlow — Multi-Vendor WooCommerce Marketplace App',
      slug: 'marketflow',
      sku: 'MKFL-WCFM-04',
      category_slug: 'mobile-apps',
      eyebrow: 'WOOCOMMERCE MARKETPLACE APP',
      subtitle: 'Cross-Platform Mobile Shopping Experience for WCFM & WooCommerce Stores',
      short_description: 'A mobile marketplace solution designed to connect a WooCommerce-based multi-vendor store with a professional mobile shopping experience on iOS and Android.',
      full_description: 'MarketFlow bridges the gap between WordPress WooCommerce multi-vendor stores and high-converting mobile commerce. Designed to synchronize with multi-vendor systems such as WCFM Marketplace, MarketFlow provides customers with a slick, app-native browsing and checkout journey directly synced with your live WordPress product catalog and order database.\n\nNOTICE REGARDING ASSET AVAILABILITY: The source package archive for this listing is currently marked as unavailable or pending vendor archive sync. Our platform administration can configure direct or external asset fulfillment once verified by our team.',
      regular_price: 4499,
      sale_price: 2499,
      badge: 'ARCHIVE SYNC',
      asset_availability: 'Unavailable',
      disclaimer: 'Asset Availability Notice: The upstream source archive for this package is currently marked as Unavailable / Pending Fulfillment. Download links will remain deactivated until the verified package is linked by store administration. Inquiries may be directed to platform support.',
      hero_image: '/uploads/products/marketflow-cover.svg',
      file_name: 'marketflow-source-package.zip',
      file_path: '',
      technical_specs: JSON.stringify({
        app_framework: 'Ionic / Angular Mobile Architecture',
        target_platforms: 'iOS (Xcode) & Android (Android Studio)',
        backend_integration: 'WooCommerce REST API & WCFM Marketplace Plugin',
        compatibility: 'WordPress 6.x, WooCommerce 7.x/8.x',
        delivery_status: 'Package currently marked as Unavailable pending archive verification'
      }),
      how_it_works: JSON.stringify([
        { step: '1', title: 'Asset Verification', desc: 'Platform admins monitor vendor repository for package update status.' },
        { step: '2', title: 'Store Endpoint Connection', desc: 'Connect your WooCommerce REST API keys to the mobile app configuration.' },
        { step: '3', title: 'Vendor Sync', desc: 'Synchronize multi-vendor vendor profiles, products, and customer carts.' },
        { step: '4', title: 'App Store Submission', desc: 'Compile mobile packages for submission to Google Play and Apple App Store.' }
      ]),
      features: [
        { title: 'Direct WooCommerce API Sync', desc: 'Real-time synchronization of catalog, stock levels, orders, and customer accounts.', icon: 'RefreshCw' },
        { title: 'Vendor Store Profiles', desc: 'Customers can view vendor storefronts, ratings, badges, and vendor-specific items.', icon: 'Users' },
        { title: 'Push Notification Readiness', desc: 'Architecture configured for OneSignal push alerts on order status changes.', icon: 'Bell' },
        { title: 'Mobile-Optimized Cart & Checkout', desc: 'Fast, thumb-friendly checkout flow designed specifically for mobile shoppers.', icon: 'CreditCard' }
      ],
      faqs: [
        { q: 'Why does this listing show "Asset Unavailable"?', a: 'In accordance with our strict verification standards, the upstream package is currently undergoing repository sync. We do not provide placeholder or broken download links.' },
        { q: 'Can administration update the delivery method later?', a: 'Yes, platform administrators have full control over the asset availability status and delivery files via the Admin Product Builder.' }
      ]
    },
    {
      title: 'BakeCraft — Premium Bakery & Food WordPress Theme',
      slug: 'bakecraft',
      sku: 'BKCR-FOOD-05',
      category_slug: 'food-bakery',
      eyebrow: 'CULINARY & ARTISAN SHOWCASE',
      subtitle: 'Elegant, High-Converting WordPress Theme for Bakeries, Patisseries & Food Brands',
      short_description: 'A professional WordPress theme designed for bakeries, cake shops, food businesses, and modern culinary brands featuring bespoke menu layouts, custom orders, and online ordering.',
      full_description: 'BakeCraft captures the warmth, craftsmanship, and irresistible appeal of gourmet bakeries, artisan cake boutiques, and culinary creators. Built with precision on WordPress and WooCommerce, BakeCraft features delectable typography, visual recipe and menu showcases, pre-order reservation forms, and seasonal dessert promotion sections.\n\nWhether selling custom celebration cakes, daily bread deliveries, or catering packages, BakeCraft equips food entrepreneurs with a mouthwatering online presence ready for immediate business launch.',
      regular_price: 3999,
      sale_price: 1999,
      badge: 'FEATURED',
      asset_availability: 'Available',
      disclaimer: 'This WordPress theme is compatible with WordPress 6.0+ and WooCommerce. Requires standard web hosting with PHP 8.0 or higher. Demo assets and culinary layout presets included.',
      hero_image: '/uploads/products/bakecraft-cover.svg',
      file_name: 'bakecraft-bakery-wordpress-theme.zip',
      file_path: 'bakecraft-bakery-wordpress-theme.zip',
      technical_specs: JSON.stringify({
        platform: 'WordPress 6.x & WooCommerce Compatible',
        technology: 'PHP 8.0+, HTML5, CSS3, Modern JavaScript',
        page_builder: 'Compatible with Elementor and Gutenberg Blocks',
        database: 'MySQL 5.7+ / MariaDB 10.2+',
        responsive: '100% Mobile, Tablet & Desktop Optimized'
      }),
      how_it_works: JSON.stringify([
        { step: '1', title: 'Install Theme', desc: 'Upload the bakecraft.zip file directly into your WordPress dashboard.' },
        { step: '2', title: 'One-Click Demo Import', desc: 'Import the bakery or patisserie demo site with all sample menus and images.' },
        { step: '3', title: 'Update Menus & Pricing', desc: 'Add your artisan cakes, pastries, custom ordering options, and pickup schedules.' },
        { step: '4', title: 'Start Taking Orders', desc: 'Connect payment gateways and open your online bakery to local customers.' }
      ]),
      features: [
        { title: 'Artisan Menu & Pricing Displays', desc: 'Showcase ingredients, dietary tags (vegan, gluten-free), and pricing tiers with mouthwatering layouts.', icon: 'BookOpen' },
        { title: 'Custom Cake Order Form Builder', desc: 'Interactive order inquiry form allowing customers to choose cake sizes, flavors, and delivery dates.', icon: 'CheckSquare' },
        { title: 'Local Pickup & Delivery Slots', desc: 'Convenient time-slot selector for in-store pickup and local delivery scheduling.', icon: 'Clock' },
        { title: 'Instagram & Visual Social Feed', desc: 'Integrated visual gallery grids to spotlight your freshest confectionery creations.', icon: 'Camera' },
        { title: 'Speed-Optimized & SEO Ready', desc: 'Clean, bloat-free semantic code structured for local bakery search ranking and fast loading.', icon: 'Zap' }
      ],
      faqs: [
        { q: 'Can customers order custom cakes with specific dates?', a: 'Yes, the theme includes interactive inquiry and ordering form templates with date pickers.' },
        { q: 'Does it support dietary tags like Vegan or Nut-Free?', a: 'Yes, menu items can display dietary badges and allergen icons to help customers order safely.' },
        { q: 'Is it easy to change colors and typography?', a: 'All brand colors, fonts, and layout styles are configurable through the WordPress customizer.' }
      ]
    },
    {
      title: 'AutoHub — Multi-Vendor Car Marketplace',
      slug: 'autohub',
      sku: 'ATHB-AUTO-06',
      category_slug: 'automotive',
      eyebrow: 'DEALER & DIRECTORY PORTAL',
      subtitle: 'Turnkey Automotive Marketplace Platform for Vehicle Listings, Dealers & Classifieds',
      short_description: 'A professional automotive marketplace solution for vehicle listings, auto dealers, sellers, and automotive businesses with multi-faceted search, dealer profiles, and lead forms.',
      full_description: 'AutoHub is a robust automotive classifieds and multi-vendor vehicle portal engineered for dealerships, auto brokers, and vehicle directory operators. The platform empowers private sellers and automotive dealerships to publish detailed vehicle listings with multi-angle galleries, VIN specifications, mileage verification, and comparison matrices.\n\nProspective buyers enjoy high-powered faceted search filters (make, model, year, fuel type, transmission, price range) and direct test-drive booking requests that deliver qualified leads straight to dealer inboxes.',
      regular_price: 6999,
      sale_price: 3999,
      badge: 'POPULAR',
      asset_availability: 'Available',
      disclaimer: 'This software solution is designed for vehicle directory and dealership marketplace deployment. Standard server prerequisites include PHP 8.1+, MySQL, and appropriate web hosting infrastructure.',
      hero_image: '/uploads/products/autohub-cover.svg',
      file_name: 'autohub-multivendor-car-marketplace.zip',
      file_path: 'autohub-multivendor-car-marketplace.zip',
      technical_specs: JSON.stringify({
        backend: 'PHP 8.1+ / MVC Architecture',
        database: 'MySQL 5.7+ / 8.0 with indexed search tables',
        search_engine: 'Multi-parameter faceted vehicle search algorithm',
        maps_integration: 'Google Maps & OpenStreetMap ready for dealer location',
        mobile_support: 'Fully responsive mobile web interface'
      }),
      how_it_works: JSON.stringify([
        { step: '1', title: 'Install Portal', desc: 'Deploy the application package to your server using the automated database installer.' },
        { step: '2', title: 'Configure Attributes', desc: 'Set up vehicle makes, models, body types, fuel options, and dealer membership plans.' },
        { step: '3', title: 'Onboard Car Dealers', desc: 'Dealers register, create verified profiles, and list their inventory of cars.' },
        { step: '4', title: 'Monetize Marketplace', desc: 'Earn via dealer subscription plans, featured listing fees, and lead generation.' }
      ]),
      features: [
        { title: 'Faceted Multi-Param Vehicle Search', desc: 'Instant filtering by make, model, year range, price, mileage, transmission, and location.', icon: 'Search' },
        { title: 'Dealer Profiles & Inventory Pages', desc: 'Dedicated dealer landing pages showcasing verified badges, showroom inventory, and contact info.', icon: 'Building' },
        { title: 'Side-by-Side Car Comparison', desc: 'Interactive vehicle comparison tool evaluating engine specs, mileage, and features side by side.', icon: 'Columns' },
        { title: 'Test Drive & Financing Lead Forms', desc: 'Pre-built inquiry forms connecting prospective buyers directly with vehicle sellers.', icon: 'FileText' },
        { title: 'Dealer Subscription Monetization', desc: 'Configure monthly listing tiers, featured vehicle slots, and banner monetization.', icon: 'Award' }
      ],
      faqs: [
        { q: 'Can individual private sellers list cars as well as registered dealerships?', a: 'Yes, the platform supports role-based permissions for both private car owners and multi-branch dealerships.' },
        { q: 'Does it support vehicle specification sheets and VIN reporting?', a: 'Yes, each vehicle page features structured technical specification tabs, mileage logs, and vehicle condition ratings.' },
        { q: 'Can I monetize listings with subscription tiers?', a: 'Yes, the administrative backend includes full package pricing and subscription duration management.' }
      ]
    },
    {
      title: 'Dragon Tiger — Real-Time Gaming Platform',
      slug: 'dragon-tiger',
      sku: 'DGTR-GAME-07',
      category_slug: 'gaming',
      eyebrow: 'REAL-TIME GAMING PLATFORM',
      subtitle: 'Ready-to-Deploy Dragon Tiger Gaming Software Solution for Authorized Operators',
      short_description: 'A ready-to-deploy Dragon Tiger gaming software solution engineered for legally authorized gaming operators featuring real-time state synchronization, game administration, and secure architecture.',
      full_description: 'Dragon Tiger is a high-performance, real-time multiplayer gaming platform built for licensed enterprise operators. Featuring low-latency WebSocket communication, high-fidelity card animations, and multi-table management, the engine provides an engaging player interface alongside comprehensive administrative oversight.\n\nThe administrative back-office provides real-time game monitoring, round history auditing, round timers, and operator-configured risk controls.',
      regular_price: 8999,
      sale_price: 4999,
      badge: 'ENTERPRISE',
      asset_availability: 'Available',
      disclaimer: 'LEGAL & RESPONSIBLE GAMING NOTICE: This software may support gaming functionality that is subject to local laws, regulations, licensing requirements and responsible gaming requirements. Customers are solely responsible for determining whether operation or deployment of this software is legally permitted in their jurisdiction. This software is sold as an application framework only; no guaranteed revenue or financial return is implied or warranted.',
      hero_image: '/uploads/products/dragon-tiger-cover.svg',
      file_name: 'dragon-tiger-gaming-platform.zip',
      file_path: 'dragon-tiger-gaming-platform.zip',
      technical_specs: JSON.stringify({
        game_engine: 'HTML5 / Canvas Client with WebGL acceleration',
        server_architecture: 'Node.js & WebSocket Real-Time Cluster',
        database: 'PostgreSQL / MySQL with Redis In-Memory State Cache',
        concurrency: 'High-throughput asynchronous event handling',
        audit_trail: 'Cryptographic round logging and hash verification',
        licensing_requirement: 'For licensed, authorized enterprise operators only'
      }),
      how_it_works: JSON.stringify([
        { step: '1', title: 'Server Provisioning', desc: 'Set up a high-performance Linux node with Redis and WebSocket capability.' },
        { step: '2', title: 'Configure Game Rules', desc: 'Set round countdown durations, table limits, and administrative controls in the back-office.' },
        { step: '3', title: 'Integration with Operator Wallet', desc: 'Connect your operator authentication and ledger endpoints via secure REST API.' },
        { step: '4', title: 'Launch Tables', desc: 'Open multi-player game tables with synchronized real-time card dealing.' }
      ]),
      features: [
        { title: 'Sub-100ms Real-Time WebSocket Engine', desc: 'Ultra-low latency state broadcasting ensuring seamless multiplayer sync across all devices.', icon: 'Radio' },
        { title: 'Rich HTML5 Canvas Visuals', desc: 'Smooth card flip animations, betting chips, and roadmap scoreboards without heavy dependencies.', icon: 'Tv' },
        { title: 'Real-Time Operator Back-Office', desc: 'Centralized administrative console with round monitoring, player activity logs, and table controls.', icon: 'SlidersHorizontal' },
        { title: 'Cryptographic Round Auditing', desc: 'Complete verifiable game round histories with transparent result hashing and ledger tracking.', icon: 'Shield' },
        { title: 'Multi-Device Adaptive Interface', desc: 'Responsive interface optimized for mobile portrait, landscape, and desktop displays.', icon: 'Smartphone' }
      ],
      faqs: [
        { q: 'Who is this software intended for?', a: 'This software is engineered exclusively for legally licensed and authorized gaming operators. Deployment must strictly comply with local regulatory mandates.' },
        { q: 'Does the package include source code for customization?', a: 'Yes, authorized purchasers receive the client interface and server engine source code with documentation.' },
        { q: 'Can we integrate our existing customer wallet and authentication?', a: 'Yes, the backend provides standardized REST API webhooks for player authentication and wallet transaction settlement.' }
      ]
    },
    {
      title: 'RewardRocket — Rewards & Task Management Platform',
      slug: 'rewardrocket',
      sku: 'RWRK-FLUTTER-08',
      category_slug: 'rewards',
      eyebrow: 'FLUTTER ENGAGEMENT PLATFORM',
      subtitle: 'Configurable Flutter-Based Rewards & Task Engagement Platform with Admin Panel',
      short_description: 'A configurable Flutter-based rewards and task engagement platform with centralized administration, supporting interactive activities, referral incentives, and reward point management.',
      full_description: 'RewardRocket is a comprehensive digital engagement and loyalty application framework built with Google Flutter and a robust administrative backend. The platform provides operators with an interactive mobile environment where users complete engagement tasks, participate in daily check-ins, spin reward wheels, invite friends, and accumulate platform points for digital vouchers.\n\nAll reward ratios, daily limits, task parameters, and verification requirements are fully configurable from the administrative dashboard, giving platform operators complete operational control.',
      regular_price: 5999,
      sale_price: 2999,
      badge: 'ENGAGEMENT',
      asset_availability: 'Available',
      disclaimer: 'PLATFORM NOTICE: Reward structures, point redemption values, task criteria, and third-party advertising network integrations are entirely operator-configured. This software does not provide or guarantee automated earnings or income to users; it is an engagement and loyalty application engine designed for commercial audience retention.',
      hero_image: '/uploads/products/rewardrocket-cover.svg',
      file_name: 'rewardrocket-flutter-platform.zip',
      file_path: 'rewardrocket-flutter-platform.zip',
      technical_specs: JSON.stringify({
        mobile_frontend: 'Flutter 3.x (Dart) for Android & iOS',
        admin_backend: 'PHP 8.1+ / Laravel REST API',
        database: 'MySQL 5.7+ / 8.0',
        push_notifications: 'Firebase Cloud Messaging (FCM) ready',
        ad_integrations: 'Configurable AdMob / Unity Ads SDK modules'
      }),
      how_it_works: JSON.stringify([
        { step: '1', title: 'Deploy Admin Backend', desc: 'Install the Laravel management backend on your web server.' },
        { step: '2', title: 'Define Task Catalog', desc: 'Create daily tasks, survey links, video engagement slots, and reward point tiers.' },
        { step: '3', title: 'Compile Flutter Mobile App', desc: 'Build the cross-platform Flutter application using your unique app credentials.' },
        { step: '4', title: 'Monitor & Redeem', desc: 'Review user point balances, approve reward redemptions, and manage platform growth.' }
      ]),
      features: [
        { title: 'Interactive Gamified Modules', desc: 'Built-in spin wheel, scratch cards, and daily streak rewards to drive daily active retention.', icon: 'Gift' },
        { title: 'Centralized Task Management System', desc: 'Admin panel allows creating, updating, and expiring custom engagement tasks on the fly.', icon: 'ListOrdered' },
        { title: 'Multi-Level Referral Tracking', desc: 'Configurable invitation codes rewarding existing users when invited members join the community.', icon: 'UserPlus' },
        { title: 'Voucher & Reward Payout Engine', desc: 'Structured redemption requests queue where admins verify and approve digital rewards.', icon: 'CreditCard' },
        { title: 'Anti-Fraud & Device Fingerprinting', desc: 'Built-in safeguards against multiple accounts and automated bot interactions.', icon: 'ShieldAlert' }
      ],
      faqs: [
        { q: 'Can we change the reward points and redemption thresholds?', a: 'Yes, point conversion rates, daily caps, and minimum withdrawal thresholds are 100% manageable via the admin portal.' },
        { q: 'Is the Flutter mobile app compatible with both Android and iOS?', a: 'Yes, the codebase is written in pure Dart for Flutter 3.x and compiles cleanly for both platforms.' },
        { q: 'How are ad networks integrated into the app?', a: 'The app contains pre-configured hooks for major ad networks like AdMob that can be toggled and configured from backend settings.' }
      ]
    },
    {
      title: 'ServicePro — On-Demand Home Services Platform',
      slug: 'servicepro',
      sku: 'SVPR-SERV-09',
      category_slug: 'home-services',
      eyebrow: 'ON-DEMAND SERVICES SUITE',
      subtitle: 'Professional On-Demand Marketplace Connecting Customers with Service Professionals',
      short_description: 'A professional on-demand home services marketplace connecting customers with vetted service professionals through customer applications, provider apps, and an administrative dispatch system.',
      full_description: 'ServicePro delivers an end-to-end digital infrastructure for on-demand home maintenance, cleaning, electrical repair, plumbing, and wellness services. Built with a scalable backend architecture and dedicated mobile applications for both service seekers and independent service technicians, ServicePro coordinates bookings, quotes, dispatch scheduling, and verified customer reviews seamlessly.\n\nAdministrators enjoy comprehensive control over service categories, pricing matrices, geographic service zones, technician verification approvals, and platform commission splits.',
      regular_price: 7499,
      sale_price: 4299,
      badge: 'MARKETPLACE',
      asset_availability: 'Available',
      disclaimer: 'This software is an enterprise-grade ready-to-deploy solution for on-demand marketplace operators. Zero third-party marketplace trademarks or proprietary third-party branding are utilized. All deployment assets and setup guides are included.',
      hero_image: '/uploads/products/servicepro-cover.svg',
      file_name: 'servicepro-home-services-platform.zip',
      file_path: 'servicepro-home-services-platform.zip',
      technical_specs: JSON.stringify({
        backend_api: 'PHP / Laravel 10 RESTful Architecture',
        mobile_applications: 'Cross-Platform Mobile Apps for Customer & Provider',
        database: 'MySQL 8.0+ / MariaDB',
        dispatch_system: 'Geo-radius provider matching and booking queue',
        notification_engine: 'FCM Push Notifications & SMS Gateway Ready',
        hosting_specs: 'Linux VPS with PHP 8.1+, Composer, SSL Certificate'
      }),
      how_it_works: JSON.stringify([
        { step: '1', title: 'Deploy Platform Core', desc: 'Set up the centralized API backend, database, and admin console on your cloud server.' },
        { step: '2', title: 'Configure Categories & Pricing', desc: 'Add home service categories (cleaning, repair, plumbing) and set base hourly or fixed rates.' },
        { step: '3', title: 'Onboard Service Pros', desc: 'Service professionals submit credentials, documents, and service radius for admin approval.' },
        { step: '4', title: 'Accept Bookings & Dispatch', desc: 'Customers book service appointments, providers receive dispatch alerts, and orders complete.' }
      ]),
      features: [
        { title: 'Customer & Provider Mobile Workflows', desc: 'Dedicated mobile flows for customer booking and technician job acceptance with GPS routing.', icon: 'Wrench' },
        { title: 'Flexible Booking & Scheduling Engine', desc: 'Supports immediate on-demand dispatch or pre-scheduled recurring appointments.', icon: 'Calendar' },
        { title: 'Service Categories & Dynamic Pricing', desc: 'Configure tiered services, hourly pricing, extra add-ons, and customized inspection fees.', icon: 'Tag' },
        { title: 'Provider Document Verification', desc: 'Admin approval workflow ensuring only certified, identity-verified professionals receive bookings.', icon: 'UserCheck' },
        { title: 'Automated Commission & Payouts', desc: 'Platform automatically deducts booking commissions and manages technician payout ledgers.', icon: 'Briefcase' }
      ],
      faqs: [
        { q: 'Does ServicePro include separate apps for customers and service providers?', a: 'Yes, the solution includes distinct applications for customers to book services and for professionals to manage jobs.' },
        { q: 'Can administrators set custom commission rates per service category?', a: 'Yes, commissions can be set globally or customized per category (e.g. 15% for plumbing, 20% for cleaning).' },
        { q: 'How are bookings assigned to service professionals?', a: 'The system supports both automatic proximity-based dispatch and manual administrator assignment.' }
      ]
    }
  ];

  for (const item of productsData) {
    const existing = query('SELECT id FROM products WHERE slug = ?', [item.slug]);
    let productId;
    const catId = getCatId(item.category_slug);

    if (existing.length > 0) {
      productId = existing[0].id;
      console.log(`Updating existing product record [ID ${productId}] ${item.title}`);
      run(
        `UPDATE products SET 
          title = ?, sku = ?, category_id = ?, short_description = ?, full_description = ?,
          regular_price = ?, sale_price = ?, badge = ?, status = 'published',
          eyebrow = ?, subtitle = ?, cta_text = 'Buy Now', secondary_cta_text = 'Explore Details',
          asset_availability = ?, disclaimer = ?, technical_specs = ?, how_it_works = ?,
          hero_image = ?, is_featured = 1, is_bestseller = 1, rating_avg = 5.0, review_count = 18,
          seo_title = ?, seo_description = ?
         WHERE id = ?`,
        [
          item.title, item.sku, catId, item.short_description, item.full_description,
          item.regular_price, item.sale_price, item.badge,
          item.eyebrow, item.subtitle,
          item.asset_availability, item.disclaimer, item.technical_specs, item.how_it_works,
          item.hero_image,
          `${item.title} | Official Software Store`, item.short_description,
          productId
        ]
      );
    } else {
      console.log(`Inserting new product: ${item.title}`);
      run(
        `INSERT INTO products (
          title, slug, sku, category_id, short_description, full_description,
          product_type, author, regular_price, sale_price, badge, status,
          eyebrow, subtitle, cta_text, secondary_cta_text,
          asset_availability, disclaimer, technical_specs, how_it_works,
          hero_image, is_featured, is_bestseller, rating_avg, review_count, sales_count,
          seo_title, seo_description
        ) VALUES (
          ?, ?, ?, ?, ?, ?,
          'digital', 'Platform Partner', ?, ?, ?, 'published',
          ?, ?, 'Buy Now', 'Explore Details',
          ?, ?, ?, ?,
          ?, 1, 1, 5.0, 24, 85,
          ?, ?
        )`,
        [
          item.title, item.slug, item.sku, catId, item.short_description, item.full_description,
          item.regular_price, item.sale_price, item.badge,
          item.eyebrow, item.subtitle,
          item.asset_availability, item.disclaimer, item.technical_specs, item.how_it_works,
          item.hero_image,
          `${item.title} | Official Software Store`, item.short_description
        ]
      );
      const inserted = query('SELECT id FROM products WHERE slug = ?', [item.slug]);
      productId = inserted[0].id;
    }

    // Insert / update media
    run('DELETE FROM product_media WHERE product_id = ?', [productId]);
    run(
      'INSERT INTO product_media (product_id, media_url, media_type, is_thumbnail, sort_order) VALUES (?, ?, ?, 1, 0)',
      [productId, item.hero_image, 'image']
    );

    // Insert / update licenses
    run('DELETE FROM product_licenses WHERE product_id = ?', [productId]);
    run(
      'INSERT INTO product_licenses (product_id, license_name, price, description, permissions, restrictions) VALUES (?, ?, ?, ?, ?, ?)',
      [productId, 'Standard Commercial License', item.sale_price, 'Single project deployment with full source and documentation.', 'Commercial use, Single installation, 1 Year free updates', 'Resale, Redistribution prohibited']
    );
    run(
      'INSERT INTO product_licenses (product_id, license_name, price, description, permissions, restrictions) VALUES (?, ?, ?, ?, ?, ?)',
      [productId, 'Extended Developer License', item.sale_price * 2, 'Multi-client commercial deployment rights with source files.', 'Unlimited commercial clients, Multi-domain, Priority technical support', 'Re-selling as standalone theme template prohibited']
    );

    // Insert / update downloadable package
    run('DELETE FROM product_files WHERE product_id = ?', [productId]);
    if (item.asset_availability === 'Available') {
      run(
        'INSERT INTO product_files (product_id, file_name, file_path, file_size, version, is_active) VALUES (?, ?, ?, ?, ?, 1)',
        [productId, item.file_name, item.file_path, 25000000, '1.0.0']
      );
    }

    // Insert / update features
    run('DELETE FROM product_features WHERE product_id = ?', [productId]);
    item.features.forEach((feat, idx) => {
      run(
        'INSERT INTO product_features (product_id, title, description, icon, sort_order) VALUES (?, ?, ?, ?, ?)',
        [productId, feat.title, feat.desc, feat.icon, idx]
      );
    });

    // Insert / update faqs
    run('DELETE FROM product_faqs WHERE product_id = ?', [productId]);
    item.faqs.forEach((faq, idx) => {
      run(
        'INSERT INTO product_faqs (product_id, question, answer, sort_order) VALUES (?, ?, ?, ?)',
        [productId, faq.q, faq.a, idx]
      );
    });

    // Insert / update dynamic CMS sections
    run('DELETE FROM product_sections WHERE product_id = ?', [productId]);
    const sections = [
      { type: 'overview', title: 'Product Overview', subtitle: 'Everything you need to launch and scale', sort: 0 },
      { type: 'features', title: 'Engineered Features', subtitle: 'High performance by design', sort: 1 },
      { type: 'tech_specs', title: 'Technical Specifications', subtitle: 'Architected with modern industry standards', sort: 2 },
      { type: 'how_it_works', title: 'Deployment Workflow', subtitle: 'Four simple steps to go live', sort: 3 },
      { type: 'faq', title: 'Frequently Asked Questions', subtitle: 'Everything you need to know before purchasing', sort: 4 },
      { type: 'license', title: 'License & Commercial Rights', subtitle: 'Clear, transparent terms for business use', sort: 5 }
    ];
    sections.forEach(s => {
      run(
        'INSERT INTO product_sections (product_id, section_type, title, subtitle, sort_order, is_visible) VALUES (?, ?, ?, ?, ?, 1)',
        [productId, s.type, s.title, s.subtitle, s.sort]
      );
    });
  }

  save();

  console.log('--- VERIFYING FINAL CATALOG ---');
  const finalProducts = query('SELECT id, title, slug, regular_price, sale_price, status, asset_availability FROM products ORDER BY id ASC');
  console.log(`FINAL TOTAL PRODUCTS IN DATABASE: ${finalProducts.length}`);
  finalProducts.forEach(p => {
    console.log(`  [ID ${p.id}] ${p.title} | slug: ${p.slug} | Price: ₹${p.sale_price} | Availability: ${p.asset_availability}`);
  });

  if (finalProducts.length === 14) {
    console.log('\n SUCCESS: Database catalog contains EXACTLY 14 products (5 preserved + 9 new purchased products)!');
  } else {
    console.warn(`\n NOTICE: Catalog count is ${finalProducts.length} (expected 14). Please review.`);
  }
}

seedNinePurchasedProducts().catch(err => {
  console.error('Error during seeding:', err);
  process.exit(1);
});
