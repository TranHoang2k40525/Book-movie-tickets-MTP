const sql = require("mssql");
const { dbConfig } = require("../config/db");
const crypto = require("crypto");

const verifyHmacSignature = (data, receivedSignature) => {
  const secretKey = "hoangdepzai2k401hoangdepzai2k401"; // Thay bằng khóa bí mật của cổng thanh toán
  const sortedKeys = Object.keys(data).sort();
  const stringToSign = sortedKeys
    .map((key) => `${key}=${data[key]}`)
    .join("&");
  const computedSignature = crypto
    .createHmac("sha256", secretKey)
    .update(stringToSign)
    .digest("hex");
  return computedSignature === receivedSignature;
};

const confirmPayment = async (req, res) => {
  const { bookingId } = req.params;
  const { paymentMethod, amount, selectedProducts, voucherId, hmacSignature, timestamp } = req.body;
  const customerId = req.user?.customerID;

  let pool;
  let transaction;
  try {
    // Kết nối database
    console.log("Kết nối đến SQL Server...");
    pool = await sql.connect(dbConfig);
    console.log("Đã kết nối SQL Server");

    // Khởi tạo transaction
    console.log("Khởi tạo transaction...");
    transaction = new sql.Transaction(pool);
    await transaction.begin();
    console.log("Đã bắt đầu transaction");

    // Xác minh chữ ký HMAC
    const hmacData = {
      bookingId,
      amount,
      paymentMethod,
      timestamp,
    };
    if (!verifyHmacSignature(hmacData, hmacSignature)) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: "Chữ ký HMAC không hợp lệ" });
    }

    // Kiểm tra booking
    const request = transaction.request();
    const bookingCheck = await request
      .input("bookingId", sql.Int, bookingId)
      .input("customerId", sql.Int, customerId)
      .query(
        `SELECT Status, TotalSeats, ShowID FROM Booking 
         WHERE BookingID = @bookingId AND CustomerID = @customerId`
      );

    if (!bookingCheck.recordset.length || bookingCheck.recordset[0].Status !== "Pending") {
      await transaction.rollback();
      console.log("Đặt vé không hợp lệ:", { bookingId, customerId });
      return res.status(400).json({ success: false, message: "Đặt vé không hợp lệ hoặc đã được xử lý" });
    }

    // Tính tổng giá vé
    const booking = bookingCheck.recordset[0];
    const seatPriceResult = await request
      .input("bookingId", sql.Int, bookingId)
      .query(
        `SELECT SUM(TicketPrice) as SeatTotalPrice 
         FROM BookingSeat 
         WHERE BookingID = @bookingId`
      );
    let totalPrice = parseFloat(seatPriceResult.recordset[0].SeatTotalPrice || 0);
    let productTotal = 0;

    // Lưu sản phẩm
    if (selectedProducts && selectedProducts.length > 0) {
      const productIds = selectedProducts.map((p) => p.productId);
      const productsResult = await request
        .input("ProductIDs", sql.VarChar, productIds.join(","))
        .query(
          `SELECT ProductID, ProductPrice 
           FROM Product 
           WHERE ProductID IN (SELECT value FROM STRING_SPLIT(@ProductIDs, ','))`
        );

      const productPrices = {};
      productsResult.recordset.forEach((product) => {
        productPrices[product.ProductID] = parseFloat(product.ProductPrice);
      });

      for (const product of selectedProducts) {
        const productPrice = productPrices[product.productId] || 0;
        const quantity = product.quantity || 0;
        const productTotalPrice = productPrice * quantity;
        productTotal += productTotalPrice;

        if (quantity > 0) {
          await request
            .input("bookingProductId", sql.Int, Math.floor(Math.random() * 1000000))
            .input("bookingId", sql.Int, bookingId)
            .input("productId", sql.Int, product.productId)
            .input("quantity", sql.Int, quantity)
            .input("totalPrice", sql.Decimal(10, 2), productTotalPrice)
            .query(
              `INSERT INTO BookingProduct (BookingProductID, BookingID, ProductID, Quantity, TotalPriceBookingProduct)
               VALUES (@bookingProductId, @bookingId, @productId, @quantity, @totalPrice)`
            );
        }
      }
    }

    totalPrice += productTotal;
    let discountAmount = 0;

    // Áp dụng voucher
    if (voucherId) {
      const voucherResult = await request
        .input("voucherId", sql.Int, voucherId)
        .input("customerId", sql.Int, customerId)
        .query(
          `SELECT DiscountValue 
           FROM Voucher 
           WHERE VoucherID = @voucherId 
           AND IsActive = 1 
           AND StartDate <= GETDATE() AND EndDate >= GETDATE()`
        );

      if (voucherResult.recordset.length > 0) {
        discountAmount = parseFloat(voucherResult.recordset[0].DiscountValue);
        await request
          .input("voucherId", sql.Int, voucherId)
          .input("customerId", sql.Int, customerId)
          .query(
            `INSERT INTO VoucherUsage (VoucherUsageID, VoucherID, CustomerID, UsedAt)
             VALUES (@voucherId, @voucherId, @customerId, GETDATE());
             UPDATE Voucher SET UsageCount = UsageCount + 1 WHERE VoucherID = @voucherId`
          );
      }
    }

    const finalAmount = Math.max(0, totalPrice - discountAmount);

    // Kiểm tra số tiền
    if (finalAmount !== parseFloat(amount)) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: "Số tiền thanh toán không khớp" });
    }

    // Tạo bản ghi thanh toán
    const paymentId = Math.floor(Math.random() * 1000000);
    await request
      .input("paymentId", sql.Int, paymentId)
      .input("bookingId", sql.Int, bookingId)
      .input("amount", sql.Decimal(10, 2), finalAmount)
      .input("paymentMethod", sql.VarChar, paymentMethod)
      .query(
        `INSERT INTO Payment (PaymentID, BookingID, Amount, PaymentDate, PaymentMethod)
         VALUES (@paymentId, @bookingId, @amount, GETDATE(), @paymentMethod)`
      );

    // Cập nhật trạng thái
    await request
      .input("bookingId", sql.Int, bookingId)
      .query(
        `UPDATE Booking SET Status = 'Confirmed' WHERE BookingID = @bookingId;
         UPDATE BookingSeat SET Status = 'Booked' WHERE BookingID = @bookingId;
         UPDATE CinemaHallSeat SET Status = 'Booked'
         WHERE SeatID IN (SELECT SeatID FROM BookingSeat WHERE BookingID = @bookingId)`
      );

    // Commit transaction
    console.log("Commit transaction...");
    await transaction.commit();
    console.log("Đã commit transaction");

    res.json({ success: true, message: "Thanh toán thành công", paymentId });
  } catch (error) {
    console.error("Lỗi khi xác nhận thanh toán:", error);
    if (transaction) {
      console.log("Rollback transaction...");
      await transaction.rollback();
      console.log("Đã rollback transaction");
    }
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  } finally {
    if (pool) {
      console.log("Đóng kết nối SQL Server...");
      await pool.close();
      console.log("Đã đóng kết nối");
    }
  }
};

