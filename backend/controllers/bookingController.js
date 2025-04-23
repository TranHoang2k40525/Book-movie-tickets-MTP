const { v4: uuidv4 } = require('uuid');
const sql = require('mssql');
const db = require('../config/db');


// Thời gian mặc định để khóa ghế (5 phút)
const DEFAULT_LOCK_DURATION = 300; // 5 minutes in seconds

/**
 * Khóa ghế tạm thời và tạo đặt vé tạm thời trong DB
 */
const holdSeats = async (req, res) => {
    const { showId } = req.params;
    const { seatIds } = req.body;
    const customerId = req.user.customerID;
  
    if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({ error: 'Invalid seat list' });
    }
  
    let pool;
    let transaction;
    try {
      pool = await db.connectDB();
      transaction = new sql.Transaction(pool);
      await transaction.begin();
      const request = new sql.Request(transaction);
  
      // Check seat availability with optimistic locking
      const seatParams = seatIds.map((_, i) => `@SeatID${i}`).join(',');
      seatIds.forEach((seatId, i) => request.input(`SeatID${i}`, sql.Int, seatId));
      const seatCheck = await request
        .input('ShowID', sql.Int, showId)
        .query(`SELECT SeatID, Version FROM BookingSeat WHERE ShowID = @ShowID AND SeatID IN (${seatParams}) AND Status = 'Confirmed'`);
  
      if (seatCheck.recordset.length > 0) {
        await transaction.rollback();
        return res.status(409).json({ error: 'Some seats are already booked', lockedSeats: seatCheck.recordset.map(s => s.SeatID) });
      }
  
      // Get ticket price
      const showResult = await request
        .input('ShowID', sql.Int, showId)
        .query('SELECT TicketPrice FROM [Show] WHERE ShowID = @ShowID');
      
      if (!showResult.recordset.length) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Show not found' });
      }
      
      const ticketPrice = showResult.recordset[0].TicketPrice;
  
      // Remove previous pending bookings
      await request
        .input('CustomerID', sql.Int, customerId)
        .input('ShowID', sql.Int, showId)
        .query(`DELETE FROM BookingSeat WHERE ShowID = @ShowID AND CustomerID = @CustomerID AND Status = 'Pending'`);
  
      // Create new booking with initial version
      const bookingId = uuidv4();
      const holdUntil = new Date(Date.now() + (DEFAULT_LOCK_DURATION * 1000));
      
      for (const seatId of seatIds) {
        const version = 1; // Initial version
        await request
          .input('BookingSeatID', sql.NVarChar, uuidv4())
          .input('BookingID', sql.NVarChar, bookingId)
          .input('ShowID', sql.Int, showId)
          .input('SeatID', sql.Int, seatId)
          .input('CustomerID', sql.Int, customerId)
          .input('TicketPrice', sql.Decimal(10, 2), ticketPrice)
          .input('HoldUntil', sql.DateTime, holdUntil)
         
          .query(`INSERT INTO BookingSeat (BookingSeatID, BookingID, ShowID, SeatID, CustomerID, Status, TicketPrice, HoldUntil, Version) 
                  VALUES (@BookingSeatID, @BookingID, @ShowID, @SeatID, @CustomerID, 'Pending', @TicketPrice, @HoldUntil, @Version)`);
      }
  
      await transaction.commit();
  
      // Notify via WebSocket
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'seatLocked', showId, seatIds, customerId }));
        }
      });
  
      return res.status(200).json({
        success: true,
        message: 'Seats held successfully',
        data: { bookingId, showId, seatIds, totalPrice: ticketPrice * seatIds.length, expiresAt: holdUntil, countdown: DEFAULT_LOCK_DURATION }
      });
    } catch (error) {
      if (transaction) await transaction.rollback();
      console.error('Error in holdSeats:', error);
      return res.status(500).json({ error: 'Error holding seats', details: error.message });
    } finally {
      if (pool) await pool.close();
    }
  };
  const releaseSeats = async (req, res) => {
    const { showId, seatIds } = req.body;
    const customerId = req.user.customerID;
  
    let pool;
    let transaction;
    try {
      pool = await db.connectDB();
      transaction = new sql.Transaction(pool);
      await transaction.begin();
      const request = new sql.Request(transaction);
  
      await request
        .input('CustomerID', sql.Int, customerId)
        .input('ShowID', sql.Int, showId)
        .query(`DELETE FROM BookingSeat WHERE ShowID = @ShowID AND CustomerID = @CustomerID AND Status = 'Pending'`);
  
      await transaction.commit();
  
      // Notify via WebSocket
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'seatReleased', showId, seatIds }));
        }
      });
  
      return res.status(200).json({ success: true, message: 'Seats released' });
    } catch (error) {
      if (transaction) await transaction.rollback();
      console.error('Error in releaseSeats:', error);
      return res.status(500).json({ error: 'Error releasing seats', details: error.message });
    } finally {
      if (pool) await pool.close();
    }
  };
