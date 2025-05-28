const crypto = require('crypto');
const HMAC_SECRET = process.env.HMAC_SECRET || 'your_hmac_secret';

function generateHmac(data) {
  // data: object, stringify theo thứ tự keys tăng dần
  const keys = Object.keys(data).sort();
  const str = keys.map(k => `${k}=${data[k]}`).join('&');
  return crypto.createHmac('sha256', HMAC_SECRET).update(str).digest('hex');
}

module.exports = { generateHmac };