// Các hàm khác (giữ nguyên từ file gốc)
const processPayment = async (req, res) => {
  try {
    const { 
      bookingId, 
      selectedProducts, 
      voucherId, 
      paymentMethod, 
      termsAccepted,
      countdown 
    } = req.body;

    if (!bookingId) {
      return res.status(400).json({ 
        success: false, 
        message: "Thiếu thông tin đặt vé" 
      });
    }

    if (!termsAccepted) {
      return res.status(400).json({ 
        success: false, 
        message: "Bạn cần đồng ý với điều khoản sử dụng" 
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({ 
        success: false, 
        message: "Vui lòng chọn phương thức thanh toán" 
      });
    }

    const pool = await sql.connect(dbConfig);
    const bookingResult = await pool.request()
      .input('BookingID', sql.NVarChar, bookingId)
      .query(`
        SELECT b.*, s.ShowDate, s.ShowTime, m.MovieTitle, m.ImageUrl, c.CinemaName,
        (SELECT SUM(TicketPrice) FROM BookingSeat WHERE BookingID = b.BookingID) as SeatTotalPrice
        FROM Booking b
        JOIN Show s ON b.ShowID = s.ShowID
        JOIN Movie m ON s.MovieID = m.MovieID
        JOIN CinemaHall ch ON s.HallID = ch.HallID
        JOIN Cinema c ON ch.CinemaID = c.CinemaID
        WHERE b.BookingID = @BookingID
      `);

    if (bookingResult.recordset.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Không tìm thấy thông tin đặt vé" 
      });
    }

    const booking = bookingResult.recordset[0];
    let totalPrice = parseFloat(booking.SeatTotalPrice || 0);
    let productTotal = 0;

    if (selectedProducts && selectedProducts.length > 0) {
      const productIds = selectedProducts.map(p => p.productId);
      const productsResult = await pool.request()
        .input('ProductIDs', sql.VarChar, productIds.join(','))
        .query(`
          SELECT ProductID, ProductPrice 
          FROM Product 
          WHERE ProductID IN (SELECT value FROM STRING_SPLIT(@ProductIDs, ','))
        `);

      const productPrices = {};
      productsResult.recordset.forEach(product => {
        productPrices[product.ProductID] = parseFloat(product.ProductPrice);
      });

      for (const product of selectedProducts) {
        const productPrice = productPrices[product.productId] || 0;
        const quantity = product.quantity || 0;
        const productTotalPrice = productPrice * quantity;
        productTotal += productTotalPrice;

        if (quantity > 0) {
          await pool.request()
            .input('BookingID', sql.NVarChar, bookingId)
            .input('ProductID', sql.Int, product.productId)
            .input('Quantity', sql.Int, quantity)
            .input('TotalPriceBookingProduct', sql.Decimal(10, 2), productTotalPrice)
            .query(`
              INSERT INTO BookingProduct (BookingProductID, BookingID, ProductID, Quantity, TotalPriceBookingProduct)
              VALUES (NEWID(), @BookingID, @ProductID, @Quantity, @TotalPriceBookingProduct)
            `);
        }
      }
    }

    totalPrice += productTotal;
    let discountAmount = 0;

    if (voucherId) {
      const voucherResult = await pool.request()
        .input('VoucherID', sql.Int, voucherId)
        .input('CustomerID', sql.Int, booking.CustomerID)
        .query(`
          SELECT * FROM Voucher 
          WHERE VoucherID = @VoucherID 
          AND IsActive = 1
          AND StartDate <= GETDATE() AND EndDate >= GETDATE()
        `);

      if (voucherResult.recordset.length > 0) {
        const voucher = voucherResult.recordset[0];
        discountAmount = parseFloat(voucher.DiscountValue);
        
        await pool.request()
          .input('VoucherID', sql.Int, voucherId)
          .input('CustomerID', sql.Int, booking.CustomerID)
          .query(`
            INSERT INTO VoucherUsage (VoucherID, CustomerID, UsedAt)
            VALUES (@VoucherID, @CustomerID, GETDATE());
            UPDATE Voucher SET UsageCount = UsageCount + 1 WHERE VoucherID = @VoucherID
          `);
      }
    }

    const finalAmount = Math.max(0, totalPrice - discountAmount);

    const paymentResult = await pool.request()
      .input('BookingID', sql.NVarChar, bookingId)
      .input('Amount', sql.Decimal(10, 2), finalAmount)
      .input('PaymentMethod', sql.VarChar(50), paymentMethod)
      .query(`
        INSERT INTO Payment (PaymentID, BookingID, Amount, PaymentDate, PaymentMethod) 
        VALUES (NEWID(), @BookingID, @Amount, GETDATE(), @PaymentMethod);
        SELECT SCOPE_IDENTITY() AS PaymentID;
      `);

    const paymentId = paymentResult.recordset[0].PaymentID;

    await pool.request()
      .input('BookingID', sql.NVarChar, bookingId)
      .query(`
        UPDATE Booking SET Status = 'Confirmed' WHERE BookingID = @BookingID;
        UPDATE BookingSeat SET Status = 'Booked' WHERE BookingID = @BookingID
      `);

    const paymentDetailsResult = await pool.request()
      .input('PaymentID', sql.Int, paymentId)
      .input('BookingID', sql.NVarChar, bookingId)
      .query(`
        SELECT p.PaymentID, p.Amount, p.PaymentDate, p.PaymentMethod,
        b.BookingID, b.Status as BookingStatus, b.TotalSeats,
        s.ShowDate, s.ShowTime,
        m.MovieTitle, m.MovieAge, m.MovieGenre, m.ImageUrl,
        c.CinemaName, ch.HallName,
        (SELECT STRING_AGG(chs.SeatNumber, ', ') 
         FROM BookingSeat bs
         JOIN CinemaHallSeat chs ON bs.SeatID = chs.SeatID
         WHERE bs.BookingID = b.BookingID) as SelectedSeats,
        (SELECT COUNT(*) FROM BookingSeat WHERE BookingID = b.BookingID) as SeatCount
        FROM Payment p
        JOIN Booking b ON p.BookingID = b.BookingID
        JOIN Show s ON b.ShowID = s.ShowID
        JOIN Movie m ON s.MovieID = m.MovieID
        JOIN CinemaHall ch ON s.HallID = ch.HallID
        JOIN Cinema c ON ch.CinemaID = c.CinemaID
        WHERE p.PaymentID = @PaymentID AND b.BookingID = @BookingID
      `);

    const bookingSeatsResult = await pool.request()
      .input('BookingID', sql.NVarChar, bookingId)
      .query(`
        SELECT bs.SeatID, chs.SeatNumber, chs.SeatType, bs.TicketPrice
        FROM BookingSeat bs
        JOIN CinemaHallSeat chs ON bs.SeatID = chs.SeatID
        WHERE bs.BookingID = @BookingID
      `);

    const bookingProductsResult = await pool.request()
      .input('BookingID', sql.NVarChar, bookingId)
      .query(`
        SELECT bp.ProductID, p.ProductName, bp.Quantity, bp.TotalPriceBookingProduct
        FROM BookingProduct bp
        JOIN Product p ON bp.ProductID = p.ProductID
        WHERE bp.BookingID = @BookingID
      `);

    return res.status(200).json({
      success: true,
      message: "Thanh toán thành công",
      data: {
        payment: paymentDetailsResult.recordset[0],
        seats: bookingSeatsResult.recordset,
        products: bookingProductsResult.recordset,
        discount: discountAmount,
        subtotal: totalPrice,
        finalAmount: finalAmount
      }
    });

  } catch (error) {
    console.error("Lỗi khi xử lý thanh toán:", error);
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi xử lý thanh toán",
      error: error.message
    });
  }
};

