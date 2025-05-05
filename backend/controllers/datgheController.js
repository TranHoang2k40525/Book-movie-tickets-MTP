const sql = require("mssql");
const { dbConfig } = require("../config/db");

// Hàm giải phóng ghế hết hạn
const releaseExpiredSeats = async (transaction) => {
  try {
    await transaction.request().query(`
      -- Cập nhật trạng thái ghế về Available
      UPDATE CinemaHallSeat
      SET Status = 'Available'
      WHERE SeatID IN (
        SELECT SeatID
        FROM BookingSeat
        WHERE Status = 'Reserved' AND HoldUntil < GETDATE()
      );

      -- Xóa các bản ghi BookingSeat hết hạn
      DELETE FROM BookingSeat
      WHERE Status = 'Reserved' AND HoldUntil < GETDATE();

      -- Xóa các bản ghi Booking không còn liên kết với BookingSeat
      DELETE FROM Booking
      WHERE BookingID NOT IN (
        SELECT DISTINCT BookingID
        FROM BookingSeat
      )
      AND Status = 'Pending';
    `);
    console.log("Đã giải phóng ghế hết hạn (nếu có)");
  } catch (err) {
    console.error("Lỗi khi giải phóng ghế hết hạn:", err);
    throw err;
  }
};

// Hàm giữ ghế
const holdSeats = async (req, res) => {
  console.log("Running updated holdSeats version - 2025-05-03");
  const { showId, seatIds ,selectedProducts} = req.body;
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

    console.log("Khởi tạo transaction...");
    transaction = new sql.Transaction(pool);
    await transaction.begin();
    console.log("Đã bắt đầu transaction");

    console.log("Bắt đầu giữ ghế:", { showId, seatIds, customerId });

    // Giải phóng ghế hết hạn
    await releaseExpiredSeats(transaction);

    // Kiểm tra ghế có sẵn
    let query = `SELECT SeatID, Status, SeatPrice FROM CinemaHallSeat 
                 WHERE SeatID IN (`;
    const seatParams = seatIds.map((id, index) => `@seat${index}`);
    query += seatParams.join(",");
    query += `) AND HallID = (SELECT HallID FROM Show WHERE ShowID = @showId)`;

    const request = transaction.request();
    seatIds.forEach((id, index) => {
      request.input(`seat${index}`, sql.Int, id);
    });
    request.input("showId", sql.Int, showId);

    console.log("Kiểm tra ghế có sẵn...");
    const availableSeats = await request.query(query);
    console.log("Kết quả kiểm tra ghế:", availableSeats.recordset);

    if (availableSeats.recordset.length !== seatIds.length) {
      await transaction.rollback();
      const unavailableSeats = seatIds.filter(
        (id) => !availableSeats.recordset.some((seat) => seat.SeatID === id)
      );
      console.log("Ghế không khả dụng:", unavailableSeats);
      return res.status(400).json({
        message: "Một số ghế không tồn tại hoặc không thuộc suất chiếu này",
        unavailableSeats,
      });
    }

    const nonAvailableSeats = availableSeats.recordset.filter(
      (seat) => seat.Status !== "Available" && seat.Status !== null
    );
    if (nonAvailableSeats.length > 0) {
      await transaction.rollback();
      console.log("Ghế không khả dụng do trạng thái:", nonAvailableSeats);
      return res.status(400).json({
        message: "Một số ghế đã được đặt hoặc khóa",
        unavailableSeats: nonAvailableSeats.map((seat) => seat.SeatID),
      });
    }

    // Tạo Booking
    console.log("Tạo Booking...");
    const bookingResult = await transaction
      .request()
      .input("customerId", sql.Int, customerId)
      .input("showId", sql.Int, showId)
      .input("totalSeats", sql.Int, seatIds.length)
      .input("status", sql.VarChar, "Pending")
      .query(
        `INSERT INTO Booking (CustomerID, ShowID, TotalSeats, Status)
         OUTPUT INSERTED.BookingID
         VALUES (@customerId, @showId, @totalSeats, @status)`
      );
    const bookingId = bookingResult.recordset[0].BookingID;
    console.log("Đã tạo Booking:", bookingId);

    // Tạo BookingSeat
    for (const seatId of seatIds) {
      const seatPrice = availableSeats.recordset.find((s) => s.SeatID === seatId).SeatPrice || 75000;
      console.log("Tạo BookingSeat cho ghế:", seatId);
      await transaction
        .request()
        .input("bookingId", sql.Int, bookingId)
        .input("showId", sql.Int, showId)
        .input("seatId", sql.Int, seatId)
        .input("status", sql.VarChar, "Reserved")
        .input("ticketPrice", sql.Decimal(10, 2), seatPrice)
        .input("holdUntil", sql.DateTime, new Date(Date.now() + 5 * 60 * 1000))
        .query(
          `INSERT INTO BookingSeat (BookingID, ShowID, SeatID, Status, TicketPrice, HoldUntil)
           VALUES (@bookingId, @showId, @seatId, @status, @ticketPrice, @holdUntil)`
        );
      console.log("Đã tạo BookingSeat cho ghế:", seatId);
      
    }
// Lưu sản phẩm vào BookingProduct
if (selectedProducts && selectedProducts.length > 0) {
  for (const product of selectedProducts) {
    await transaction
      .request()
      .input("bookingProductId", sql.Int, Math.floor(Math.random() * 1000000))
      .input("bookingId", sql.Int, bookingId)
      .input("productId", sql.Int, product.productId)
      .input("quantity", sql.Int, product.quantity)
      .input("totalPrice", sql.Decimal(10, 2), product.price * product.quantity)
      .query(
        `INSERT INTO BookingProduct (BookingProductID, BookingID, ProductID, Quantity, TotalPriceBookingProduct)
         VALUES (@bookingProductId, @bookingId, @productId, @quantity, @totalPrice)`
      );
  }
}
    // Cập nhật CinemaHallSeat
    let updateQuery = `UPDATE CinemaHallSeat SET Status = 'Reserved' WHERE SeatID IN (`;
    updateQuery += seatParams.join(",");
    updateQuery += `)`;

    const updateRequest = transaction.request();
    seatIds.forEach((id, index) => {
      updateRequest.input(`seat${index}`, sql.Int, id);
    });

    console.log("Cập nhật trạng thái ghế...");
    await updateRequest.query(updateQuery);
    console.log("Đã cập nhật trạng thái ghế thành Reserved:", seatIds);

    console.log("Commit transaction...");
    await transaction.commit();
    console.log("Đã commit transaction");

    res.json({
      bookingId,
      expirationTime: new Date(Date.now() + 5 * 60 * 1000),
    });
  } catch (err) {
    console.error("Lỗi trong quá trình giữ ghế:", err);
    if (transaction) {
      console.log("Rollback transaction...");
      await transaction.rollback();
      console.log("Đã rollback transaction");
    }
    res.status(500).json({ message: "Lỗi server!", error: err.message });
  } finally {
    if (pool) {
      console.log("Đóng kết nối SQL Server...");
      await pool.close();
      console.log("Đã đóng kết nối");
    }
  }
};

