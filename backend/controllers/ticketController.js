const sql = require('mssql');
const { dbConfig } = require('../config/db');

const getTickets = async (req, res) => {
  const customerId = req.user?.customerID;
  const { page = 1, limit = 10 } = req.query; // Thêm phân trang
  const offset = (page - 1) * limit;
  let pool = null;

  if (!customerId) {
    return res.status(401).json({ success: false, message: 'Không tìm thấy thông tin người dùng' });
  }

  try {
    console.log('Kết nối đến SQL Server...');
    pool = await sql.connect(dbConfig);
    console.log('Đã kết nối SQL Server');

    const request = pool.request();
    request.input('customerId', sql.Int, customerId);
    request.input('offset', sql.Int, offset);
    request.input('limit', sql.Int, limit);

    const result = await request.query(`
      SELECT 
        b.BookingID,
        b.Status,
        b.TotalSeats,
        s.ShowDate,
        s.ShowTime,
        m.MovieTitle AS Title,
        m.ImageUrl AS PosterUrl,
        c.CinemaName,
        ch.HallName,
        p.Amount,
        (SELECT STRING_AGG(chs.SeatNumber, ', ') 
         FROM BookingSeat bs
         JOIN CinemaHallSeat chs ON bs.SeatID = chs.SeatID
         WHERE bs.BookingID = b.BookingID) AS SeatNumbers,
        MIN(bs.HoldUntil) AS HoldUntil
      FROM Booking b
      JOIN Show s ON b.ShowID = s.ShowID
      JOIN Movie m ON s.MovieID = m.MovieID
      JOIN CinemaHall ch ON s.HallID = ch.HallID
      JOIN Cinema c ON ch.CinemaID = c.CinemaID
      LEFT JOIN Payment p ON b.BookingID = p.BookingID
      JOIN BookingSeat bs ON b.BookingID = bs.BookingID
      WHERE b.CustomerID = @customerId AND b.Status = 'Confirmed'
      GROUP BY 
        b.BookingID,
        b.Status,
        b.TotalSeats,
        s.ShowDate,
        s.ShowTime,
        m.MovieTitle,
        m.ImageUrl,
        c.CinemaName,
        ch.HallName,
        p.Amount
      ORDER BY s.ShowDate DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `);

    const countResult = await request.query(`
      SELECT COUNT(*) AS total
      FROM Booking b
      WHERE b.CustomerID = @customerId AND b.Status = 'Confirmed'
    `);

    const tickets = result.recordset.map((ticket) => ({
      BookingID: ticket.BookingID,
      Status: ticket.Status,
      TotalSeats: ticket.TotalSeats,
      Show: {
        ShowDate: ticket.ShowDate,
        ShowTime: ticket.ShowTime,
      },
      Movie: {
        Title: ticket.Title,
        PosterUrl: ticket.PosterUrl,
      },
      CinemaHall: {
        CinemaName: ticket.CinemaName,
        HallName: ticket.HallName,
      },
      Payment: {
        Amount: ticket.Amount || 0,
      },
      BookingSeats: ticket.SeatNumbers
        ? ticket.SeatNumbers.split(', ').map((seatNumber) => ({ SeatNumber: seatNumber }))
        : [],
      HoldUntil: ticket.HoldUntil,
    }));

    console.log(`Fetched ${tickets.length} confirmed tickets for customer ${customerId}`);
    res.json({
      success: true,
      bookings: tickets,
      total: countResult.recordset[0].total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách vé:', error);
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  } finally {
    if (pool && pool.connected) {
      await pool.close();
      console.log('Đã đóng kết nối pool');
    }
  }
};

const getTicketById = async (req, res) => {
  const { bookingId } = req.params;
  const customerId = req.user?.customerID;
  let pool = null;

  if (!customerId) {
    return res.status(401).json({ success: false, message: 'Không tìm thấy thông tin người dùng' });
  }

  if (!bookingId || isNaN(bookingId)) {
    return res.status(400).json({ success: false, message: 'BookingID không hợp lệ' });
  }

  try {
    console.log('Kết nối đến SQL Server...');
    pool = await sql.connect(dbConfig);
    console.log('Đã kết nối SQL Server');

    const request = pool.request();
    request.input('bookingId', sql.Int, bookingId);
    request.input('customerId', sql.Int, customerId);

    const bookingResult = await request.query(`
      SELECT 
        b.BookingID,
        b.Status,
        b.TotalSeats,
        s.ShowDate,
        s.ShowTime,
        m.MovieTitle AS Title,
        m.ImageUrl AS PosterUrl,
        m.MovieDescription, -- Sửa từ Description thành MovieDescription
        m.MovieRuntime, -- Sửa từ Runtime thành MovieRuntime
        c.CinemaName,
        c.CityAddress, -- Sửa từ CinemaAddress thành CityAddress
        ch.HallName,
        p.Amount,
        p.PaymentMethod,
        p.PaymentDate,
        cu.CustomerName, -- Sửa từ FullName thành CustomerName
        cu.CustomerEmail,
        (SELECT STRING_AGG(chs.SeatNumber, ', ') 
         FROM BookingSeat bs
         JOIN CinemaHallSeat chs ON bs.SeatID = chs.SeatID
         WHERE bs.BookingID = b.BookingID) AS SeatNumbers,
        MIN(bs.HoldUntil) AS HoldUntil
      FROM Booking b
      JOIN Show s ON b.ShowID = s.ShowID
      JOIN Movie m ON s.MovieID = m.MovieID
      JOIN CinemaHall ch ON s.HallID = ch.HallID
      JOIN Cinema c ON ch.CinemaID = c.CinemaID
      JOIN Customer cu ON b.CustomerID = cu.CustomerID
      LEFT JOIN Payment p ON b.BookingID = p.BookingID
      JOIN BookingSeat bs ON b.BookingID = bs.BookingID
      WHERE b.BookingID = @bookingId AND b.CustomerID = @customerId AND b.Status = 'Confirmed'
      GROUP BY 
        b.BookingID,
        b.Status,
        b.TotalSeats,
        s.ShowDate,
        s.ShowTime,
        m.MovieTitle,
        m.ImageUrl,
        m.MovieDescription,
        m.MovieRuntime,
        c.CinemaName,
        c.CityAddress,
        ch.HallName,
        p.Amount,
        p.PaymentMethod,
        p.PaymentDate,
        cu.CustomerName,
        cu.CustomerEmail
    `);

    if (!bookingResult.recordset.length) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy vé hoặc bạn không có quyền truy cập',
      });
    }

    const productsResult = await request.query(`
      SELECT 
        bp.ProductID,
        p.ProductName,
        bp.Quantity,
        bp.TotalPriceBookingProduct
      FROM BookingProduct bp
      JOIN Product p ON bp.ProductID = p.ProductID
      WHERE bp.BookingID = @bookingId
    `);

    const ticket = bookingResult.recordset[0];
    const booking = {
      BookingID: ticket.BookingID,
      Status: ticket.Status,
      TotalSeats: ticket.TotalSeats,
      Show: {
        ShowDate: ticket.ShowDate,
        ShowTime: ticket.ShowTime,
      },
      Movie: {
        Title: ticket.Title,
        PosterUrl: ticket.PosterUrl,
        Description: ticket.MovieDescription, // Sửa từ Description thành MovieDescription
        Runtime: ticket.MovieRuntime, // Sửa từ Runtime thành MovieRuntime
      },
      CinemaHall: {
        CinemaName: ticket.CinemaName,
        CinemaAddress: ticket.CityAddress, // Sửa từ CinemaAddress thành CityAddress
        HallName: ticket.HallName,
      },
      Payment: {
        Amount: ticket.Amount || 0,
        PaymentMethod: ticket.PaymentMethod,
        PaymentDate: ticket.PaymentDate,
      },
      Customer: {
        FullName: ticket.CustomerName, // Sửa từ FullName thành CustomerName
        CustomerEmail: ticket.CustomerEmail,
      },
      BookingSeats: ticket.SeatNumbers
        ? ticket.SeatNumbers.split(', ').map((seatNumber) => ({ SeatNumber: seatNumber }))
        : [],
      BookingProducts: productsResult.recordset.map((product) => ({
        ProductID: product.ProductID,
        ProductName: product.ProductName,
        Quantity: product.Quantity,
        TotalPriceBookingProduct: product.TotalPriceBookingProduct,
      })),
      HoldUntil: ticket.HoldUntil,
    };

    console.log(`Fetched ticket details for BookingID: ${bookingId}`);
    res.json({ success: true, booking });
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết vé:', error);
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  } finally {
    if (pool && pool.connected) {
      await pool.close();
      console.log('Đã đóng kết nối pool');
    }
  }
};

