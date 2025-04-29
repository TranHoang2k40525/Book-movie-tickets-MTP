const { v4: uuidv4 } = require('uuid');
const sql = require('mssql');
const db = require('../config/db');

// Thời gian mặc định để khóa ghế (5 phút)
const DEFAULT_LOCK_DURATION = 300; // 5 phút tính bằng giây

// Giữ nguyên các hàm khác
const getBookingStatus = async (req, res) => {
  const { bookingId } = req.params;
  let pool;
  try {
    pool = await db.connectDB();
    const request = new sql.Request(pool);

    const bookingOwnerCheck = await request
      .input('BookingID', sql.NVarChar, bookingId)
      .input('CustomerID', sql.Int, req.user.customerID)
      .query(`
        SELECT BookingID
        FROM Booking
        WHERE BookingID = @BookingID AND CustomerID = @CustomerID
      `);

    if (!bookingOwnerCheck.recordset.length) {
      return res.status(404).json({ error: 'Không tìm thấy thông tin đặt vé' });
    }

    const bookingResult = await request
      .input('BookingID', sql.NVarChar, bookingId)
      .query(`
        SELECT bs.*, chs.SeatNumber, chs.SeatType
        FROM BookingSeat bs
        JOIN CinemaHallSeat chs ON bs.SeatID = chs.SeatID
        WHERE bs.BookingID = @BookingID
      `);

    if (!bookingResult.recordset.length) {
      return res.status(404).json({ error: 'Không tìm thấy thông tin ghế' });
    }

    const seats = bookingResult.recordset.map((seat) => ({
      seatId: seat.SeatID,
      seatNumber: seat.SeatNumber,
      seatType: seat.SeatType,
      status: seat.Status,
      price: parseFloat(seat.TicketPrice || 0),
    }));

    const firstRecord = bookingResult.recordset[0];

    let remainingTime = 0;
    if (firstRecord.Status === 'Held' && firstRecord.HoldUntil) {
      const expiryTime = new Date(firstRecord.HoldUntil).getTime();
      const currentTime = Date.now();
      remainingTime = Math.max(0, Math.floor((expiryTime - currentTime) / 1000));
    }

    const showResult = await request
      .input('ShowID', sql.Int, firstRecord.ShowID)
      .query(`
        SELECT s.*, m.MovieTitle, m.MovieLanguage, m.ImageUrl AS PosterUrl
        FROM [Show] s
        JOIN Movie m ON s.MovieID = m.MovieID
        WHERE s.ShowID = @ShowID
      `);

    const showInfo = showResult.recordset[0] || {};

    return res.status(200).json({
      success: true,
      data: {
        bookingId,
        showId: firstRecord.ShowID,
        status: firstRecord.Status,
        seats,
        totalPrice: seats.reduce((sum, seat) => sum + seat.price, 0),
        remainingTime,
        showInfo,
      },
    });
  } catch (error) {
    console.error('Lỗi khi lấy trạng thái đặt vé:', error);
    return res.status(500).json({
      error: 'Không thể lấy thông tin đặt vé',
      details: error.message,
    });
  } finally {
    if (pool) await pool.close();
  }
};