/**
 * Xác nhận đặt vé sau khi thanh toán
 */
const confirmBooking = async (req, res) => {
  const { bookingId } = req.params;
  const customerId = req.user.customerID;
  
  let pool;
  let transaction;
  try {
    pool = await db.connectDB();
    transaction = new sql.Transaction(pool);
    await transaction.begin();
    const request = new sql.Request(transaction);

    // Fetch booking details with current version
    const bookingResult = await request
      .input('BookingID', sql.NVarChar, bookingId)
      .input('CustomerID', sql.Int, customerId)
      .query(`SELECT bs.*, s.ShowID FROM BookingSeat bs
              JOIN [Show] s ON bs.ShowID = s.ShowID
              WHERE bs.BookingID = @BookingID AND bs.CustomerID = @CustomerID AND bs.Status = 'Pending'`);

    const pendingSeats = bookingResult.recordset;
    if (!pendingSeats.length) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Booking not found or expired' });
    }

    // Update status with optimistic locking
    const seatUpdates = pendingSeats.map(seat => 
      request
        .input(`SeatID${seat.SeatID}`, sql.Int, seat.SeatID)
        .input(`Version${seat.SeatID}`, sql.Int, seat.Version)
        .query(`UPDATE BookingSeat SET Status = 'Confirmed', Version = Version + 1 
                WHERE BookingID = @BookingID AND SeatID = @SeatID${seat.SeatID} AND Version = @Version${seat.SeatID}`)
    );

    await Promise.all(seatUpdates);

    await transaction.commit();

    const showId = pendingSeats[0].ShowID;
    const seatIds = pendingSeats.map(seat => seat.SeatID);

    // Notify via WebSocket
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'seatConfirmed', showId, seatIds }));
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Booking confirmed',
      data: { bookingId, totalSeats: pendingSeats.length, totalPrice: pendingSeats.reduce((sum, seat) => sum + parseFloat(seat.TicketPrice), 0) }
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error('Error in confirmBooking:', error);
    return res.status(500).json({ error: 'Error confirming booking', details: error.message });
  } finally {
    if (pool) await pool.close();
  }
};
/**
 * Lấy trạng thái đặt vé
 */
