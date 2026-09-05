const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'storage', 'public', 'products');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const artworks = [
  {
    filename: 'shopforge-wp-cover.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0b0f19" />
      <stop offset="50%" stop-color="#111827" />
      <stop offset="100%" stop-color="#1e1b4b" />
    </linearGradient>
    <linearGradient id="primaryGlow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#6366f1" />
      <stop offset="100%" stop-color="#a855f7" />
    </linearGradient>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="rgba(30, 41, 59, 0.9)" />
      <stop offset="100%" stop-color="rgba(15, 23, 42, 0.95)" />
    </linearGradient>
  </defs>
  <rect width="1200" height="675" fill="url(#bg)" />
  <circle cx="950" cy="200" r="300" fill="#6366f1" opacity="0.12" filter="blur(80px)" />
  <circle cx="250" cy="500" r="250" fill="#a855f7" opacity="0.1" filter="blur(80px)" />
  
  <!-- Left Content -->
  <g transform="translate(80, 140)">
    <rect width="180" height="32" rx="16" fill="rgba(99, 102, 241, 0.15)" stroke="#6366f1" stroke-width="1.5" />
    <text x="90" y="21" fill="#818cf8" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="800" text-anchor="middle" letter-spacing="1.5">WORDPRESS THEME</text>
    
    <text x="0" y="90" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="52" font-weight="900" letter-spacing="-1">ShopForge WP</text>
    <text x="0" y="135" fill="url(#primaryGlow)" font-family="'Outfit', sans-serif" font-size="28" font-weight="700">Premium eCommerce WordPress Theme</text>
    
    <text x="0" y="185" fill="#94a3b8" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="400">Ultra High-Converting Storefront • Elementor &amp; Block Ready</text>
    <text x="0" y="215" fill="#94a3b8" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="400">Mobile-First Architecture • Instant Ajax Cart • Clean Code</text>

    <!-- Value Badges -->
    <g transform="translate(0, 260)">
      <rect width="130" height="36" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" />
      <text x="65" y="23" fill="#f8fafc" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="700" text-anchor="middle">⚡ Blazing Fast</text>
      
      <rect x="145" width="145" height="36" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" />
      <text x="217" y="23" fill="#f8fafc" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="700" text-anchor="middle">🛍️ 30+ Shop Layouts</text>

      <rect x="305" width="140" height="36" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" />
      <text x="375" y="23" fill="#f8fafc" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="700" text-anchor="middle">♾️ Lifetime Updates</text>
    </g>
  </g>

  <!-- Right Visual Mockup Cards -->
  <g transform="translate(680, 100)">
    <!-- Browser Mockup Window -->
    <rect width="450" height="340" rx="16" fill="url(#cardGrad)" stroke="rgba(255, 255, 255, 0.15)" stroke-width="1.5" />
    <circle cx="25" cy="20" r="5" fill="#ef4444" />
    <circle cx="42" cy="20" r="5" fill="#f59e0b" />
    <circle cx="59" cy="20" r="5" fill="#10b981" />
    <rect x="85" y="12" width="280" height="16" rx="8" fill="rgba(255,255,255,0.08)" />

    <!-- Store Preview Elements -->
    <rect x="25" y="45" width="185" height="120" rx="10" fill="#1e293b" />
    <rect x="35" y="130" width="100" height="12" rx="4" fill="#6366f1" />
    <rect x="35" y="148" width="60" height="8" rx="3" fill="#94a3b8" />

    <rect x="235" y="45" width="185" height="120" rx="10" fill="#1e293b" />
    <rect x="245" y="130" width="100" height="12" rx="4" fill="#a855f7" />
    <rect x="245" y="148" width="60" height="8" rx="3" fill="#94a3b8" />

    <rect x="25" y="185" width="395" height="125" rx="10" fill="rgba(99, 102, 241, 0.08)" stroke="rgba(99, 102, 241, 0.25)" />
    <text x="45" y="225" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="18" font-weight="700">Conversion-Optimized Checkout</text>
    <text x="45" y="255" fill="#94a3b8" font-family="'Plus Jakarta Sans', sans-serif" font-size="13">One-page checkout, sales countdown timers &amp; bundle upsell widgets.</text>

    <!-- Floating Mobile Badge -->
    <g transform="translate(280, 240)">
      <rect width="180" height="180" rx="20" fill="#0f172a" stroke="#6366f1" stroke-width="2" filter="drop-shadow(0 15px 30px rgba(0,0,0,0.6))" />
      <text x="90" y="55" fill="#10b981" font-size="28" text-anchor="middle">✓</text>
      <text x="90" y="95" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="16" font-weight="800" text-anchor="middle">100% Mobile Score</text>
      <text x="90" y="125" fill="#818cf8" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" text-anchor="middle">Google Core Web Vitals</text>
    </g>
  </g>
</svg>`
  },
  {
    filename: 'shopforge-shopify-cover.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
  <defs>
    <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06121e" />
      <stop offset="50%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#042f2e" />
    </linearGradient>
    <linearGradient id="shopifyGreen" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
  </defs>
  <rect width="1200" height="675" fill="url(#bg2)" />
  <circle cx="1000" cy="180" r="280" fill="#10b981" opacity="0.12" filter="blur(90px)" />
  <circle cx="200" cy="500" r="220" fill="#06b6d4" opacity="0.1" filter="blur(90px)" />
  
  <g transform="translate(80, 140)">
    <rect width="160" height="32" rx="16" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" stroke-width="1.5" />
    <text x="80" y="21" fill="#34d399" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="800" text-anchor="middle" letter-spacing="1.5">SHOPIFY THEME</text>
    
    <text x="0" y="90" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="52" font-weight="900" letter-spacing="-1">ShopForge Shopify</text>
    <text x="0" y="135" fill="url(#shopifyGreen)" font-family="'Outfit', sans-serif" font-size="28" font-weight="700">Premium Multipurpose Shopify Theme</text>
    
    <text x="0" y="185" fill="#94a3b8" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="400">Shopify Online Store 2.0 • Drag &amp; Drop Sections Everywhere</text>
    <text x="0" y="215" fill="#94a3b8" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="400">Built-In Product Filters • Pre-Order Engine • Mega Menu</text>

    <g transform="translate(0, 260)">
      <rect width="140" height="36" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" />
      <text x="70" y="23" fill="#f8fafc" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="700" text-anchor="middle">⚡ OS 2.0 Native</text>
      
      <rect x="155" width="150" height="36" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" />
      <text x="230" y="23" fill="#f8fafc" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="700" text-anchor="middle">🎨 45+ Presets</text>

      <rect x="320" width="140" height="36" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" />
      <text x="390" y="23" fill="#f8fafc" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="700" text-anchor="middle">🛡️ Verified Assets</text>
    </g>
  </g>

  <g transform="translate(680, 110)">
    <rect width="450" height="380" rx="20" fill="rgba(15, 23, 42, 0.9)" stroke="rgba(16, 185, 129, 0.3)" stroke-width="2" />
    <rect x="30" y="30" width="390" height="170" rx="12" fill="#1e293b" />
    <text x="50" y="80" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="24" font-weight="800">Shopify 2.0 Full Suite</text>
    <text x="50" y="115" fill="#34d399" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="700">Save $2,000/year on 3rd party Shopify apps</text>
    <text x="50" y="145" fill="#94a3b8" font-family="'Plus Jakarta Sans', sans-serif" font-size="13">Native swatches, countdowns, stock counters &amp; quick view.</text>
    
    <g transform="translate(30, 220)">
      <rect width="185" height="130" rx="10" fill="rgba(16, 185, 129, 0.1)" stroke="rgba(16, 185, 129, 0.25)" />
      <text x="20" y="45" fill="#34d399" font-size="24">🛒</text>
      <text x="20" y="80" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="15" font-weight="700">Dynamic Cart Drawer</text>
      <text x="20" y="105" fill="#94a3b8" font-size="12">Free shipping motivator</text>
    </g>

    <g transform="translate(235, 220)">
      <rect width="185" height="130" rx="10" fill="rgba(6, 182, 212, 0.1)" stroke="rgba(6, 182, 212, 0.25)" />
      <text x="20" y="45" fill="#06b6d4" font-size="24">📈</text>
      <text x="20" y="80" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="15" font-weight="700">High ROAS Layouts</text>
      <text x="20" y="105" fill="#94a3b8" font-size="12">Engineered for DTC brands</text>
    </g>
  </g>
</svg>`
  },
  {
    filename: 'multimart-cover.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
  <defs>
    <linearGradient id="bg3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#14532d" />
      <stop offset="100%" stop-color="#022c22" />
    </linearGradient>
    <linearGradient id="multiGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#22c55e" />
      <stop offset="100%" stop-color="#eab308" />
    </linearGradient>
  </defs>
  <rect width="1200" height="675" fill="url(#bg3)" />
  <circle cx="950" cy="200" r="300" fill="#22c55e" opacity="0.12" filter="blur(80px)" />
  
  <g transform="translate(80, 140)">
    <rect width="210" height="32" rx="16" fill="rgba(34, 197, 94, 0.15)" stroke="#22c55e" stroke-width="1.5" />
    <text x="105" y="21" fill="#4ade80" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="800" text-anchor="middle" letter-spacing="1.5">GROCERY &amp; DELIVERY PLATFORM</text>
    
    <text x="0" y="90" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="52" font-weight="900" letter-spacing="-1">MultiMart</text>
    <text x="0" y="135" fill="url(#multiGrad)" font-family="'Outfit', sans-serif" font-size="28" font-weight="700">Grocery &amp; Multi-Vendor Delivery Platform</text>
    
    <text x="0" y="185" fill="#94a3b8" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="400">Android &amp; iOS Apps + Customer Web + Vendor &amp; Admin Hub</text>
    <text x="0" y="215" fill="#94a3b8" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="400">Ionic + Laravel Architecture • Live Order Dispatch System</text>

    <g transform="translate(0, 260)">
      <rect width="140" height="36" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" />
      <text x="70" y="23" fill="#f8fafc" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="700" text-anchor="middle">📱 iOS &amp; Android</text>
      
      <rect x="155" width="140" height="36" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" />
      <text x="225" y="23" fill="#f8fafc" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="700" text-anchor="middle">🏬 Vendor Portal</text>

      <rect x="310" width="140" height="36" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" />
      <text x="380" y="23" fill="#f8fafc" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="700" text-anchor="middle">🚀 Full Source Code</text>
    </g>
  </g>

  <g transform="translate(700, 110)">
    <rect width="420" height="380" rx="20" fill="rgba(15, 23, 42, 0.95)" stroke="rgba(34, 197, 94, 0.3)" stroke-width="2" />
    <text x="30" y="50" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="20" font-weight="800">4-in-1 Platform Suite</text>
    
    <g transform="translate(30, 80)">
      <rect width="170" height="120" rx="10" fill="#1e293b" />
      <text x="15" y="40" fill="#22c55e" font-size="20">📱</text>
      <text x="15" y="70" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="14" font-weight="700">Customer Apps</text>
      <text x="15" y="95" fill="#94a3b8" font-size="11">Ionic iOS &amp; Android</text>
    </g>

    <g transform="translate(220, 80)">
      <rect width="170" height="120" rx="10" fill="#1e293b" />
      <text x="15" y="40" fill="#eab308" font-size="20">🛵</text>
      <text x="15" y="70" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="14" font-weight="700">Driver &amp; Delivery</text>
      <text x="15" y="95" fill="#94a3b8" font-size="11">Real-time status</text>
    </g>

    <g transform="translate(30, 220)">
      <rect width="170" height="120" rx="10" fill="#1e293b" />
      <text x="15" y="40" fill="#3b82f6" font-size="20">🏪</text>
      <text x="15" y="70" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="14" font-weight="700">Vendor Manager</text>
      <text x="15" y="95" fill="#94a3b8" font-size="11">Stock &amp; payouts</text>
    </g>

    <g transform="translate(220, 220)">
      <rect width="170" height="120" rx="10" fill="#1e293b" />
      <text x="15" y="40" fill="#a855f7" font-size="20">⚙️</text>
      <text x="15" y="70" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="14" font-weight="700">Super Admin</text>
      <text x="15" y="95" fill="#94a3b8" font-size="11">Laravel backend</text>
    </g>
  </g>
</svg>`
  },
  {
    filename: 'marketflow-cover.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
  <defs>
    <linearGradient id="bg4" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#311042" />
      <stop offset="100%" stop-color="#1e1b4b" />
    </linearGradient>
    <linearGradient id="purpGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#c084fc" />
      <stop offset="100%" stop-color="#f472b6" />
    </linearGradient>
  </defs>
  <rect width="1200" height="675" fill="url(#bg4)" />
  <circle cx="950" cy="200" r="300" fill="#c084fc" opacity="0.12" filter="blur(80px)" />
  
  <g transform="translate(80, 140)">
    <rect width="220" height="32" rx="16" fill="rgba(192, 132, 252, 0.15)" stroke="#c084fc" stroke-width="1.5" />
    <text x="110" y="21" fill="#e879f9" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="800" text-anchor="middle" letter-spacing="1.5">WOOCOMMERCE MARKETPLACE</text>
    
    <text x="0" y="90" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="52" font-weight="900" letter-spacing="-1">MarketFlow</text>
    <text x="0" y="135" fill="url(#purpGrad)" font-family="'Outfit', sans-serif" font-size="28" font-weight="700">Multi-Vendor WooCommerce Marketplace App</text>
    
    <text x="0" y="185" fill="#94a3b8" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="400">Ionic Mobile App Solution for Multi-Vendor Stores</text>
    <text x="0" y="215" fill="#94a3b8" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="400">Direct WooCommerce &amp; WCFM Marketplace Sync • Modern UX</text>

    <g transform="translate(0, 260)">
      <rect width="150" height="36" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" />
      <text x="75" y="23" fill="#f8fafc" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="700" text-anchor="middle">🛍️ Vendor Stores</text>
      
      <rect x="165" width="140" height="36" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" />
      <text x="235" y="23" fill="#f8fafc" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="700" text-anchor="middle">⚡ Push Alerts</text>

      <rect x="320" width="150" height="36" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" />
      <text x="395" y="23" fill="#f8fafc" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="700" text-anchor="middle">📦 REST API Driven</text>
    </g>
  </g>

  <g transform="translate(720, 120)">
    <rect width="400" height="370" rx="20" fill="rgba(15, 23, 42, 0.9)" stroke="rgba(192, 132, 252, 0.3)" stroke-width="2" />
    <rect x="25" y="30" width="350" height="130" rx="12" fill="#1e293b" />
    <text x="45" y="70" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="20" font-weight="800">WooCommerce App Hub</text>
    <text x="45" y="100" fill="#c084fc" font-family="'Plus Jakarta Sans', sans-serif" font-size="13">Seamless sync with products, reviews &amp; order statuses.</text>

    <g transform="translate(25, 180)">
      <rect width="350" height="150" rx="12" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" />
      <text x="25" y="45" fill="#f472b6" font-weight="700" font-size="14">Configurable Asset Delivery</text>
      <text x="25" y="75" fill="#94a3b8" font-size="12">Admin-controlled distribution &amp; source code licensing.</text>
      <text x="25" y="105" fill="#10b981" font-size="12" font-weight="700">✓ Production Deployment Ready</text>
    </g>
  </g>
</svg>`
  },
  {
    filename: 'bakecraft-cover.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
  <defs>
    <linearGradient id="bg5" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1c1917" />
      <stop offset="50%" stop-color="#292524" />
      <stop offset="100%" stop-color="#451a03" />
    </linearGradient>
    <linearGradient id="bakeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#fbbf24" />
    </linearGradient>
  </defs>
  <rect width="1200" height="675" fill="url(#bg5)" />
  <circle cx="950" cy="200" r="300" fill="#f59e0b" opacity="0.1" filter="blur(90px)" />
  
  <g transform="translate(80, 140)">
    <rect width="170" height="32" rx="16" fill="rgba(245, 158, 11, 0.15)" stroke="#f59e0b" stroke-width="1.5" />
    <text x="85" y="21" fill="#fbbf24" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="800" text-anchor="middle" letter-spacing="1.5">WORDPRESS THEME</text>
    
    <text x="0" y="90" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="52" font-weight="900" letter-spacing="-1">BakeCraft</text>
    <text x="0" y="135" fill="url(#bakeGrad)" font-family="'Outfit', sans-serif" font-size="28" font-weight="700">Premium Bakery &amp; Food WordPress Theme</text>
    
    <text x="0" y="185" fill="#d6d3d1" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="400">Artisan Cake Shops, Bakeries &amp; Gourmet Culinary Brands</text>
    <text x="0" y="215" fill="#a8a29e" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="400">Online Cake Ordering • Menu Layouts • WooCommerce Compatible</text>

    <g transform="translate(0, 260)">
      <rect width="140" height="36" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" />
      <text x="70" y="23" fill="#f8fafc" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="700" text-anchor="middle">🎂 Custom Menus</text>
      
      <rect x="155" width="140" height="36" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" />
      <text x="225" y="23" fill="#f8fafc" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="700" text-anchor="middle">🛒 Online Orders</text>

      <rect x="310" width="140" height="36" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" />
      <text x="380" y="23" fill="#f8fafc" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="700" text-anchor="middle">📱 100% Responsive</text>
    </g>
  </g>

  <g transform="translate(700, 110)">
    <rect width="420" height="380" rx="20" fill="rgba(28, 25, 23, 0.95)" stroke="rgba(245, 158, 11, 0.3)" stroke-width="2" />
    <rect x="25" y="25" width="370" height="160" rx="12" fill="#292524" />
    <text x="50" y="70" fill="#fbbf24" font-family="'Outfit', sans-serif" font-size="22" font-weight="800">Delightful Food Presentation</text>
    <text x="50" y="105" fill="#e7e5e4" font-size="14">Tailored for sweet shops, bakeries and cafes.</text>
    <text x="50" y="135" fill="#a8a29e" font-size="12">Includes reservation forms, order pickup slots &amp; delivery zones.</text>

    <g transform="translate(25, 210)">
      <rect width="175" height="135" rx="10" fill="#1c1917" stroke="rgba(245, 158, 11, 0.2)" />
      <text x="20" y="45" fill="#f59e0b" font-size="24">🧁</text>
      <text x="20" y="80" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="14" font-weight="700">Artisan Catalog</text>
      <text x="20" y="105" fill="#a8a29e" font-size="11">Flavor &amp; tier builder</text>
    </g>

    <g transform="translate(220, 210)">
      <rect width="175" height="135" rx="10" fill="#1c1917" stroke="rgba(245, 158, 11, 0.2)" />
      <text x="20" y="45" fill="#f59e0b" font-size="24">⚡</text>
      <text x="20" y="80" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="14" font-weight="700">1-Click Demo Import</text>
      <text x="20" y="105" fill="#a8a29e" font-size="11">Pre-styled templates</text>
    </g>
  </g>
</svg>`
  },
  {
    filename: 'autohub-cover.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
  <defs>
    <linearGradient id="bg6" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090d16" />
      <stop offset="50%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="autoGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#818cf8" />
    </linearGradient>
  </defs>
  <rect width="1200" height="675" fill="url(#bg6)" />
  <circle cx="950" cy="200" r="300" fill="#38bdf8" opacity="0.1" filter="blur(90px)" />
  
  <g transform="translate(80, 140)">
    <rect width="200" height="32" rx="16" fill="rgba(56, 189, 248, 0.15)" stroke="#38bdf8" stroke-width="1.5" />
    <text x="100" y="21" fill="#38bdf8" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="800" text-anchor="middle" letter-spacing="1.5">AUTOMOTIVE MARKETPLACE</text>
    
    <text x="0" y="90" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="52" font-weight="900" letter-spacing="-1">AutoHub</text>
    <text x="0" y="135" fill="url(#autoGrad)" font-family="'Outfit', sans-serif" font-size="28" font-weight="700">Multi-Vendor Car Marketplace</text>
    
    <text x="0" y="185" fill="#94a3b8" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="400">Complete Vehicle Directory, Dealer Portal &amp; Classifieds</text>
    <text x="0" y="215" fill="#94a3b8" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="400">Multi-Dealer Subscriptions • VIN &amp; Spec Comparison Engine</text>

    <g transform="translate(0, 260)">
      <rect width="140" height="36" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" />
      <text x="70" y="23" fill="#f8fafc" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="700" text-anchor="middle">🚗 Car Listings</text>
      
      <rect x="155" width="140" height="36" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" />
      <text x="225" y="23" fill="#f8fafc" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="700" text-anchor="middle">🏢 Dealer Profiles</text>

      <rect x="310" width="140" height="36" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" />
      <text x="380" y="23" fill="#f8fafc" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="700" text-anchor="middle">📊 Lead Generator</text>
    </g>
  </g>

  <g transform="translate(700, 110)">
    <rect width="420" height="380" rx="20" fill="rgba(15, 23, 42, 0.9)" stroke="rgba(56, 189, 248, 0.3)" stroke-width="2" />
    <rect x="25" y="25" width="370" height="150" rx="12" fill="#1e293b" />
    <text x="45" y="70" fill="#38bdf8" font-family="'Outfit', sans-serif" font-size="22" font-weight="800">Automotive Portal Hub</text>
    <text x="45" y="105" fill="#ffffff" font-size="14">Designed for car dealers, private sellers and showrooms.</text>
    <text x="45" y="135" fill="#94a3b8" font-size="12">Advanced search by make, model, price, mileage &amp; fuel type.</text>

    <g transform="translate(25, 200)">
      <rect width="175" height="145" rx="10" fill="#090d16" stroke="rgba(56, 189, 248, 0.2)" />
      <text x="20" y="45" fill="#38bdf8" font-size="24">🏎️</text>
      <text x="20" y="80" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="14" font-weight="700">Vehicle Inspector</text>
      <text x="20" y="105" fill="#94a3b8" font-size="11">Spec sheets &amp; photo gallery</text>
    </g>

    <g transform="translate(220, 200)">
      <rect width="175" height="145" rx="10" fill="#090d16" stroke="rgba(56, 189, 248, 0.2)" />
      <text x="20" y="45" fill="#818cf8" font-size="24">💳</text>
      <text x="20" y="80" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="14" font-weight="700">Dealer Packages</text>
      <text x="20" y="105" fill="#94a3b8" font-size="11">Monetize featured listings</text>
    </g>
  </g>
</svg>`
  },
  {
    filename: 'dragon-tiger-cover.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
  <defs>
    <linearGradient id="bg7" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#180404" />
      <stop offset="50%" stop-color="#3f0808" />
      <stop offset="100%" stop-color="#180808" />
    </linearGradient>
    <linearGradient id="dragonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="50%" stop-color="#ef4444" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>
  </defs>
  <rect width="1200" height="675" fill="url(#bg7)" />
  <circle cx="950" cy="200" r="300" fill="#ef4444" opacity="0.12" filter="blur(90px)" />
  
  <g transform="translate(80, 130)">
    <rect width="190" height="32" rx="16" fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" stroke-width="1.5" />
    <text x="95" y="21" fill="#f87171" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="800" text-anchor="middle" letter-spacing="1.5">GAMING PLATFORM</text>
    
    <text x="0" y="90" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="52" font-weight="900" letter-spacing="-1">Dragon Tiger</text>
    <text x="0" y="135" fill="url(#dragonGrad)" font-family="'Outfit', sans-serif" font-size="28" font-weight="700">Real-Time Gaming Platform</text>
    
    <text x="0" y="185" fill="#fca5a5" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="400">Ready-To-Deploy Software For Legally Authorized Gaming Operators</text>
    <text x="0" y="215" fill="#cbd5e1" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="400">High-FPS Real-Time Table • Central Admin &amp; Player Management</text>

    <!-- Responsible Gaming Warning Notice -->
    <g transform="translate(0, 250)">
      <rect width="520" height="60" rx="10" fill="rgba(239, 68, 68, 0.12)" stroke="rgba(239, 68, 68, 0.3)" />
      <text x="15" y="24" fill="#f87171" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="800">⚖️ LEGAL &amp; RESPONSIBLE GAMING NOTICE:</text>
      <text x="15" y="44" fill="#cbd5e1" font-family="'Plus Jakarta Sans', sans-serif" font-size="11">Subject to local laws and licensing. For authorized operators only.</text>
    </g>

    <g transform="translate(0, 330)">
      <rect width="140" height="36" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" />
      <text x="70" y="23" fill="#f8fafc" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="700" text-anchor="middle">⚡ Real-Time Engine</text>
      
      <rect x="155" width="140" height="36" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" />
      <text x="225" y="23" fill="#f8fafc" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="700" text-anchor="middle">🛡️ Admin Security</text>

      <rect x="310" width="140" height="36" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" />
      <text x="380" y="23" fill="#f8fafc" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="700" text-anchor="middle">📊 Reporting Suite</text>
    </g>
  </g>

  <g transform="translate(720, 110)">
    <rect width="400" height="390" rx="20" fill="rgba(24, 4, 4, 0.95)" stroke="rgba(239, 68, 68, 0.35)" stroke-width="2" />
    <rect x="25" y="25" width="350" height="150" rx="12" fill="#2d0a0a" />
    <text x="45" y="70" fill="#fbbf24" font-family="'Outfit', sans-serif" font-size="22" font-weight="800">Dragon vs Tiger Table</text>
    <text x="45" y="105" fill="#f87171" font-size="14">Multiplayer Card Game Architecture</text>
    <text x="45" y="135" fill="#e2e8f0" font-size="12">Fast round settlements, history roadmap &amp; audio cues.</text>

    <g transform="translate(25, 200)">
      <rect width="165" height="150" rx="10" fill="#180404" stroke="rgba(239, 68, 68, 0.25)" />
      <text x="20" y="45" fill="#ef4444" font-size="24">🐉</text>
      <text x="20" y="80" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="14" font-weight="700">Dragon Side</text>
      <text x="20" y="105" fill="#fca5a5" font-size="11">Real-time betting</text>
    </g>

    <g transform="translate(210, 200)">
      <rect width="165" height="150" rx="10" fill="#180404" stroke="rgba(239, 68, 68, 0.25)" />
      <text x="20" y="45" fill="#f59e0b" font-size="24">🐅</text>
      <text x="20" y="80" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="14" font-weight="700">Tiger Side</text>
      <text x="20" y="105" fill="#fde68a" font-size="11">Fast card draw</text>
    </g>
  </g>
</svg>`
  },
  {
    filename: 'rewardrocket-cover.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
  <defs>
    <linearGradient id="bg8" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0b1329" />
      <stop offset="50%" stop-color="#1e1b4b" />
      <stop offset="100%" stop-color="#311042" />
    </linearGradient>
    <linearGradient id="rocketGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="50%" stop-color="#818cf8" />
      <stop offset="100%" stop-color="#c084fc" />
    </linearGradient>
  </defs>
  <rect width="1200" height="675" fill="url(#bg8)" />
  <circle cx="950" cy="200" r="300" fill="#38bdf8" opacity="0.12" filter="blur(90px)" />
  
  <g transform="translate(80, 140)">
    <rect width="210" height="32" rx="16" fill="rgba(56, 189, 248, 0.15)" stroke="#38bdf8" stroke-width="1.5" />
    <text x="105" y="21" fill="#38bdf8" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="800" text-anchor="middle" letter-spacing="1.5">FLUTTER REWARDS APP</text>
    
    <text x="0" y="90" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="52" font-weight="900" letter-spacing="-1">RewardRocket</text>
    <text x="0" y="135" fill="url(#rocketGrad)" font-family="'Outfit', sans-serif" font-size="28" font-weight="700">Rewards &amp; Task Management Platform</text>
    
    <text x="0" y="185" fill="#94a3b8" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="400">Configurable Flutter User App + Interactive Admin Panel</text>
    <text x="0" y="215" fill="#94a3b8" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="400">Daily Tasks, Spin-Wheel, Video Rewards &amp; Referral System</text>

    <g transform="translate(0, 260)">
      <rect width="140" height="36" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" />
      <text x="70" y="23" fill="#f8fafc" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="700" text-anchor="middle">🎯 Task Engine</text>
      
      <rect x="155" width="140" height="36" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" />
      <text x="225" y="23" fill="#f8fafc" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="700" text-anchor="middle">🎡 Spin &amp; Scratch</text>

      <rect x="310" width="140" height="36" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" />
      <text x="380" y="23" fill="#f8fafc" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="700" text-anchor="middle">📱 Flutter Source</text>
    </g>
  </g>

  <g transform="translate(700, 110)">
    <rect width="420" height="380" rx="20" fill="rgba(15, 23, 42, 0.95)" stroke="rgba(56, 189, 248, 0.3)" stroke-width="2" />
    <rect x="25" y="25" width="370" height="150" rx="12" fill="#1e293b" />
    <text x="45" y="70" fill="#38bdf8" font-family="'Outfit', sans-serif" font-size="22" font-weight="800">Engagement &amp; Tasks Suite</text>
    <text x="45" y="105" fill="#ffffff" font-size="14">Built for community engagement &amp; task incentives.</text>
    <text x="45" y="135" fill="#94a3b8" font-size="12">Manage reward points, custom offerwalls &amp; redeem options.</text>

    <g transform="translate(25, 200)">
      <rect width="175" height="145" rx="10" fill="#0b1329" stroke="rgba(56, 189, 248, 0.2)" />
      <text x="20" y="45" fill="#38bdf8" font-size="24">🚀</text>
      <text x="20" y="80" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="14" font-weight="700">Daily Streaks</text>
      <text x="20" y="105" fill="#94a3b8" font-size="11">Keep users returning</text>
    </g>

    <g transform="translate(220, 200)">
      <rect width="175" height="145" rx="10" fill="#0b1329" stroke="rgba(192, 132, 252, 0.2)" />
      <text x="20" y="45" fill="#c084fc" font-size="24">⚙️</text>
      <text x="20" y="80" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="14" font-weight="700">Admin Control</text>
      <text x="20" y="105" fill="#94a3b8" font-size="11">Configure point values</text>
    </g>
  </g>
</svg>`
  },
  {
    filename: 'servicepro-cover.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
  <defs>
    <linearGradient id="bg9" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090d16" />
      <stop offset="50%" stop-color="#0f2942" />
      <stop offset="100%" stop-color="#083344" />
    </linearGradient>
    <linearGradient id="servGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#06b6d4" />
      <stop offset="100%" stop-color="#3b82f6" />
    </linearGradient>
  </defs>
  <rect width="1200" height="675" fill="url(#bg9)" />
  <circle cx="950" cy="200" r="300" fill="#06b6d4" opacity="0.12" filter="blur(90px)" />
  
  <g transform="translate(80, 140)">
    <rect width="190" height="32" rx="16" fill="rgba(6, 182, 212, 0.15)" stroke="#06b6d4" stroke-width="1.5" />
    <text x="95" y="21" fill="#22d3ee" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="800" text-anchor="middle" letter-spacing="1.5">HOME SERVICES PLATFORM</text>
    
    <text x="0" y="90" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="52" font-weight="900" letter-spacing="-1">ServicePro</text>
    <text x="0" y="135" fill="url(#servGrad)" font-family="'Outfit', sans-serif" font-size="28" font-weight="700">On-Demand Home Services Platform</text>
    
    <text x="0" y="185" fill="#94a3b8" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="400">Connect Customers With Verified Local Service Professionals</text>
    <text x="0" y="215" fill="#94a3b8" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="400">Booking Calendar, Provider Dispatch &amp; Centralized Admin</text>

    <g transform="translate(0, 260)">
      <rect width="140" height="36" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" />
      <text x="70" y="23" fill="#f8fafc" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="700" text-anchor="middle">🧹 50+ Services</text>
      
      <rect x="155" width="140" height="36" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" />
      <text x="225" y="23" fill="#f8fafc" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="700" text-anchor="middle">📍 Map Routing</text>

      <rect x="310" width="140" height="36" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" />
      <text x="380" y="23" fill="#f8fafc" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="700" text-anchor="middle">⭐ Verified Reviews</text>
    </g>
  </g>

  <g transform="translate(700, 110)">
    <rect width="420" height="380" rx="20" fill="rgba(15, 23, 42, 0.95)" stroke="rgba(6, 182, 212, 0.3)" stroke-width="2" />
    <rect x="25" y="25" width="370" height="150" rx="12" fill="#1e293b" />
    <text x="45" y="70" fill="#06b6d4" font-family="'Outfit', sans-serif" font-size="22" font-weight="800">On-Demand Ecosystem</text>
    <text x="45" y="105" fill="#ffffff" font-size="14">End-to-end home maintenance and service bookings.</text>
    <text x="45" y="135" fill="#94a3b8" font-size="12">Cleaning, plumbing, electrical, AC repair and painting.</text>

    <g transform="translate(25, 200)">
      <rect width="175" height="145" rx="10" fill="#090d16" stroke="rgba(6, 182, 212, 0.2)" />
      <text x="20" y="45" fill="#06b6d4" font-size="24">📱</text>
      <text x="20" y="80" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="14" font-weight="700">Customer Booking</text>
      <text x="20" y="105" fill="#94a3b8" font-size="11">Time slots &amp; live track</text>
    </g>

    <g transform="translate(220, 200)">
      <rect width="175" height="145" rx="10" fill="#090d16" stroke="rgba(59, 130, 246, 0.2)" />
      <text x="20" y="45" fill="#3b82f6" font-size="24">🛠️</text>
      <text x="20" y="80" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="14" font-weight="700">Partner Portal</text>
      <text x="20" y="105" fill="#94a3b8" font-size="11">Job alerts &amp; earnings</text>
    </g>
  </g>
</svg>`
  }
];

artworks.forEach(item => {
  const filePath = path.join(targetDir, item.filename);
  fs.writeFileSync(filePath, item.svg, 'utf8');
  console.log('✓ Generated artwork:', item.filename);
});

console.log('All 9 product artworks successfully generated in storage/public/products/');