const checkExpiredBookings = async (req, res) => {
    const customerId = req.user?.customerID;
    let pool = null;
  
    if (!customerId || isNaN(customerId)) {
      console.error('CustomerID không hợp lệ hoặc không tồn tại:', customerId);
      return res.status(401).json({ success: false, message: 'Không tìm thấy hoặc CustomerID không hợp lệ' });
    }
  
    try {
      console.log(`Kết nối đến SQL Server cho customerId: ${customerId}`);
      pool = await sql.connect(dbConfig);
      console.log('Đã kết nối SQL Server');
  
      const request = pool.request();
      request.input('customerId', sql.Int, customerId);
  
      const result = await request.query(`
        SELECT      
          b.BookingID,
          MIN(bs.HoldUntil) AS HoldUntil
        FROM Booking b
        JOIN BookingSeat bs ON b.BookingID = bs.BookingID
        WHERE b.CustomerID = @customerId 
          AND b.Status = 'Confirmed'
          AND bs.HoldUntil <= DATEADD(HOUR, 24, GETDATE())
        GROUP BY b.BookingID
      `);
  
      const expiringTickets = result.recordset.length;
      console.log(`Found ${expiringTickets} expiring tickets for customer ${customerId}`);
      res.json({
        success: true,
        expiringTickets,
        message: expiringTickets > 0 
          ? `Bạn có ${expiringTickets} vé sắp hết hạn` 
          : 'Không có vé nào sắp hết hạn trong 24 giờ tới'
      });
    } catch (error) {
      console.error('Lỗi khi kiểm tra vé sắp hết hạn:', error);
      res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    } finally {
      if (pool && pool.connected) {
        await pool.close();
        console.log('Đã đóng kết nối pool');
      }
    }
  };

module.exports = { getTickets, getTicketById, checkExpiredBookings };