const getUserBookings = async (req, res) => {
  const customerId = req.user.customerID;
  let pool;

  try {
    pool = await db.connectDB();
    const request = new sql.Request(pool);

    const checkResult = await request
      .input('CustomerID', sql.Int, customerId)
      .query(`
        SELECT COUNT(*) AS BookingCount
        FROM Booking
        WHERE CustomerID = @CustomerID
      `);

    if (checkResult.recordset[0].BookingCount === 0) {
      return res.status(200).json({ bookings: [], message: 'Hiện tại bạn chưa có vé nào' });
    }

    const bookingsResult = await request
      .input('CustomerID', sql.Int, customerId)
      .query(`
        SELECT
          b.BookingID,
          b.CustomerID,
          b.ShowID,
          b.TotalSeats,
          b.TotalPrice,
          b.Status,
          s.MovieID,
          s.HallID AS CinemaHallID,
          s.ShowTime,
          s.ShowDate
        FROM Booking b
        JOIN [Show] s ON b.ShowID = s.ShowID
        WHERE b.CustomerID = @CustomerID
        ORDER BY s.ShowDate DESC, s.ShowTime DESC
      `);

    const bookings = [];

    for (const booking of bookingsResult.recordset) {
      const movieResult = await request
        .input('MovieID', sql.Int, booking.MovieID)
        .query(`
          SELECT
            MovieID,
            MovieTitle AS Title,
            MovieDescription AS Description,
            MovieRuntime AS Runtime,
            ImageUrl AS PosterUrl
          FROM Movie
          WHERE MovieID = @MovieID
        `);

      const cinemaHallResult = await request
        .input('HallID', sql.Int, booking.CinemaHallID)
        .query(`
          SELECT
            ch.HallID,
            ch.HallName AS HallName,
            c.CinemaID,
            c.CinemaName AS CinemaName,
            c.CityAddress AS CinemaAddress
          FROM CinemaHall ch
          JOIN Cinema c ON ch.CinemaID = c.CinemaID
          WHERE ch.HallID = @HallID
        `);

      const bookingSeatsResult = await request
        .input('BookingID', sql.NVarChar, booking.BookingID)
        .query(`
          SELECT
            bs.BookingSeatID,
            bs.SeatID,
            bs.Status,
            bs.TicketPrice,
            bs.HoldUntil,
            chs.SeatNumber,
            chs.SeatType
          FROM BookingSeat bs
          JOIN CinemaHallSeat chs ON bs.SeatID = chs.SeatID
          WHERE bs.BookingID = @BookingID
        `);

      const paymentResult = await request
        .input('BookingID', sql.NVarChar, booking.BookingID)
        .query(`
          SELECT
            PaymentID,
            Amount,
            PaymentDate,
            PaymentMethod
          FROM Payment
          WHERE BookingID = @BookingID
        `);

      const bookingWithDetails = {
        BookingID: booking.BookingID,
        CustomerID: booking.CustomerID,
        ShowID: booking.ShowID,
        TotalSeats: booking.TotalSeats,
        TotalPrice: parseFloat(booking.TotalPrice || 0),
        Status: booking.Status,
        Show: {
          ShowID: booking.ShowID,
          MovieID: booking.MovieID,
          ShowTime: booking.ShowTime,
          ShowDate: booking.ShowDate,
        },
        Movie: movieResult.recordset[0] || null,
        CinemaHall: cinemaHallResult.recordset[0] || null,
        BookingSeats: bookingSeatsResult.recordset || [],
        Payment: paymentResult.recordset[0] || null,
      };

      bookings.push(bookingWithDetails);
    }

    res.status(200).json({ bookings });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách vé:', error);
    res.status(200).json({
      bookings: [],
      message: 'Không thể lấy danh sách vé',
    });
  } finally {
    if (pool) await pool.close();
  }
};