const getBookingStatus = async (req, res) => {
  const { bookingId } = req.params;
  
  let pool;
  try {
    pool = await db.connectDB();
    const request = new sql.Request(pool);

    // Kiểm tra Booking tồn tại và thuộc về người dùng hiện tại
    const bookingOwnerCheck = await request
      .input('BookingID', sql.NVarChar, bookingId)
      .input('CustomerID', sql.Int, req.user.customerID)
      .query(`
        SELECT BookingID 
        FROM Booking 
        WHERE BookingID = @BookingID AND CustomerID = @CustomerID
      `);

    if (!bookingOwnerCheck.recordset.length) {
      return res.status(404).json({ error: 'Không tìm thấy đặt vé' });
    }

    // Sau khi xác nhận quyền sở hữu, lấy thông tin từ BookingSeat mà không cần điều kiện CustomerID
    const bookingResult = await request
      .input('BookingID', sql.NVarChar, bookingId)
      .query(`
        SELECT *
        FROM BookingSeat 
        WHERE BookingID = @BookingID
      `);

    if (!bookingResult.recordset.length) {
      return res.status(404).json({ error: 'Không tìm thấy thông tin ghế' });
    }

    const seats = bookingResult.recordset.map(seat => ({
      seatId: seat.SeatID,
      status: seat.Status,
      price: parseFloat(seat.TicketPrice || 0)
    }));

    // Lấy thông tin chung từ bản ghi đầu tiên
    const firstRecord = bookingResult.recordset[0];
    
    // Kiểm tra thời gian hết hạn nếu còn đang ở trạng thái Pending
    let remainingTime = 0;
    if (firstRecord.Status === 'Pending' && firstRecord.HoldUntil) {
      const expiryTime = new Date(firstRecord.HoldUntil).getTime();
      const currentTime = Date.now();
      remainingTime = Math.max(0, Math.floor((expiryTime - currentTime) / 1000));
    }

    // Lấy thêm thông tin từ bảng Show
    try {
      const showResult = await request
        .input('ShowID', sql.Int, firstRecord.ShowID)
        .query(`SELECT * FROM [Show] WHERE ShowID = @ShowID`);
      
      const showInfo = showResult.recordset[0] || {};

      return res.status(200).json({
        success: true,
        data: {
          bookingId,
          showId: firstRecord.ShowID,
          status: firstRecord.Status,
          seats: seats,
          totalPrice: seats.reduce((sum, seat) => sum + seat.price, 0),
          remainingTime,
          showInfo: showInfo
        }
      });
    } catch (showError) {
      console.error('Error fetching show details:', showError);
      // Vẫn trả về kết quả cơ bản nếu không thể lấy thông tin show
      return res.status(200).json({
        success: true,
        data: {
          bookingId,
          showId: firstRecord.ShowID,
          status: firstRecord.Status,
          seats: seats,
          totalPrice: seats.reduce((sum, seat) => sum + seat.price, 0),
          remainingTime
        }
      });
    }
  } catch (error) {
    console.error('Error in getBookingStatus:', error);
    return res.status(500).json({ 
      error: 'Lỗi khi lấy thông tin đặt vé', 
      details: error.message 
    });
  } finally {
    if (pool) await pool.close();
  }
};

/**
 * Hủy đặt vé
 */
