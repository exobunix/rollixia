const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'storage', 'public', 'products');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// 1. Festive Sale Artwork (Dark Gold & Festive Orange celebratory banner)
const festiveSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="100%" height="100%">
  <defs>
    <linearGradient id="festiveBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#140d04"/>
      <stop offset="50%" stop-color="#2a1805"/>
      <stop offset="100%" stop-color="#0a0502"/>
    </linearGradient>
    <linearGradient id="goldText" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffd700"/>
      <stop offset="50%" stop-color="#ffae19"/>
      <stop offset="100%" stop-color="#fff2a3"/>
    </linearGradient>
    <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#e11d48"/>
      <stop offset="100%" stop-color="#f97316"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="15" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1200" height="800" fill="url(#festiveBg)"/>

  <!-- Decorative Mandala / Glow Circles -->
  <circle cx="600" cy="400" r="320" fill="none" stroke="#d97706" stroke-width="1.5" stroke-dasharray="12 8" opacity="0.25"/>
  <circle cx="600" cy="400" r="240" fill="none" stroke="#fbbf24" stroke-width="1" opacity="0.3"/>
  <circle cx="600" cy="400" r="140" fill="#f59e0b" opacity="0.08" filter="url(#glow)"/>

  <!-- Sparkles & Diya lights -->
  <g fill="#f59e0b" opacity="0.6">
    <circle cx="200" cy="180" r="4"/>
    <circle cx="1000" cy="190" r="5"/>
    <circle cx="280" cy="620" r="4"/>
    <circle cx="940" cy="580" r="6"/>
    <circle cx="160" cy="420" r="3"/>
    <circle cx="1040" cy="380" r="3"/>
  </g>

  <!-- Top Badge -->
  <g transform="translate(475, 90)">
    <rect width="250" height="46" rx="23" fill="url(#badgeGrad)"/>
    <text x="125" y="29" font-family="'Outfit', sans-serif" font-size="16" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="3">FESTIVE SALE 🔥</text>
  </g>

  <!-- Main Headline -->
  <text x="600" y="220" font-family="'Outfit', sans-serif" font-size="44" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1">
    5000+ ALL-IN-ONE
  </text>
  <text x="600" y="290" font-family="'Outfit', sans-serif" font-size="58" font-weight="900" fill="url(#goldText)" text-anchor="middle" letter-spacing="2" filter="url(#glow)">
    DIGITAL EMPIRE
  </text>

  <!-- Subheadline -->
  <text x="600" y="350" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="600" fill="#fef3c7" text-anchor="middle" letter-spacing="2">
    COURSES • REELS • TEMPLATES • EBOOKS • PROMPTS • RESELL RIGHTS
  </text>

  <!-- Central Offer Card -->
  <g transform="translate(350, 390)">
    <rect width="500" height="240" rx="24" fill="#1c1106" stroke="#f59e0b" stroke-width="2" stroke-opacity="0.4"/>
    
    <!-- Discount Tag -->
    <rect x="30" y="25" width="120" height="32" rx="8" fill="#e11d48"/>
    <text x="90" y="46" font-family="'Outfit', sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">99% OFF</text>

    <!-- Strike through price -->
    <text x="170" y="48" font-family="'Outfit', sans-serif" font-size="20" font-weight="600" fill="#9ca3af" text-decoration="line-through">₹9,999</text>

    <!-- Super Price -->
    <text x="250" y="145" font-family="'Outfit', sans-serif" font-size="90" font-weight="900" fill="url(#goldText)" text-anchor="middle" filter="url(#glow)">₹29</text>

    <!-- Micro Highlights -->
    <text x="250" y="195" font-family="'Plus Jakarta Sans', sans-serif" font-size="15" font-weight="700" fill="#34d399" text-anchor="middle">
      ✓ Free Resell Rights Included • Keep 100% Profits
    </text>
  </g>

  <!-- Bottom Strip -->
  <g transform="translate(0, 720)">
    <rect width="1200" height="80" fill="#0f0903" opacity="0.9"/>
    <text x="600" y="46" font-family="'Plus Jakarta Sans', sans-serif" font-size="15" font-weight="700" fill="#fbbf24" text-anchor="middle" letter-spacing="1.5">
      BONUS: Instagram Mastery • 90+ Hashtags • Canva Guide • Digital Selling Course
    </text>
  </g>
</svg>`;

// 2. 10,000 n8n Workflows Artwork (Cyber Tech, Node Automation, Clean Blue/Cyan)
const n8nSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="100%" height="100%">
  <defs>
    <linearGradient id="techBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#050b14"/>
      <stop offset="50%" stop-color="#0b172a"/>
      <stop offset="100%" stop-color="#030712"/>
    </linearGradient>
    <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="50%" stop-color="#818cf8"/>
      <stop offset="100%" stop-color="#c084fc"/>
    </linearGradient>
    <linearGradient id="nodeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="800" fill="url(#techBg)"/>

  <!-- Network Automation Grid & Nodes -->
  <g stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="6 4" opacity="0.25">
    <line x1="200" y1="250" x2="450" y2="250"/>
    <line x1="450" y1="250" x2="700" y2="350"/>
    <line x1="700" y1="350" x2="950" y2="250"/>
    <line x1="450" y1="250" x2="600" y2="550"/>
    <line x1="700" y1="350" x2="600" y2="550"/>
  </g>

  <!-- Automation Nodes -->
  <g fill="url(#nodeGrad)" stroke="#38bdf8" stroke-width="2">
    <rect x="140" y="210" width="120" height="80" rx="14"/>
    <rect x="390" y="210" width="120" height="80" rx="14"/>
    <rect x="640" y="310" width="120" height="80" rx="14"/>
    <rect x="890" y="210" width="120" height="80" rx="14"/>
    <rect x="540" y="510" width="120" height="80" rx="14"/>
  </g>

  <g font-family="'JetBrains Mono', monospace" font-size="13" font-weight="700" fill="#38bdf8" text-anchor="middle">
    <text x="200" y="255">Webhook</text>
    <text x="450" y="255">AI Agent</text>
    <text x="700" y="355">Transform</text>
    <text x="950" y="255">Database</text>
    <text x="600" y="555">Slack/CRM</text>
  </g>

  <!-- Badge -->
  <g transform="translate(450, 70)">
    <rect width="300" height="42" rx="21" fill="#0284c7" fill-opacity="0.2" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="150" y="26" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="800" fill="#38bdf8" text-anchor="middle" letter-spacing="2">AUTOMATION MEGA PACK ⚡</text>
  </g>

  <!-- Main Headline -->
  <text x="600" y="180" font-family="'Outfit', sans-serif" font-size="52" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1">
    10,000 n8n WORKFLOWS
  </text>
  <text x="600" y="235" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="600" fill="url(#cyanGrad)" text-anchor="middle">
    Yours for the Price of a Coffee • Lifetime Updates
  </text>

  <!-- Pricing Card -->
  <g transform="translate(380, 620)">
    <rect width="440" height="120" rx="20" fill="#0f172a" stroke="#38bdf8" stroke-width="2" stroke-opacity="0.5"/>
    <text x="220" y="65" font-family="'Outfit', sans-serif" font-size="56" font-weight="900" fill="#38bdf8" text-anchor="middle">₹299</text>
    <text x="220" y="98" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="700" fill="#94a3b8" text-anchor="middle">Instant JSON Import • Production Ready</text>
  </g>
</svg>`;

// 3. Video Editing Bundle Artwork (Cinematic Crimson / Violet Film Theme)
const videoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="100%" height="100%">
  <defs>
    <linearGradient id="cinemaBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#18041d"/>
      <stop offset="50%" stop-color="#0d0214"/>
      <stop offset="100%" stop-color="#020005"/>
    </linearGradient>
    <linearGradient id="neonPink" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f43f5e"/>
      <stop offset="50%" stop-color="#ec4899"/>
      <stop offset="100%" stop-color="#a855f7"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="800" fill="url(#cinemaBg)"/>

  <!-- Film Strip Top & Bottom -->
  <g fill="#1f0729" stroke="#ec4899" stroke-opacity="0.3">
    <rect x="0" y="0" width="1200" height="50"/>
    <rect x="0" y="750" width="1200" height="50"/>
  </g>
  <g fill="#000000">
    <rect x="40" y="10" width="30" height="30" rx="4"/>
    <rect x="110" y="10" width="30" height="30" rx="4"/>
    <rect x="180" y="10" width="30" height="30" rx="4"/>
    <rect x="1000" y="10" width="30" height="30" rx="4"/>
    <rect x="1070" y="10" width="30" height="30" rx="4"/>
    <rect x="1140" y="10" width="30" height="30" rx="4"/>
  </g>

  <!-- Badge -->
  <g transform="translate(430, 90)">
    <rect width="340" height="42" rx="21" fill="#ec4899" fill-opacity="0.2" stroke="#ec4899" stroke-width="1.5"/>
    <text x="170" y="27" font-family="'Outfit', sans-serif" font-size="14" font-weight="800" fill="#f43f5e" text-anchor="middle" letter-spacing="2">BIGGEST VIDEO EDITING BUNDLE 🎬</text>
  </g>

  <!-- Headline -->
  <text x="600" y="210" font-family="'Outfit', sans-serif" font-size="44" font-weight="900" fill="#ffffff" text-anchor="middle">
    THE WORLD'S BIGGEST
  </text>
  <text x="600" y="280" font-family="'Outfit', sans-serif" font-size="64" font-weight="900" fill="url(#neonPink)" text-anchor="middle" letter-spacing="1">
    VIDEO EDITING BUNDLE
  </text>

  <!-- Asset Counter Pills -->
  <g transform="translate(200, 340)">
    <rect x="0" y="0" width="240" height="70" rx="16" fill="#1c072b" stroke="#f43f5e" stroke-width="1.5"/>
    <text x="120" y="32" font-family="'Outfit', sans-serif" font-size="20" font-weight="900" fill="#ffffff" text-anchor="middle">2000+ FX PRESETS</text>
    <text x="120" y="55" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" fill="#fda4af" text-anchor="middle">Premiere • FCP • DaVinci</text>

    <rect x="280" y="0" width="240" height="70" rx="16" fill="#1c072b" stroke="#f43f5e" stroke-width="1.5"/>
    <text x="400" y="32" font-family="'Outfit', sans-serif" font-size="20" font-weight="900" fill="#ffffff" text-anchor="middle">1000+ SOUND FX</text>
    <text x="400" y="55" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" fill="#fda4af" text-anchor="middle">Whoosh • Risers • Hits</text>

    <rect x="560" y="0" width="240" height="70" rx="16" fill="#1c072b" stroke="#f43f5e" stroke-width="1.5"/>
    <text x="680" y="32" font-family="'Outfit', sans-serif" font-size="20" font-weight="900" fill="#ffffff" text-anchor="middle">500+ CINEMATIC LUTS</text>
    <text x="680" y="55" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" fill="#fda4af" text-anchor="middle">Film • Vlog • Teal &amp; Orange</text>
  </g>

  <!-- Price CTA Banner -->
  <g transform="translate(400, 480)">
    <rect width="400" height="180" rx="24" fill="#240a35" stroke="#ec4899" stroke-width="2"/>
    <text x="200" y="60" font-family="'Outfit', sans-serif" font-size="18" font-weight="700" fill="#e2e8f0" text-anchor="middle">LIFETIME ACCESS ONLY</text>
    <text x="200" y="125" font-family="'Outfit', sans-serif" font-size="64" font-weight="900" fill="#f43f5e" text-anchor="middle">₹399</text>
    <text x="200" y="155" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="700" fill="#34d399" text-anchor="middle">✓ Instant Google Drive &amp; Direct Downloads</text>
  </g>
</svg>`;

// 4. 5000+ SEO Backlinks Package Artwork (Emerald & Teal Search Analytics)
const seoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="100%" height="100%">
  <defs>
    <linearGradient id="seoBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#021a12"/>
      <stop offset="50%" stop-color="#052e22"/>
      <stop offset="100%" stop-color="#01100b"/>
    </linearGradient>
    <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#10b981"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="800" fill="url(#seoBg)"/>

  <!-- Search Bar Visual Motif -->
  <g transform="translate(250, 100)">
    <rect width="700" height="60" rx="30" fill="#064e3b" stroke="#10b981" stroke-width="2"/>
    <circle cx="45" cy="30" r="14" fill="none" stroke="#34d399" stroke-width="3"/>
    <line x1="55" y1="40" x2="68" y2="53" stroke="#34d399" stroke-width="3" stroke-linecap="round"/>
    <text x="85" y="37" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="700" fill="#a7f3d0">high da do-follow backlinks directory 2026</text>
    <rect x="580" y="10" width="105" height="40" rx="20" fill="#10b981"/>
    <text x="632" y="35" font-family="'Outfit', sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">RANK #1</text>
  </g>

  <!-- Headline -->
  <text x="600" y="270" font-family="'Outfit', sans-serif" font-size="54" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1">
    5000+ HIGH QUALITY
  </text>
  <text x="600" y="340" font-family="'Outfit', sans-serif" font-size="62" font-weight="900" fill="url(#emeraldGrad)" text-anchor="middle" letter-spacing="2">
    SEO BACKLINKS
  </text>
  <text x="600" y="390" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="600" fill="#d1fae5" text-anchor="middle">
    High DA 50-90+ • Do-Follow Profile, Web 2.0 &amp; Business Directories
  </text>

  <!-- Spreadsheets & Categories Grid -->
  <g transform="translate(280, 430)">
    <rect width="640" height="240" rx="20" fill="#042f24" stroke="#10b981" stroke-width="1.5"/>
    
    <text x="320" y="45" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="800" fill="#6ee7b7" text-anchor="middle">
      ORGANIZED IN LIVE GOOGLE SHEET WITH FILTERING
    </text>

    <!-- Category Pills -->
    <g transform="translate(40, 70)" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="700" fill="#ffffff">
      <rect x="0" y="0" width="160" height="40" rx="10" fill="#065f46"/><text x="80" y="25" text-anchor="middle">Profile Links (1500+)</text>
      <rect x="190" y="0" width="170" height="40" rx="10" fill="#065f46"/><text x="275" y="25" text-anchor="middle">Web 2.0 Sites (1000+)</text>
      <rect x="390" y="0" width="170" height="40" rx="10" fill="#065f46"/><text x="475" y="25" text-anchor="middle">Gov/Edu Links (500+)</text>
    </g>

    <!-- Price Tag -->
    <g transform="translate(180, 140)">
      <rect width="280" height="70" rx="18" fill="#10b981"/>
      <text x="140" y="48" font-family="'Outfit', sans-serif" font-size="44" font-weight="900" fill="#ffffff" text-anchor="middle">ONLY ₹49</text>
    </g>
  </g>
</svg>`;

// 5. 2000+ Cartoon Stories Bundle Artwork (Vibrant Kids Animation Palette)
const cartoonSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="100%" height="100%">
  <defs>
    <linearGradient id="cartoonBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e1145"/>
      <stop offset="50%" stop-color="#311768"/>
      <stop offset="100%" stop-color="#13072e"/>
    </linearGradient>
    <linearGradient id="warmYellow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#f43f5e"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="800" fill="url(#cartoonBg)"/>

  <!-- Playful stars & clouds -->
  <g fill="#fde047" opacity="0.6">
    <polygon points="150,150 155,165 170,170 155,175 150,190 145,175 130,170 145,165"/>
    <polygon points="1050,220 1055,235 1070,240 1055,245 1050,260 1045,245 1030,240 1045,235"/>
    <polygon points="220,580 225,595 240,600 225,605 220,620 215,605 200,600 215,595"/>
    <polygon points="980,540 985,555 1000,560 985,565 980,580 975,565 960,560 975,555"/>
  </g>

  <!-- Top Badge -->
  <g transform="translate(420, 80)">
    <rect width="360" height="46" rx="23" fill="#f59e0b"/>
    <text x="180" y="30" font-family="'Outfit', sans-serif" font-size="16" font-weight="900" fill="#000000" text-anchor="middle" letter-spacing="2">2000+ VIDEO BUNDLE 🧸</text>
  </g>

  <!-- Main Headline -->
  <text x="600" y="210" font-family="'Outfit', sans-serif" font-size="46" font-weight="900" fill="#ffffff" text-anchor="middle">
    2000+ USA &amp; INDIA
  </text>
  <text x="600" y="280" font-family="'Outfit', sans-serif" font-size="58" font-weight="900" fill="url(#warmYellow)" text-anchor="middle">
    CARTOON STORIES
  </text>
  <text x="600" y="340" font-family="'Plus Jakarta Sans', sans-serif" font-size="22" font-weight="700" fill="#e9d5ff" text-anchor="middle">
    HD Animated Moral Stories • Fairy Tales • Ready for YouTube
  </text>

  <!-- Feature Tags -->
  <g transform="translate(300, 390)">
    <rect width="600" height="150" rx="20" fill="#24124d" stroke="#a855f7" stroke-width="2"/>
    <text x="300" y="45" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="800" fill="#fde047" text-anchor="middle">
      ✓ Ready to Monetize • Instant Download • No Copyright Issues
    </text>
    <text x="300" y="80" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="600" fill="#cbd5e1" text-anchor="middle">
      Includes English &amp; Hindi Audio Stories • Perfect for Educators &amp; Creators
    </text>
    <text x="300" y="118" font-family="'Plus Jakarta Sans', sans-serif" font-size="15" font-weight="800" fill="#34d399" text-anchor="middle">
      🎁 INCLUDES FREE BONUS SOUND PACK
    </text>
  </g>

  <!-- Price CTA -->
  <g transform="translate(450, 580)">
    <rect width="300" height="120" rx="24" fill="#f59e0b"/>
    <text x="150" y="75" font-family="'Outfit', sans-serif" font-size="64" font-weight="900" fill="#000000" text-anchor="middle">₹99</text>
    <text x="150" y="105" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="800" fill="#000000" text-anchor="middle">LIFETIME ACCESS</text>
  </g>
</svg>`;

fs.writeFileSync(path.join(targetDir, 'festive-sale-cover.svg'), festiveSvg);
fs.writeFileSync(path.join(targetDir, 'n8n-workflows-cover.svg'), n8nSvg);
fs.writeFileSync(path.join(targetDir, 'video-editing-cover.svg'), videoSvg);
fs.writeFileSync(path.join(targetDir, 'seo-backlinks-cover.svg'), seoSvg);
fs.writeFileSync(path.join(targetDir, 'cartoon-stories-cover.svg'), cartoonSvg);

console.log('Successfully generated authentic vector artwork for all 5 products in server/storage/public/products/!');
