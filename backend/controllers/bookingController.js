const db = require('../config/db');
const sql = require('mssql');
const { createNotification } = require('./notifications');

// Lấy danh sách vé của người dùng
const getUserBookings = async (req, res, next) => {
  let pool;
  try {
    const customerId = req.user.customerID;
    console.log('Fetching bookings for customer:', customerId);

    pool = await db.connectDB();
    const request = new sql.Request(pool);

    const result = await request
      .input('CustomerID', sql.Int, customerId)
      .query(`
        SELECT 
          b.BookingID,
          b.CustomerID,
          b.ShowID,
          b.TotalSeats,
          b.Status AS BookingStatus,
          s.ShowDate,
          s.ShowTime,
          m.MovieID,
          m.MovieTitle AS Title,
          m.MovieDescription AS Description,
          m.MovieRuntime AS Runtime,
          m.ImageUrl AS PosterUrl,
          ch.HallID,
          ch.HallName,
          c.CinemaID,
          c.CinemaName,
          c.CityAddress AS CinemaAddress,
          p.PaymentID,
          p.Amount,
          p.PaymentDate,
          p.PaymentMethod,
          bs.HoldUntil,
          cus.CustomerName AS FullName,
          cus.CustomerEmail
        FROM Booking b
        JOIN Show s ON b.ShowID = s.ShowID
        JOIN Movie m ON s.MovieID = m.MovieID
        JOIN CinemaHall ch ON s.HallID = ch.HallID
        JOIN Cinema c ON ch.CinemaID = c.CinemaID
        LEFT JOIN Payment p ON b.BookingID = p.BookingID
        JOIN Customer cus ON b.CustomerID = cus.CustomerID
        LEFT JOIN BookingSeat bs ON b.BookingID = bs.BookingID
        WHERE b.CustomerID = @CustomerID
        ORDER BY s.ShowDate DESC, s.ShowTime DESC
      `);

    const bookings = result.recordset.reduce((acc, row) => {
      let booking = acc.find(b => b.BookingID === row.BookingID);
      if (!booking) {
        booking = {
          BookingID: row.BookingID,
          Customer: {
            CustomerID: row.CustomerID,
            FullName: row.FullName,
            CustomerEmail: row.CustomerEmail,
          },
          Show: {
            ShowID: row.ShowID,
            ShowDate: row.ShowDate,
            ShowTime: row.ShowTime.toString().substring(0, 5), // Format HH:mm
          },
          Movie: {
            MovieID: row.MovieID,
            Title: row.Title,
            Description: row.Description,
            Runtime: row.Runtime,
            PosterUrl: row.PosterUrl ? Buffer.from(row.PosterUrl).toString('base64') : null,
          },
          CinemaHall: {
            HallID: row.HallID,
            HallName: row.HallName,
            CinemaName: row.CinemaName,
            CinemaAddress: row.CinemaAddress,
          },
          Payment: row.PaymentID ? {
            PaymentID: row.PaymentID,
            Amount: parseFloat(row.Amount || 0),
            PaymentDate: row.PaymentDate,
            PaymentMethod: row.PaymentMethod,
          } : null,
          TotalSeats: row.TotalSeats,
          Status: row.BookingStatus,
          HoldUntil: row.HoldUntil,
          BookingSeats: [],
        };
        acc.push(booking);
      }
      if (row.SeatID) {
        booking.BookingSeats.push({
          SeatID: row.SeatID,
          SeatNumber: row.SeatNumber,
          TicketPrice: parseFloat(row.TicketPrice || 0),
        });
      }
      return acc;
    }, []);

    // Kiểm tra trạng thái hết hạn
    const now = new Date();
    for (const booking of bookings) {
      if (booking.Status !== 'Expired') {
        const showDateTime = new Date(`${booking.Show.ShowDate.toISOString().split('T')[0]}T${booking.Show.ShowTime}:00`);
        if (booking.HoldUntil && new Date(booking.HoldUntil) < now) {
          booking.Status = 'Expired';
          await updateBookingStatus(booking.BookingID, 'Expired', pool);
          await createNotification(
            customerId,
            `Vé của bạn cho phim "${booking.Movie.Title}" đã hết hạn.`,
            req.headers['user-agent'],
            req.ip
          );
        } else if (showDateTime < now) {
          booking.Status = 'Expired';
          await updateBookingStatus(booking.BookingID, 'Expired', pool);
          await createNotification(
            customerId,
            `Vé của bạn cho phim "${booking.Movie.Title}" đã hết hạn do suất chiếu đã kết thúc.`,
            req.headers['user-agent'],
            req.ip
          );
        }
      }
    }

    res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách vé', details: error.message });
  } finally {
    if (pool) await pool.close();
  }
};

