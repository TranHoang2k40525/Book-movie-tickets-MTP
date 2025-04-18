// backend/server.js
<<<<<<< HEAD
=======
// backend/server.js
>>>>>>> 259430187e2398ff2d9c39e096d87a1c6ce7111b
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();
<<<<<<< HEAD
=======
require('dotenv').config();
>>>>>>> 259430187e2398ff2d9c39e096d87a1c6ce7111b
const { connectDB } = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const movieRoutes = require('./routes/movies');
const locationRoutes = require('./routes/locations');
const likeRoutes = require("./routes/likes");
const productRoutes = require("./routes/products");
const app = express();
<<<<<<< HEAD
=======

// Chỉ gọi cors và bodyParser một lần
>>>>>>> 259430187e2398ff2d9c39e096d87a1c6ce7111b
// Chỉ gọi cors và bodyParser một lần
app.use(cors());
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
const host = '0.0.0.0';
app.use('/Video', express.static(path.join(__dirname, 'assets/Video')));

// Route mặc định
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Movie Ticket Booking API!' });
<<<<<<< HEAD

=======
  res.json({ message: 'Welcome to the Movie Ticket Booking API!' });
>>>>>>> 259430187e2398ff2d9c39e096d87a1c6ce7111b
});

// Sử dụng routes
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api', locationRoutes);
app.use('/api', productRoutes);
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
<<<<<<< HEAD

=======
  try {
    await connectDB();
    app.listen(port, host, () => {
      console.log(`Server running at http://${host}:${port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
>>>>>>> 259430187e2398ff2d9c39e096d87a1c6ce7111b
}

startServer();

// Xử lý lỗi không bắt được
process.on('uncaughtException', (err) => {
  console.error('Unhandled Exception:', err);
  console.error('Unhandled Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

