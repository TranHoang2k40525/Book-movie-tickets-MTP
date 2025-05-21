const sql = require("mssql");
const { dbConfig } = require("../config/db");
const QRCode = require("qrcode");
const nodemailer = require("nodemailer");
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  logger: true,
  debug: true,
});

// Hàm kiểm tra và ánh xạ PaymentMethod
const validatePaymentMethod = (method) => {
  const validMethods = ['Online', 'Card', 'Cash'];
  if (method === 'Momo') return 'Online';
  if (!validMethods.includes(method)) {
    throw new Error(`Phương thức thanh toán không hợp lệ: ${method}. Chỉ chấp nhận: ${validMethods.join(', ')}`);
  }
  return method;
};

// Hàm tạo nội dung thông báo
const generateNotificationContent = (bookingDetails, paymentDetails, products, discount, finalAmount) => {
  const productMap = new Map();
  products.forEach(p => {
    const key = `${p.ProductID}-${p.TotalPriceBookingProduct}`;
    if (productMap.has(key)) {
      productMap.get(key).Quantity += p.Quantity;
    } else {
      productMap.set(key, { ...p });
    }
  });
  const uniqueProducts = Array.from(productMap.values());

  const productText = uniqueProducts.length > 0
    ? `Sản phẩm: ${uniqueProducts.map(p => `${p.ProductName} x${p.Quantity} - ${p.TotalPriceBookingProduct.toLocaleString("vi-VN")} VNĐ`).join(", ")}`
    : "";
  const discountText = discount > 0 ? `Giảm giá: ${discount.toLocaleString("vi-VN")} VNĐ` : "";
  
  return `
Xác nhận thanh toán thành công
Bạn đã đặt vé thành công! Dưới đây là chi tiết vé:
- Mã đặt vé: ${bookingDetails.BookingID}
- Phim: ${bookingDetails.MovieTitle}
- Ngày chiếu: ${new Date(bookingDetails.ShowDate).toLocaleDateString("vi-VN")}
- Giờ chiếu: ${bookingDetails.ShowTime}
- Rạp: ${bookingDetails.CinemaName}
- Phòng: ${bookingDetails.HallName}
- Ghế: ${bookingDetails.SelectedSeats}
- Tổng tiền vé: ${paymentDetails.Amount.toLocaleString("vi-VN")} VNĐ
- Phương thức thanh toán: ${paymentDetails.PaymentMethod}
${productText ? `- ${productText}` : ""}
${discountText ? `- ${discountText}` : ""}
- Tổng thanh toán: ${finalAmount.toLocaleString("vi-VN")} VNĐ
Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!
  `.trim();
};

