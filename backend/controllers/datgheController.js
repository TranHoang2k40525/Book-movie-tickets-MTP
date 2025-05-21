// backend/controllers/datgheController.js
const sql = require('mssql');
const { dbConfig } = require('../config/db');
const { broadcastSeatUpdate } = require('../websocket');

// Hàm lấy sơ đồ ghế để broadcast
const getSeatLayout = async (transaction, showId, hallId) => {
  const seatsQuery = `
    SELECT 
      chs.SeatID,
      chs.SeatNumber,
      chs.SeatType,
      chs.SeatPrice,
      CASE 
        WHEN bs.Status = 'Reserved' AND bs.HoldUntil > DATEADD(HOUR, 7, GETUTCDATE()) THEN 'reserved'
        WHEN chs.Status = 'Reserved' THEN 'reserved'
        WHEN chs.Status = 'Locked' THEN 'locked'
        WHEN chs.Status = 'Booked' THEN 'booked'
        WHEN chs.Status IS NULL OR chs.Status = 'Available' THEN 'available'
      END AS SeatStatus
    FROM CinemaHallSeat chs
    LEFT JOIN BookingSeat bs ON chs.SeatID = bs.SeatID AND bs.ShowID = @showId
    WHERE chs.HallID = @hallId
    ORDER BY chs.SeatNumber
  `;
  const seatsResult = await transaction
    .request()
    .input('showId', sql.Int, showId)
    .input('hallId', sql.Int, hallId)
    .query(seatsQuery);

  const seatMap = {};
  seatsResult.recordset.forEach((seat) => {
    const rowMatch = seat.SeatNumber.match(/([A-H])(\d+)/);
    if (rowMatch) {
      const row = rowMatch[1];
      const number = parseInt(rowMatch[2]);
      if (!seatMap[row]) {
        seatMap[row] = [];
      }
      seatMap[row][number - 1] = {
        seatId: seat.SeatID,
        seatNumber: seat.SeatNumber,
        type: seat.SeatType.toLowerCase(),
        price: seat.SeatPrice,
        status: seat.SeatStatus,
      };
    }
  });

  const rows = Object.keys(seatMap).sort();
  const seatLayout = rows.map((row) => ({
    row,
    seats: seatMap[row],
  }));

  // Lấy thông tin phòng chiếu
  const hallQuery = `
    SELECT c.CinemaName, ch.HallID, ch.HallName, ch.TotalSeats
    FROM CinemaHall ch
    JOIN Cinema c ON ch.CinemaID = c.CinemaID
    WHERE ch.HallID = @hallId
  `;
  const hallResult = await transaction
    .request()
    .input('hallId', sql.Int, hallId)
    .query(hallQuery);

  const hall = hallResult.recordset[0]
    ? {
        cinemaName: hallResult.recordset[0].CinemaName,
        hallId: hallResult.recordset[0].HallID,
        hallName: hallResult.recordset[0].HallName,
        totalSeats: hallResult.recordset[0].TotalSeats,
      }
    : null;

  return { seatLayout, hall };
};

// Hàm giải phóng ghế hết hạn (cho cron job)
const releaseExpiredSeatsCron = async () => {
  let pool = null;
  let transaction = null;
  try {
    pool = await sql.connect(dbConfig);
    transaction = new sql.Transaction(pool);
    await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);

    // Kiểm tra xem có ghế đang được đặt không
    const reservedCheck = await transaction.request().query(`
      SELECT COUNT(*) AS ReservedCount
      FROM BookingSeat
      WHERE Status = 'Reserved'
    `);
    const reservedCount = reservedCheck.recordset[0].ReservedCount;

    if (reservedCount === 0) {
      await transaction.commit();
      return;
    }

    const expiredSeats = await transaction.request().query(`
      SELECT bs.SeatID, bs.ShowID, ch.HallID
      FROM BookingSeat bs
      JOIN Show s ON bs.ShowID = s.ShowID
      JOIN CinemaHall ch ON s.HallID = ch.HallID
      WHERE bs.Status = 'Reserved' AND bs.HoldUntil < DATEADD(HOUR, 7, GETUTCDATE())
    `);

    if (expiredSeats.recordset.length === 0) {
      await transaction.commit();
      return;
    }

    const result = await transaction.request().query(`
      UPDATE CinemaHallSeat
      SET Status = 'Available'
      OUTPUT DELETED.SeatID
      WHERE SeatID IN (
        SELECT SeatID
        FROM BookingSeat
        WHERE Status = 'Reserved' AND HoldUntil < DATEADD(HOUR, 7, GETUTCDATE())
      );

      DELETE FROM BookingSeat
      WHERE Status = 'Reserved' AND HoldUntil < DATEADD(HOUR, 7, GETUTCDATE());

      DELETE FROM Booking
      WHERE BookingID NOT IN (
        SELECT DISTINCT BookingID
        FROM BookingSeat
      )
      AND Status = 'Pending';
    `);

    if (result.recordset.length > 0) {
      console.log('Ghế được giải phóng (cron):', result.recordset);
      const showIds = [...new Set(expiredSeats.recordset.map((seat) => seat.ShowID))];
      for (const showId of showIds) {
        const hallId = expiredSeats.recordset.find((seat) => seat.ShowID === showId).HallID;
        const { seatLayout } = await getSeatLayout(transaction, showId, hallId);
        broadcastSeatUpdate(showId, seatLayout);
      }
    }

    await transaction.commit();
    console.log('Đã commit transaction cron job');
  } catch (err) {
    console.error('Lỗi khi giải phóng ghế hết hạn (cron):', err);
    if (transaction) {
      console.log('Rollback transaction cron job...');
      await transaction.rollback();
      console.log('Đã rollback transaction cron job');
    }
  } finally {
    if (pool && pool.connected) {
      
    }
  }
};

