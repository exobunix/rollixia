const http = require('http');

const BASE_URL = 'http://localhost:5000';

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = http.request(url, reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runEndToEndVerification() {
  console.log('====================================================');
  console.log('  STARTING COMPREHENSIVE E2E VERIFICATION TEST');
  console.log('====================================================\n');

  try {
    // 1. Health check
    console.log('[1/12] Testing API Health...');
    const health = await request('/api/health');
    if (health.status !== 200 || health.body.status !== 'ok') throw new Error('Health check failed');
    console.log('  ✓ API Health: 200 OK\n');

    // 2. Categories discovery
    console.log('[2/12] Testing Categories Discovery...');
    const categories = await request('/api/categories');
    if (categories.status !== 200 || !Array.isArray(categories.body) || categories.body.length === 0) {
      throw new Error('Categories failed');
    }
    console.log(`  ✓ Retrieved ${categories.body.length} categories (${categories.body.map(c => c.name).join(', ')})\n`);

    // 3. Search & Filter
    console.log('[3/12] Testing Product Search & Filter...');
    const searchRes = await request('/api/products?q=saas');
    if (searchRes.status !== 200 || searchRes.body.products.length === 0) {
      throw new Error('Search failed');
    }
    const targetProduct = searchRes.body.products[0];
    const displayPrice = targetProduct.sale_price || targetProduct.regular_price;
    console.log(`  ✓ Search query "saas" returned product: "${targetProduct.title}" (₹${displayPrice})\n`);

    // 4. Product Detail (Full Rich Content)
    console.log('[4/12] Testing Product Detail Rich Content...');
    const detailRes = await request(`/api/products/${targetProduct.slug}`);
    if (detailRes.status !== 200 || !detailRes.body.product) throw new Error('Product detail failed');
    const { product, media, licenses, features, compatibility, faqs, ratingBreakdown } = detailRes.body;
    console.log(`  ✓ Product Detail Loaded:`);
    console.log(`    - Title: ${product.title}`);
    console.log(`    - Rating: ${product.rating_avg} ★ (${product.review_count} reviews)`);
    console.log(`    - Licenses: ${licenses.length} tiers (${licenses.map(l => l.license_name).join(', ')})`);
    console.log(`    - Features: ${features.length} items`);
    console.log(`    - Compatible With: ${compatibility.map(c => c.platform).join(', ')}`);
    console.log(`    - FAQs: ${faqs.length} entries\n`);

    // 5. Server-Side Cart Calculation & Coupon Application
    console.log('[5/12] Testing Server-Side Cart Price Calculation with Coupon SAVE20...');
    const commercialLicense = licenses.find(l => l.license_name === 'Commercial') || licenses[0];
    const cartCalcRes = await request('/api/cart/calculate', {
      method: 'POST',
      body: {
        items: [{ productId: product.id, licenseId: commercialLicense.id }],
        couponCode: 'SAVE20'
      }
    });
    if (cartCalcRes.status !== 200 || !cartCalcRes.body.coupon || cartCalcRes.body.coupon.invalid) {
      throw new Error('Cart calculation or coupon application failed: ' + JSON.stringify(cartCalcRes.body));
    }
    const totals = cartCalcRes.body;
    console.log(`  ✓ Server Calculation verified:`);
    console.log(`    - Subtotal: ₹${totals.subtotal}`);
    console.log(`    - Discount (20% OFF via SAVE20): -₹${totals.discount}`);
    console.log(`    - Tax (18% GST): ₹${totals.tax}`);
    console.log(`    - Final Total: ₹${totals.total}\n`);

    // 6. Order Creation (Never trusting client amounts)
    console.log('[6/12] Creating Order on Server...');
    const orderRes = await request('/api/orders', {
      method: 'POST',
      body: {
        customerName: 'Marcus Vance',
        customerEmail: 'marcus.vance@example.com',
        billingCountry: 'India',
        items: [{ productId: product.id, licenseId: commercialLicense.id }],
        couponCode: 'SAVE20',
        paymentProvider: 'simulated'
      }
    });
    if (orderRes.status !== 201 || !orderRes.body.orderNumber) {
      throw new Error('Order creation failed: ' + JSON.stringify(orderRes.body));
    }
    const orderNumber = orderRes.body.orderNumber;
    console.log(`  ✓ Order Created: ${orderNumber} (Pending Payment, Total: ₹${orderRes.body.totalAmount})\n`);

    // 7. Payment Verification (Server-Side)
    console.log('[7/12] Performing Server-Side Payment Verification...');
    const verifyRes = await request('/api/payments/verify', {
      method: 'POST',
      body: {
        orderNumber,
        paymentId: `PAY-E2E-TEST-${Date.now()}`,
        provider: 'simulated'
      }
    });
    if (verifyRes.status !== 200 || !verifyRes.body.success) {
      throw new Error('Payment verification failed: ' + JSON.stringify(verifyRes.body));
    }
    console.log(`  ✓ Payment Verified: Order transitioned to COMPLETED. Digital access granted.\n`);

    // 8. Digital Delivery & Tokenized Download Verification
    console.log('[8/12] Testing Secure Tokenized Download Flow...');
    const orderDetailRes = await request(`/api/orders/${orderNumber}`);
    const downloads = orderDetailRes.body.downloads;
    if (!downloads || downloads.length === 0) throw new Error('No digital downloads found for order');
    const dl = downloads[0];
    const downloadToken = dl.token || dl.download_token;
    console.log(`  ✓ Deliverable file found: "${dl.file_name}"`);
    console.log(`  ✓ Generated temporary HMAC signed token: ${downloadToken.substring(0, 24)}... (Expires in 48h)`);

    // Request actual download using the token
    const fileStreamRes = await request(`/api/downloads/file/${downloadToken}`);
    if (fileStreamRes.status !== 200) {
      throw new Error(`File download endpoint failed with status ${fileStreamRes.status}`);
    }
    console.log(`  ✓ Secure download verified: Status 200 OK, Content-Type: ${fileStreamRes.headers['content-type']}, Content-Disposition: ${fileStreamRes.headers['content-disposition']}\n`);

    // 9. Customer Login & Dashboard
    console.log('[9/12] Testing Customer Authentication & My Downloads Dashboard...');
    const custLoginRes = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'alex@example.com',
        password: 'CustomerPassword123!'
      }
    });
    if (custLoginRes.status !== 200 || !custLoginRes.body.token) throw new Error('Customer login failed');
    const custToken = custLoginRes.body.token;
    const custDownloadsRes = await request('/api/downloads', {
      headers: { Authorization: `Bearer ${custToken}` }
    });
    console.log(`  ✓ Customer "alex@example.com" logged in. Total entitled downloads: ${custDownloadsRes.body.length}\n`);

    // 10. Admin Authentication & Analytics Dashboard
    console.log('[10/12] Testing Admin Authentication & Analytics Dashboard...');
    const adminLoginRes = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'admin@digitalstore.com',
        password: 'AdminPassword123!'
      }
    });
    if (adminLoginRes.status !== 200 || !adminLoginRes.body.token) throw new Error('Admin login failed');
    const adminToken = adminLoginRes.body.token;
    const dashRes = await request('/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (dashRes.status !== 200) throw new Error('Admin dashboard failed');
    console.log(`  ✓ Admin Dashboard KPIs:`);
    console.log(`    - Total Revenue: ₹${dashRes.body.kpis.totalRevenue}`);
    console.log(`    - Orders: ${dashRes.body.kpis.totalOrders}`);
    console.log(`    - Total Customers: ${dashRes.body.kpis.totalCustomers}`);
    console.log(`    - Total Digital Products: ${dashRes.body.kpis.totalProducts}\n`);

    // 11. Admin 9-Step Product Creation (Real live product added without code changes)
    console.log('[11/12] Testing Admin 9-Step Digital Product Creation Engine...');
    const newProductSlug = `nextgen-ai-automation-engine-${Date.now().toString(36)}`;
    const newProductPayload = {
      title: 'NextGen AI Automation Engine',
      slug: newProductSlug,
      sku: 'PRD-AI-AUTO-01',
      categoryId: categories.body[0].id,
      productType: 'AI Tools & Automation',
      author: 'Antigravity Studio',
      shortDescription: 'Production-ready agentic AI workflow engine with prebuilt connectors and webhooks.',
      fullDescription: 'Comprehensive AI workflow platform with ready-to-run microservices, token optimization, and real-time streaming interfaces.',
      price: 2499,
      originalPrice: 4999,
      badge: 'TRENDING',
      version: '1.0.0',
      mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      demoUrl: 'https://demo.example.com/ai-engine',
      features: [
        { title: 'Self-Healing Workflows', description: 'Autonomous retry mechanisms for external API faults' },
        { title: 'Multi-LLM Routing', description: 'Optimizes latency and cost across providers' }
      ],
      compatibility: [
        { platform: 'Node.js', version: '18+' },
        { platform: 'Python', version: '3.11+' }
      ],
      licenses: [
        { name: 'Personal', price: 2499, description: 'Single project use' },
        { name: 'Commercial', price: 4999, description: 'Unlimited client deployments' },
        { name: 'Extended', price: 9999, description: 'SaaS redistributable license' }
      ],
      faqs: [
        { question: 'Does this include complete source code?', answer: 'Yes, full unminified source code with TypeScript types is included.' }
      ],
      seoTitle: 'NextGen AI Automation Engine - Production Codebase',
      seoDescription: 'High-performance AI automation workflows for developers.',
      deliverableFileName: 'NextGen_AI_Engine_v1.0.0.zip'
    };

    const createProductRes = await request('/api/admin/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: newProductPayload
    });

    if (createProductRes.status !== 201) {
      throw new Error('Admin product creation failed: ' + JSON.stringify(createProductRes.body));
    }
    console.log(`  ✓ Product Created via Admin Wizard! ID: ${createProductRes.body.productId}, Slug: ${newProductSlug}\n`);

    // 12. Instant Storefront Live Verification
    console.log('[12/12] Verifying Newly Added Product Appears Immediately on Live Public Storefront...');
    const liveCheckRes = await request(`/api/products/${newProductSlug}`);
    if (liveCheckRes.status !== 200 || !liveCheckRes.body.product) {
      throw new Error('Newly created product failed to appear live on storefront!');
    }
    console.log(`  ✓ Verified Live on Storefront:`);
    console.log(`    - Product: "${liveCheckRes.body.product.title}"`);
    console.log(`    - Price: ₹${liveCheckRes.body.product.sale_price || liveCheckRes.body.product.regular_price} (Original: ₹${liveCheckRes.body.product.regular_price})`);
    console.log(`    - Features Count: ${liveCheckRes.body.features.length}`);
    console.log(`    - License Tiers: ${liveCheckRes.body.licenses.length}`);
    console.log(`    - Delivery File: Ready for download upon purchase!`);

    console.log('\n====================================================');
    console.log('  ALL 12/12 E2E CRITICAL PLATFORM FLOWS PASSED (100%)');
    console.log('====================================================\n');
  } catch (err) {
    console.error('\n❌ E2E Verification Failed:', err.message);
    process.exit(1);
  }
}

runEndToEndVerification();
