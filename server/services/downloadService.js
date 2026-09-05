const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const TOKEN_SECRET = process.env.TOKEN_SECRET || 'super_secret_download_key_2026_antigravity';

function generateDownloadToken(orderId, userId, productFileId) {
  const payload = `${orderId}:${userId}:${productFileId}:${Date.now()}:${crypto.randomBytes(8).toString('hex')}`;
  const hmac = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex');
  return `${Buffer.from(payload).toString('base64url')}.${hmac}`;
}

function verifyDownloadToken(token) {
  try {
    const [payloadB64, hmac] = token.split('.');
    if (!payloadB64 || !hmac) return null;

    const payload = Buffer.from(payloadB64, 'base64url').toString('utf-8');
    const expectedHmac = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex');

    if (hmac !== expectedHmac) {
      return null;
    }

    const [orderId, userId, productFileId, timestamp] = payload.split(':');
    return {
      orderId: parseInt(orderId),
      userId: parseInt(userId),
      productFileId: parseInt(productFileId),
      createdAt: parseInt(timestamp)
    };
  } catch (err) {
    return null;
  }
}

module.exports = {
  generateDownloadToken,
  verifyDownloadToken
};
