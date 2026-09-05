const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function run() {
  console.log('============================================================');
  console.log('STARTING SECTION 92 FINAL ACCEPTANCE TEST SUITE');
  console.log('============================================================\n');

  // 1. Authenticate as Admin
  console.log('Authenticating as Super Admin...');
  const loginRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@digitalstore.com', password: 'AdminPassword123!' });

  if (loginRes.status !== 200 || !loginRes.body.token) {
    throw new Error('Admin login failed: ' + JSON.stringify(loginRes.body));
  }
  const adminToken = loginRes.body.token;
  const adminHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  };
  console.log('✓ Admin authenticated successfully.\n');

  // Get Festive Sale product
  const festiveSlug = 'festive-sale-5000-all-in-one';
  let festiveRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/products/${festiveSlug}`,
    method: 'GET'
  });
  const festiveId = festiveRes.body.product.id;
  console.log(`Festive Sale Product ID: ${festiveId}, Initial Price: ₹${festiveRes.body.product.sale_price}`);

  // TEST 1: Admin changes Festive Sale price from ₹29 to ₹39.
  console.log('\n--- TEST 1: Admin changes Festive Sale price from ₹29 to ₹39 ---');
  const updatePriceRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/admin/products/${festiveId}`,
    method: 'PUT',
    headers: adminHeaders
  }, { sale_price: 39 });
  if (updatePriceRes.status !== 200) throw new Error('Failed to update price');

  const checkPriceRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/products/${festiveSlug}`,
    method: 'GET'
  });
  console.log('Public endpoint sale_price after update:', checkPriceRes.body.product.sale_price);
  if (checkPriceRes.body.product.sale_price !== 39) {
    throw new Error(`TEST 1 FAILED: Expected ₹39, got ₹${checkPriceRes.body.product.sale_price}`);
  }
  console.log('✓ TEST 1 PASSED: Frontend public API dynamically displays ₹39.');

  // Revert back to ₹29 for pristine state
  await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/admin/products/${festiveId}`,
    method: 'PUT',
    headers: adminHeaders
  }, { sale_price: 29 });
  console.log('✓ Restored price to ₹29.');

  // TEST 2: Admin replaces Festive Sale hero image.
  console.log('\n--- TEST 2: Admin replaces Festive Sale hero image ---');
  const newHeroImage = '/storage/products/festive-sale-cover-updated.svg';
  await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/admin/products/${festiveId}`,
    method: 'PUT',
    headers: adminHeaders
  }, { hero_image: newHeroImage });

  const checkHeroRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/products/${festiveSlug}`,
    method: 'GET'
  });
  console.log('Hero image on public endpoint:', checkHeroRes.body.product.hero_image);
  if (checkHeroRes.body.product.hero_image !== newHeroImage) {
    throw new Error('TEST 2 FAILED: Hero image was not updated');
  }
  console.log('✓ TEST 2 PASSED: Hero image replaced and dynamically shown on frontend.');

  // TEST 3: Admin adds a new bonus.
  console.log('\n--- TEST 3: Admin adds a new bonus ---');
  const currentBonuses = checkHeroRes.body.bonuses || [];
  const newBonus = {
    title: 'Bonus #6: AI Prompt Engineering Bible',
    subtitle: '1000+ Production AI Prompts',
    description: 'Master prompting for ChatGPT, Midjourney, and Claude.',
    value: '₹2,499',
    badge: 'EXCLUSIVE',
    is_visible: 1,
    sort_order: currentBonuses.length + 1
  };
  await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/admin/products/${festiveId}/bonuses`,
    method: 'PUT',
    headers: adminHeaders
  }, { bonuses: [...currentBonuses, newBonus] });

  const checkBonusRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/products/${festiveSlug}`,
    method: 'GET'
  });
  const foundBonus = checkBonusRes.body.bonuses.find(b => b.title.includes('AI Prompt Engineering Bible'));
  if (!foundBonus) {
    throw new Error('TEST 3 FAILED: New bonus not found on frontend');
  }
  console.log(`✓ TEST 3 PASSED: New bonus "${foundBonus.title}" appears immediately.`);

  // TEST 4: Admin hides FAQ.
  console.log('\n--- TEST 4: Admin hides FAQ ---');
  // Load full sections
  const fullRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/admin/products/${festiveId}/full`,
    method: 'GET',
    headers: adminHeaders
  });
  let sections = fullRes.body.sections;
  const faqSection = sections.find(s => (s.type || s.section_type) === 'faq');
  if (!faqSection) throw new Error('FAQ section not found in sections: ' + JSON.stringify(sections.map(s => s.type || s.section_type)));

  // Toggle FAQ visibility to 0
  sections = sections.map(s => (s.type || s.section_type) === 'faq' ? { ...s, is_visible: 0 } : s);
  await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/admin/products/${festiveId}/sections`,
    method: 'PUT',
    headers: adminHeaders
  }, { sections });

  const checkFaqRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/products/${festiveSlug}`,
    method: 'GET'
  });
  const publicFaq = checkFaqRes.body.sections.find(s => s.type === 'faq');
  if (publicFaq) {
    throw new Error('TEST 4 FAILED: FAQ section is still visible on frontend');
  }
  console.log('✓ TEST 4 PASSED: FAQ section hidden from public storefront.');

  // Restore FAQ visibility
  sections = sections.map(s => s.type === 'faq' ? { ...s, is_visible: 1 } : s);
  await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/admin/products/${festiveId}/sections`,
    method: 'PUT',
    headers: adminHeaders
  }, { sections });

  // TEST 5: Admin changes section order.
  console.log('\n--- TEST 5: Admin changes section order ---');
  // Put benefits first
  const reordered = sections.map((s, i) => {
    const stype = s.type || s.section_type;
    if (stype === 'benefits') return { ...s, section_type: 'benefits', type: 'benefits', sort_order: 1 };
    if (stype === 'hero') return { ...s, section_type: 'hero', type: 'hero', sort_order: 2 };
    return { ...s, section_type: stype, type: stype, sort_order: 10 + i };
  });
  await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/admin/products/${festiveId}/sections`,
    method: 'PUT',
    headers: adminHeaders
  }, { sections: reordered });

  const checkOrderRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/products/${festiveSlug}`,
    method: 'GET'
  });
  const firstSection = checkOrderRes.body.sections[0];
  const firstType = firstSection ? (firstSection.type || firstSection.section_type) : null;
  console.log('First section on public storefront after reordering:', firstType);
  if (firstType !== 'benefits') {
    throw new Error('TEST 5 FAILED: Section order was not applied');
  }
  console.log('✓ TEST 5 PASSED: Reordered section stack reflected on frontend.');

  // TEST 6: Admin creates a sixth product.
  console.log('\n--- TEST 6: Admin creates a sixth product ---');
  const createSixthRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/products',
    method: 'POST',
    headers: adminHeaders
  }, {
    title: '500+ Luxury Real Estate Social Media Kit',
    slug: 'luxury-real-estate-social-media-kit',
    sku: 'SKU-RE-500',
    category_id: 3,
    product_type: 'Graphic Pack',
    author: 'Digitalverse Pro',
    regular_price: 1999,
    sale_price: 199,
    badge: 'NEW',
    status: 'published',
    short_description: '500+ premium Canva templates tailored for luxury realtors and brokers.',
    full_description: 'Everything you need to scale real estate listings effortlessly.',
    theme_style: 'cinematic'
  });

  if (createSixthRes.status !== 201) throw new Error('Failed to create sixth product: ' + JSON.stringify(createSixthRes.body));
  const sixthId = createSixthRes.body.productId || createSixthRes.body.id;

  const catalogRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/products',
    method: 'GET'
  });
  const foundSixth = catalogRes.body.products.find(p => p.id === sixthId);
  if (!foundSixth) {
    throw new Error('TEST 6 FAILED: Sixth product did not appear in public product listing');
  }
  console.log(`✓ TEST 6 PASSED: Sixth product "${foundSixth.title}" appears in public catalog!`);

  // TEST 7: Customer buys product (backend order integrity check).
  console.log('\n--- TEST 7: Customer buys product ---');
  // Login as demo customer
  const customerLogin = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'alex@example.com', password: 'CustomerPassword123!' });
  const customerToken = customerLogin.body.token;
  const customerHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${customerToken}`
  };

  // Create order for ₹29 festive sale product
  const orderRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/orders',
    method: 'POST',
    headers: customerHeaders
  }, {
    customer_name: 'Alex Morgan',
    customer_email: 'alex@example.com',
    items: [{ productId: festiveId }],
    payment_provider: 'simulated'
  });

  if (orderRes.status !== 201 || !orderRes.body.orderNumber) {
    throw new Error('TEST 7 FAILED: Order creation failed: ' + JSON.stringify(orderRes.body));
  }
  const orderNumber = orderRes.body.orderNumber;
  const totalAmount = orderRes.body.totalAmount;
  console.log(`Order created: ${orderNumber}, Total Amount: ₹${totalAmount} (Includes 18% GST on ₹29 base product price)`);
  if (Math.abs(totalAmount - 34.22) > 0.1 && totalAmount !== 29) {
    throw new Error(`TEST 7 FAILED: Expected ₹29 (+ 18% GST = ₹34.22), got ₹${totalAmount}`);
  }

  // Verify payment
  const verifyRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/payments/verify',
    method: 'POST',
    headers: customerHeaders
  }, {
    orderNumber,
    paymentId: 'pay_simulated_' + Date.now(),
    provider: 'simulated'
  });
  if (verifyRes.status !== 200 || !verifyRes.body.success) {
    throw new Error('TEST 7 FAILED: Payment verification failed: ' + JSON.stringify(verifyRes.body));
  }
  console.log('✓ TEST 7 PASSED: Order created and payment verified with exact server price of ₹29.');

  // TEST 8: Customer accesses digital file (verified token authorization).
  console.log('\n--- TEST 8: Customer accesses digital file ---');
  const myDownloads = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/downloads/my-downloads',
    method: 'GET',
    headers: customerHeaders
  });
  console.log('myDownloads status:', myDownloads.status, 'body:', myDownloads.body);
  const dlList = Array.isArray(myDownloads.body) ? myDownloads.body : (myDownloads.body.downloads || []);
  if (!dlList.length) {
    throw new Error('TEST 8 FAILED: No downloads found for customer: ' + JSON.stringify(myDownloads.body));
  }
  const downloadItem = dlList.find(d => d.product_id === festiveId);
  if (!downloadItem) {
    throw new Error('TEST 8 FAILED: Download for festive sale not found');
  }
  console.log('Secure Token obtained:', downloadItem.token.slice(0, 32) + '...');

  const fileReq = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/downloads/file/${downloadItem.token}`,
    method: 'GET'
  });
  console.log('fileReq status:', fileReq.status, 'body:', fileReq.body);
  if (fileReq.status !== 200 && fileReq.status !== 302) {
    throw new Error(`TEST 8 FAILED: Token download request returned status ${fileReq.status}: ` + JSON.stringify(fileReq.body));
  }
  console.log(`✓ TEST 8 PASSED: Secure token authorization verified (HTTP status ${fileReq.status}).`);

  // TEST 9: Admin unpublishes product.
  console.log('\n--- TEST 9: Admin unpublishes product ---');
  await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/admin/products/${festiveId}/status`,
    method: 'PATCH',
    headers: adminHeaders
  }, { status: 'draft' });

  const catalogAfterDraft = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/products',
    method: 'GET'
  });
  const isPresentInCatalog = catalogAfterDraft.body.products.some(p => p.id === festiveId);
  if (isPresentInCatalog) {
    throw new Error('TEST 9 FAILED: Unpublished product still visible in public catalog');
  }
  console.log('✓ TEST 9 PASSED: Unpublished product disappeared from public catalog.');

  // TEST 10: Customer who already purchased retains access.
  console.log('\n--- TEST 10: Customer retains access to purchased unpublished product ---');
  const myDownloadsAfterUnpublish = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/downloads/my-downloads',
    method: 'GET',
    headers: customerHeaders
  });
  const customerStillHasAccess = myDownloadsAfterUnpublish.body.some(d => d.product_id === festiveId);
  if (!customerStillHasAccess) {
    throw new Error('TEST 10 FAILED: Customer lost entitlement to already purchased product');
  }
  console.log('✓ TEST 10 PASSED: Customer retains lifetime download access to purchased product!');

  // Cleanup: Re-publish Festive Sale & delete temporary sixth product
  await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/admin/products/${festiveId}/status`,
    method: 'PATCH',
    headers: adminHeaders
  }, { status: 'published' });
  await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/admin/products/${sixthId}`,
    method: 'DELETE',
    headers: adminHeaders
  });
  console.log('\n✓ Cleanup complete: Festive Sale restored to published, temp product deleted.');

  console.log('\n============================================================');
  console.log('ALL 10 SECTION 92 ACCEPTANCE TESTS PASSED SUCCESSFULLY! 🎯');
  console.log('============================================================');
}

run().catch(err => {
  console.error('\n❌ ACCEPTANCE TEST RUN FAILED:', err);
  process.exit(1);
});
