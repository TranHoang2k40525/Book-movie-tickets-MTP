// backend/routes/movies.js
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const sql = require('mssql');
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');
const movieController = require('../controllers/movieController');

// Route để đặt ghế tạm thời
router.post('/:showId/hold-seats', authMiddleware, async (req, res) => {
  const { showId } = req.params;
  const { seatIds } = req.body;
  const customerId = req.user.customerID; // Lấy từ token (cần đảm bảo nhất quán với tên cột trong DB)

  console.log('Received showId:', showId);
  console.log('Received seatIds:', seatIds);
  console.log('CustomerId from token:', customerId);

  if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
    return res.status(400).json({ error: 'Danh sách ghế không hợp lệ' });
  }

  let pool;
  let transaction;
  try {
    console.log('Attempting to get database connection...');
    pool = await db.connectDB();
    console.log('Starting transaction...');
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    const request = new sql.Request(transaction);

    console.log('Checking existing seats...');
    // Thêm tham số ShowID
    request.input('ShowID', sql.Int, showId);
    // Thêm từng SeatID vào request
    seatIds.forEach((seatId, index) => {
      request.input(`SeatID${index}`, sql.Int, seatId);
    });

    // Tạo truy vấn IN với danh sách tham số
    const seatParams = seatIds.map((_, i) => `@SeatID${i}`).join(',');
    const existingSeatsResult = await request.query(`
      SELECT SeatID, Status 
      FROM BookingSeat 
      WHERE ShowID = @ShowID AND SeatID IN (${seatParams})
    `);

    const existingSeats = existingSeatsResult.recordset;
    console.log('Existing seats:', existingSeats);

    // Kiểm tra cả ghế đã đặt chính thức và đặt tạm thời
    const unavailableSeats = existingSeats.filter(seat => 
      seat.Status === 'Confirmed' || 
      (seat.Status === 'Pending' && new Date(seat.HoldUntil) > new Date())
    );
    
    if (unavailableSeats.length > 0) {
      await transaction.rollback();
      return res.status(400).json({ 
        error: 'Một số ghế đã được đặt hoặc đang được giữ bởi người dùng khác',
        unavailableSeats: unavailableSeats.map(s => s.SeatID)
      });
    }

    console.log('Deleting old pending seats...');
    await request
      .input('CustomerID', sql.Int, customerId) // CustomerID (viết hoa) để khớp với tên cột trong DB
      .query(`
        DELETE FROM BookingSeat 
        WHERE ShowID = @ShowID AND CustomerID = @CustomerID AND Status = 'Pending'
      `);

    console.log('Fetching show details...');
    const showResult = await request
      .query(`SELECT TicketPrice FROM [Show] WHERE ShowID = @ShowID`);
    console.log('Show:', showResult.recordset);

    if (!showResult.recordset.length) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Suất chiếu không tồn tại' });
    }
    const ticketPrice = showResult.recordset[0].TicketPrice;

    console.log('Creating new booking...');
    const bookingId = uuidv4();
    // Thay đổi thời gian giữ ghế từ 5 phút xuống 1 phút (60000 ms)
    const holdUntil = new Date(Date.now() + 60000);
    const bookingSeats = seatIds.map(seatId => ({
      BookingSeatID: uuidv4(),
      BookingID: bookingId,
      ShowID: showId,
      SeatID: seatId,
      CustomerID: customerId, // CustomerID (viết hoa) để khớp với tên cột trong DB
      Status: 'Pending',
      TicketPrice: ticketPrice,
      HoldUntil: holdUntil,
    }));

    console.log('Inserting booking seats...');
    for (const seat of bookingSeats) {
      await request
        .input('BookingSeatID', sql.NVarChar, seat.BookingSeatID)
        .input('BookingID', sql.NVarChar, seat.BookingID)
        .input('SeatID', sql.Int, seat.SeatID)
        .input('CustomerID', sql.Int, seat.CustomerID) // CustomerID (viết hoa) để khớp với tham số đúng
        .input('TicketPrice', sql.Decimal(10, 2), seat.TicketPrice)
        .input('HoldUntil', sql.DateTime, seat.HoldUntil)
        .query(`
          INSERT INTO BookingSeat (BookingSeatID, BookingID, ShowID, SeatID, CustomerID, Status, TicketPrice, HoldUntil)
          VALUES (@BookingSeatID, @BookingID, @ShowID, @SeatID, @CustomerID, 'Pending', @TicketPrice, @HoldUntil)
        `);
    }

    console.log('Committing transaction...');
    await transaction.commit();

    // Set timeout để xóa ghế hết hạn - giảm xuống 1 phút
    setTimeout(async () => {
      let cleanupPool;
      try {
        cleanupPool = await db.connectDB();
        const cleanupRequest = new sql.Request(cleanupPool);
        await cleanupRequest
          .input('BookingID', sql.NVarChar, bookingId)
          .input('CurrentTime', sql.DateTime, new Date())
          .query(`
            DELETE FROM BookingSeat 
            WHERE BookingID = @BookingID AND Status = 'Pending' AND HoldUntil <= @CurrentTime
          `);
        console.log(`Cleaned up expired seats for booking ${bookingId}`);
      } catch (err) {
        console.error('Error cleaning up expired seats:', err);
      } finally {
        if (cleanupPool) {
          await cleanupPool.close();
        }
      }
    }, 60000); // 1 phút (60000 ms)

    res.status(200).json({ 
      message: 'Đặt ghế tạm thời thành công', 
      bookingId,
      expirationTime: holdUntil // Trả về thời gian hết hạn để frontend có thể hiển thị đếm ngược
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error('Error holding seats:', error);
    res.status(500).json({ error: 'Lỗi khi đặt ghế tạm thời', details: error.message });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
});

// Thêm route mới để kiểm tra và giải phóng ghế đã hết hạn
router.get('/:showId/expired-seats', async (req, res) => {
  const { showId } = req.params;
  let pool;
  
  try {
    pool = await db.connectDB();
    const request = new sql.Request(pool);
    
    // Xóa các ghế đã hết hạn và trả về danh sách các ghế đã được giải phóng
    const result = await request
      .input('ShowID', sql.Int, showId)
      .input('CurrentTime', sql.DateTime, new Date())
      .query(`
        DELETE FROM BookingSeat 
        OUTPUT DELETED.SeatID
        WHERE ShowID = @ShowID AND Status = 'Pending' AND HoldUntil <= @CurrentTime
      `);
    
    const releasedSeats = result.recordset.map(row => row.SeatID);
    
    res.status(200).json({ 
      message: 'Kiểm tra ghế hết hạn thành công', 
      releasedSeats 
    });
  } catch (error) {
    console.error('Error checking expired seats:', error);
    res.status(500).json({ error: 'Lỗi khi kiểm tra ghế hết hạn', details: error.message });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
});

// Các route khác giữ nguyên
router.get('/', movieController.getAllMovies);
router.get('/:id', movieController.getMovieById);
router.get('/:id/showtimes', movieController.getShowtimesByMovieId);
router.get('/:id/cinemas', movieController.getCinemasByMovieAndDate);
router.get('/:movieId/cinemas/:cinemaId/showtimes', movieController.getShowtimesByCinemaAndDate);
router.get('/movies/showing-today', movieController.getMoviesShowingToday);
router.get('/cinemas/:cinemaId/movies-and-showtimes', movieController.getMoviesAndShowtimesByCinema);
router.get('/:showId/seats', movieController.getSeatMapByShow);

module.exports = router;