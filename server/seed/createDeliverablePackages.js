const fs = require('fs');
const path = require('path');

const protectedDir = path.resolve(__dirname, '../storage/protected');

if (!fs.existsSync(protectedDir)) {
  fs.mkdirSync(protectedDir, { recursive: true });
}

// 8 products with available deliverables (marketflow is Unavailable as instructed)
const packages = [
  {
    name: 'shopforge-wp-theme-package.zip',
    content: 'ShopForge WP - Premium eCommerce WordPress Theme\nReady-to-deploy digital package including theme files, child theme, demo import XML, documentation, and child theme.'
  },
  {
    name: 'shopforge-shopify-theme-package.zip',
    content: 'ShopForge Shopify - Premium Multipurpose Shopify Theme\nReady-to-deploy Liquid theme files, presets, sections, blocks, assets, and store setup documentation.'
  },
  {
    name: 'multimart-full-platform-package.zip',
    content: 'MultiMart - Grocery & Multi-Vendor Delivery Platform\nComplete source code package: Laravel Admin & API backend, Ionic Customer & Delivery mobile applications, responsive website, and database schema.'
  },
  {
    name: 'bakecraft-bakery-wordpress-theme.zip',
    content: 'BakeCraft - Premium Bakery & Food WordPress Theme\nWordPress theme zip, demo content, culinary menu layouts, custom Gutenberg blocks, and comprehensive user guide.'
  },
  {
    name: 'autohub-multivendor-car-marketplace.zip',
    content: 'AutoHub - Multi-Vendor Car Marketplace\nFull source code: vehicle directory portal, dealer management dashboard, search & filtering modules, and MySQL setup guide.'
  },
  {
    name: 'dragon-tiger-gaming-platform.zip',
    content: 'Dragon Tiger - Real-Time Gaming Platform\nReal-time multiplayer gaming server engine, frontend HTML5/Canvas client, administrative risk/game console, and compliance guide for authorized operators.'
  },
  {
    name: 'rewardrocket-flutter-platform.zip',
    content: 'RewardRocket - Rewards & Task Management Platform\nFlutter mobile app source code, PHP/Laravel administration backend, task reward engine, referral tracking, and ad network configuration guide.'
  },
  {
    name: 'servicepro-home-services-platform.zip',
    content: 'ServicePro - On-Demand Home Services Platform\nCustomer mobile application, service provider application, administrative dispatch dashboard, booking flow engine, and documentation.'
  }
];

packages.forEach(pkg => {
  const filePath = path.join(protectedDir, pkg.name);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, pkg.content, 'utf8');
    console.log(`✓ Created deliverable package: ${pkg.name}`);
  } else {
    console.log(`- Deliverable package already exists: ${pkg.name}`);
  }
});

console.log('Finished verifying deliverable packages.');
