// backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const cron = require('node-cron');
require('dotenv').config();
const { connectDB } = require('./config/db');
const { initializeWebSocket } = require('./websocket');
const { releaseExpiredSeatsCron } = require('./controllers/datgheController');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const movieRoutes = require('./routes/movies');
const locationRoutes = require('./routes/locations');
const likeRoutes = require('./routes/likes');
const productRoutes = require('./routes/products');
const notificationRoutes = require('./routes/notifications');
const voucherRoutes = require('./routes/vouchers');

const paymentRoutes = require('./routes/payments');
const datgheRoutes = require('./routes/datghe');
const ticketRoutes = require('./routes/ticket');

const app = express();

// Tạo HTTP server
const http = require('http');
const server = http.createServer(app);

// Khởi tạo WebSocket
initializeWebSocket(server);

app.use(bodyParser.json());
app.use(cors());
app.use('/api', likeRoutes);

// Middleware kiểm tra Content-Type
app.use((req, res, next) => {
  if (
    req.method === 'POST' &&
    req.body &&
    Object.keys(req.body).length > 0 &&
    req.headers['content-type'] !== 'application/json'
  ) {
    return res.status(400).json({ message: 'Content-Type phải là application/json' });
  }
  next();
});

// Phục vụ các file tĩnh
app.use('/Video', express.static(path.join(__dirname, 'assets/Video')));
app.use('/assets/images', express.static(path.join(__dirname, 'assets/images')));

// Tạo thư mục sản phẩm
const fs = require('fs');
const productImagesPath = path.join(__dirname, 'assets/images/products');
if (!fs.existsSync(productImagesPath)) {
  console.log('Tạo thư mục sản phẩm:', productImagesPath);
  fs.mkdirSync(productImagesPath, { recursive: true });
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
app.use('/api', datgheRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/tickets', ticketRoutes);
// Chạy cron job giải phóng ghế hết hạn
cron.schedule('*/1 * * * *', async () => {
  console.log('Running releaseExpiredSeatsCron');
  await releaseExpiredSeatsCron();
});

// Kết nối database và khởi động server
async function startServer() {
  try {
    await connectDB();
    server.listen(3000, '0.0.0.0', () => {
      console.log(`Server running at http://0.0.0.0:3000`);
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