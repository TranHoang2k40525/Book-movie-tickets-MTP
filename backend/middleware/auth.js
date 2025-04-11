const jwt = require('jsonwebtoken');
const SECRET_KEY = 'your-secret-key'; // Thay bằng key bí mật mạnh hơn trong production

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Lấy token từ header "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'Không có token, truy cập bị từ chối!' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token không hợp lệ!' });
    }
    req.user = decoded; // Lưu thông tin người dùng từ token vào req.user
    next();
  });
};

module.exports = { authenticateToken };