// Lấy thông tin chi tiết một vé
const getBookingById = async (req, res, next) => {
  let pool;
  try {
    const { bookingId } = req.params;
    const customerId = req.user.customerID;

    pool = await db.connectDB();
    const request = new sql.Request(pool);

    const result = await request
      .input('BookingID', sql.Int, bookingId)
      .input('CustomerID', sql.Int, customerId)
      .query(`
        SELECT 
          b.BookingID,
          b.CustomerID,
          b.ShowID,
          b.TotalSeats,
          b.Status AS BookingStatus,
          s.ShowDate,
          s.ShowTime,
          m.MovieID,
          m.MovieTitle AS Title,
          m.MovieDescription AS Description,
          m.MovieRuntime AS Runtime,
          m.ImageUrl AS PosterUrl,
          ch.HallID,
          ch.HallName,
          c.CinemaID,
          c.CinemaName,
          c.CityAddress AS CinemaAddress,
          p.PaymentID,
          p.Amount,
          p.PaymentDate,
          p.PaymentMethod,
          bs.SeatID,
          bs.SeatNumber,
          bs.TicketPrice,
          bs.HoldUntil,
          cus.CustomerName AS FullName,
          cus.CustomerEmail
        FROM Booking b
        JOIN Show s ON b.ShowID = s.ShowID
        JOIN Movie m ON s.MovieID = m.MovieID
        JOIN CinemaHall ch ON s.HallID = ch.HallID
        JOIN Cinema c ON ch.CinemaID = c.CinemaID
        LEFT JOIN Payment p ON b.BookingID = p.BookingID
        JOIN Customer cus ON b.CustomerID = cus.CustomerID
        LEFT JOIN BookingSeat bs ON b.BookingID = bs.BookingID
        WHERE b.BookingID = @BookingID AND b.CustomerID = @CustomerID
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy vé' });
    }

    const booking = result.recordset.reduce((acc, row) => {
      if (!acc.BookingID) {
        acc = {
          BookingID: row.BookingID,
          Customer: {
            CustomerID: row.CustomerID,
            FullName: row.FullName,
            CustomerEmail: row.CustomerEmail,
          },
          Show: {
            ShowID: row.ShowID,
            ShowDate: row.ShowDate,
            ShowTime: row.ShowTime.toString().substring(0, 5),
          },
          Movie: {
            MovieID: row.MovieID,
            Title: row.Title,
            Description: row.Description,
            Runtime: row.Runtime,
            PosterUrl: row.PosterUrl ? Buffer.from(row.PosterUrl).toString('base64') : null,
          },
          CinemaHall: {
            HallID: row.HallID,
            HallName: row.HallName,
            CinemaName: row.CinemaName,
            CinemaAddress: row.CinemaAddress,
          },
          Payment: row.PaymentID ? {
            PaymentID: row.PaymentID,
            Amount: parseFloat(row.Amount || 0),
            PaymentDate: row.PaymentDate,
            PaymentMethod: row.PaymentMethod,
          } : null,
          TotalSeats: row.TotalSeats,
          Status: row.BookingStatus,
          HoldUntil: row.HoldUntil,
          BookingSeats: [],
        };
      }
      if (row.SeatID) {
        acc.BookingSeats.push({
          SeatID: row.SeatID,
          SeatNumber: row.SeatNumber,
          TicketPrice: parseFloat(row.TicketPrice || 0),
        });
      }
      return acc;
    }, {});

    // Kiểm tra trạng thái hết hạn
    const now = new Date();
    const showDateTime = new Date(`${booking.Show.ShowDate.toISOString().split('T')[0]}T${booking.Show.ShowTime}:00`);
    if (booking.Status !== 'Expired') {
      if (booking.HoldUntil && new Date(booking.HoldUntil) < now) {
        booking.Status = 'Expired';
        await updateBookingStatus(booking.BookingID, 'Expired', pool);
        await createNotification(
          customerId,
          `Vé của bạn cho phim "${booking.Movie.Title}" đã hết hạn.`,
          req.headers['user-agent'],
          req.ip
        );
      } else if (showDateTime < now) {
        booking.Status = 'Expired';
        await updateBookingStatus(booking.BookingID, 'Expired', pool);
        await createNotification(
          customerId,
          `Vé của bạn cho phim "${booking.Movie.Title}" đã hết hạn do suất chiếu đã kết thúc.`,
          req.headers['user-agent'],
          req.ip
        );
      }
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error('Error fetching booking by ID:', error);
    res.status(500).json({ error: 'Lỗi khi lấy thông tin vé', details: error.message });
  } finally {
    if (pool) await pool.close();
  }
};

// Kiểm tra vé sắp hết hạn
const checkExpiringBookings = async (req, res, next) => {
  let pool;
  try {
    const customerId = req.user.customerID;
    pool = await db.connectDB();
    const request = new sql.Request(pool);

    const result = await request
      .input('CustomerID', sql.Int, customerId)
      .query(`
        SELECT 
          b.BookingID,
          b.Status AS BookingStatus,
          s.ShowDate,
          s.ShowTime,
          m.MovieTitle AS Title,
          bs.HoldUntil
        FROM Booking b
        JOIN Show s ON b.ShowID = s.ShowID
        JOIN Movie m ON s.MovieID = m.MovieID
        LEFT JOIN BookingSeat bs ON b.BookingID = bs.BookingID
        WHERE b.CustomerID = @CustomerID AND b.Status != 'Expired'
      `);

    const now = new Date();
    let expiringTickets = 0;

    for (const row of result.recordset) {
      const showDateTime = new Date(`${row.ShowDate.toISOString().split('T')[0]}T${row.ShowTime.toString().substring(0, 5)}:00`);
      if (row.HoldUntil && new Date(row.HoldUntil) < now) {
        await updateBookingStatus(row.BookingID, 'Expired', pool);
        await createNotification(
          customerId,
          `Vé của bạn cho phim "${row.Title}" đã hết hạn.`,
          req.headers['user-agent'],
          req.ip
        );
        expiringTickets++;
      } else if (showDateTime < now) {
        await updateBookingStatus(row.BookingID, 'Expired', pool);
        await createNotification(
          customerId,
          `Vé của bạn cho phim "${row.Title}" đã hết hạn do suất chiếu đã kết thúc.`,
          req.headers['user-agent'],
          req.ip
        );
        expiringTickets++;
      } else if (row.HoldUntil) {
        const timeDiff = new Date(row.HoldUntil) - now;
        if (timeDiff <= 24 * 60 * 60 * 1000) { // Sắp hết hạn trong 24 giờ
          await createNotification(
            customerId,
            `Vé của bạn cho phim "${row.Title}" sẽ hết hạn vào ${new Date(row.HoldUntil).toLocaleString('vi-VN')}.`,
            req.headers['user-agent'],
            req.ip
          );
          expiringTickets++;
        }
      }
    }

    res.status(200).json({
      success: true,
      message: expiringTickets > 0 ? `Có ${expiringTickets} vé sắp hết hạn hoặc đã hết hạn.` : 'Không có vé sắp hết hạn.',
      expiringTickets,
    });
  } catch (error) {
    console.error('Error checking expiring bookings:', error);
    res.status(500).json({ error: 'Lỗi khi kiểm tra vé hết hạn', details: error.message });
  } finally {
    if (pool) await pool.close();
  }
};

// Hàm hỗ trợ: Cập nhật trạng thái đặt vé
const updateBookingStatus = async (bookingId, status, pool) => {
  const request = new sql.Request(pool);
  await request
    .input('BookingID', sql.Int, bookingId)
    .input('Status', sql.VarChar(20), status)
    .query(`
      UPDATE Booking
      SET Status = @Status
      WHERE BookingID = @BookingID
    `);
};

// Lấy trạng thái đặt vé
const getBookingStatus = async (req, res, next) => {
  let pool;
  try {
    const { bookingId } = req.params;
    const customerId = req.user.customerID;

    pool = await db.connectDB();
    const request = new sql.Request(pool);

    const result = await request
      .input('BookingID', sql.Int, bookingId)
      .input('CustomerID', sql.Int, customerId)
      .query(`
        SELECT Status, HoldUntil
        FROM Booking b
        WHERE b.BookingID = @BookingID AND b.CustomerID = @CustomerID
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy vé' });
    }

    const { Status, HoldUntil } = result.recordset[0];
    res.status(200).json({
      success: true,
      status: Status,
      holdUntil: HoldUntil,
    });
  } catch (error) {
    console.error('Error fetching booking status:', error);
    res.status(500).json({ error: 'Lỗi khi lấy trạng thái vé', details: error.message });
  } finally {
    if (pool) await pool.close();
  }
};

module.exports = {
  getUserBookings,
  getBookingById,
  checkExpiringBookings,
  getBookingStatus,
};