const checkExpiringBookings = async (req, res) => {
  const customerId = req.user.customerID;
  let pool;

  try {
    pool = await db.connectDB();
    const request = new sql.Request(pool);

    const checkResult = await request
      .input('CustomerID', sql.Int, customerId)
      .query(`
        SELECT COUNT(*) AS BookingCount
        FROM Booking
        WHERE CustomerID = @CustomerID
      `);

    if (checkResult.recordset[0].BookingCount === 0) {
      return res.status(200).json({
        message: 'Bạn chưa có vé nào',
        expiringTickets: 0,
      });
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const result = await request
      .input('CustomerID', sql.Int, customerId)
      .input('Tomorrow', sql.DateTime, tomorrow)
      .query(`
        SELECT
          b.BookingID,
          m.MovieTitle AS MovieTitle,
          s.ShowTime,
          s.ShowDate
        FROM Booking b
        JOIN [Show] s ON b.ShowID = s.ShowID
        JOIN Movie m ON s.MovieID = m.MovieID
        WHERE
          b.CustomerID = @CustomerID
          AND b.Status = 'Confirmed'
          AND s.ShowDate <= @Tomorrow
          AND s.ShowDate >= GETDATE()
          AND NOT EXISTS (
            SELECT 1 FROM Notification n
            WHERE
              n.CustomerID = @CustomerID
              AND n.Message LIKE '%' + m.MovieTitle + '%sắp hết hạn%'
          )
        GROUP BY b.BookingID, m.MovieTitle, s.ShowTime, s.ShowDate
      `);

    const { createNotification } = require('../routes/notifications');

    for (const booking of result.recordset) {
      const message = `Vé của bạn cho phim ${booking.MovieTitle} vào lúc ${booking.ShowTime} ngày ${booking.ShowDate.toISOString().split('T')[0]} sắp hết hạn. Vui lòng đến rạp để trải nghiệm!`;
      await createNotification(customerId, message);
    }

    res.status(200).json({
      message: 'Đã kiểm tra các vé sắp hết hạn',
      expiringTickets: result.recordset.length,
    });
  } catch (error) {
    console.error('Lỗi khi kiểm tra vé sắp hết hạn:', error);
    res.status(200).json({
      message: 'Không thể kiểm tra vé sắp hết hạn',
      expiringTickets: 0,
    });
  } finally {
    if (pool) await pool.close();
  }
};

const getBookingById = async (req, res) => {
  const { bookingId } = req.params;
  const customerId = req.user.customerID;

  if (!bookingId) {
    console.error('Mã đặt vé không hợp lệ:', bookingId);
    return res.status(400).json({
      error: 'Mã đặt vé không hợp lệ',
      details: 'Vui lòng cung cấp mã đặt vé',
    });
  }

  let pool;
  try {
    pool = await db.connectDB();
    const request = new sql.Request(pool);

    const bookingResult = await request
      .input('BookingID', sql.NVarChar, bookingId)
      .input('CustomerID', sql.Int, customerId)
      .query(`
        SELECT
          b.BookingID,
          b.CustomerID,
          b.ShowID,
          b.TotalSeats,
          b.TotalPrice,
          b.Status,
          s.MovieID,
          s.HallID AS CinemaHallID,
          s.ShowTime,
          s.ShowDate
        FROM Booking b
        JOIN [Show] s ON b.ShowID = s.ShowID
        WHERE b.BookingID = @BookingID AND b.CustomerID = @CustomerID
      `);

    if (!bookingResult.recordset.length) {
      return res.status(404).json({ error: 'Không tìm thấy thông tin đặt vé' });
    }

    const booking = bookingResult.recordset[0];

    const movieResult = await request
      .input('MovieID', sql.Int, booking.MovieID)
      .query(`
        SELECT
          MovieID,
          MovieTitle AS Title,
          MovieDescription AS Description,
          MovieRuntime AS Runtime,
          ImageUrl AS PosterUrl
        FROM Movie
        WHERE MovieID = @MovieID
      `);

    const cinemaHallResult = await request
      .input('HallID', sql.Int, booking.CinemaHallID)
      .query(`
        SELECT
          ch.HallID,
          ch.HallName AS HallName,
          c.CinemaID,
          c.CinemaName AS CinemaName,
          c.CityAddress AS CinemaAddress
        FROM CinemaHall ch
        JOIN Cinema c ON ch.CinemaID = c.CinemaID
        WHERE ch.HallID = @HallID
      `);

    const bookingSeatsResult = await request
      .input('BookingID', sql.NVarChar, booking.BookingID)
      .query(`
        SELECT
          bs.BookingSeatID,
          bs.SeatID,
          bs.Status,
          bs.TicketPrice,
          bs.HoldUntil,
          chs.SeatNumber,
          chs.SeatType
        FROM BookingSeat bs
        JOIN CinemaHallSeat chs ON bs.SeatID = chs.SeatID
        WHERE bs.BookingID = @BookingID
      `);

    const paymentResult = await request
      .input('BookingID', sql.NVarChar, booking.BookingID)
      .query(`
        SELECT
          PaymentID,
          Amount,
          PaymentDate,
          PaymentMethod
        FROM Payment
        WHERE BookingID = @BookingID
      `);

    const customerResult = await request
      .input('CustomerID', sql.Int, booking.CustomerID)
      .query(`
        SELECT
          CustomerID,
          CustomerName AS FullName,
          CustomerEmail AS Email,
          CustomerPhone AS Phone
        FROM Customer
        WHERE CustomerID = @CustomerID
      `);

    const bookingWithDetails = {
      BookingID: booking.BookingID,
      CustomerID: booking.CustomerID,
      ShowID: booking.ShowID,
      TotalSeats: booking.TotalSeats,
      TotalPrice: parseFloat(booking.TotalPrice || 0),
      Status: booking.Status,
      Show: {
        ShowID: booking.ShowID,
        MovieID: booking.MovieID,
        ShowTime: booking.ShowTime,
        ShowDate: booking.ShowDate,
      },
      Movie: movieResult.recordset[0] || null,
      CinemaHall: cinemaHallResult.recordset[0] || null,
      BookingSeats: bookingSeatsResult.recordset || [],
      Payment: paymentResult.recordset[0] || null,
      Customer: customerResult.recordset[0] || null,
    };

    res.status(200).json({ booking: bookingWithDetails });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin đặt vé:', error);
    res.status(500).json({
      error: 'Không thể lấy thông tin đặt vé',
      details: error.message,
    });
  } finally {
    if (pool) await pool.close();
  }
};

module.exports = {
 
  getBookingStatus,
  getUserBookings,
  checkExpiringBookings,
  getBookingById,
};