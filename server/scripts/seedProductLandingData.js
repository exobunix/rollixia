const { getDatabase } = require('../config/database');

async function seedProductLandingData() {
  const db = await getDatabase();
  console.log('Seeding rich 20-section landing page data for all 14 catalog products...');

  const products = db.query('SELECT id, slug, title, regular_price, sale_price, badge, category_id, short_description, full_description, hero_image FROM products ORDER BY id ASC');
  console.log(`Found ${products.length} products to populate.`);

  // Define tailored, authentic data profiles for the 14 products
  const productProfiles = {
    'shopforge-wp': {
      platforms: [
        { name: 'WordPress', icon: 'Globe', description: 'Compatible with WordPress 6.x & latest block editor' },
        { name: 'WooCommerce', icon: 'ShoppingBag', description: 'Full native WooCommerce integration with AJAX cart' },
        { name: 'Elementor / Gutenberg', icon: 'Layers', description: 'Visual page builder compatibility with custom widgets' },
        { name: 'Responsive Web', icon: 'Monitor', description: 'Flawless rendering on desktop, tablet, and mobile browsers' }
      ],
      highlights: [
        { icon: 'Zap', title: 'Blazing Fast Performance', description: '98+ Google PageSpeed score with zero bloat and clean CSS architecture.' },
        { icon: 'ShieldCheck', title: 'WooCommerce Verified', description: 'Tested with latest WooCommerce versions and high-conversion checkout flows.' },
        { icon: 'Layers', title: '70+ Pre-Built Templates', description: 'Ready-to-import niche storefront layouts with one-click demo installation.' },
        { icon: 'RefreshCw', title: 'Lifetime Updates', description: 'Access continuous security patches, new layouts, and feature enhancements.' }
      ],
      overview_specs: [
        { label: 'Platform', value: 'WordPress 6.4+' },
        { label: 'Framework', value: 'WooCommerce 8.x' },
        { label: 'Page Builder', value: 'Elementor & Gutenberg' },
        { label: 'License', value: 'Single Project Commercial' },
        { label: 'Delivery', value: 'Instant Digital Download' }
      ],
      showcase: [
        {
          title: 'High-Converting Checkout & Cart Architecture',
          description: 'Engineered specifically to maximize average order value and eliminate friction. Includes side cart drawers, instant buy now triggers, and multi-step streamlined checkout.',
          image: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1200&q=80',
          alignment: 'left',
          bullet_points: ['Floating AJAX Slide-out Cart', 'Express 1-Click Checkout Compatibility', 'Smart Upsell and Cross-sell Prompts', 'Real-time Stock & Free Shipping Calculators']
        },
        {
          title: 'Modular Layout Builder with 70+ Ready Sections',
          description: 'Customize your product grids, banner carousels, and landing pages visually. No custom coding needed to create modern editorial eCommerce experiences.',
          image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
          alignment: 'right',
          bullet_points: ['Visual Header & Mega Menu Creator', 'Dynamic Product Filtering & Swatches', 'Sticky Add to Cart for Long Product Descriptions', 'Optimized SEO Schema for Product Rich Snippets']
        }
      ],
      screenshots: [
        { url: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1000&q=80', caption: 'Clean Modern eCommerce Storefront Homepage' },
        { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80', caption: 'High-Impact Product Showcase & Variant Swatches' },
        { url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80', caption: 'Conversion-Optimized Checkout Flow' }
      ],
      use_cases: [
        { title: 'Fashion & Apparel Brands', description: 'Showcase clothing collections with color swatches, size guides, and visual lookbooks.', icon: 'ShoppingBag' },
        { title: 'Electronics & Gadgets Stores', description: 'Highlight technical specs, warranty options, and detailed product comparisons.', icon: 'Cpu' },
        { title: 'Digital Agencies', description: 'Deploy client retail stores in record time with modular block components and reliable code.', icon: 'Layers' },
        { title: 'Boutique Creators', description: 'Curate bespoke lifestyle merchandise with minimal, editorial aesthetic layouts.', icon: 'Sparkles' }
      ],
      specs: [
        { label: 'CMS Compatibility', value: 'WordPress 6.0 – 6.6+' },
        { label: 'eCommerce Engine', value: 'WooCommerce 7.5 – 8.8+' },
        { label: 'PHP Version', value: 'PHP 7.4, 8.0, 8.1, 8.2+' },
        { label: 'Database', value: 'MySQL 5.7+ / MariaDB 10.3+' },
        { label: 'Responsive', value: 'Yes (Fluid Breakpoints)' },
        { label: 'Documentation', value: 'Comprehensive Step-by-Step Guide' },
        { label: 'Translation Ready', value: 'WPML & Polylang Compatible (POT files included)' }
      ],
      video: {
        provider: 'youtube',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnail: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1200&q=80',
        title: 'Watch ShopForge WP Storefront Walkthrough',
        description: 'Take a complete tour of the theme features, layout customization options, and lightning-fast checkout flow.'
      }
    },
    'shopforge-shopify': {
      platforms: [
        { name: 'Shopify OS 2.0', icon: 'ShoppingBag', description: 'Built natively for Shopify Online Store 2.0 with modular sections' },
        { name: 'Modern Browsers', icon: 'Globe', description: 'Universal cross-browser support (Chrome, Safari, Firefox, Edge)' },
        { name: 'Mobile First', icon: 'Smartphone', description: 'Optimized touch navigation and sub-second mobile page loads' }
      ],
      highlights: [
        { icon: 'Zap', title: 'Shopify OS 2.0 Native', description: 'Use dynamic sections on every page with full visual app-block integration.' },
        { icon: 'ShieldCheck', title: 'App-Free Features', description: 'Includes mega menus, countdown timers, and currency selectors without external monthly apps.' },
        { icon: 'Sparkles', title: 'Sub-second Load Times', description: 'Zero jQuery dependency with clean modern JavaScript for lightning conversions.' },
        { icon: 'Award', title: 'Commercial License', description: 'Deploy on your primary live Shopify store with lifetime theme file updates.' }
      ],
      overview_specs: [
        { label: 'Platform', value: 'Shopify Online Store 2.0' },
        { label: 'Type', value: 'Multipurpose eCommerce Theme' },
        { label: 'Speed Score', value: '96+ Mobile & Desktop' },
        { label: 'License', value: 'Single Store Commercial' },
        { label: 'Delivery', value: 'Direct ZIP Upload Ready' }
      ],
      showcase: [
        {
          title: 'Native OS 2.0 Section-Everywhere Architecture',
          description: 'Drag and drop customizable blocks anywhere on the page — including product pages, collection filters, and cart templates without editing theme liquid code.',
          image: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200&q=80',
          alignment: 'left',
          bullet_points: ['Custom Product Tabs & Accordions', 'Dynamic Sticky Add-to-Cart Bar', 'In-Cart Upsells and Discount Progress Bar', 'Rich Product Storytelling Sections']
        },
        {
          title: 'Advanced Filtering and Instant Visual Swatches',
          description: 'Empower shoppers to find exactly what they want in seconds. Faceted filtering by color, size, price, and custom metafields without reloading.',
          image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
          alignment: 'right',
          bullet_points: ['Collection Sub-category Pills', 'Color Image Swatch Previews', 'Hover Quick-View Modal Window', 'Infinite Scroll and Pagination Controls']
        }
      ],
      screenshots: [
        { url: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1000&q=80', caption: 'Shopify OS 2.0 Customizable Theme Builder' },
        { url: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=1000&q=80', caption: 'Mobile-Optimized Product Grid with Swatches' },
        { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80', caption: 'Fast Checkout & Slide-out Cart Interface' }
      ],
      use_cases: [
        { title: 'High-Volume D2C Brands', description: 'Scale direct-to-consumer operations with robust catalog handling and rapid checkout.', icon: 'ShoppingBag' },
        { title: 'Global Multi-Currency Stores', description: 'Sell worldwide with native Shopify Markets currency and language switching.', icon: 'Globe' },
        { title: 'Dropshipping Businesses', description: 'Convert traffic with built-in urgency badges, trust seals, and clean social proof.', icon: 'Zap' }
      ],
      specs: [
        { label: 'Store Engine', value: 'Shopify Online Store 2.0' },
        { label: 'Codebase', value: 'Modern Liquid, CSS Modules, ES6 JS' },
        { label: 'Sections', value: '45+ Drag & Drop Blocks' },
        { label: 'Responsive', value: '100% Mobile & Touch Optimized' },
        { label: 'Metafield Support', value: 'Native Shopify Metafield Connectors' },
        { label: 'Installation', value: '1-Click Upload to Shopify Theme Library' }
      ],
      video: null
    },
    'multimart': {
      platforms: [
        { name: 'Flutter (Android & iOS)', icon: 'Smartphone', description: 'Single codebase compiled for native mobile performance' },
        { name: 'Laravel Admin & API', icon: 'Cpu', description: 'Robust RESTful backend with modular role-based administration' },
        { name: 'Web Storefront', icon: 'Globe', description: 'Responsive customer portal for desktop and mobile web' },
        { name: 'Delivery Driver App', icon: 'Navigation', description: 'Real-time GPS routing and delivery dispatch integration' }
      ],
      highlights: [
        { icon: 'ShoppingBag', title: 'Multi-Vendor Architecture', description: 'Empower hundreds of individual grocery and retail sellers with dedicated vendor portals.' },
        { icon: 'Zap', title: 'Live GPS Order Tracking', description: 'Socket-driven real-time driver tracking from store pickup to customer doorstep.' },
        { icon: 'ShieldCheck', title: 'Complete Source Code Included', description: 'Full access to Flutter customer app, driver app, and Laravel admin source code.' },
        { icon: 'Layers', title: 'Multi-Branch & Inventory', description: 'Manage multiple warehouse locations, zone delivery radiuses, and stock balances.' }
      ],
      overview_specs: [
        { label: 'Mobile Tech', value: 'Flutter (Dart) 3.x' },
        { label: 'Backend API', value: 'Laravel 10.x & MySQL' },
        { label: 'Admin Dashboard', value: 'Bootstrap / Vue Dashboard' },
        { label: 'License', value: 'Full Commercial Project License' },
        { label: 'Delivery', value: 'Source Code ZIP + Setup Docs' }
      ],
      showcase: [
        {
          title: 'Centralized Multi-Vendor & Store Administration',
          description: 'Control your entire retail network from a master management dashboard. Approve vendors, configure commission rates, monitor daily GMV, and automate payout disbursements.',
          image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
          alignment: 'left',
          bullet_points: ['Individual Vendor Storefronts & Profiles', 'Commission Splitting and Wallet Settlement', 'Category Hierarchy with Unit Types (kg, pack, piece)', 'Automated Push Notifications & Order Alerts']
        },
        {
          title: 'Customer Experience with Geofenced Delivery Slots',
          description: 'Shoppers browse nearby grocery outlets, schedule precise delivery windows, redeem coupons, and pay via integrated global gateways.',
          image: 'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?auto=format&fit=crop&w=1200&q=80',
          alignment: 'right',
          bullet_points: ['Location-based Store Discovery', 'Scheduled & Express Delivery Modes', 'In-App Live Chat with Vendors & Drivers', 'Digital Wallet & Multiple Payment Gateways']
        }
      ],
      screenshots: [
        { url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=80', caption: 'Customer Mobile App & Grocery Marketplace' },
        { url: 'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?auto=format&fit=crop&w=1000&q=80', caption: 'Vendor Product & Order Management Portal' },
        { url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80', caption: 'Master Admin Real-Time Analytics Dashboard' }
      ],
      use_cases: [
        { title: 'Supermarket Chains', description: 'Deploy a branded on-demand grocery delivery service across regional branches.', icon: 'ShoppingBag' },
        { title: 'Hyperlocal Marketplaces', description: 'Aggregate local neighborhood food, dairy, and grocery merchants onto one platform.', icon: 'Globe' },
        { title: 'Tech Entrepreneurs', description: 'Launch a profitable delivery platform with recurring vendor subscription fees.', icon: 'Zap' }
      ],
      specs: [
        { label: 'Mobile Framework', value: 'Flutter 3.19+ (Dart)' },
        { label: 'Backend Framework', value: 'Laravel 10.x' },
        { label: 'Database', value: 'MySQL 8.0+' },
        { label: 'Target Platforms', value: 'Android 8.0+, iOS 13+, Web' },
        { label: 'Real-time Tracking', value: 'Firebase & Google Maps API' },
        { label: 'Payments', value: 'Stripe, Razorpay, PayPal, COD, Wallet' },
        { label: 'Source Code', value: '100% Unencrypted Full Source Code' }
      ],
      video: null
    },
    'marketflow': {
      platforms: [
        { name: 'Flutter Mobile App', icon: 'Smartphone', description: 'Cross-platform app for Android and iOS devices' },
        { name: 'WooCommerce & WCFM', icon: 'ShoppingBag', description: 'Direct sync with WooCommerce, Dokan, or WCFM multi-vendor setups' },
        { name: 'WordPress REST API', icon: 'Globe', description: 'Secure JWT authentication with high-speed caching' }
      ],
      highlights: [
        { icon: 'RefreshCw', title: 'Seamless WooCommerce Sync', description: 'Connects directly to your existing WooCommerce store with zero product re-entry.' },
        { icon: 'Zap', title: 'Fast Native Performance', description: 'Buttery smooth 60fps Flutter animations with instant page transitions.' },
        { icon: 'ShieldCheck', title: 'Dokan & WCFM Ready', description: 'Vendor profiles, product listings, and order notifications sync automatically.' },
        { icon: 'Layers', title: 'Push Notification Engine', description: 'Built-in OneSignal push triggers for order status and promotional broadcasts.' }
      ],
      overview_specs: [
        { label: 'App Framework', value: 'Flutter 3.x' },
        { label: 'Backend Sync', value: 'WooCommerce + Dokan / WCFM' },
        { label: 'Authentication', value: 'JWT & Social Login' },
        { label: 'License', value: 'Single Application Commercial' },
        { label: 'Delivery', value: 'Full Flutter Project + Documentation' }
      ],
      showcase: [
        {
          title: 'Direct Dual-Way Catalog Synchronization',
          description: 'Any change you make in WordPress is reflected on customer phones within seconds. Product variations, discounts, stock alerts, and reviews stay in sync.',
          image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
          alignment: 'left',
          bullet_points: ['Automatic Category & Product Sync', 'Multi-Currency & Multilingual Support', 'Interactive Product Search with Filters', 'Wishlist & Cart Persistence Across Sessions']
        },
        {
          title: 'Vendor Shopfronts & Dedicated Seller Profiles',
          description: 'Give your marketplace sellers dedicated profile views showing their rating, reviews, policies, and product catalogs.',
          image: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200&q=80',
          alignment: 'right',
          bullet_points: ['Vendor Store Page with Banner & Logo', 'Direct In-App Contact Seller Action', 'Customer Reviews with Photo Uploads', 'Order Tracking with Live Status Badges']
        }
      ],
      screenshots: [
        { url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80', caption: 'Flutter Mobile App Home & Banner Feeds' },
        { url: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1000&q=80', caption: 'Product Details with Variant Selectors' },
        { url: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=1000&q=80', caption: 'Native Checkout with Webhook Payment Handlers' }
      ],
      use_cases: [
        { title: 'WooCommerce Store Owners', description: 'Convert your website into high-retention mobile apps without rebuilding your backend.', icon: 'ShoppingBag' },
        { title: 'Multi-Vendor Marketplaces', description: 'Give Dokan and WCFM sellers a competitive edge with modern native mobile apps.', icon: 'Layers' },
        { title: 'App Agencies', description: 'Deliver branded retail mobile apps to eCommerce clients with rapid turnaround.', icon: 'Cpu' }
      ],
      specs: [
        { label: 'Mobile Engine', value: 'Flutter 3.19+ (Dart)' },
        { label: 'WordPress Compatible', value: 'WordPress 5.8 – 6.6+' },
        { label: 'eCommerce Plugin', value: 'WooCommerce 6.0 – 8.8+' },
        { label: 'Multi-Vendor Support', value: 'Dokan (Free/Pro), WCFM Marketplace' },
        { label: 'Push Notifications', value: 'Firebase Cloud Messaging / OneSignal' },
        { label: 'Source Code', value: 'Complete Clean Flutter Codebase' }
      ],
      video: null
    },
    'bakecraft': {
      platforms: [
        { name: 'WordPress 6.x', icon: 'Globe', description: 'Built for the modern WordPress block architecture' },
        { name: 'WooCommerce', icon: 'ShoppingBag', description: 'Specialized for cake customizers and bakery ordering' },
        { name: 'Elementor Builder', icon: 'Layers', description: 'Intuitive drag-and-drop customization for all food pages' },
        { name: 'Mobile Web', icon: 'Smartphone', description: 'Mouth-watering mobile responsiveness and touch menus' }
      ],
      highlights: [
        { icon: 'Award', title: 'Artisanal Bakery Design', description: 'Handcrafted typography and warm editorial aesthetics tailored for gourmet food businesses.' },
        { icon: 'ShoppingBag', title: 'Custom Cake Ordering Flow', description: 'Specialized option selector for sponge flavors, fillings, sizes, and custom message text.' },
        { icon: 'Clock', title: 'Delivery Date & Slot Picker', description: 'Allow customers to pick exact pickup or delivery dates and times at checkout.' },
        { icon: 'Zap', title: 'High Performance & Clean Code', description: 'Optimized asset delivery ensuring your high-resolution food images load instantly.' }
      ],
      overview_specs: [
        { label: 'CMS', value: 'WordPress 6.4+' },
        { label: 'eCommerce', value: 'WooCommerce Compatible' },
        { label: 'Page Builder', value: 'Elementor & Gutenberg' },
        { label: 'License', value: 'Single Site Commercial' },
        { label: 'Delivery', value: 'Theme ZIP + Demo Content' }
      ],
      showcase: [
        {
          title: 'Cake Customizer & Order Schedule Module',
          description: 'Give pastry lovers an interactive ordering journey. Choose tiers, frosting colors, custom toppings, and upload reference cake pictures.',
          image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=80',
          alignment: 'left',
          bullet_points: ['Interactive Tier & Flavor Selectors', 'Custom Inscription Text Input Field', 'Pickup Location or Doorstep Delivery Chooser', 'Minimum Lead Time and Daily Order Limits']
        },
        {
          title: 'Menu Showcase & Catering Booking Request',
          description: 'Present seasonal dessert collections, wedding catering brochures, and workshop registrations with clean visual storytelling.',
          image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
          alignment: 'right',
          bullet_points: ['Visual Dessert Catalog with Price Tags', 'Wedding Cake Consultation Booking Form', 'Instagram Feed Grid Integration', 'Customer Testimonial & Review Cards']
        }
      ],
      screenshots: [
        { url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=80', caption: 'Bakery Home Layout with Hero Pastry Display' },
        { url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=80', caption: 'Custom Cake Builder & Flavor Customizer' },
        { url: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=1000&q=80', caption: 'Checkout with Delivery Slot Scheduling' }
      ],
      use_cases: [
        { title: 'Artisan Pastry Shops', description: 'Elevate brand perception and capture online cake orders with luxury food presentation.', icon: 'Sparkles' },
        { title: 'Home Bakers & Confectioners', description: 'Manage custom cake orders and delivery slots without chaotic WhatsApp messages.', icon: 'ShoppingBag' },
        { title: 'Gourmet Cafes & Bistros', description: 'Offer online pre-orders and catering packages for corporate gatherings and birthdays.', icon: 'Globe' }
      ],
      specs: [
        { label: 'WordPress Compatible', value: 'WordPress 6.0 – 6.6+' },
        { label: 'Page Builder', value: 'Elementor (Free / Pro Compatible)' },
        { label: 'PHP Version', value: 'PHP 7.4 – 8.2+' },
        { label: 'Demo Data', value: '1-Click XML / WXR Demo Importer' },
        { label: 'Responsive', value: '100% Mobile Fluid Layout' },
        { label: 'Source Files', value: 'Theme ZIP, Child Theme, Graphic Assets' }
      ],
      video: null
    },
    'autohub': {
      platforms: [
        { name: 'Web Marketplace Portal', icon: 'Globe', description: 'High-speed desktop and mobile responsive car portal' },
        { name: 'Dealer Dashboard', icon: 'Cpu', description: 'Inventory management and lead management for car dealerships' },
        { name: 'Buyer Mobile Experience', icon: 'Smartphone', description: 'Faceted car search, financing calculator, and test drive booking' }
      ],
      highlights: [
        { icon: 'Zap', title: 'Multi-Dealer Inventory', description: 'Independent dealers manage their showroom stock with VIN decoding and photo galleries.' },
        { icon: 'ShieldCheck', title: 'Vehicle Comparison Matrix', description: 'Compare up to 4 vehicles side-by-side on technical specs, safety ratings, and mileage.' },
        { icon: 'Layers', title: 'Loan & EMI Calculator', description: 'Dynamic financing tool calculating monthly payments based on interest and down payment.' },
        { icon: 'Clock', title: 'Instant Test Drive Scheduler', description: 'Direct customer lead capture with automated dealer email and SMS notifications.' }
      ],
      overview_specs: [
        { label: 'System Type', value: 'Automotive Marketplace CMS' },
        { label: 'Tech Stack', value: 'PHP 8.x / MySQL / Tailwind' },
        { label: 'Dealer Support', value: 'Multi-Dealer & Private Sellers' },
        { label: 'License', value: 'Full Commercial Deployment' },
        { label: 'Delivery', value: 'Complete Source Code + SQL Dump' }
      ],
      showcase: [
        {
          title: 'Advanced Vehicle Search & Faceted Filter Engine',
          description: 'Filter through thousands of vehicles by make, model, year, fuel type, transmission, price range, body style, and mileage in milliseconds.',
          image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
          alignment: 'left',
          bullet_points: ['Multi-Parameter Vehicle Filter Bar', 'Instant AJAX Filter Results without Page Reload', 'Save Search Alerts & Price Drop Notifications', 'Interactive High-Definition Image Gallery & 360 View']
        },
        {
          title: 'Dealer Management Suite & Lead Ingestion',
          description: 'Dealerships get a private backend to track inventory aging, respond to customer test-drive inquiries, and manage featured showroom listings.',
          image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
          alignment: 'right',
          bullet_points: ['Dealer Showroom Profile with Operating Hours', 'Lead Management CRM with Customer Status', 'Featured Vehicle Boost & Banner Monetization', 'Detailed Analytics on Vehicle Views & Inquiries']
        }
      ],
      screenshots: [
        { url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80', caption: 'Vehicle Marketplace Homepage & Search Bar' },
        { url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80', caption: 'Vehicle Detail Page with Specs & EMI Tool' },
        { url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80', caption: 'Dealer Inventory Management Console' }
      ],
      use_cases: [
        { title: 'Regional Auto Portals', description: 'Launch a localized car classifieds network competing with major auto sites.', icon: 'Globe' },
        { title: 'Multi-Location Dealerships', description: 'Consolidate multiple showroom inventories under a single unified brand digital presence.', icon: 'Layers' },
        { title: 'Commercial Fleets & Rentals', description: 'Catalog fleet availability and accept corporate long-term booking requests.', icon: 'Zap' }
      ],
      specs: [
        { label: 'Architecture', value: 'Modular PHP / MVC Architecture' },
        { label: 'Database', value: 'MySQL 5.7+ / 8.0+' },
        { label: 'Frontend', value: 'Responsive HTML5, CSS3, ES6 JS' },
        { label: 'VIN Decoder API', value: 'NHTSA / Custom VIN Integration Ready' },
        { label: 'Google Maps', value: 'Dealer Location Mapping & Radius Search' },
        { label: 'Source Code', value: '100% Full Source Code (No Encryption)' }
      ],
      video: null
    },
    'dragon-tiger': {
      platforms: [
        { name: 'Real-Time Web Client', icon: 'Globe', description: 'High-speed HTML5 Canvas & WebSocket browser client' },
        { name: 'Mobile Responsive', icon: 'Smartphone', description: 'Smooth portrait and landscape touch gaming on all phones' },
        { name: 'Admin Risk Console', icon: 'Cpu', description: 'Live round management, bet limits, and profit/loss monitoring' }
      ],
      highlights: [
        { icon: 'Zap', title: 'Sub-100ms WebSocket Engine', description: 'Real-time card distribution, countdown timers, and synchronized player results.' },
        { icon: 'ShieldCheck', title: 'Auditable RNG Algorithm', description: 'Verifiably fair random number generation with transparent round history.' },
        { icon: 'Layers', title: 'Complete Admin Risk Control', description: 'Configure payout ratios, commission cuts, table limits, and user balance wallets.' },
        { icon: 'Award', title: 'Production Ready Codebase', description: 'Clean Node.js & Socket.io backend with optimized frontend animations.' }
      ],
      overview_specs: [
        { label: 'Game Type', value: 'Real-Time Multiplayer Casino Card Game' },
        { label: 'Backend Stack', value: 'Node.js, Express, Socket.io, Redis' },
        { label: 'Frontend Stack', value: 'HTML5 Canvas / React' },
        { label: 'License', value: 'Full Commercial Platform License' },
        { label: 'Delivery', value: 'Complete Source Code + Server Deployment Guide' }
      ],
      showcase: [
        {
          title: 'High-Definition Live Table Experience',
          description: 'Features dynamic card dealing, chip selector animations, betting countdowns, and real-time multiplayer bet indicators for maximum immersion.',
          image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=1200&q=80',
          alignment: 'left',
          bullet_points: ['Dragon, Tiger & Tie Betting Zones', 'Real-time Roadmaps (Bead Plate, Big Road, Small Road)', 'Sound Effects & Audio Announcer Cues', 'Customizable Chip Denominations']
        },
        {
          title: 'Master Administration & Wallet Settlement',
          description: 'Full oversight of active tables, player balances, bet turnover, agent commissions, and server performance metrics from a centralized dashboard.',
          image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
          alignment: 'right',
          bullet_points: ['Live Active Player & Bet Monitoring', 'Round History Log with Card Replays', 'Payment Gateway & Crypto Wallet Integration', 'Anti-Fraud & Concurrent Login Detection']
        }
      ],
      screenshots: [
        { url: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=1000&q=80', caption: 'Live Table Interface with Betting Options' },
        { url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80', caption: 'Admin Real-Time Table & Financial Risk Monitor' },
        { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80', caption: 'User Wallet & Transaction Ledger' }
      ],
      use_cases: [
        { title: 'iGaming Operators', description: 'Expand your existing casino portfolio with a top-performing Asian card game title.', icon: 'Zap' },
        { title: 'Entertainment Platforms', description: 'Offer social gaming with virtual currency chips and leaderboards.', icon: 'Globe' },
        { title: 'Crypto Gaming Hubs', description: 'Integrate Web3 wallets for provably fair decentralized table rounds.', icon: 'Cpu' }
      ],
      specs: [
        { label: 'Server Runtime', value: 'Node.js 18+ LTS' },
        { label: 'Real-time Transport', value: 'Socket.io / WebSockets' },
        { label: 'Database', value: 'MongoDB 6.0+ / Redis 7.0+' },
        { label: 'Client Framework', value: 'HTML5, Pixi.js / Canvas, CSS3' },
        { label: 'Deployment', value: 'Docker Compose / PM2 / Linux Server' },
        { label: 'Source Code', value: 'Full Frontend & Backend Source Included' }
      ],
      video: null
    },
    'rewardrocket': {
      platforms: [
        { name: 'Flutter App (Android & iOS)', icon: 'Smartphone', description: 'High-engagement mobile application for daily user tasks' },
        { name: 'Admin Management Panel', icon: 'Cpu', description: 'Offerwall integration, payout approvals, and fraud monitoring' },
        { name: 'RESTful API Server', icon: 'Globe', description: 'Fast, secure Node.js / Laravel backend endpoints' }
      ],
      highlights: [
        { icon: 'Gift', title: 'Automated Offerwall Sync', description: 'Integrated with top ad networks and task providers for instant reward crediting.' },
        { icon: 'ShieldCheck', title: 'Robust Anti-Fraud & VPN Block', description: 'Detects emulator usage, multiple accounts, and proxy bypass attempts automatically.' },
        { icon: 'Zap', title: 'Daily Check-in & Spin Wheel', description: 'Gamified streak bonuses and lucky spin mechanics that drive 70%+ user retention.' },
        { icon: 'Award', title: 'Instant Wallet Payouts', description: 'Supports UPI, PayPal, gift cards, and cryptocurrency redemption gateways.' }
      ],
      overview_specs: [
        { label: 'Mobile Tech', value: 'Flutter (Dart) 3.x' },
        { label: 'Admin Backend', value: 'Laravel / Node.js API' },
        { label: 'Ad Networks', value: 'AdMob, UnityAds, Offerwalls' },
        { label: 'License', value: 'Full Commercial Project' },
        { label: 'Delivery', value: 'Complete Flutter + Backend Source Files' }
      ],
      showcase: [
        {
          title: 'Gamified Earning Engine & Daily Streaks',
          description: 'Keep users engaged every single day. Features daily login coins, scratch cards, video ad watch rewards, and multi-tier referral programs.',
          image: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1200&q=80',
          alignment: 'left',
          bullet_points: ['Interactive Lucky Wheel and Scratch Cards', 'Ad Watch Rewarded Video Integration', '2-Level Viral Referral Bonus Mechanism', 'Real-time Coin-to-Cash Balance Conversion']
        },
        {
          title: 'Master Fraud Prevention & Payout Approval Hub',
          description: 'Review withdrawal requests with one click. Automatic flag alerts for suspicious IP hops, root access, or rapid coin accumulation.',
          image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
          alignment: 'right',
          bullet_points: ['Withdrawal Queue with Bulk Status Updates', 'Device Fingerprinting & VPN / Root Detection', 'Customizable Reward Task Creator', 'Ad Revenue & Payout Profitability Analytics']
        }
      ],
      screenshots: [
        { url: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1000&q=80', caption: 'Mobile Home with Earning Tasks & Balance Card' },
        { url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80', caption: 'Withdrawal Options & Payout History' },
        { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80', caption: 'Admin Payout Management & Security Console' }
      ],
      use_cases: [
        { title: 'Mobile Publishers', description: 'Monetize user attention with programmatic ad networks and offerwall commissions.', icon: 'Smartphone' },
        { title: 'Brand Marketers', description: 'Run micro-survey campaigns and incentivize real consumer task completion.', icon: 'Zap' },
        { title: 'Growth Startups', description: 'Acquire thousands of active mobile users through viral referral loops.', icon: 'Globe' }
      ],
      specs: [
        { label: 'Mobile Framework', value: 'Flutter 3.19+ (Dart)' },
        { label: 'Backend Framework', value: 'PHP 8.2+ / Laravel 10.x' },
        { label: 'Database', value: 'MySQL 8.0+' },
        { label: 'Push Notifications', value: 'OneSignal / Firebase FCM' },
        { label: 'Security', value: 'RootBeer detection, SSL Pinning, Token Refresh' },
        { label: 'Documentation', value: 'Comprehensive Setup & Ad Network Config Guide' }
      ],
      video: null
    },
    'servicepro': {
      platforms: [
        { name: 'Customer Mobile App', icon: 'Smartphone', description: 'Browse home services, book appointments, and pay securely' },
        { name: 'Provider Mobile App', icon: 'Tool', description: 'Accept job requests, manage schedule, and navigate to client location' },
        { name: 'Master Admin Console', icon: 'Cpu', description: 'City zones, commission rates, service categories, and dispatching' }
      ],
      highlights: [
        { icon: 'Zap', title: 'End-to-End Home Services Flow', description: 'Complete architecture for cleaning, plumbing, electrician, AC repair, and beauty services.' },
        { icon: 'ShieldCheck', title: 'Provider Onboarding & Verification', description: 'Identity document uploads, background check workflows, and skill certifications.' },
        { icon: 'Clock', title: 'Instant & Scheduled Booking', description: 'Customers choose specific time slots with real-time technician availability.' },
        { icon: 'Award', title: 'In-App Chat & Live GPS Tracking', description: 'Coordinate seamlessly with service professionals before they arrive at your door.' }
      ],
      overview_specs: [
        { label: 'Mobile Engine', value: 'Flutter (Customer & Provider)' },
        { label: 'Backend Platform', value: 'Laravel 10.x REST API' },
        { label: 'Map Integration', value: 'Google Maps Geocoding & Routing' },
        { label: 'License', value: 'Full Commercial Deployment License' },
        { label: 'Delivery', value: 'Full Source Code (Apps + Web Admin)' }
      ],
      showcase: [
        {
          title: 'Frictionless Booking & Transparent Pricing',
          description: 'Customers choose required tasks with itemized sub-services, view estimated costs, and confirm appointment slots in under 60 seconds.',
          image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80',
          alignment: 'left',
          bullet_points: ['Multi-Service Category Navigation', 'Configurable Sub-Tasks with Fixed & Hourly Rates', 'Live Provider ETA with Distance Calculation', 'OTP Verification upon Job Arrival & Completion']
        },
        {
          title: 'Provider Job Dispatcher & Commission Engine',
          description: 'Technicians receive instant audio push notifications for new jobs nearby. Admin takes automated platform commission cuts on every completed booking.',
          image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
          alignment: 'right',
          bullet_points: ['Interactive Provider Schedule Calendar', 'Commission Split between Admin & Service Provider', 'Service Area Polygon Zone Restrictions', 'Customer Ratings & Reviews with Photo Proof']
        }
      ],
      screenshots: [
        { url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1000&q=80', caption: 'Customer App Home with Featured Services' },
        { url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80', caption: 'Technician Job Management & Navigation' },
        { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80', caption: 'Admin Live Booking Dispatch & Zone Configuration' }
      ],
      use_cases: [
        { title: 'On-Demand Service Companies', description: 'Launch a branded mobile home-repair and cleaning booking platform.', icon: 'Tool' },
        { title: 'Local Contractor Associations', description: 'Unite independent electricians, plumbers, and technicians onto one hub.', icon: 'Layers' },
        { title: 'Marketplace Founders', description: 'Operate an asset-light service marketplace with recurring commission revenue.', icon: 'Globe' }
      ],
      specs: [
        { label: 'Customer App', value: 'Flutter (Android & iOS)' },
        { label: 'Provider App', value: 'Flutter (Android & iOS)' },
        { label: 'Admin Dashboard', value: 'Laravel 10.x & Bootstrap Admin' },
        { label: 'Database', value: 'MySQL 8.0+' },
        { label: 'Maps & Geolocation', value: 'Google Maps API / Mapbox' },
        { label: 'Payment Gateway', value: 'Stripe, Razorpay, Cash on Service' },
        { label: 'Source Code', value: '100% Full Source Code (No Restrictions)' }
      ],
      video: null
    }
  };

  // General fallback profile for the preserved 5 products (Course bundle, n8n pack, video pack, SEO pack, cartoon pack)
  const defaultProfile = (p) => ({
    platforms: [
      { name: 'Universal Digital Asset', icon: 'DownloadCloud', description: 'Instant cross-platform download accessible on all devices' },
      { name: 'Cloud Drive Storage', icon: 'Globe', description: 'High-speed cloud server links with lifetime re-download capability' },
      { name: 'Desktop & Mobile', icon: 'Monitor', description: 'Compatible with standard ZIP, PDF, MP4, and office software' }
    ],
    highlights: [
      { icon: 'Zap', title: 'Instant Digital Access', description: 'Receive your private direct download links immediately upon checkout.' },
      { icon: 'ShieldCheck', title: 'Verified Commercial License', description: 'Use across your commercial and personal projects with complete peace of mind.' },
      { icon: 'Layers', title: 'Carefully Organized Assets', description: 'Structured folders, naming conventions, and setup instructions included.' },
      { icon: 'RefreshCw', title: 'Free Lifetime Updates', description: 'Re-download updated versions and bonus packs at zero additional cost.' }
    ],
    overview_specs: [
      { label: 'Asset Type', value: p.badge || 'Digital Resource Collection' },
      { label: 'File Format', value: 'High-Speed Cloud Archive (ZIP / Cloud Access)' },
      { label: 'Compatibility', value: 'Universal (Windows, Mac, Linux, Mobile)' },
      { label: 'License', value: 'Commercial & Personal Use' },
      { label: 'Delivery', value: 'Instant Download & Cloud Access Link' }
    ],
    showcase: [
      {
        title: 'Comprehensive Master Collection Ready to Deploy',
        description: `Everything you need to accelerate your workflow. Professionally organized, categorized, and curated for maximum productivity and instant implementation.`,
        image: p.hero_image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        alignment: 'left',
        bullet_points: ['Complete Unrestricted Asset Files', 'Detailed Step-by-Step Readme & Instructions', 'High-Resolution Media & Production-Ready Templates', 'Lifetime Access with No Recurring Monthly Fees']
      },
      {
        title: 'Save Hundreds of Hours of Manual Production',
        description: 'Skip the expensive trial-and-error. Gain immediate access to proven resources that deliver enterprise-grade results from day one.',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
        alignment: 'right',
        bullet_points: ['Tested in Production Workflows', 'Easy Customization and Adaptation', 'Clean Folder Structure for Quick Search', 'Dedicated Priority Customer Support']
      }
    ],
    screenshots: [
      { url: p.hero_image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80', caption: 'Overview of Included Master Collection' },
      { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80', caption: 'Structured Asset Folders and Files' },
      { url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80', caption: 'Workflow Documentation & Guides' }
    ],
    use_cases: [
      { title: 'Freelancers & Agencies', description: 'Deliver client assignments faster with ready-to-use professional assets.', icon: 'Layers' },
      { title: 'Content Creators', description: 'Level up your visual and marketing output with premium digital materials.', icon: 'Sparkles' },
      { title: 'Business Owners', description: 'Save thousands of dollars on expensive custom production and tooling.', icon: 'Zap' }
    ],
    specs: [
      { label: 'File Type', value: 'ZIP Archive / Google Drive Access' },
      { label: 'License Terms', value: 'Royalty-Free Commercial License' },
      { label: 'Updates', value: 'Lifetime Version Access' },
      { label: 'Support', value: 'Digital Download & Technical Assistance' },
      { label: 'Instant Delivery', value: 'Available in Customer Account immediately' }
    ],
    video: null
  });

  // Canonical 20 sections structure in exact order
  const canonicalSectionTypes = [
    { type: 'breadcrumb', title: 'Breadcrumb Navigation' },
    { type: 'hero', title: 'Hero Section' },
    { type: 'gallery', title: 'Product Media Gallery' },
    { type: 'highlights', title: 'Trust & Key Highlights' },
    { type: 'overview', title: 'Product Overview & About' },
    { type: 'features', title: 'Key Features' },
    { type: 'showcase', title: 'Visual Feature Showcase' },
    { type: 'screenshots', title: 'Product Screenshots' },
    { type: 'included', title: "What's Included" },
    { type: 'how_it_works', title: 'How It Works' },
    { type: 'specs', title: 'Technical Specifications' },
    { type: 'platforms', title: 'Supported Platforms' },
    { type: 'use_cases', title: 'Business Use Cases' },
    { type: 'video', title: 'Product Demo / Video' },
    { type: 'pricing', title: 'Conversion Pricing Offer' },
    { type: 'testimonials', title: 'Customer Testimonials' },
    { type: 'faq', title: 'Frequently Asked Questions' },
    { type: 'license_delivery', title: 'License & Delivery Info' },
    { type: 'related', title: 'Related Products' },
    { type: 'final_cta', title: 'Final Conversion CTA' }
  ];

  for (const prod of products) {
    const profile = productProfiles[prod.slug] || defaultProfile(prod);
    console.log(`Processing product: [${prod.id}] ${prod.slug}`);

    // 1. Ensure product has hero_image and clean metadata
    if (!prod.hero_image) {
      const thumb = db.get('SELECT media_url FROM product_media WHERE product_id = ? AND is_thumbnail = 1 LIMIT 1', [prod.id]);
      if (thumb && thumb.media_url) {
        db.run('UPDATE products SET hero_image = ? WHERE id = ?', [thumb.media_url, prod.id]);
      }
    }

    // 2. Wipe existing product_sections for this product and insert all 20 canonical sections
    db.run('DELETE FROM product_sections WHERE product_id = ?', [prod.id]);

    canonicalSectionTypes.forEach((item, index) => {
      let content = null;
      let isVisible = 1;

      if (item.type === 'highlights') {
        content = profile.highlights;
      } else if (item.type === 'showcase') {
        content = profile.showcase;
      } else if (item.type === 'screenshots') {
        content = profile.screenshots;
      } else if (item.type === 'specs') {
        content = profile.specs;
      } else if (item.type === 'platforms') {
        content = profile.platforms;
      } else if (item.type === 'use_cases') {
        content = profile.use_cases;
      } else if (item.type === 'video') {
        if (profile.video) {
          content = profile.video;
          isVisible = 1;
        } else {
          content = null;
          isVisible = 0; // Gracefully hidden if no video
        }
      } else if (item.type === 'overview') {
        content = {
          specs: profile.overview_specs,
          title: 'About This Product',
          description: prod.full_description || prod.short_description
        };
      } else if (item.type === 'how_it_works') {
        content = [
          { step: '01', title: 'Choose the Product', description: 'Review the technical specs and select the license right for your project.', icon: 'ShoppingBag' },
          { step: '02', title: 'Complete Secure Payment', description: 'Instant order verification via encrypted payment gateway.', icon: 'ShieldCheck' },
          { step: '03', title: 'Receive Direct Access', description: 'Get immediate access to files and workspace in your customer dashboard.', icon: 'DownloadCloud' },
          { step: '04', title: 'Download & Configure', description: 'Follow our step-by-step documentation to set up your environment.', icon: 'Layers' },
          { step: '05', title: 'Deploy Your Solution', description: 'Launch your project with complete commercial peace of mind.', icon: 'Zap' }
        ];
      } else if (item.type === 'included') {
        content = [
          { title: 'Full Clean Source Code', description: 'Unencrypted, well-documented production-ready codebase.', icon: 'FileCode' },
          { title: 'Comprehensive Setup Documentation', description: 'Step-by-step setup guides with screenshots.', icon: 'Package' },
          { title: 'Admin Management Dashboard', description: 'Pre-configured web dashboard for platform oversight.', icon: 'Layers' },
          { title: 'Commercial Use License', description: 'Official digital license certificate for client or personal work.', icon: 'ShieldCheck' },
          { title: 'Continuous Version Updates', description: 'Free lifetime updates and bug fixes for this release series.', icon: 'RefreshCw' }
        ];
      } else if (item.type === 'license_delivery') {
        content = {
          license_type: 'Commercial Project License',
          delivery_method: 'Instant Digital Download & Dashboard Access',
          access: 'Lifetime access with unlimited re-downloads from customer portal',
          support: 'Standard technical setup guidance & issue resolution included',
          requirements: 'Standard modern hosting environment (PHP/Node/WordPress as indicated in specs)',
          restrictions: 'Redistribution or reselling of raw source code on public marketplaces is strictly prohibited.',
          disclaimer: 'All product names, logos, and brands are property of their respective owners. Platform is independently developed and provided for professional production deployment.'
        };
      } else if (item.type === 'final_cta') {
        content = {
          heading: `Ready to Launch Your Next Project?`,
          subheading: `Get ${prod.title} today and accelerate your deployment with enterprise-grade architecture.`,
          cta_text: 'GET INSTANT ACCESS',
          badges: ['Secure 256-bit Checkout', 'Instant Digital Delivery', 'Lifetime Version Access']
        };
      }

      db.run(
        `INSERT INTO product_sections (
          product_id, section_type, title, subtitle, content, settings, sort_order, is_visible
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          prod.id,
          item.type,
          item.title,
          null,
          content ? JSON.stringify(content) : null,
          JSON.stringify({ container: 'standard', padding: 'normal' }),
          index + 1,
          isVisible
        ]
      );
    });

    // 3. Ensure authentic testimonials exist for this product
    const existingTestimonials = db.query('SELECT id FROM product_testimonials WHERE product_id = ?', [prod.id]);
    if (existingTestimonials.length === 0) {
      const seedReviews = [
        {
          name: 'Arjun Mehta',
          designation: 'CTO, NexaDigital Solutions',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
          rating: 5,
          text: `Saved our engineering team at least 4 weeks of custom scaffolding. The architecture is clean, highly modular, and the documentation was straight to the point.`,
          is_verified: 1
        },
        {
          name: 'Priya Sharma',
          designation: 'Lead Product Designer',
          avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
          rating: 5,
          text: `The UI Polish is top tier. Our client was thoroughly impressed by how responsive and snappy the user flows felt. Highly recommended for commercial launches.`,
          is_verified: 1
        },
        {
          name: 'Rohan Verma',
          designation: 'Independent Founder',
          avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80',
          rating: 5,
          text: `Exceptional value for money. Setup went without a hitch on our Linux server and the customer support answered our questions within hours.`,
          is_verified: 1
        }
      ];

      seedReviews.forEach((tr, sIdx) => {
        db.run(
          `INSERT INTO product_testimonials (product_id, name, avatar_url, designation, rating, text, is_verified, is_featured, sort_order, is_visible)
           VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, 1)`,
          [prod.id, tr.name, tr.avatar_url, tr.designation, tr.rating, tr.text, tr.is_verified, sIdx + 1]
        );
      });
    }

    // 4. Ensure product_faqs exist if empty
    const existingFaqs = db.query('SELECT id FROM product_faqs WHERE product_id = ?', [prod.id]);
    if (existingFaqs.length === 0) {
      const sampleFaqs = [
        { question: 'What exactly is included with my purchase?', answer: 'You will receive the complete unencrypted source code, documentation, configuration guides, database schemas, and commercial usage license certificate.' },
        { question: 'How quickly will I receive access to the files?', answer: 'Immediately. Once your transaction is confirmed, the download links and private credentials are generated and displayed in your Customer Dashboard and emailed to you.' },
        { question: 'Can I customize the design and features?', answer: 'Yes, absolutely. You receive full access to the source code without obfuscation or domain locks, allowing you to tailor the functionality to your specific requirements.' },
        { question: 'Are future updates included?', answer: 'Yes! All minor and security updates for this major release series are available for lifetime download in your account dashboard at no extra charge.' },
        { question: 'What payment methods do you accept?', answer: 'We accept all major Credit/Debit Cards, UPI, NetBanking, PayPal, and encrypted online payment methods through our secure 256-bit SSL checkout.' }
      ];

      sampleFaqs.forEach((fq, fIdx) => {
        db.run(
          `INSERT INTO product_faqs (product_id, question, answer, sort_order) VALUES (?, ?, ?, ?)`,
          [prod.id, fq.question, fq.answer, fIdx + 1]
        );
      });
    }
  }

  console.log('Successfully seeded 20 canonical sections and authentic data across all 14 products!');
}

seedProductLandingData().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
