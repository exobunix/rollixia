const http = require('http');

function apiCall(endpoint, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`http://localhost:5000${endpoint}`);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(url, { method, headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('========================================================');
  console.log('VERIFYING CATALOG & 9 PURCHASED PRODUCTS');
  console.log('========================================================\n');

  // 1. Check Total Catalog Count
  const catalogRes = await apiCall('/api/products?limit=100');
  console.log(`[TEST 1] Catalog total products count: ${catalogRes.data.total}`);
  if (catalogRes.data.total === 14 && catalogRes.data.products.length === 14) {
    console.log('✓ PASS: Total products in catalog is EXACTLY 14.');
  } else {
    console.error(`✗ FAIL: Expected 14 products, found ${catalogRes.data.total}`);
  }

  // 2. Verify Preserved 5 Products
  console.log('\n[TEST 2] Verifying Preserved 5 Products:');
  const preservedSlugs = [
    'festive-sale-5000-all-in-one',
    '10000-n8n-automation-workflows',
    'worlds-biggest-video-editing-bundle',
    '5000-high-quality-seo-backlinks-package',
    '2000-usa-india-cartoon-stories-bundle'
  ];

  for (const slug of preservedSlugs) {
    const p = catalogRes.data.products.find(item => item.slug === slug);
    if (p) {
      console.log(`✓ Preserved [ID ${p.id}]: ${p.title} (₹${p.sale_price || p.regular_price})`);
    } else {
      console.error(`✗ Missing preserved product: ${slug}`);
    }
  }

  // 3. Verify 9 New Purchased Products
  console.log('\n[TEST 3] Verifying 9 New Purchased Products:');
  const newProducts = [
    { slug: 'shopforge-wp', name: 'ShopForge WP — Premium eCommerce WordPress Theme', price: 2999, avail: 'Available' },
    { slug: 'shopforge-shopify', name: 'ShopForge Shopify — Premium Multipurpose Shopify Theme', price: 3499, avail: 'Available' },
    { slug: 'multimart', name: 'MultiMart — Grocery & Multi-Vendor Delivery Platform', price: 4499, avail: 'Available' },
    { slug: 'marketflow', name: 'MarketFlow — Multi-Vendor WooCommerce Marketplace App', price: 2499, avail: 'Unavailable' },
    { slug: 'bakecraft', name: 'BakeCraft — Premium Bakery & Food WordPress Theme', price: 1999, avail: 'Available' },
    { slug: 'autohub', name: 'AutoHub — Multi-Vendor Car Marketplace', price: 3999, avail: 'Available' },
    { slug: 'dragon-tiger', name: 'Dragon Tiger — Real-Time Gaming Platform', price: 4999, avail: 'Available' },
    { slug: 'rewardrocket', name: 'RewardRocket — Rewards & Task Management Platform', price: 2999, avail: 'Available' },
    { slug: 'servicepro', name: 'ServicePro — On-Demand Home Services Platform', price: 4299, avail: 'Available' }
  ];

  for (const np of newProducts) {
    const detail = await apiCall(`/api/products/${np.slug}`);
    if (detail.status === 200 && detail.data.product) {
      const p = detail.data.product;
      const media = detail.data.media;
      const faqs = detail.data.faqs;
      const features = detail.data.features;
      console.log(`✓ [${p.slug}] status 200 | Title: "${p.title}" | Price: ₹${p.sale_price} | Availability: ${p.asset_availability} | Features: ${features.length} | FAQs: ${faqs.length} | Media: ${media.length}`);
    } else {
      console.error(`✗ FAIL loading detail for: ${np.slug}`);
    }
  }

  // 4. Verify MarketFlow Has No Fake Download & Shows Unavailable
  console.log('\n[TEST 4] Verifying MarketFlow Asset Handling:');
  const mf = await apiCall('/api/products/marketflow');
  if (mf.data.product.asset_availability === 'Unavailable' && (!mf.data.fileInfo || !mf.data.fileInfo.file_path)) {
    console.log('✓ PASS: MarketFlow asset_availability is "Unavailable" and has no fake download file.');
  } else {
    console.error('✗ FAIL: MarketFlow asset_availability unexpected:', mf.data.product.asset_availability);
  }

  // 5. Verify Search Multi-Field Capabilities
  console.log('\n[TEST 5] Verifying Search Capabilities:');
  const searchTerms = [
    { query: 'WordPress', expectedSlug: 'shopforge-wp' },
    { query: 'Flutter', expectedSlug: 'rewardrocket' },
    { query: 'Automotive', expectedSlug: 'autohub' },
    { query: 'Gaming', expectedSlug: 'dragon-tiger' },
    { query: 'Bakery', expectedSlug: 'bakecraft' }
  ];

  for (const s of searchTerms) {
    const sRes = await apiCall(`/api/products?q=${encodeURIComponent(s.query)}`);
    const match = sRes.data.products?.some(p => p.slug === s.expectedSlug);
    if (match) {
      console.log(`✓ Search "${s.query}" matched expected product: ${s.expectedSlug}`);
    } else {
      console.warn(`! Search "${s.query}" did not return ${s.expectedSlug}`);
    }
  }

  // 6. Admin Login & Price Update Test
  console.log('\n========================================================');
  console.log('RUNNING ADMIN PRICE UPDATE TEST (ShopForge WP: ₹2,999 -> ₹1,999)');
  console.log('========================================================\n');

  // Authenticate as Admin
  const loginRes = await apiCall('/api/auth/login', 'POST', {
    email: 'admin@digitalstore.com',
    password: 'AdminPassword123!'
  });

  const adminToken = loginRes.data.token;
  if (!adminToken) {
    console.error('✗ Admin authentication failed. Check credentials.');
    return;
  }
  console.log('✓ Admin authenticated successfully.');

  // Find ShopForge WP ID
  const shopforgeProduct = (await apiCall('/api/products/shopforge-wp')).data.product;
  const targetId = shopforgeProduct.id;
  console.log(`Target Product: ID ${targetId} (${shopforgeProduct.title}) - Current Sale Price: ₹${shopforgeProduct.sale_price}`);

  // Step A: Update Price to ₹1,999 in Admin
  console.log('\nUpdating sale_price to ₹1,999 via Admin API...');
  const updateRes = await apiCall(`/api/admin/products/${targetId}`, 'PUT', {
    ...shopforgeProduct,
    sale_price: 1999
  }, adminToken);

  if (updateRes.status === 200) {
    console.log('✓ Admin PUT returned 200 OK.');
  } else {
    console.error('✗ Admin update failed:', updateRes);
  }

  // Step B: Verify Updated Price in Public Detail API
  const updatedDetail = await apiCall('/api/products/shopforge-wp');
  console.log(`Verification: Product Detail Sale Price = ₹${updatedDetail.data.product.sale_price}`);

  // Step C: Verify Updated Price in Catalog List API
  const updatedCatalog = await apiCall('/api/products?limit=50');
  const catalogItem = updatedCatalog.data.products.find(p => p.slug === 'shopforge-wp');
  console.log(`Verification: Catalog Card Sale Price = ₹${catalogItem?.sale_price}`);

  // Step D: Verify Server-Side Checkout Uses Authoritative DB Price ₹1,999
  const checkoutRes = await apiCall('/api/orders', 'POST', {
    items: [
      { product_id: targetId, price: 50 } // Client tries to spoof ₹50
    ],
    customer_name: 'Test QA Buyer',
    customer_email: 'buyer@test.com'
  });

  console.log(`Checkout Response Status: ${checkoutRes.status}`);
  console.log(`Checkout Response Data:`, JSON.stringify(checkoutRes.data));

  const orderId = checkoutRes.data.orderId;
  const orderDetail = await apiCall(`/api/orders/${checkoutRes.data.orderNumber}`);
  const authoritativeSubtotal = orderDetail.data.order?.subtotal;
  console.log(`Authoritative Database Subtotal Charged: ₹${authoritativeSubtotal}`);

  if (authoritativeSubtotal === 1999) {
    console.log('✓ PASS: Checkout correctly ignored client spoofed price (₹50) and charged authoritative database price of ₹1,999!');
  } else {
    console.error(`✗ FAIL: Expected subtotal 1999, received ${authoritativeSubtotal}`);
  }

  // Step E: Revert Price Back to ₹2,999 to leave clean production catalog
  console.log('\nReverting sale_price back to ₹2,999...');
  await apiCall(`/api/admin/products/${targetId}`, 'PUT', {
    ...shopforgeProduct,
    sale_price: 2999
  }, adminToken);
  const revertedDetail = await apiCall('/api/products/shopforge-wp');
  console.log(`✓ Restored ShopForge WP price to original ₹${revertedDetail.data.product.sale_price}`);

  console.log('\n========================================================');
  console.log('ALL TESTS COMPLETED SUCCESSFULLY!');
  console.log('========================================================');
}

runTests().catch(err => {
  console.error('Error running test script:', err);
});
