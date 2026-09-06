const http = require('http');
const crypto = require('crypto');
const path = require('path');
try {
  require('dotenv').config({ path: path.join(__dirname, '..', 'server', '.env') });
} catch (e) {
  require(path.join(__dirname, '..', 'server', 'node_modules', 'dotenv')).config({ path: path.join(__dirname, '..', 'server', '.env') });
}

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'FM2lMwXz4Rq4r5IZGFpi7GgP';
const KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_TYdMxQomEc4yMe';

function request(urlPath, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, BASE_URL);
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

async function runRazorpayTests() {
  console.log('====================================================');
  console.log('  RAZORPAY STANDARD WEB CHECKOUT VERIFICATION SUITE');
  console.log('====================================================\n');
  console.log(`Target URL: ${BASE_URL}`);
  console.log(`Razorpay Key ID: ${KEY_ID}\n`);

  let passCount = 0;
  let failCount = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ ${message}`);
      passCount++;
    } else {
      console.error(`  ✗ FAILED: ${message}`);
      failCount++;
    }
  }

  try {
    // 1. Test POST /api/create-order with valid amount (>= 100 paise)
    console.log('[TEST 1] Creating Razorpay order with valid amount (50000 paise / ₹500)...');
    const orderRes = await request('/api/create-order', {
      method: 'POST',
      body: {
        amount: 50000,
        currency: 'INR',
        receipt: `test_rcpt_${Date.now()}`
      }
    });

    assert(orderRes.status === 200, `Expected status 200, got ${orderRes.status}`);
    assert(orderRes.body.order_id && orderRes.body.order_id.startsWith('order_'), `Valid order_id received: ${orderRes.body.order_id}`);
    assert(orderRes.body.amount === 50000, `Correct amount received: ${orderRes.body.amount}`);
    assert(orderRes.body.currency === 'INR', `Correct currency received: ${orderRes.body.currency}`);
    assert(orderRes.body.key_id === KEY_ID, `Matches configured KEY_ID`);

    const createdOrderId = orderRes.body.order_id;
    console.log();

    // 2. Test POST /api/create-order with amount < 100 paise (Validation error)
    console.log('[TEST 2] Testing amount validation (< 100 paise)...');
    const minAmountRes = await request('/api/create-order', {
      method: 'POST',
      body: {
        amount: 50,
        currency: 'INR'
      }
    });

    assert(minAmountRes.status === 400, `Expected status 400 for amount < 100, got ${minAmountRes.status}`);
    assert(minAmountRes.body.error && minAmountRes.body.error.includes('100 paise'), `Error message mentions 100 paise constraint: "${minAmountRes.body.error}"`);
    console.log();

    // 3. Test POST /api/verify-payment with missing fields
    console.log('[TEST 3] Testing verify-payment missing fields validation...');
    const missingFieldsRes = await request('/api/verify-payment', {
      method: 'POST',
      body: {
        order_id: createdOrderId
        // missing payment_id and razorpay_signature
      }
    });

    assert(missingFieldsRes.status === 400, `Expected status 400 for missing fields, got ${missingFieldsRes.status}`);
    assert(missingFieldsRes.body.success === false, `Response success is false`);
    console.log();

    // 4. Test POST /api/verify-payment with tampered / invalid signature (Security mismatch)
    console.log('[TEST 4] Testing verify-payment signature mismatch (anti-tamper test)...');
    const fakePaymentId = `pay_fake_${Date.now()}`;
    const tamperedSignature = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

    const mismatchRes = await request('/api/verify-payment', {
      method: 'POST',
      body: {
        order_id: createdOrderId,
        payment_id: fakePaymentId,
        razorpay_signature: tamperedSignature
      }
    });

    assert(mismatchRes.status === 400, `Expected status 400 for invalid signature, got ${mismatchRes.status}`);
    assert(mismatchRes.body.success === false, `Mismatch rejected with success = false`);
    assert(mismatchRes.body.error && mismatchRes.body.error.includes('signature mismatch'), `Error correctly identifies signature mismatch`);
    console.log();

    // 5. Test POST /api/verify-payment with authentic HMAC-SHA256 signature
    console.log('[TEST 5] Testing verify-payment with authentic HMAC-SHA256 signature...');
    const testPaymentId = `pay_test_${Date.now()}`;
    const expectedSignature = crypto
      .createHmac('sha256', KEY_SECRET)
      .update(`${createdOrderId}|${testPaymentId}`)
      .digest('hex');

    const validVerifyRes = await request('/api/verify-payment', {
      method: 'POST',
      body: {
        order_id: createdOrderId,
        payment_id: testPaymentId,
        razorpay_signature: expectedSignature
      }
    });

    assert(validVerifyRes.status === 200, `Expected status 200 for authentic signature, got ${validVerifyRes.status}`);
    assert(validVerifyRes.body.success === true, `Response success is true`);
    assert(validVerifyRes.body.payment_id === testPaymentId, `Returned payment_id matches`);
    assert(validVerifyRes.body.order_id === createdOrderId, `Returned order_id matches`);
    console.log();

    // 6. Test Full Platform Store Checkout Flow with Razorpay
    console.log('[TEST 6] Testing Complete Digital Product Store Checkout via Razorpay...');
    // Find an active published paid product (price > 0)
    const productsRes = await request('/api/products');
    const allProducts = productsRes.body.products || productsRes.body;
    const paidProduct = allProducts.find(p => (p.sale_price || p.regular_price) > 0) || { id: 11 };
    const testProductId = paidProduct.id;

    // Create cart order
    const storeOrderRes = await request('/api/orders', {
      method: 'POST',
      body: {
        customer_email: 'razorpay.customer@example.com',
        customer_name: 'Adarsh Deep',
        customer_phone: '+919876543210',
        items: [{ productId: testProductId }],
        payment_provider: 'razorpay',
        currency: 'INR'
      }
    });

    assert(storeOrderRes.status === 201, `Store order created with 201 Created`);
    assert(storeOrderRes.body.paymentSession?.provider === 'razorpay', `Order payment provider is razorpay`);
    assert(storeOrderRes.body.paymentSession?.orderId && storeOrderRes.body.paymentSession.orderId.startsWith('order_'), `Razorpay order ID generated: ${storeOrderRes.body.paymentSession.orderId}`);
    
    const storeOrderNumber = storeOrderRes.body.orderNumber;
    const storeRzpOrderId = storeOrderRes.body.paymentSession.orderId;
    const storePaymentId = `pay_rzp_live_${Date.now()}`;
    const storeSignature = crypto
      .createHmac('sha256', KEY_SECRET)
      .update(`${storeRzpOrderId}|${storePaymentId}`)
      .digest('hex');

    // Verify payment for store order
    const storeVerifyRes = await request('/api/verify-payment', {
      method: 'POST',
      body: {
        order_id: storeRzpOrderId,
        payment_id: storePaymentId,
        razorpay_signature: storeSignature,
        orderNumber: storeOrderNumber
      }
    });

    assert(storeVerifyRes.status === 200, `Store payment verified with 200 OK`);
    assert(storeVerifyRes.body.success === true, `Store payment success is true`);

    // Fetch order details to check digital downloads unlocked
    const orderDetailsRes = await request(`/api/orders/${storeOrderNumber}`);
    assert(orderDetailsRes.status === 200, `Order details retrieved`);
    assert(orderDetailsRes.body.order?.payment_status === 'paid', `Order payment_status is 'paid'`);
    assert(orderDetailsRes.body.order?.order_status === 'completed', `Order order_status is 'completed'`);
    assert(Array.isArray(orderDetailsRes.body.downloads) && orderDetailsRes.body.downloads.length > 0, `Digital downloads and token generated for buyer`);
    console.log();

    console.log('====================================================');
    console.log(`  VERIFICATION SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
    console.log('====================================================');

    if (failCount > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal test error:', error);
    process.exit(1);
  }
}

// Ensure server is reachable before running tests
async function main() {
  let attempts = 0;
  while (attempts < 10) {
    try {
      const health = await request('/api/health');
      if (health.status === 200) {
        return runRazorpayTests();
      }
    } catch (e) {
      // Wait and retry
    }
    attempts++;
    await new Promise(r => setTimeout(r, 1000));
  }
  console.error(`Server not responding on ${BASE_URL}. Please make sure backend is running.`);
  process.exit(1);
}

main();
