const express = require('express');
const connectDB = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware để parse JSON
app.use(express.json());

// Kết nối database
let dbPool;
(async () => {
  dbPool = await connectDB();
})();

// API đăng nhập
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body; // Frontend gửi email và password

  // Kiểm tra dữ liệu đầu vào
  if (!email || !password) {
    return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin!' });
  }

  try {
    // Truy vấn người dùng từ bảng Account
    const result = await dbPool.request()
      .input('email', email)
      .query('SELECT * FROM [dbo].[Account] WHERE [AccountName] = @email');

    const user = result.recordset[0];
    if (!user) {
      return res.status(401).json({ message: 'Email không tồn tại!' });
    }

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.AccountPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mật khẩu không đúng!' });
    }

    // Tạo JWT token
    const token = jwt.sign(
      { id: user.AccountID, email: user.AccountName, type: user.AccountType },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Trả về thông tin đăng nhập thành công
    res.status(200).json({
      message: 'Đăng nhập thành công!',
      token,
      user: {
        id: user.AccountID,
        email: user.AccountName,
        type: user.AccountType
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});