const cancelBooking = async (req, res) => {
  const { bookingId } = req.params;
  const customerId = req.user.customerID;
  
  let pool;
  let transaction;
  try {
    pool = await db.connectDB();
    transaction = new sql.Transaction(pool);
    await transaction.begin();
    const request = new sql.Request(transaction);

    // Lấy thông tin đặt ghế để biết ShowID và SeatID
    const bookingResult = await request
      .input('BookingID', sql.NVarChar, bookingId)
      .input('CustomerID', sql.Int, customerId)
      .query(`
        SELECT * FROM BookingSeat 
        WHERE BookingID = @BookingID AND CustomerID = @CustomerID AND Status = 'Pending'
      `);

    if (!bookingResult.recordset.length) {
      await transaction.rollback();
      return res.status(404).json({ 
        error: 'Không tìm thấy đặt vé hoặc không thể hủy' 
      });
    }

    // Xóa các bản ghi đặt ghế tạm thời
    await request
      .input('BookingID', sql.NVarChar, bookingId)
      .query(`
        DELETE FROM BookingSeat 
        WHERE BookingID = @BookingID AND Status = 'Pending'
      `);

    await transaction.commit();

    // Giải phóng khóa Redis
    const showId = bookingResult.recordset[0].ShowID;
    const seatIds = bookingResult.recordset.map(seat => seat.SeatID);
    
    await Promise.all(seatIds.map(seatId => 
      redisService.unlockSeat(showId, seatId)
    ));

    return res.status(200).json({
      success: true,
      message: 'Đã hủy đặt vé thành công'
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error('Error in cancelBooking:', error);
    return res.status(500).json({ 
      error: 'Lỗi khi hủy đặt vé', 
      details: error.message 
    });
  } finally {
    if (pool) await pool.close();
  }
};

/**
 * Kiểm tra ghế có còn trống không
 */
const checkSeatsAvailability = async (req, res) => {
  const { showId } = req.params;
  const { seatIds } = req.body;

  if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
    return res.status(400).json({ error: 'Danh sách ghế không hợp lệ' });
  }

  try {
    // Kết nối Redis
    await redisService.connectRedis();

    // Kiểm tra ghế trong Redis
    const lockedSeats = [];
    for (const seatId of seatIds) {
      const lockInfo = await redisService.getSeatLock(showId, seatId);
      if (lockInfo) {
        lockedSeats.push(seatId);
      }
    }

    // Kiểm tra cả trong DB
    let pool;
    try {
      pool = await db.connectDB();
      const request = new sql.Request(pool);
      
      // Tạo các tham số đầu vào cho truy vấn
      request.input('ShowID', sql.Int, showId);
      seatIds.forEach((seatId, index) => {
        request.input(`SeatID${index}`, sql.Int, seatId);
      });

      // Tạo câu truy vấn IN với các tham số
      const seatParams = seatIds.map((_, i) => `@SeatID${i}`).join(',');
      const dbResult = await request.query(`
        SELECT SeatID, Status 
        FROM BookingSeat 
        WHERE ShowID = @ShowID AND SeatID IN (${seatParams}) AND Status = 'Confirmed'
      `);

      // Kết hợp kết quả từ Redis và DB
      const bookedSeatsInDB = dbResult.recordset.map(s => s.SeatID);
      const unavailableSeats = [...new Set([...lockedSeats, ...bookedSeatsInDB])];

      return res.status(200).json({
        success: true,
        data: {
          availableSeats: seatIds.filter(id => !unavailableSeats.includes(id)),
          unavailableSeats: unavailableSeats
        }
      });
    } finally {
      if (pool) await pool.close();
    }
  } catch (error) {
    console.error('Error in checkSeatsAvailability:', error);
    return res.status(500).json({ 
      error: 'Lỗi khi kiểm tra ghế trống', 
      details: error.message 
    });
  }
};

/**
 * Gia hạn thời gian giữ ghế
 */
const extendSeatHold = async (req, res) => {
  const { bookingId } = req.params;
  const { extensionSeconds = 300 } = req.body; // Mặc định thêm 5 phút
  const customerId = req.user.customerID;
  
  // Kiểm tra thời gian gia hạn hợp lệ (tối đa 10 phút)
  if (extensionSeconds <= 0 || extensionSeconds > 600) {
    return res.status(400).json({ 
      error: 'Thời gian gia hạn không hợp lệ. Giới hạn từ 1 đến 600 giây.' 
    });
  }
  
  let pool;
  let transaction;
  try {
    // Kết nối Redis
    await redisService.connectRedis();
    
    pool = await db.connectDB();
    transaction = new sql.Transaction(pool);
    await transaction.begin();
    const request = new sql.Request(transaction);

    // Lấy thông tin đặt ghế
    const bookingResult = await request
      .input('BookingID', sql.NVarChar, bookingId)
      .input('CustomerID', sql.Int, customerId)
      .query(`
        SELECT * FROM BookingSeat 
        WHERE BookingID = @BookingID AND CustomerID = @CustomerID AND Status = 'Pending'
      `);

    if (!bookingResult.recordset.length) {
      await transaction.rollback();
      return res.status(404).json({ 
        error: 'Không tìm thấy đặt vé hoặc đã hết hạn' 
      });
    }

    // Cập nhật thời gian hết hạn trong cơ sở dữ liệu
    const newExpiryTime = new Date(Date.now() + (extensionSeconds * 1000));
    await request
      .input('BookingID', sql.NVarChar, bookingId)
      .input('HoldUntil', sql.DateTime, newExpiryTime)
      .query(`
        UPDATE BookingSeat 
        SET HoldUntil = @HoldUntil
        WHERE BookingID = @BookingID AND Status = 'Pending'
      `);

    await transaction.commit();

    // Gia hạn khóa trong Redis
    const showId = bookingResult.recordset[0].ShowID;
    const seatIds = bookingResult.recordset.map(seat => seat.SeatID);
    
    for (const seatId of seatIds) {
      await redisService.extendSeatLock(showId, seatId, customerId, extensionSeconds);
    }

    return res.status(200).json({
      success: true,
      message: 'Đã gia hạn thời gian giữ ghế thành công',
      data: {
        expiresAt: newExpiryTime,
        remainingSeconds: extensionSeconds
      }
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error('Error in extendSeatHold:', error);
    return res.status(500).json({ 
      error: 'Lỗi khi gia hạn thời gian giữ ghế', 
      details: error.message 
    });
  } finally {
    if (pool) await pool.close();
  }
};

/**
 * Lấy danh sách vé của người dùng
 */
const getUserBookings = async (req, res) => {
  const customerId = req.user.customerID;
  let pool;
  
  try {
    pool = await db.connectDB();
    const request = new sql.Request(pool);
    
    // Kiểm tra xem người dùng có vé nào không
    const checkResult = await request
      .input('CustomerID', sql.Int, customerId)
      .query(`
        SELECT COUNT(*) AS BookingCount
        FROM Booking 
        WHERE CustomerID = @CustomerID
      `);
    
    // Nếu không có vé nào, trả về mảng rỗng
    if (checkResult.recordset[0].BookingCount === 0) {
      return res.status(200).json({ bookings: [] });
    }
    
    // Nếu có vé, tiếp tục lấy thông tin chi tiết
    try {
      const bookingsResult = await request
        .input('CustomerID', sql.Int, customerId)
        .query(`
          SELECT 
            b.BookingID,
            b.CustomerID,
            b.ShowID,
            b.TotalSeats,
            b.Status,
            s.MovieID,
            s.HallID as CinemaHallID,
            s.ShowTime,
            s.ShowDate
          FROM Booking b
          JOIN [Show] s ON b.ShowID = s.ShowID
          WHERE b.CustomerID = @CustomerID
          ORDER BY s.ShowDate DESC, s.ShowTime DESC
        `);
      
      if (!bookingsResult.recordset.length) {
        return res.status(200).json({ bookings: [] });
      }

      // Lấy chi tiết cho mỗi booking
      const bookings = [];
      
      for (const booking of bookingsResult.recordset) {
        // Lấy thông tin Movie cho booking
        const movieResult = await request
          .input('MovieID', sql.Int, booking.MovieID)
          .query(`
            SELECT 
              MovieID,
              Title,
              Description,
              Duration as Runtime,
              ImageUrl as PosterUrl
            FROM Movie 
            WHERE MovieID = @MovieID
          `);
        
        // Lấy thông tin CinemaHall
        const cinemaHallResult = await request
          .input('HallID', sql.Int, booking.CinemaHallID)
          .query(`
            SELECT 
              ch.HallID,
              ch.Name as HallName,
              c.CinemaID,
              c.Name as CinemaName,
              c.Address as CinemaAddress
            FROM CinemaHall ch
            JOIN Cinema c ON ch.CinemaID = c.CinemaID
            WHERE ch.HallID = @HallID
          `);
        
        // Lấy thông tin BookingSeat
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
        
        // Lấy thông tin Payment nếu có
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
        
        // Tạo đối tượng booking với đầy đủ thông tin
        const bookingWithDetails = {
          BookingID: booking.BookingID,
          CustomerID: booking.CustomerID,
          ShowID: booking.ShowID,
          TotalSeats: booking.TotalSeats,
          Status: booking.Status,
          
          // Thông tin Show
          Show: {
            ShowID: booking.ShowID,
            MovieID: booking.MovieID,
            ShowTime: booking.ShowTime,
            ShowDate: booking.ShowDate
          },
          
          // Thông tin Movie
          Movie: movieResult.recordset[0] || null,
          
          // Thông tin CinemaHall
          CinemaHall: cinemaHallResult.recordset[0] || null,
          
          // Thông tin BookingSeat
          BookingSeats: bookingSeatsResult.recordset || [],
          
          // Thông tin Payment
          Payment: paymentResult.recordset[0] || null
        };
        
        bookings.push(bookingWithDetails);
      }
      
      res.status(200).json({ bookings });
    } catch (joinError) {
      console.error('Error with JOIN queries:', joinError);
      // Nếu lỗi trong truy vấn JOIN, vẫn trả về mảng rỗng để không làm crash ứng dụng
      res.status(200).json({ bookings: [] });
    }
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    // Vẫn trả về mảng rỗng để tránh lỗi
    res.status(200).json({ 
      bookings: [],
      message: 'Không thể truy xuất dữ liệu vé'
    });
  } finally {
    if (pool) await pool.close();
  }
};

/**
 * Kiểm tra vé sắp hết hạn và gửi thông báo
 */
const checkExpiringBookings = async (req, res) => {
  const customerId = req.user.customerID;
  let pool;
  
  try {
    pool = await db.connectDB();
    const request = new sql.Request(pool);
    
    // Kiểm tra xem người dùng có vé nào không
    const checkResult = await request
      .input('CustomerID', sql.Int, customerId)
      .query(`
        SELECT COUNT(*) AS BookingCount
        FROM BookingSeat 
        WHERE CustomerID = @CustomerID
      `);
    
    // Nếu không có vé nào, trả về thông báo phù hợp
    if (checkResult.recordset[0].BookingCount === 0) {
      return res.status(200).json({ 
        message: 'Không có vé nào',
        expiringTickets: 0
      });
    }
    
    // Lấy tất cả vé sắp hết hạn (còn 1 ngày)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    try {
      const result = await request
        .input('CustomerID', sql.Int, customerId)
        .input('Tomorrow', sql.DateTime, tomorrow)
        .query(`
          SELECT 
            bs.BookingID,
            m.Title AS MovieTitle,
            s.StartTime
          FROM BookingSeat bs
          JOIN [Show] s ON bs.ShowID = s.ShowID
          JOIN Movie m ON s.MovieID = m.MovieID
          WHERE 
            bs.CustomerID = @CustomerID AND
            bs.Status = 'Confirmed' AND
            s.StartTime BETWEEN GETDATE() AND @Tomorrow AND
            NOT EXISTS (
              SELECT 1 FROM Notification n
              WHERE 
                n.CustomerID = @CustomerID AND
                n.Message LIKE '%' + m.Title + '%sắp hết hạn%'
            )
          GROUP BY bs.BookingID, m.Title, s.StartTime
        `);
      
      // Tạo thông báo cho mỗi vé sắp hết hạn
      const { createNotification } = require('../routes/notifications');
      
      for (const booking of result.recordset) {
        const message = `Vé của bạn sắp hết hạn, xin vui lòng bạn đến xem và trải nghiệm bộ phim ${booking.MovieTitle} để có những giây phút đáng nhớ, không để quá hạn`;
        await createNotification(customerId, message);
      }
      
      res.status(200).json({ 
        message: 'Đã kiểm tra vé sắp hết hạn',
        expiringTickets: result.recordset.length
      });
    } catch (joinError) {
      console.error('Error checking expiring tickets with JOIN:', joinError);
      // Nếu có lỗi trong truy vấn JOIN, trả về không có vé sắp hết hạn
      res.status(200).json({ 
        message: 'Không thể kiểm tra vé sắp hết hạn',
        expiringTickets: 0
      });
    }
  } catch (error) {
    console.error('Error checking expiring bookings:', error);
    // Vẫn trả về thông báo không có lỗi để không làm crash ứng dụng
    res.status(200).json({ 
      message: 'Không thể kiểm tra vé sắp hết hạn',
      expiringTickets: 0
    });
  } finally {
    if (pool) await pool.close();
  }
};

/**
 * Lấy thông tin đặt vé theo ID
 */
const getBookingById = async (req, res) => {
  const { bookingId } = req.params;
  const customerId = req.user.customerID;
  
  // Kiểm tra bookingId hợp lệ
  if (!bookingId || bookingId === 'bookings' || bookingId === 'undefined') {
    return res.status(400).json({ 
      error: 'Mã đặt vé không hợp lệ',
      details: 'BookingID phải là một giá trị hợp lệ'
    });
  }
  
  let pool;
  try {
    pool = await db.connectDB();
    const request = new sql.Request(pool);
    
    // Lấy thông tin cơ bản của booking
    const bookingResult = await request
      .input('BookingID', sql.Int, bookingId)
      .input('CustomerID', sql.Int, customerId)
      .query(`
        SELECT 
          b.BookingID,
          b.CustomerID,
          b.ShowID,
          b.TotalSeats,
          b.Status,
          s.MovieID,
          s.HallID as CinemaHallID,
          s.ShowTime,
          s.ShowDate
        FROM Booking b
        JOIN [Show] s ON b.ShowID = s.ShowID
        WHERE b.BookingID = @BookingID AND b.CustomerID = @CustomerID
      `);
    
    if (!bookingResult.recordset.length) {
      return res.status(404).json({ error: 'Không tìm thấy đặt vé' });
    }
    
    const booking = bookingResult.recordset[0];
    
    // Lấy thông tin Movie cho booking
    const movieResult = await request
      .input('MovieID', sql.Int, booking.MovieID)
      .query(`
        SELECT 
          MovieID,
          Title,
          Description,
          Duration as Runtime,
          ImageUrl as PosterUrl
        FROM Movie 
        WHERE MovieID = @MovieID
      `);
    
    // Lấy thông tin CinemaHall
    const cinemaHallResult = await request
      .input('HallID', sql.Int, booking.CinemaHallID)
      .query(`
        SELECT 
          ch.HallID,
          ch.Name as HallName,
          c.CinemaID,
          c.Name as CinemaName,
          c.Address as CinemaAddress
        FROM CinemaHall ch
        JOIN Cinema c ON ch.CinemaID = c.CinemaID
        WHERE ch.HallID = @HallID
      `);
    
    // Lấy thông tin BookingSeat
    const bookingSeatsResult = await request
      .input('BookingID', sql.Int, booking.BookingID)
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
    
    // Lấy thông tin Payment nếu có
    const paymentResult = await request
      .input('BookingID', sql.Int, booking.BookingID)
      .query(`
        SELECT 
          PaymentID,
          Amount,
          PaymentDate,
          PaymentMethod
        FROM Payment 
        WHERE BookingID = @BookingID
      `);
    
    // Lấy thông tin Customer
    const customerResult = await request
      .input('CustomerID', sql.Int, booking.CustomerID)
      .query(`
        SELECT 
          CustomerID,
          FullName,
          Email,
          Phone
        FROM Customer 
        WHERE CustomerID = @CustomerID
      `);
    
    // Tạo đối tượng booking với đầy đủ thông tin
    const bookingWithDetails = {
      BookingID: booking.BookingID,
      CustomerID: booking.CustomerID,
      ShowID: booking.ShowID,
      TotalSeats: booking.TotalSeats,
      Status: booking.Status,
      
      // Thông tin Show
      Show: {
        ShowID: booking.ShowID,
        MovieID: booking.MovieID,
        ShowTime: booking.ShowTime,
        ShowDate: booking.ShowDate
      },
      
      // Thông tin Movie
      Movie: movieResult.recordset[0] || null,
      
      // Thông tin CinemaHall
      CinemaHall: cinemaHallResult.recordset[0] || null,
      
      // Thông tin BookingSeat
      BookingSeats: bookingSeatsResult.recordset || [],
      
      // Thông tin Payment
      Payment: paymentResult.recordset[0] || null,
      
      // Thông tin Customer
      Customer: customerResult.recordset[0] || null
    };
    
    res.status(200).json({ booking: bookingWithDetails });
  } catch (error) {
    console.error('Error fetching booking details:', error);
    res.status(500).json({ 
      error: 'Không thể lấy thông tin đặt vé',
      details: error.message 
    });
  } finally {
    if (pool) await pool.close();
  }
};

module.exports = {
  holdSeats,
  releaseSeats,
  confirmBooking,
  getBookingStatus,
  cancelBooking,
  checkSeatsAvailability,
  extendSeatHold,
  getUserBookings,
  checkExpiringBookings,
  getBookingById
}; 