// Hàm giải phóng ghế hết hạn (cho transaction)
const releaseExpiredSeats = async (transaction, showId) => {
  try {
    const expiredSeats = await transaction
      .request()
      .input('showId', sql.Int, showId)
      .query(`
        SELECT bs.SeatID, bs.ShowID, ch.HallID
        FROM BookingSeat bs
        JOIN Show s ON bs.ShowID = s.ShowID
        JOIN CinemaHall ch ON s.HallID = ch.HallID
        WHERE bs.Status = 'Reserved' AND bs.HoldUntil < DATEADD(HOUR, 7, GETUTCDATE())
        AND bs.ShowID = @showId
      `);

    if (expiredSeats.recordset.length === 0) {
      return;
    }

    const result = await transaction
      .request()
      .input('showId', sql.Int, showId)
      .query(`
        UPDATE CinemaHallSeat
        SET Status = 'Available'
        OUTPUT DELETED.SeatID
        WHERE SeatID IN (
          SELECT SeatID
          FROM BookingSeat
          WHERE ShowID = @showId AND Status = 'Reserved' 
            AND HoldUntil < DATEADD(HOUR, 7, GETUTCDATE())
        );

        DELETE FROM BookingSeat
        WHERE ShowID = @showId AND Status = 'Reserved' 
          AND HoldUntil < DATEADD(HOUR, 7, GETUTCDATE());

        DELETE FROM Booking
        WHERE BookingID NOT IN (
          SELECT DISTINCT BookingID
          FROM BookingSeat
        )
        AND Status = 'Pending';
      `);

    if (result.recordset.length > 0) {
      console.log('Đã giải phóng ghế hết hạn:', result.recordset);
      const hallId = expiredSeats.recordset[0].HallID;
      const { seatLayout } = await getSeatLayout(transaction, showId, hallId);
      broadcastSeatUpdate(showId, seatLayout);
    }
  } catch (err) {
    console.error('Lỗi khi giải phóng ghế:', err);
    throw err;
  }
};

