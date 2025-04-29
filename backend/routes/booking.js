const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');
const db = require('../config/db');
const sql = require('mssql');

// Route cho user
// Lấy danh sách vé của người dùng

router.get('/bookings', authMiddleware, (req, res, next) => {
  console.log('Route called: GET /api/bookings');
  bookingController.getUserBookings(req, res, next);
});

router.get('/bookings/:bookingId', authMiddleware, (req, res, next) => {
  console.log('Route called: GET /api/bookings/:bookingId', req.params.bookingId);
  bookingController.getBookingById(req, res, next);
});
// Kiểm tra vé sắp hết hạn
router.get('/check-expiration', authMiddleware, bookingController.checkExpiringBookings);

// Lấy thông tin ghế của suất chiếu
router.get('/shows/:showId/seats', async (req, res) => {
  const { showId } = req.params;
  let pool;
  
  try {
    pool = await db.connectDB();
    const request = new sql.Request(pool);
    
    const result = await request
      .input('ShowID', sql.Int, showId)
      .query(`
        SELECT 
          chs.SeatID,
          chs.SeatNumber,
          chs.SeatRow,
          chs.SeatColumn,
          chs.SeatType,
          chs.Price,
          ISNULL(bs.Status, 'Available') AS Status
        FROM CinemaHallSeat chs
        JOIN Show s ON chs.CinemaHallID = s.CinemaHallID
        LEFT JOIN BookingSeat bs ON chs.SeatID = bs.SeatID AND bs.ShowID = s.ShowID
        WHERE s.ShowID = @ShowID
        ORDER BY chs.SeatRow, chs.SeatColumn
      `);
    
    const seats = result.recordset.map(seat => ({
      seatId: seat.SeatID,
      seatNumber: seat.SeatNumber,
      row: seat.SeatRow,
      column: seat.SeatColumn,
      type: seat.SeatType,
      price: parseFloat(seat.Price || 0),
      status: seat.Status
    }));
    
    res.status(200).json({
      success: true,
      seats: seats
    });
  } catch (error) {
    console.error('Error fetching seats:', error);
    res.status(500).json({ 
      error: 'Lỗi khi lấy thông tin ghế', 
      details: error.message 
    });
  } finally {
    if (pool) await pool.close();
  }
});


// --- Các route với tham số bookingId ---

// Lấy trạng thái đặt vé (cho tiến trình đặt vé)
router.get('/:bookingId/status', authMiddleware, bookingController.getBookingStatus);

// Lấy thông tin chi tiết đặt vé - phải đặt cuối cùng để tránh xung đột route
router.get('/:bookingId', authMiddleware, bookingController.getBookingById);



module.exports = router; 