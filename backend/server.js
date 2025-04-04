const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { connectDB } = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const movieRoutes = require('./routes/movies');
const locationRoutes = require('./routes/locations');

const app = express();
const port = 3000;
const host = '0.0.0.0'; // Chấp nhận kết nối từ mọi IP

// Middleware
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(cors());
app.use(bodyParser.json());

// Route mặc định
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Movie Ticket Booking API!' });
});

// Sử dụng routes
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api', locationRoutes);

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