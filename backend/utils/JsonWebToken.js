const crypto = require("crypto");

// Lấy khóa bí mật từ biến môi trường
const jwtSecret = process.env.JWT_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
const jwtAlgorithm = "HS256";

const base64url = (str) => {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
};

const generateToken = (user) => {
  if (!jwtSecret) throw new Error("JWT_SECRET is not defined");
  const header = {
    alg: jwtAlgorithm,
    typ: "JWT",
  };
  const payload = {
    ...user, // Bao gồm toàn bộ userData
    exp: Math.floor(Date.now() / 1000) + 15 * 60, // 15 phút
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const tokenData = `${encodedHeader}.${encodedPayload}`;

  const hmac = crypto.createHmac("sha256", jwtSecret);
  const signature = base64url(hmac.update(tokenData).digest("base64"));

  return `${tokenData}.${signature}`;
};

const generateRefreshToken = (user) => {
  if (!refreshTokenSecret) throw new Error("REFRESH_TOKEN_SECRET is not defined");
  const header = {
    alg: jwtAlgorithm,
    typ: "JWT",
  };
  const payload = {
    ...user, // Bao gồm toàn bộ userData
    exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 ngày
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const tokenData = `${encodedHeader}.${encodedPayload}`;

  const hmac = crypto.createHmac("sha256", refreshTokenSecret);
  const signature = base64url(hmac.update(tokenData).digest("base64"));

  return `${tokenData}.${signature}`;
};

const verifyToken = (token) => {
  if (!jwtSecret) throw new Error("JWT_SECRET is not defined");
  if (!token) throw new Error("Token không được cung cấp");

  const [encodedHeader, encodedPayload, signature] = token.split(".");
  if (!encodedHeader || !encodedPayload || !signature) {
    throw new Error("Token không hợp lệ: Cấu trúc không đúng");
  }

  const tokenData = `${encodedHeader}.${encodedPayload}`;
  const hmac = crypto.createHmac("sha256", jwtSecret);
  const computedSignature = base64url(hmac.update(tokenData).digest("base64"));

  if (computedSignature !== signature) {
    throw new Error("Token không hợp lệ: Chữ ký không khớp");
  }

  const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString());
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Token đã hết hạn");
  }

  return payload;
};

const verifyRefreshToken = (token) => {
  if (!refreshTokenSecret) throw new Error("REFRESH_TOKEN_SECRET is not defined");
  if (!token) throw new Error("Refresh token không được cung cấp");

  const [encodedHeader, encodedPayload, signature] = token.split(".");
  if (!encodedHeader || !encodedPayload || !signature) {
    throw new Error("Refresh token không hợp lệ: Cấu trúc không đúng");
  }

  const tokenData = `${encodedHeader}.${encodedPayload}`;
  const hmac = crypto.createHmac("sha256", refreshTokenSecret);
  const computedSignature = base64url(hmac.update(tokenData).digest("base64"));

  if (computedSignature !== signature) {
    throw new Error("Refresh token không hợp lệ: Chữ ký không khớp");
  }

  const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString());
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Refresh token đã hết hạn");
  }

  return payload;
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  base64url,
};