// Hàm giữ ghế
const holdSeats = async (req, res) => {
  console.log("Running updated holdSeats version - 2025-05-20");
  const { showId, seatIds, selectedProducts } = req.body;
  const customerId = req.user?.customerID;

  if (!customerId) {
    return res.status(401).json({ message: "Không tìm thấy thông tin người dùng" });
  }

  if (!showId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
    return res.status(400).json({ message: "Danh sách ghế hoặc suất chiếu không hợp lệ" });
  }

  let pool = null;
  let transaction = null;
  try {
    console.log("Kết nối đến SQL Server...");
    pool = await sql.connect(dbConfig);
    console.log("Đã kết nối SQL Server");

    const serverTimeResult = await pool
      .request()
      .query(
        'SELECT DATEADD(HOUR, 7, GETUTCDATE()) AS ServerTime, DATEADD(MINUTE, 1, DATEADD(HOUR, 7, GETUTCDATE())) AS HoldUntil'
      );
    const holdUntil = serverTimeResult.recordset[0].HoldUntil;
    const holdUntilDate = new Date(holdUntil);
    const formattedExpirationTime = holdUntilDate.toISOString().replace('Z', '+07:00');
    console.log(
      'Node.js time:',
      new Date(),
      'SQL Server time:',
      serverTimeResult.recordset[0].ServerTime,
      'HoldUntil:',
      holdUntil,
      'Formatted expirationTime:',
      formattedExpirationTime
    );

    console.log('Khởi tạo transaction...');
    transaction = new sql.Transaction(pool);
    await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);
    console.log('Đã bắt đầu transaction');

    console.log('Bắt đầu giữ ghế:', { showId, seatIds, customerId });

    await releaseExpiredSeats(transaction, showId);

    let query = `SELECT SeatID, Status, SeatPrice, SeatNumber 
                 FROM CinemaHallSeat WITH (UPDLOCK, ROWLOCK)
                 WHERE SeatID IN (`;
    const seatParams = seatIds.map((id, index) => `@seat${index}`);
    query += seatParams.join(',');
    query += `) AND HallID = (SELECT HallID FROM Show WHERE ShowID = @showId)`;

    const request = transaction.request();
    seatIds.forEach((id, index) => {
      request.input(`seat${index}`, sql.Int, id);
    });
    request.input('showId', sql.Int, showId);

    console.log('Kiểm tra ghế có sẵn...');
    const availableSeats = await request.query(query);
    console.log('Kết quả kiểm tra ghế:', availableSeats.recordset);

    if (availableSeats.recordset.length !== seatIds.length) {
      await transaction.rollback();
      const unavailableSeats = seatIds.filter(
        (id) => !availableSeats.recordset.some((seat) => seat.SeatID === id)
      );
      console.log('Ghế không khả dụng:', unavailableSeats);
      return res.status(400).json({
        message: 'Một số ghế không tồn tại hoặc không thuộc suất chiếu này',
        unavailableSeats,
      });
    }

    const nonAvailableSeats = availableSeats.recordset.filter(
      (seat) => seat.Status !== 'Available' && seat.Status !== null
    );
    if (nonAvailableSeats.length > 0) {
      console.log('Xung đột ghế:', {
        showId,
        seatIds: nonAvailableSeats.map((seat) => seat.SeatID),
        timestamp: new Date(),
      });
      await transaction.rollback();
      return res.status(400).json({
        message: 'Một số ghế đã được đặt hoặc khóa',
        unavailableSeats: nonAvailableSeats.map((seat) => seat.SeatID),
      });
    }

    console.log('Tạo Booking...');
    const bookingResult = await transaction
      .request()
      .input('customerId', sql.Int, customerId)
      .input('showId', sql.Int, showId)
      .input('totalSeats', sql.Int, seatIds.length)
      .input('status', sql.VarChar, 'Pending')
      .query(
        `INSERT INTO Booking (CustomerID, ShowID, TotalSeats, Status)
         OUTPUT INSERTED.BookingID
         VALUES (@customerId, @showId, @totalSeats, @status)`
      );
    const bookingId = bookingResult.recordset[0].BookingID;
    console.log('Đã tạo Booking:', bookingId);

    const seatDetails = [];
    for (const seatId of seatIds) {
      const seatPrice = availableSeats.recordset.find((s) => s.SeatID === seatId).SeatPrice || 75000;
      console.log('Tạo BookingSeat cho ghế:', seatId);
      await transaction
        .request()
        .input('bookingId', sql.Int, bookingId)
        .input('showId', sql.Int, showId)
        .input('seatId', sql.Int, seatId)
        .input('status', sql.VarChar, 'Reserved')
        .input('ticketPrice', sql.Decimal(10, 2), seatPrice)
        .input('holdUntil', sql.DateTime, holdUntil)
        .query(
          `INSERT INTO BookingSeat (BookingID, ShowID, SeatID, Status, TicketPrice, HoldUntil)
           VALUES (@bookingId, @showId, @seatId, @status, @ticketPrice, @holdUntil)`
        );
      console.log('Đã tạo BookingSeat cho ghế:', seatId);
      seatDetails.push({
        seatId,
        seatNumber: availableSeats.recordset.find((s) => s.SeatID === seatId).SeatNumber || `Seat${seatId}`,
        status: 'Reserved',
        price: seatPrice,
      });
    }

    if (selectedProducts && selectedProducts.length > 0) {
      for (const product of selectedProducts) {
        await transaction
          .request()
          .input('bookingProductId', sql.Int, Math.floor(Math.random() * 1000000))
          .input('bookingId', sql.Int, bookingId)
          .input('productId', sql.Int, product.productId)
          .input('quantity', sql.Int, product.quantity)
          .input('totalPrice', sql.Decimal(10, 2), product.price * product.quantity)
          .query(
            `INSERT INTO BookingProduct (BookingProductID, BookingID, ProductID, Quantity, TotalPriceBookingProduct)
             VALUES (@bookingProductId, @bookingId, @productId, @quantity, @totalPrice)`
          );
      }
    }

    let updateQuery = `UPDATE CinemaHallSeat SET Status = 'Reserved' WHERE SeatID IN (`;
    updateQuery += seatParams.join(',');
    updateQuery += `)`;

    const updateRequest = transaction.request();
    seatIds.forEach((id, index) => {
      updateRequest.input(`seat${index}`, sql.Int, id);
    });

    console.log('Cập nhật trạng thái ghế...');
    await updateRequest.query(updateQuery);
    console.log('Đã cập nhật trạng thái ghế thành Reserved:', seatIds);

    // Lấy hallId và gửi cập nhật WebSocket
    const hallQuery = `SELECT HallID FROM Show WHERE ShowID = @showId`;
    const hallResult = await transaction.request().input('showId', sql.Int, showId).query(hallQuery);
    const hallId = hallResult.recordset[0].HallID;

    const { seatLayout } = await getSeatLayout(transaction, showId, hallId);
    broadcastSeatUpdate(showId, seatLayout);

    console.log('Commit transaction...');
    await transaction.commit();
    console.log('Đã commit transaction');

    res.json({
      bookingId,
      expirationTime: formattedExpirationTime,
      bookingStatus: 'Pending',
      seats: seatDetails,
    });
  } catch (err) {
    console.error('Lỗi trong quá trình giữ ghế:', err);
    if (transaction) {
      console.log('Rollback transaction...');
      await transaction.rollback();
      console.log('Đã rollback transaction');
    }
    res.status(500).json({ message: 'Lỗi server!', error: err.message });
  } finally {
    if (pool && pool.connected) {
      
    }
  }
};