// API hủy đặt vé
const cancelBooking = async (req, res) => {
  const { bookingId } = req.body;
  const customerId = req.user?.customerID;

  if (!customerId) {
    return res.status(401).json({ message: "Không tìm thấy thông tin người dùng" });
  }

  if (!bookingId) {
    return res.status(400).json({ message: "BookingID không hợp lệ" });
  }

  let pool = null;
  let transaction = null;
  try {
    console.log("Kết nối đến SQL Server...");
    pool = await sql.connect(dbConfig);
    console.log("Đã kết nối SQL Server");

    console.log("Khởi tạo transaction...");
    transaction = new sql.Transaction(pool);
    await transaction.begin();
    console.log("Đã bắt đầu transaction");

    // Kiểm tra đặt vé
    const bookingCheck = await transaction
      .request()
      .input("bookingId", sql.Int, bookingId)
      .input("customerId", sql.Int, customerId)
      .query(
        `SELECT BookingID, CustomerID, Status
         FROM Booking 
         WHERE BookingID = @bookingId AND CustomerID = @customerId`
      );

    if (bookingCheck.recordset.length === 0) {
      await transaction.rollback();
      console.log("Không tìm thấy đặt vé hoặc không có quyền:", { bookingId, customerId });
      return res.status(403).json({ message: "Không có quyền hủy đặt vé này" });
    }

    const booking = bookingCheck.recordset[0];

    // Kiểm tra trạng thái đặt vé
    if (booking.Status === "Cancelled") {
      await transaction.rollback();
      console.log("Đặt vé đã được hủy trước đó:", bookingId);
      return res.status(400).json({ message: "Đặt vé đã được hủy trước đó" });
    }

    if (booking.Status === "Confirmed") {
      await transaction.rollback();
      console.log("Không thể hủy đặt vé đã xác nhận:", bookingId);
      return res.status(400).json({ message: "Không thể hủy đặt vé đã xác nhận" });
    }

    // Cập nhật trạng thái ghế và xóa dữ liệu
    await transaction
      .request()
      .input("bookingId", sql.Int, bookingId)
      .query(`
        -- Cập nhật trạng thái ghế về Available
        UPDATE CinemaHallSeat
        SET Status = 'Available'
        WHERE SeatID IN (
          SELECT SeatID
          FROM BookingSeat
          WHERE BookingID = @bookingId AND Status = 'Reserved'
        );

        -- Xóa BookingSeat
        DELETE FROM BookingSeat
        WHERE BookingID = @bookingId AND Status = 'Reserved';

        -- Cập nhật trạng thái Booking thành Cancelled
        UPDATE Booking
        SET Status = 'Cancelled'
        WHERE BookingID = @bookingId AND Status = 'Pending';
      `);

    console.log("Đã hủy đặt vé và giải phóng ghế:", bookingId);
    await transaction.commit();
    console.log("Đã commit transaction");
    res.json({ message: "Đã hủy đặt vé và giải phóng ghế" });
  } catch (err) {
    console.error("Lỗi khi hủy đặt vé:", err);
    if (transaction) {
      console.log("Rollback transaction...");
      await transaction.rollback();
      console.log("Đã rollback transaction");
    }
    res.status(500).json({ message: "Lỗi server!", error: err.message });
  } finally {
    if (pool) {
      console.log("Đóng kết nối SQL Server...");
      await pool.close();
      console.log("Đã đóng kết nối");
    }
  }
};

module.exports = { holdSeats, cancelBooking };