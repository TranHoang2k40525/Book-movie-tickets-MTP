// backend/middleware/authMiddleware.js
const { verifyToken } = require("../utils/JsonWebToken");

const authMiddleware = (req, res, next) => {
  try {
    // Lấy token từ header Authorization (Bearer token)
    const authHeader = req.headers.authorization;
    console.log("Authorization Header:", authHeader);
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ 
        message: "Không có token hoặc token không hợp lệ!",
        code: "INVALID_TOKEN"
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ 
        message: "Token không được cung cấp!",
        code: "MISSING_TOKEN"
      });
    }

    // Xác thực token
    let payload;
    try {
      payload = verifyToken(token);
      console.log("Token payload:", payload);
    } catch (err) {
      console.error("Token verification error:", err);
      if (err.message === "Token đã hết hạn") {
        return res.status(401).json({ 
          message: "Token đã hết hạn", 
          code: "TOKEN_EXPIRED" 
        });
      }
      return res.status(401).json({ 
        message: err.message,
        code: "TOKEN_ERROR"
      });
    }

    // Lưu thông tin người dùng vào req.user
    req.user = payload;
    console.log("User authenticated:", payload);

    
    // Kiểm tra quyền truy cập (bỏ qua nếu là admin)
    if (payload.AccountType !== 'ADMIN') {
      if (req.body.accountID && req.body.accountID !== payload.AccountID) {
          return res.status(403).json({
              message: "Bạn không có quyền truy cập dữ liệu này!",
              code: "ACCESS_DENIED"
          });
      }
      if (req.body.customerID && req.body.customerID !== payload.customerID) {
          return res.status(403).json({
              message: "Bạn không có quyền truy cập dữ liệu này!",
              code: "ACCESS_DENIED"
          });
      }
  }

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ 
      message: "Lỗi xác thực!",
      code: "AUTH_ERROR"
    });
  }
};

module.exports = authMiddleware;