// API hủy đặt vé
const cancelBooking = async (req, res) => {
  const { bookingId } = req.body;
  const customerId = req.user?.customerID;

  if (!customerId) {
    return res.status(401).json({ message: 'Không tìm thấy thông tin người dùng' });
  }

  if (!bookingId) {
    return res.status(400).json({ message: 'BookingID không hợp lệ' });
  }

  let pool = null;
  let transaction = null;
  try {
    console.log('Kết nối đến SQL Server...');
    pool = await sql.connect(dbConfig);
    console.log('Đã kết nối SQL Server');

    console.log('Khởi tạo transaction...');
    transaction = new sql.Transaction(pool);
    await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);
    console.log('Đã bắt đầu transaction');

    const bookingCheck = await transaction
      .request()
      .input('bookingId', sql.Int, bookingId)
      .input('customerId', sql.Int, customerId)
      .query(
        `SELECT BookingID, CustomerID, Status, ShowID
         FROM Booking 
         WHERE BookingID = @bookingId AND CustomerID = @customerId`
      );

    if (bookingCheck.recordset.length === 0) {
      await transaction.rollback();
      console.log('Không tìm thấy đặt vé hoặc không có quyền:', { bookingId, customerId });
      return res.status(403).json({ message: 'Không có quyền hủy đặt vé này' });
    }

    const booking = bookingCheck.recordset[0];

    if (booking.Status === 'Cancelled') {
      await transaction.rollback();
      console.log('Đã hủy đặt vé trước đó:', bookingId);
      return res.status(400).json({ message: 'Đặt vé đã được hủy trước đó' });
    }

    if (booking.Status === 'Confirmed') {
      await transaction.rollback();
      console.log('Không thể hủy đặt vé đã xác nhận:', bookingId);
      return res.status(400).json({ message: 'Không thể hủy đặt vé đã xác nhận' });
    }

    await transaction
      .request()
      .input('bookingId', sql.Int, bookingId)
      .query(`
        UPDATE CinemaHallSeat
        SET Status = 'Available'
        WHERE SeatID IN (
          SELECT SeatID
          FROM BookingSeat
          WHERE BookingID = @bookingId AND Status = 'Reserved'
        );

        DELETE FROM BookingSeat
        WHERE BookingID = @bookingId AND Status = 'Reserved';

        UPDATE Booking
        SET Status = 'Cancelled'
        WHERE BookingID = @bookingId AND Status = 'Pending';
      `);

    // Lấy hallId và gửi cập nhật WebSocket
    const hallQuery = `SELECT HallID FROM Show WHERE ShowID = @showId`;
    const hallResult = await transaction
      .request()
      .input('showId', sql.Int, booking.ShowID)
      .query(hallQuery);
    const hallId = hallResult.recordset[0].HallID;

    const { seatLayout } = await getSeatLayout(transaction, booking.ShowID, hallId);
    broadcastSeatUpdate(booking.ShowID, seatLayout);

    console.log('Đã hủy đặt vé và giải phóng ghế:', bookingId);
    await transaction.commit();
    console.log('Đã commit transaction');
    res.json({ message: 'Đã hủy đặt vé và giải phóng ghế' });
  } catch (err) {
    console.error('Lỗi khi hủy đặt vé:', err);
    if (transaction) {
      console.log('Rollback transaction...');
      await transaction.rollback();
      console.log('Đã rollback transaction');
    }
    res.status(500).json({ message: 'Lỗi server!', error: err.message });
  } finally {
    if (pool && pool.connected) {
      
    }
  }
};

module.exports = { holdSeats, cancelBooking, releaseExpiredSeatsCron };