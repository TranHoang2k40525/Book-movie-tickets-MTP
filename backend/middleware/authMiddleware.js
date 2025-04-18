// backend/middleware/authMiddleware.js
const { verifyToken } = require("../utils/JsonWebToken");

const authMiddleware = (req, res, next) => {
  // Lấy token từ header Authorization (Bearer token)
  const authHeader = req.headers.authorization;
  console.log("Authorization Header:", authHeader);
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Không có token hoặc token không hợp lệ!" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token không được cung cấp!" });
  }

  // Xác thực token
  let payload;
  try {
    payload = verifyToken(token);
  } catch (err) {
    if (err.message === "Token đã hết hạn") {
      return res.status(401).json({ message: "Token đã hết hạn", code: "TOKEN_EXPIRED" });
    }
    return res.status(401).json({ message: err.message });
  }

  // Lưu thông tin người dùng vào req.user
  req.user = payload;

  // Kiểm tra quyền truy cập (nếu cần)
  if (req.body.accountID && req.body.accountID !== payload.AccountID) {
    return res.status(403).json({ message: "Bạn không có quyền truy cập dữ liệu này!" });
  }
  if (req.body.customerID && req.body.customerID !== payload.customerID) {
    return res.status(403).json({ message: "Bạn không có quyền truy cập dữ liệu này!" });
  }

  next();
};

module.exports = authMiddleware;