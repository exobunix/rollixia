const Razorpay = require('razorpay');

function getRazorpayInstance() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    const error = new Error('Razorpay credentials missing. Please configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your environment.');
    error.status = 401;
    throw error;
  }

  return new Razorpay({
    key_id,
    key_secret
  });
}

module.exports = {
  getRazorpayInstance
};