const getApplicableVouchers = async (req, res) => {
  try {
    const { customerId } = req.params;
    
    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin khách hàng"
      });
    }

    const pool = await sql.connect(dbConfig);
    const vouchersResult = await pool.request()
      .input('CustomerID', sql.Int, customerId)
      .input('CurrentDate', sql.Date, new Date())
      .query(`
        SELECT * FROM Voucher 
        WHERE IsActive = 1
        AND StartDate <= @CurrentDate AND EndDate >= @CurrentDate
      `);

    return res.status(200).json({
      success: true,
      data: vouchersResult.recordset
    });

  } catch (error) {
    console.error("Lỗi khi lấy danh sách voucher:", error);
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi lấy danh sách voucher",
      error: error.message
    });
  }
};

const getPaymentDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin đặt vé"
      });
    }

    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('BookingID', sql.NVarChar, bookingId)
      .query(`
        SELECT b.*, s.ShowDate, s.ShowTime, 
        m.MovieTitle, m.MovieAge, m.MovieGenre, m.ImageUrl,
        c.CinemaName, ch.HallName,
        (SELECT SUM(TicketPrice) FROM BookingSeat WHERE BookingID = b.BookingID) as SeatTotalPrice,
        (SELECT STRING_AGG(chs.SeatNumber, ', ') 
         FROM BookingSeat bs
         JOIN CinemaHallSeat chs ON bs.SeatID = chs.SeatID
         WHERE bs.BookingID = b.BookingID) as SelectedSeats,
        (SELECT COUNT(*) FROM BookingSeat WHERE BookingID = b.BookingID) as SeatCount
        FROM Booking b
        JOIN Show s ON b.ShowID = s.ShowID
        JOIN Movie m ON s.MovieID = m.MovieID
        JOIN CinemaHall ch ON s.HallID = ch.HallID
        JOIN Cinema c ON ch.CinemaID = c.CinemaID
        WHERE b.BookingID = @BookingID
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin đặt vé"
      });
    }

    const productsResult = await pool.request()
      .input('BookingID', sql.NVarChar, bookingId)
      .query(`
        SELECT bp.ProductID, p.ProductName, p.ProductPrice, bp.Quantity, 
        bp.TotalPriceBookingProduct, p.ImageProduct
        FROM BookingProduct bp
        JOIN Product p ON bp.ProductID = p.ProductID
        WHERE bp.BookingID = @BookingID
      `);

    const paymentData = {
      booking: result.recordset[0],
      products: productsResult.recordset || []
    };

    return res.status(200).json({
      success: true,
      data: paymentData
    });

  } catch (error) {
    console.error("Lỗi khi lấy thông tin thanh toán:", error);
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi lấy thông tin thanh toán",
      error: error.message
    });
  }
};

module.exports = {
  processPayment,
  getApplicableVouchers,
  getPaymentDetails,
  confirmPayment
};