// Hàm gửi email xác nhận thanh toán
const sendPaymentConfirmationEmail = async (customerEmail, bookingDetails, paymentDetails, products, discount, finalAmount) => {
  const notificationContent = generateNotificationContent(bookingDetails, paymentDetails, products, discount, finalAmount);
  const htmlContent = notificationContent
    .split("\n")
    .map(line => line.startsWith("-") ? `<li>${line.substring(2)}</li>` : `<p>${line}</p>`)
    .join("")
    .replace("<p>Xác nhận thanh toán thành công</p>", "<h2>Xác nhận thanh toán thành công</h2>")
    .replace("<p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>", "<p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>")
    .replace("<p>Bạn đã đặt vé thành công! Dưới đây là chi tiết vé:</p>", "<p>Bạn đã đặt vé thành công! Dưới đây là chi tiết vé:</p><ul>")
    .concat("</ul>");

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: [customerEmail, process.env.EMAIL_USER],
    subject: "Xác nhận thanh toán vé xem phim",
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${customerEmail} and admin`, {
      messageId: info.messageId,
      response: info.response,
    });
  } catch (error) {
    console.error("Error sending email:", {
      message: error.message,
      code: error.code,
      response: error.response,
    });
    throw error;
  }
};

// Hàm xác nhận thanh toán
const confirmPayment = async (req, res) => {
  const { bookingId } = req.params;
  const { paymentMethod, amount, selectedProducts = [], voucherId } = req.body;
  const customerId = req.user?.customerID;

  let pool;
  let transaction;
  try {
    console.log("Kết nối đến SQL Server...");
    pool = await sql.connect(dbConfig);
    console.log("Đã kết nối SQL Server");

    console.log("Khởi tạo transaction...");
    transaction = new sql.Transaction(pool);
    await transaction.begin(sql.ISOLATION_LEVEL_SERIALIZABLE);
    console.log("Đã bắt đầu transaction với isolation level SERIALIZABLE");

    const validatedPaymentMethod = validatePaymentMethod(paymentMethod);

    const request = transaction.request();
    request.input("bookingId", sql.Int, bookingId);
    request.input("customerId", sql.Int, customerId);
    const bookingCheck = await request.query(
      `SELECT Status, TotalSeats, ShowID FROM Booking WITH (UPDLOCK)
       WHERE BookingID = @bookingId AND CustomerID = @customerId`
    );

    if (!bookingCheck.recordset.length) {
      await transaction.rollback();
      console.log("Không tìm thấy đặt vé:", { bookingId, customerId });
      return res.status(400).json({ success: false, message: "Không tìm thấy đặt vé" });
    }

    const booking = bookingCheck.recordset[0];
    if (booking.Status !== "Pending") {
      await transaction.rollback();
      console.log("Đặt vé không hợp lệ:", { bookingId, status: booking.Status });
      return res.status(400).json({
        success: false,
        message: `Đặt vé không hợp lệ do trạng thái hiện tại là '${booking.Status}'`
      });
    }

    // Kiểm tra trạng thái ghế trước khi thanh toán
    const seatCheck = await request.query(
      `SELECT chs.SeatID, chs.Status
       FROM BookingSeat bs
       JOIN CinemaHallSeat chs ON bs.SeatID = chs.SeatID
       WHERE bs.BookingID = @bookingId`
    );

    const invalidSeats = seatCheck.recordset.filter(seat => seat.Status !== 'Reserved');
    if (invalidSeats.length > 0) {
      await transaction.rollback();
      console.log("Ghế không hợp lệ:", invalidSeats);
      return res.status(400).json({
        success: false,
        message: "Một số ghế đã bị thay đổi trạng thái. Vui lòng thử lại.",
        invalidSeats: invalidSeats.map(seat => seat.SeatID)
      });
    }

    const seatPriceResult = await request.query(
      `SELECT SUM(TicketPrice) as SeatTotalPrice 
       FROM BookingSeat 
       WHERE BookingID = @bookingId`
    );
    let totalPrice = parseFloat(seatPriceResult.recordset[0].SeatTotalPrice || 0);

    const bookingProductsResult = await request.query(
      `SELECT bp.ProductID, p.ProductName, bp.Quantity, bp.TotalPriceBookingProduct
       FROM BookingProduct bp
       JOIN Product p ON bp.ProductID = p.ProductID
       WHERE bp.BookingID = @bookingId`
    );
    let productTotal = bookingProductsResult.recordset.reduce((sum, p) => sum + parseFloat(p.TotalPriceBookingProduct), 0);
    console.log("Sản phẩm đã lưu:", bookingProductsResult.recordset);

    totalPrice += productTotal;
    let discountAmount = 0;

    if (voucherId) {
      const voucherResult = await request
        .input("voucherId", sql.Int, voucherId)
        .query(
          `SELECT DiscountValue 
           FROM Voucher 
           WHERE VoucherID = @voucherId 
           AND IsActive = 1 
           AND StartDate <= GETDATE() AND EndDate >= GETDATE()`
        );

      if (voucherResult.recordset.length > 0) {
        discountAmount = parseFloat(voucherResult.recordset[0].DiscountValue);
        const voucherUsageCheck = await request
          .input("bookingId", sql.Int, bookingId)
          .query(
            `SELECT * FROM VoucherUsage 
             WHERE VoucherID = @voucherId AND BookingID = @bookingId`
          );
        if (voucherUsageCheck.recordset.length === 0) {
          await request
            .input("voucherId", sql.Int, voucherId)
            .input("customerId", sql.Int, customerId)
            .input("bookingId", sql.Int, bookingId)
            .query(
              `INSERT INTO VoucherUsage (VoucherID, CustomerID, BookingID, UsedAt)
               VALUES (@voucherId, @customerId, @bookingId, GETDATE());
               UPDATE Voucher SET UsageCount = UsageCount + 1 WHERE VoucherID = @voucherId`
            );
        }
      }
    }

    const finalAmount = Math.max(0, totalPrice - discountAmount);

    if (finalAmount !== parseFloat(amount)) {
      await transaction.rollback();
      console.log("Số tiền không khớp:", { finalAmount, amount });
      return res.status(400).json({ success: false, message: "Số tiền thanh toán không khớp" });
    }

    const paymentId = Math.floor(Math.random() * 1000000);
    await request
      .input("paymentId", sql.Int, paymentId)
      .input("bookingId", sql.Int, bookingId)
      .input("amount", sql.Decimal(10, 2), finalAmount)
      .input("paymentMethod", sql.VarChar, validatedPaymentMethod)
      .query(
        `INSERT INTO Payment (PaymentID, BookingID, Amount, PaymentDate, PaymentMethod)
         VALUES (@paymentId, @bookingId, @amount, GETDATE(), @paymentMethod)`
      );

    await request.query(
      `UPDATE Booking SET Status = 'Confirmed' WHERE BookingID = @bookingId;
       UPDATE BookingSeat SET Status = 'Booked' WHERE BookingID = @bookingId;
       UPDATE CinemaHallSeat SET Status = 'Booked'
       WHERE SeatID IN (SELECT SeatID FROM BookingSeat WHERE BookingID = @bookingId)`
    );

    const paymentDetailsResult = await request
      .input("paymentId", sql.Int, paymentId)
      .query(
        `SELECT p.PaymentID, p.Amount, p.PaymentDate, p.PaymentMethod,
         b.BookingID, b.Status as BookingStatus, b.TotalSeats,
         s.ShowDate, s.ShowTime,
         m.MovieTitle, m.MovieAge, m.MovieGenre, m.ImageUrl,
         c.CinemaName, ch.HallName,
         (SELECT STRING_AGG(chs.SeatNumber, ', ') 
          FROM BookingSeat bs
          JOIN CinemaHallSeat chs ON bs.SeatID = chs.SeatID
          WHERE bs.BookingID = b.BookingID) as SelectedSeats
         FROM Payment p
         JOIN Booking b ON p.BookingID = b.BookingID
         JOIN Show s ON b.ShowID = s.ShowID
         JOIN Movie m ON s.MovieID = m.MovieID
         JOIN CinemaHall ch ON s.HallID = ch.HallID
         JOIN Cinema c ON ch.CinemaID = c.CinemaID
         WHERE p.PaymentID = @paymentId AND b.BookingID = @bookingId`
      );

    const customerResult = await request
      .input("customerId", sql.Int, customerId)
      .query(
        `SELECT CustomerEmail
         FROM Customer
         WHERE CustomerID = @customerId`
      );

    const customerEmail = customerResult.recordset[0]?.CustomerEmail || "unknown@example.com";
    const notificationMessage = generateNotificationContent(
      paymentDetailsResult.recordset[0],
      paymentDetailsResult.recordset[0],
      bookingProductsResult.recordset,
      discountAmount,
      finalAmount
    );

    await request
      .input("customerId", sql.Int, customerId)
      .input("message", sql.NVarChar(sql.MAX), notificationMessage)
      .query(
        `INSERT INTO Notification (CustomerID, Message, DateSent, IsRead)
         VALUES (@customerId, @message, GETDATE(), 0)`
      );

    await sendPaymentConfirmationEmail(
      customerEmail,
      paymentDetailsResult.recordset[0],
      paymentDetailsResult.recordset[0],
      bookingProductsResult.recordset,
      discountAmount,
      finalAmount
    );

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
    if (pool && pool.connected) {
      await pool.close();
      console.log("Đã đóng kết nối pool");
    }
  }
};

// Hàm xử lý thanh toán
const processPayment = async (req, res) => {
  const { 
    bookingId, 
    selectedProducts = [], 
    voucherId, 
    paymentMethod, 
    termsAccepted,
    countdown 
  } = req.body;
  const customerId = req.user?.customerID;

  let pool;
  let transaction;
  try {
    if (!bookingId || !termsAccepted || !paymentMethod || !customerId) {
      return res.status(400).json({ 
        success: false, 
        message: "Thông tin không đầy đủ hoặc không hợp lệ" 
      });
    }

    console.log("Kết nối đến SQL Server...");
    pool = await sql.connect(dbConfig);
    console.log("Đã kết nối SQL Server");

    console.log("Khởi tạo transaction...");
    transaction = new sql.Transaction(pool);
    await transaction.begin(sql.ISOLATION_LEVEL_SERIALIZABLE);
    console.log("Đã bắt đầu transaction với isolation level SERIALIZABLE");

    const validatedPaymentMethod = validatePaymentMethod(paymentMethod);

    const request = transaction.request();
    request.input("bookingId", sql.Int, bookingId);
    request.input("customerId", sql.Int, customerId);
    const bookingResult = await request.query(
      `SELECT b.*, s.ShowDate, s.ShowTime, m.MovieTitle, m.ImageUrl, c.CinemaName, ch.HallName,
       (SELECT SUM(TicketPrice) FROM BookingSeat WHERE BookingID = b.BookingID) as SeatTotalPrice
       FROM Booking b
       JOIN Show s ON b.ShowID = s.ShowID
       JOIN Movie m ON s.MovieID = m.MovieID
       JOIN CinemaHall ch ON s.HallID = ch.HallID
       JOIN Cinema c ON ch.CinemaID = c.CinemaID
       WHERE b.BookingID = @bookingId AND b.CustomerID = @customerId`
    );

    if (!bookingResult.recordset.length) {
      await transaction.rollback();
      console.log("Không tìm thấy đặt vé:", { bookingId, customerId });
      return res.status(404).json({ 
        success: false, 
        message: "Không tìm thấy thông tin đặt vé hoặc bạn không có quyền truy cập" 
      });
    }

    const booking = bookingResult.recordset[0];
    if (booking.Status !== "Pending") {
      await transaction.rollback();
      console.log("Đặt vé không hợp lệ:", { bookingId, status: booking.Status });
      return res.status(400).json({
        success: false,
        message: `Đặt vé không hợp lệ do trạng thái hiện tại là '${booking.Status}'`
      });
    }

    // Kiểm tra trạng thái ghế
    const seatCheck = await request.query(
      `SELECT chs.SeatID, chs.Status
       FROM BookingSeat bs
       JOIN CinemaHallSeat chs ON bs.SeatID = chs.SeatID
       WHERE bs.BookingID = @bookingId`
    );

    const invalidSeats = seatCheck.recordset.filter(seat => seat.Status !== 'Reserved');
    if (invalidSeats.length > 0) {
      await transaction.rollback();
      console.log("Ghế không hợp lệ:", invalidSeats);
      return res.status(400).json({
        success: false,
        message: "Một số ghế đã bị thay đổi trạng thái. Vui lòng thử lại.",
        invalidSeats: invalidSeats.map(seat => seat.SeatID)
      });
    }

    let totalPrice = parseFloat(booking.SeatTotalPrice || 0);

    const bookingProductsResult = await request.query(
      `SELECT bp.ProductID, p.ProductName, bp.Quantity, bp.TotalPriceBookingProduct
       FROM BookingProduct bp
       JOIN Product p ON bp.ProductID = p.ProductID
       WHERE bp.BookingID = @bookingId`
    );
    let productTotal = bookingProductsResult.recordset.reduce((sum, p) => sum + parseFloat(p.TotalPriceBookingProduct), 0);
    console.log("Sản phẩm đã lưu:", bookingProductsResult.recordset);

    totalPrice += productTotal;
    let discountAmount = 0;

    if (voucherId) {
      const voucherResult = await request
        .input("voucherId", sql.Int, voucherId)
        .query(
          `SELECT DiscountValue 
           FROM Voucher 
           WHERE VoucherID = @voucherId 
           AND IsActive = 1 
           AND StartDate <= GETDATE() AND EndDate >= GETDATE()`
        );

      if (voucherResult.recordset.length > 0) {
        discountAmount = parseFloat(voucherResult.recordset[0].DiscountValue);
        const voucherUsageCheck = await request
          .input("bookingId", sql.Int, bookingId)
          .query(
            `SELECT * FROM VoucherUsage 
             WHERE VoucherID = @voucherId AND BookingID = @bookingId`
          );
        if (voucherUsageCheck.recordset.length === 0) {
          await request
            .input("voucherId", sql.Int, voucherId)
            .input("customerId", sql.Int, customerId)
            .input("bookingId", sql.Int, bookingId)
            .query(
              `INSERT INTO VoucherUsage (VoucherID, CustomerID, BookingID, UsedAt)
               VALUES (@voucherId, @customerId, @bookingId, GETDATE());
               UPDATE Voucher SET UsageCount = UsageCount + 1 WHERE VoucherID = @voucherId`
            );
        }
      }
    }

    const finalAmount = Math.max(0, totalPrice - discountAmount);

    const paymentResult = await request
      .input("bookingId", sql.Int, bookingId)
      .input("amount", sql.Decimal(10, 2), finalAmount)
      .input("paymentMethod", sql.VarChar, validatedPaymentMethod)
      .query(
        `INSERT INTO Payment (BookingID, Amount, PaymentDate, PaymentMethod) 
         VALUES (@bookingId, @amount, GETDATE(), @paymentMethod);
         SELECT SCOPE_IDENTITY() AS PaymentID;`
      );

    const paymentId = paymentResult.recordset[0].PaymentID;

    await request.query(
      `UPDATE Booking SET Status = 'Confirmed' WHERE BookingID = @bookingId;
       UPDATE BookingSeat SET Status = 'Booked' WHERE BookingID = @bookingId;
       UPDATE CinemaHallSeat SET Status = 'Booked'
       WHERE SeatID IN (SELECT SeatID FROM BookingSeat WHERE BookingID = @bookingId)`
    );

    const paymentDetailsResult = await request
      .input("paymentId", sql.Int, paymentId)
      .query(
        `SELECT p.PaymentID, p.Amount, p.PaymentDate, p.PaymentMethod,
         b.BookingID, b.Status as BookingStatus, b.TotalSeats,
         s.ShowDate, s.ShowTime,
         m.MovieTitle, m.MovieAge, m.MovieGenre, m.ImageUrl,
         c.CinemaName, ch.HallName,
         (SELECT STRING_AGG(chs.SeatNumber, ', ') 
          FROM BookingSeat bs
          JOIN CinemaHallSeat chs ON bs.SeatID = chs.SeatID
          WHERE bs.BookingID = b.BookingID) as SelectedSeats
         FROM Payment p
         JOIN Booking b ON p.BookingID = b.BookingID
         JOIN Show s ON b.ShowID = s.ShowID
         JOIN Movie m ON s.MovieID = m.MovieID
         JOIN CinemaHall ch ON s.HallID = ch.HallID
         JOIN Cinema c ON ch.CinemaID = c.CinemaID
         WHERE p.PaymentID = @paymentId AND b.BookingID = @bookingId`
      );

    const customerResult = await request
      .input("customerId", sql.Int, customerId)
      .query(
        `SELECT CustomerEmail
         FROM Customer
         WHERE CustomerID = @customerId`
      );

    const customerEmail = customerResult.recordset[0]?.CustomerEmail || "unknown@example.com";
    const notificationMessage = generateNotificationContent(
      paymentDetailsResult.recordset[0],
      paymentDetailsResult.recordset[0],
      bookingProductsResult.recordset,
      discountAmount,
      finalAmount
    );

    await request
      .input("customerId", sql.Int, customerId)
      .input("message", sql.NVarChar(sql.MAX), notificationMessage)
      .query(
        `INSERT INTO Notification (CustomerID, Message, DateSent, IsRead)
         VALUES (@customerId, @message, GETDATE(), 0)`
      );

    await sendPaymentConfirmationEmail(
      customerEmail,
      paymentDetailsResult.recordset[0],
      paymentDetailsResult.recordset[0],
      bookingProductsResult.recordset,
      discountAmount,
      finalAmount
    );

    await transaction.commit();
    console.log("Đã commit transaction");

    return res.status(200).json({
      success: true,
      message: "Thanh toán thành công",
      data: {
        payment: paymentDetailsResult.recordset[0],
        products: bookingProductsResult.recordset,
        discount: discountAmount,
        subtotal: totalPrice,
        finalAmount: finalAmount
      }
    });
  } catch (error) {
    console.error("Lỗi khi xử lý thanh toán:", error);
    if (transaction) {
      console.log("Rollback transaction...");
      await transaction.rollback();
      console.log("Đã rollback transaction");
    }
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi xử lý thanh toán",
      error: error.message
    });
  } finally {
    if (pool && pool.connected) {
      await pool.close();
      console.log("Đã đóng kết nối pool");
    }
  }
};

// Hàm lấy danh sách voucher áp dụng
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
      .query(
        `SELECT * FROM Voucher 
         WHERE IsActive = 1
         AND StartDate <= @CurrentDate AND EndDate >= @CurrentDate`
      );

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
  } finally {
    if (pool && pool.connected) {
      await pool.close();
      console.log("Đã đóng kết nối pool");
    }
  }
};

// Hàm lấy chi tiết thanh toán
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
    const request = pool.request();
    request.input('BookingID', sql.Int, bookingId);
    const result = await request.query(
      `SELECT b.*, s.ShowDate, s.ShowTime, 
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
       WHERE b.BookingID = @BookingID`
    );

    if (!result.recordset.length) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin đặt vé"
      });
    }

    const productsResult = await request.query(
      `SELECT bp.ProductID, p.ProductName, p.ProductPrice, bp.Quantity, 
       bp.TotalPriceBookingProduct, p.ImageProduct
       FROM BookingProduct bp
       JOIN Product p ON bp.ProductID = p.ProductID
       WHERE bp.BookingID = @BookingID`
    );

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
  } finally {
    if (pool && pool.connected) {
      await pool.close();
      console.log("Đã đóng kết nối pool");
    }
  }
};

// Hàm sinh mã QR
const generateQRCode = async (req, res) => {
  const { bookingId } = req.params;
  const { paymentMethod, selectedProducts = [], voucherId } = req.body;
  const customerId = req.user?.customerID;

  let pool;
  let transaction;
  try {
    console.log("Kết nối đến SQL Server...");
    pool = await sql.connect(dbConfig);
    console.log("Đã kết nối SQL Server");

    console.log("Khởi tạo transaction...");
    transaction = new sql.Transaction(pool);
    await transaction.begin(sql.ISOLATION_LEVEL_SERIALIZABLE);
    console.log("Đã bắt đầu transaction");

    const validatedPaymentMethod = validatePaymentMethod(paymentMethod);

    const request = transaction.request();
    request.input("bookingId", sql.Int, bookingId);
    request.input("customerId", sql.Int, customerId);

    console.log("Kiểm tra booking...");
    const bookingCheck = await request.query(
      `SELECT Status, TotalSeats FROM Booking WITH (UPDLOCK)
       WHERE BookingID = @bookingId AND CustomerID = @customerId`
    );
    console.log("Kết quả kiểm tra booking:", bookingCheck.recordset);

    if (!bookingCheck.recordset.length) {
      await transaction.rollback();
      console.log("Không tìm thấy đặt vé:", { bookingId, customerId });
      return res.status(400).json({ success: false, message: "Không tìm thấy đặt vé" });
    }

    const booking = bookingCheck.recordset[0];
    if (booking.Status !== "Pending") {
      await transaction.rollback();
      console.log("Đặt vé không hợp lệ:", { bookingId, status: booking.Status });
      return res.status(400).json({
        success: false,
        message: `Đặt vé không hợp lệ do trạng thái hiện tại là '${booking.Status}'`
      });
    }

    // Kiểm tra trạng thái ghế
    const seatCheck = await request.query(
      `SELECT chs.SeatID, chs.Status
       FROM BookingSeat bs
       JOIN CinemaHallSeat chs ON bs.SeatID = chs.SeatID
       WHERE bs.BookingID = @bookingId`
    );

    const invalidSeats = seatCheck.recordset.filter(seat => seat.Status !== 'Reserved');
    if (invalidSeats.length > 0) {
      await transaction.rollback();
      console.log("Ghế không hợp lệ:", invalidSeats);
      return res.status(400).json({
        success: false,
        message: "Một số ghế đã bị thay đổi trạng thái. Vui lòng thử lại.",
        invalidSeats: invalidSeats.map(seat => seat.SeatID)
      });
    }

    console.log("Tính tổng giá vé...");
    const seatPriceResult = await request.query(
      `SELECT SUM(TicketPrice) as SeatTotalPrice 
       FROM BookingSeat 
       WHERE BookingID = @bookingId`
    );
    let totalPrice = parseFloat(seatPriceResult.recordset[0].SeatTotalPrice || 0);
    let productTotal = 0;

    if (selectedProducts.length > 0) {
      console.log("Xử lý sản phẩm:", selectedProducts);
      const uniqueProducts = [];
      const productMap = new Map();
      selectedProducts.forEach(p => {
        const key = `${p.productId}-${p.quantity}`;
        if (!productMap.has(key)) {
          productMap.set(key, p);
          uniqueProducts.push(p);
        }
      });
      console.log("Sản phẩm không trùng lặp:", uniqueProducts);

      const productIds = uniqueProducts.map((p) => p.productId);
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

      for (const product of uniqueProducts) {
        const productPrice = productPrices[product.productId] || 0;
        const quantity = product.quantity || 0;
        const productTotalPrice = productPrice * quantity;
        productTotal += productTotalPrice;

        if (quantity > 0) {
          const checkProductRequest = transaction.request();
          checkProductRequest.input("bookingId", sql.Int, bookingId);
          checkProductRequest.input("productId", sql.Int, product.productId);
          const existingProduct = await checkProductRequest.query(
            `SELECT Quantity, TotalPriceBookingProduct 
             FROM BookingProduct 
             WHERE BookingID = @bookingId AND ProductID = @productId`
          );

          if (existingProduct.recordset.length > 0) {
            const newQuantity = existingProduct.recordset[0].Quantity + quantity;
            const newTotalPrice = productPrice * newQuantity;
            const updateProductRequest = transaction.request();
            await updateProductRequest
              .input("bookingId", sql.Int, bookingId)
              .input("productId", sql.Int, product.productId)
              .input("quantity", sql.Int, newQuantity)
              .input("totalPrice", sql.Decimal(10, 2), newTotalPrice)
              .query(
                `UPDATE BookingProduct 
                 SET Quantity = @quantity, TotalPriceBookingProduct = @totalPrice
                 WHERE BookingID = @bookingId AND ProductID = @productId`
              );
          } else {
            const productRequest = transaction.request();
            await productRequest
              .input("bookingId", sql.Int, bookingId)
              .input("productId", sql.Int, product.productId)
              .input("quantity", sql.Int, quantity)
              .input("totalPrice", sql.Decimal(10, 2), productTotalPrice)
              .query(
                `INSERT INTO BookingProduct (BookingID, ProductID, Quantity, TotalPriceBookingProduct)
                 VALUES (@bookingId, @productId, @quantity, @totalPrice)`
              );
          }
        }
      }
    }

    totalPrice += productTotal;
    let discountAmount = 0;

    if (voucherId) {
      console.log("Xử lý voucher:", voucherId);
      const voucherRequest = transaction.request();
      const voucherResult = await voucherRequest
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
        const voucherUsageCheck = await voucherRequest
          .input("bookingId", sql.Int, bookingId)
          .query(
            `SELECT * FROM VoucherUsage 
             WHERE VoucherID = @voucherId AND BookingID = @bookingId`
          );
        if (voucherUsageCheck.recordset.length === 0) {
          await voucherRequest
            .input("bookingId", sql.Int, bookingId)
            .query(
              `INSERT INTO VoucherUsage (VoucherID, CustomerID, BookingID, UsedAt)
               VALUES (@voucherId, @customerId, @bookingId, GETDATE());
               UPDATE Voucher SET UsageCount = UsageCount + 1 WHERE VoucherID = @voucherId`
            );
        }
      }
    }

    const finalAmount = Math.max(0, totalPrice - discountAmount);
    console.log("Tổng tiền cuối cùng:", finalAmount);

    let qrData;
    let transactionInfo;
    if (validatedPaymentMethod === "Online") {
      transactionInfo = {
        bankName: "Online",
        accountNumber: "1234567890",
        accountName: "CJ MTB VIETNAM",
        amount: finalAmount,
        content: `Thanh toan don hang ${bookingId}`,
      };
      qrData = `momo://payment?orderId=${bookingId}&amount=${finalAmount}&orderInfo=Thanh%20toan%20don%20hang%20${bookingId}`;
    } else {
      await transaction.rollback();
      console.log("Phương thức thanh toán không hỗ trợ:", validatedPaymentMethod);
      return res.status(400).json({ success: false, message: "Phương thức thanh toán không hỗ trợ" });
    }

    console.log("Sinh mã QR...");
    const qrCodeImage = await QRCode.toDataURL(qrData);
    console.log("Đã sinh mã QR thành công");

    await transaction.commit();
    console.log("Đã commit transaction");

    res.json({
      success: true,
      qrCode: qrCodeImage,
      bookingId,
      totalPrice: finalAmount,
      paymentMethod: validatedPaymentMethod,
      transactionInfo,
    });
  } catch (error) {
    console.error("Lỗi khi sinh mã QR:", error);
    if (transaction) {
      console.log("Rollback transaction...");
      await transaction.rollback();
      console.log("Đã rollback transaction");
    }
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  } finally {
    if (pool && pool.connected) {
      await pool.close();
      console.log("Đã đóng kết nối pool");
    }
  }
};

