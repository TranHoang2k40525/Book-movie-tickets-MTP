// backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();
const { connectDB } = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const movieRoutes = require('./routes/movies');
const locationRoutes = require('./routes/locations');
const likeRoutes = require("./routes/likes");
const productRoutes = require("./routes/products");
const notificationRoutes = require("./routes/notifications");
const voucherRoutes = require("./routes/vouchers")

const paymentRoutes = require("./routes/payments");
const datgheRoutes = require("./routes/datghe");
const app = express();




app.use(bodyParser.json());
app.use("/api", likeRoutes);

// Middleware kiểm tra Content-Type chỉ khi có body
app.use((req, res, next) => {
  if (
    req.method === "POST" &&
    req.body && // Kiểm tra xem có body không
    Object.keys(req.body).length > 0 && // Kiểm tra body không rỗng
    req.headers["content-type"] !== "application/json"
  ) {
    return res.status(400).json({ message: "Content-Type phải là application/json" });
  }
  next();
});

const port = 3000;
const host = '0.0.0.0'; // Lắng nghe trên tất cả các interface

// Phục vụ các file tĩnh
app.use('/Video', express.static(path.join(__dirname, 'assets/Video')));
app.use('/assets/images', express.static(path.join(__dirname, 'assets/images')));

// Tạo thư mục sản phẩm nếu chưa tồn tại
const fs = require('fs');
const productImagesPath = path.join(__dirname, 'assets/images/products');
if (!fs.existsSync(productImagesPath)) {
  console.log('Tạo thư mục sản phẩm:', productImagesPath);
  fs.mkdirSync(productImagesPath, { recursive: true });
  
  // Copy các ảnh mẫu từ fontend vào backend để sử dụng
  try {
    // Danh sách tên file ảnh sản phẩm
    const productImagesNames = [
      { source: '../fontend/src/assets/douong/Anh1.jpeg', dest: 'product1.jpeg' },
      { source: '../fontend/src/assets/douong/Anh2.jpeg', dest: 'product2.jpeg' },
      { source: '../fontend/src/assets/douong/Anh3.jpeg', dest: 'product3.jpeg' },
      { source: '../fontend/src/assets/douong/Anh6.jpeg', dest: 'product4.jpeg' },
      { source: '../fontend/src/assets/douong/Anh7.jpeg', dest: 'product5.jpeg' },
    ];
    
    productImagesNames.forEach(img => {
      const sourcePath = path.join(__dirname, img.source);
      const destPath = path.join(productImagesPath, img.dest);
      
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`Đã copy ${img.source} đến ${img.dest}`);
      } else {
        console.log(`Không tìm thấy file nguồn: ${sourcePath}`);
      }
    });
  } catch (err) {
    console.error('Lỗi khi copy ảnh sản phẩm mẫu:', err);
  }
}

// Route mặc định
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Movie Ticket Booking API!' });
});

// Sử dụng routes

app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api', locationRoutes);
app.use('/api', productRoutes);
app.use('/api', notificationRoutes);
app.use('/api', voucherRoutes);
app.use("/api", datgheRoutes);
app.use('/api/payments', paymentRoutes);




// Kết nối database và khởi động server
async function startServer() {
  try {
    await connectDB();
    app.listen(port, host, () => {
      console.log(`Server running at http://${host}:${port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

// Xử lý lỗi không bắt được
process.on('uncaughtException', (err) => {
  console.error('Unhandled Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});