// Hàm giả lập thanh toán Momo
const simulateMomoPayment = async (req, res) => {
  const { bookingId } = req.params;
  const { selectedProducts = [], voucherId, paymentConfirmed } = req.body;
  const customerId = req.user?.customerID;

  if (!paymentConfirmed) {
    return res.status(400).json({
      success: false,
      message: "Thanh toán chưa được xác nhận từ phía client",
    });
  }

  let pool;
  let transaction;
  try {
    console.log("Kết nối đến SQL Server...");
    pool = await sql.connect(dbConfig);
    console.log("Đã kết nối SQL Server");

    console.log("Khởi tạo transaction...");
    transaction = new sql.Transaction(pool);
    await transaction.begin(sql.ISOLATION_LEVEL_SERIALIZABLE);
    console.log("Đã bắt đầu transaction");

    const bookingRequest = transaction.request();
    bookingRequest.input("bookingId", sql.Int, bookingId);
    bookingRequest.input("customerId", sql.Int, customerId);
    const bookingCheck = await bookingRequest.query(
      `SELECT Status, TotalSeats FROM Booking WITH (UPDLOCK)
       WHERE BookingID = @bookingId AND CustomerID = @customerId`
    );

    if (!bookingCheck.recordset.length) {
      await transaction.rollback();
      console.log("Không tìm thấy đặt vé:", { bookingId, customerId });
      return res.status(400).json({ success: false, message: "Không tìm thấy đặt vé" });
    }

    const booking = bookingCheck.recordset[0];
    if (booking.Status !== "Pending") {
      await transaction.rollback();
      console.log("Đặt vé không hợp lệ:", { bookingId, status: booking.Status });
      return res.status(400).json({
        success: false,
        message: `Đặt vé không hợp lệ do trạng thái hiện tại là '${booking.Status}'`
      });
    }

    // Kiểm tra trạng thái ghế
    const seatCheck = await bookingRequest.query(
      `SELECT chs.SeatID, chs.Status
       FROM BookingSeat bs
       JOIN CinemaHallSeat chs ON bs.SeatID = chs.SeatID
       WHERE bs.BookingID = @bookingId`
    );

    const invalidSeats = seatCheck.recordset.filter(seat => seat.Status !== 'Reserved');
    if (invalidSeats.length > 0) {
      await transaction.rollback();
      console.log("Ghế không hợp lệ:", invalidSeats);
      return res.status(400).json({
        success: false,
        message: "Một số ghế đã bị thay đổi trạng thái. Vui lòng thử lại.",
        invalidSeats: invalidSeats.map(seat => seat.SeatID)
      });
    }

    const seatPriceRequest = transaction.request();
    seatPriceRequest.input("bookingId", sql.Int, bookingId);
    const seatPriceResult = await seatPriceRequest.query(
      `SELECT SUM(TicketPrice) as SeatTotalPrice 
       FROM BookingSeat 
       WHERE BookingID = @bookingId`
    );
    let totalPrice = parseFloat(seatPriceResult.recordset[0].SeatTotalPrice || 0);

    const bookingProductsResult = await seatPriceRequest.query(
      `SELECT bp.ProductID, p.ProductName, bp.Quantity, bp.TotalPriceBookingProduct
       FROM BookingProduct bp
       JOIN Product p ON bp.ProductID = p.ProductID
       WHERE bp.BookingID = @bookingId`
    );
    let productTotal = bookingProductsResult.recordset.reduce((sum, p) => sum + parseFloat(p.TotalPriceBookingProduct), 0);
    console.log("Sản phẩm đã lưu:", bookingProductsResult.recordset);

    totalPrice += productTotal;
    let discountAmount = 0;

    if (voucherId) {
      const voucherRequest = transaction.request();
      voucherRequest.input("voucherId", sql.Int, voucherId);
      voucherRequest.input("customerId", sql.Int, customerId);
      const voucherResult = await voucherRequest.query(
        `SELECT DiscountValue 
         FROM Voucher 
         WHERE VoucherID = @voucherId 
         AND IsActive = 1 
         AND StartDate <= GETDATE() AND EndDate >= GETDATE()`
      );

      if (voucherResult.recordset.length > 0) {
        discountAmount = parseFloat(voucherResult.recordset[0].DiscountValue);
        const voucherUsageCheck = await voucherRequest
          .input("bookingId", sql.Int, bookingId)
          .query(
            `SELECT * FROM VoucherUsage 
             WHERE VoucherID = @voucherId AND BookingID = @bookingId`
          );
        if (voucherUsageCheck.recordset.length === 0) {
          await voucherRequest
            .input("bookingId", sql.Int, bookingId)
            .query(
              `INSERT INTO VoucherUsage (VoucherID, CustomerID, BookingID, UsedAt)
               VALUES (@voucherId, @customerId, @bookingId, GETDATE());
               UPDATE Voucher SET UsageCount = UsageCount + 1 WHERE VoucherID = @voucherId`
            );
        }
      }
    }

    const finalAmount = Math.max(0, totalPrice - discountAmount);

    const paymentRequest = transaction.request();
    paymentRequest.input("bookingId", sql.Int, bookingId);
    paymentRequest.input("amount", sql.Decimal(10, 2), finalAmount);
    paymentRequest.input("paymentMethod", sql.VarChar, "Online");
    const paymentResult = await paymentRequest.query(
      `INSERT INTO Payment (BookingID, Amount, PaymentDate, PaymentMethod)
       VALUES (@bookingId, @amount, GETDATE(), @paymentMethod);
       SELECT SCOPE_IDENTITY() AS PaymentID;`
    );

    const paymentId = paymentResult.recordset[0].PaymentID;

    const updateRequest = transaction.request();
    updateRequest.input("bookingId", sql.Int, bookingId);
    await updateRequest.query(
      `UPDATE Booking SET Status = 'Confirmed' WHERE BookingID = @bookingId;
       UPDATE BookingSeat SET Status = 'Booked' WHERE BookingID = @bookingId;
       UPDATE CinemaHallSeat SET Status = 'Booked'
       WHERE SeatID IN (SELECT SeatID FROM BookingSeat WHERE BookingID = @bookingId)`
    );

    const paymentDetailsRequest = transaction.request();
    paymentDetailsRequest.input("paymentId", sql.Int, paymentId);
    paymentDetailsRequest.input("bookingId", sql.Int, bookingId);
    const paymentDetailsResult = await paymentDetailsRequest.query(
      `SELECT p.PaymentID, p.Amount, p.PaymentDate, p.PaymentMethod,
       b.BookingID, b.Status as BookingStatus, b.TotalSeats,
       s.ShowDate, s.ShowTime,
       m.MovieTitle, m.MovieAge, m.MovieGenre, m.ImageUrl,
       c.CinemaName, ch.HallName,
       (SELECT STRING_AGG(chs.SeatNumber, ', ') 
        FROM BookingSeat bs
        JOIN CinemaHallSeat chs ON bs.SeatID = chs.SeatID
        WHERE bs.BookingID = b.BookingID) as SelectedSeats
       FROM Payment p
       JOIN Booking b ON p.BookingID = b.BookingID
       JOIN Show s ON b.ShowID = s.ShowID
       JOIN Movie m ON s.MovieID = m.MovieID
       JOIN CinemaHall ch ON s.HallID = ch.HallID
       JOIN Cinema c ON ch.CinemaID = c.CinemaID
       WHERE p.PaymentID = @paymentId AND b.BookingID = @bookingId`
    );

    const customerRequest = transaction.request();
    customerRequest.input("customerId", sql.Int, customerId);
    const customerResult = await customerRequest.query(
      `SELECT CustomerEmail
       FROM Customer
       WHERE CustomerID = @customerId`
    );

    const customerEmail = customerResult.recordset[0]?.CustomerEmail || "unknown@example.com";
    const notificationMessage = generateNotificationContent(
      paymentDetailsResult.recordset[0],
      paymentDetailsResult.recordset[0],
      bookingProductsResult.recordset,
      discountAmount,
      finalAmount
    );

    const notificationRequest = transaction.request();
    notificationRequest.input("customerId", sql.Int, customerId);
    notificationRequest.input("message", sql.NVarChar(sql.MAX), notificationMessage);
    await notificationRequest.query(
      `INSERT INTO Notification (CustomerID, Message, DateSent, IsRead)
       VALUES (@customerId, @message, GETDATE(), 0)`
    );

    await sendPaymentConfirmationEmail(
      customerEmail,
      paymentDetailsResult.recordset[0],
      paymentDetailsResult.recordset[0],
      bookingProductsResult.recordset,
      discountAmount,
      finalAmount
    );

    await transaction.commit();
    console.log("Đã commit transaction");

    res.json({
      success: true,
      message: "Thanh toán Momo thành công",
      paymentId,
      bookingId,
      finalAmount
    });
  } catch (error) {
    console.error("Lỗi khi giả lập thanh toán Momo:", error);
    if (transaction) {
      console.log("Rollback transaction...");
      await transaction.rollback();
      console.log("Đã rollback transaction");
    }
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  } finally {
    if (pool && pool.connected) {
      await pool.close();
      console.log("Đã đóng kết nối pool");
    }
  }
};

// Hàm kiểm tra trạng thái thanh toán
const checkPaymentStatus = async (req, res) => {
  const { bookingId } = req.params;
  const customerId = req.user?.customerID;

  let pool;
  try {
    console.log("Kết nối đến SQL Server...");
    pool = await sql.connect(dbConfig);
    console.log("Đã kết nối SQL Server");

    const request = pool.request();
    request.input("bookingId", sql.Int, bookingId);
    request.input("customerId", sql.Int, customerId);

    const result = await request.query(
      `SELECT b.*, p.PaymentID, p.Amount, p.PaymentDate, p.PaymentMethod
       FROM Booking b
       LEFT JOIN Payment p ON b.BookingID = p.BookingID
       WHERE b.BookingID = @bookingId AND b.CustomerID = @customerId`
    );

    if (!result.recordset.length) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đặt vé hoặc bạn không có quyền truy cập" });
    }

    res.json({ success: true, data: result.recordset[0] });
  } catch (error) {
    console.error("Lỗi khi kiểm tra trạng thái thanh toán:", error);
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  } finally {
    if (pool && pool.connected) {
      await pool.close();
      console.log("Đã đóng kết nối pool");
    }
  }
};

module.exports = {
  processPayment,
  getApplicableVouchers,
  getPaymentDetails,
  confirmPayment,
  generateQRCode,
  simulateMomoPayment,
  checkPaymentStatus,
};