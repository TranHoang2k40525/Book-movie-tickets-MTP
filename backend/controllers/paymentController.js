const sql = require("mssql");
const { dbConfig } = require("../config/db");
const crypto = require("crypto");
const QRCode = require("qrcode");
const nodemailer = require("nodemailer");

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

// Hàm tạo nội dung thông báo (dùng cho cả email và Notification)
const generateNotificationContent = (bookingDetails, paymentDetails, products, discount, finalAmount) => {
  const productText = products.length > 0
    ? `Sản phẩm: ${products.map(p => `${p.ProductName} x${p.Quantity} - ${p.TotalPriceBookingProduct.toLocaleString("vi-VN")} VNĐ`).join(", ")}`
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

const verifyHmacSignature = (data, receivedSignature) => {
  const secretKey = process.env.PAYMENT_SECRET_KEY || "hoangdepzai2k401hoangdepzai2k401";
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
  const { paymentMethod, amount, selectedProducts = [], voucherId, hmacSignature, timestamp } = req.body;
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

    const request = transaction.request();
    const bookingCheck = await request
      .input("bookingId", sql.Int, bookingId)
      .input("customerId", sql.Int, customerId)
      .query(
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

    const seatPriceResult = await request
      .input("bookingId", sql.Int, bookingId)
      .query(
        `SELECT SUM(TicketPrice) as SeatTotalPrice 
         FROM BookingSeat 
         WHERE BookingID = @bookingId`
      );
    let totalPrice = parseFloat(seatPriceResult.recordset[0].SeatTotalPrice || 0);
    let productTotal = 0;

    if (selectedProducts.length > 0) {
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

    totalPrice += productTotal;
    let discountAmount = 0;

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
            `INSERT INTO VoucherUsage (VoucherID, CustomerID, UsedAt)
             VALUES (@voucherId, @customerId, GETDATE());
             UPDATE Voucher SET UsageCount = UsageCount + 1 WHERE VoucherID = @voucherId`
          );
      }
    }

    const finalAmount = Math.max(0, totalPrice - discountAmount);

    if (finalAmount !== parseFloat(amount)) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: "Số tiền thanh toán không khớp" });
    }

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

    await request
      .input("bookingId", sql.Int, bookingId)
      .query(
        `UPDATE Booking SET Status = 'Confirmed' WHERE BookingID = @bookingId;
         UPDATE BookingSeat SET Status = 'Booked' WHERE BookingID = @bookingId;
         UPDATE CinemaHallSeat SET Status = 'Booked'
         WHERE SeatID IN (SELECT SeatID FROM BookingSeat WHERE BookingID = @bookingId)`
      );

    const paymentDetailsResult = await request
      .input("paymentId", sql.Int, paymentId)
      .input("bookingId", sql.Int, bookingId)
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

    const bookingProductsResult = await request
      .input("bookingId", sql.Int, bookingId)
      .query(
        `SELECT bp.ProductID, p.ProductName, bp.Quantity, bp.TotalPriceBookingProduct
         FROM BookingProduct bp
         JOIN Product p ON bp.ProductID = p.ProductID
         WHERE bp.BookingID = @bookingId`
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
    if (pool) {
      console.log("Đóng kết nối SQL Server...");
      await pool.close();
      console.log("Đã đóng kết nối");
    }
  }
};

const processPayment = async (req, res) => {
  try {
    const { 
      bookingId, 
      selectedProducts = [], 
      voucherId, 
      paymentMethod, 
      termsAccepted,
      countdown 
    } = req.body;

    if (!bookingId || !termsAccepted || !paymentMethod) {
      return res.status(400).json({ 
        success: false, 
        message: "Thông tin không đầy đủ hoặc không hợp lệ" 
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

    if (selectedProducts.length > 0) {
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
              INSERT INTO BookingProduct (BookingID, ProductID, Quantity, TotalPriceBookingProduct)
              VALUES (@BookingID, @ProductID, @Quantity, @TotalPriceBookingProduct)
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
          SELECT DiscountValue FROM Voucher 
          WHERE VoucherID = @VoucherID 
          AND IsActive = 1
          AND StartDate <= GETDATE() AND EndDate >= GETDATE()
        `);

      if (voucherResult.recordset.length > 0) {
        discountAmount = parseFloat(voucherResult.recordset[0].DiscountValue);
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
        INSERT INTO Payment (BookingID, Amount, PaymentDate, PaymentMethod) 
        VALUES (@BookingID, @Amount, GETDATE(), @PaymentMethod);
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
         WHERE bs.BookingID = b.BookingID) as SelectedSeats
        FROM Payment p
        JOIN Booking b ON p.BookingID = b.BookingID
        JOIN Show s ON b.ShowID = s.ShowID
        JOIN Movie m ON s.MovieID = m.MovieID
        JOIN CinemaHall ch ON s.HallID = ch.HallID
        JOIN Cinema c ON ch.CinemaID = c.CinemaID
        WHERE p.PaymentID = @PaymentID AND b.BookingID = @BookingID
      `);

    const bookingProductsResult = await pool.request()
      .input('BookingID', sql.NVarChar, bookingId)
      .query(`
        SELECT bp.ProductID, p.ProductName, bp.Quantity, bp.TotalPriceBookingProduct
        FROM BookingProduct bp
        JOIN Product p ON bp.ProductID = p.ProductID
        WHERE bp.BookingID = @BookingID
      `);

    const customerResult = await pool.request()
      .input('CustomerID', sql.Int, booking.CustomerID)
      .query(`
        SELECT CustomerEmail
        FROM Customer
        WHERE CustomerID = @CustomerID
      `);

    const customerEmail = customerResult.recordset[0]?.CustomerEmail || "unknown@example.com";
    const notificationMessage = generateNotificationContent(
      paymentDetailsResult.recordset[0],
      paymentDetailsResult.recordset[0],
      bookingProductsResult.recordset,
      discountAmount,
      finalAmount
    );

    await pool.request()
      .input('CustomerID', sql.Int, booking.CustomerID)
      .input('Message', sql.NVarChar(sql.MAX), notificationMessage)
      .query(`
        INSERT INTO Notification (CustomerID, Message, DateSent, IsRead)
        VALUES (@CustomerID, @Message, GETDATE(), 0)
      `);

    await sendPaymentConfirmationEmail(
      customerEmail,
      paymentDetailsResult.recordset[0],
      paymentDetailsResult.recordset[0],
      bookingProductsResult.recordset,
      discountAmount,
      finalAmount
    );

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

const generateQRCode = async (req, res) => {
  const { bookingId } = req.params;
  const { paymentMethod, selectedProducts = [], voucherId } = req.body;
  const customerId = req.user?.customerID;

  let pool;
  let transaction;
  try {
    pool = await sql.connect(dbConfig);
    transaction = new sql.Transaction(pool);
    await transaction.begin();
    const request = transaction.request();

    request.input("bookingId", sql.Int, bookingId);
    request.input("customerId", sql.Int, customerId);

    // SỬA: Thêm WITH (UPDLOCK) để khóa hàng booking khi kiểm tra
    const bookingCheck = await request.query(
      `SELECT Status, TotalSeats FROM Booking WITH (UPDLOCK)
       WHERE BookingID = @bookingId AND CustomerID = @customerId`
    );

    if (!bookingCheck.recordset.length) {
      await transaction.rollback();
      console.log("Không tìm thấy đặt vé:", { bookingId, customerId });
      return res.status(400).json({ success: false, message: "Không tìm thấy đặt vé" });
    }

    const booking = bookingCheck.recordset[0];
    // SỬA: Kiểm tra trạng thái cụ thể và trả về thông báo chi tiết
    if (booking.Status !== "Pending") {
      await transaction.rollback();
      console.log("Đặt vé không hợp lệ:", { bookingId, status: booking.Status });
      return res.status(400).json({
        success: false,
        message: `Đặt vé không hợp lệ do trạng thái hiện tại là '${booking.Status}'`
      });
    }

    const seatPriceResult = await request.query(
      `SELECT SUM(TicketPrice) as SeatTotalPrice 
       FROM BookingSeat 
       WHERE BookingID = @bookingId`
    );
    let totalPrice = parseFloat(seatPriceResult.recordset[0].SeatTotalPrice || 0);
    let productTotal = 0;

    if (selectedProducts.length > 0) {
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

    totalPrice += productTotal;
    let discountAmount = 0;

    if (voucherId) {
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
      }
    }

    const finalAmount = Math.max(0, totalPrice - discountAmount);

    let qrData;
    let transactionInfo;
    if (paymentMethod === "Vietcombank") {
      transactionInfo = {
        bankName: "Vietcombank",
        accountNumber: "1234567890",
        accountName: "CJ MTB VIETNAM",
        amount: finalAmount,
        content: `Thanh toan don hang ${bookingId}`,
      };
      qrData = `vietqr:${transactionInfo.accountNumber}|${transactionInfo.accountName}|${transactionInfo.amount}|${transactionInfo.content}`;
    } else if (paymentMethod === "Momo") {
      const momoData = {
        partnerCode: process.env.MOMO_PARTNER_CODE || "MOMO_TEST",
        accessKey: process.env.MOMO_ACCESS_KEY || "test_access_key",
        requestId: `${bookingId}_${Date.now()}`,
        amount: finalAmount,
        orderId: bookingId,
        orderInfo: `Thanh toan don hang ${bookingId}`,
        redirectUrl: "http://localhost:3000/redirect",
        ipnUrl: "http://localhost:3000/api/payments/momo-callback",
        requestType: "captureWallet",
        extraData: "",
      };

      const rawSignature = `accessKey=${momoData.accessKey}&amount=${momoData.amount}&extraData=${momoData.extraData}&ipnUrl=${momoData.ipnUrl}&orderId=${momoData.orderId}&orderInfo=${momoData.orderInfo}&partnerCode=${momoData.partnerCode}&redirectUrl=${momoData.redirectUrl}&requestId=${momoData.requestId}&requestType=${momoData.requestType}`;
      momoData.signature = crypto
        .createHmac("sha256", process.env.MOMO_SECRET_KEY || "test_secret_key")
        .update(rawSignature)
        .digest("hex");

      qrData = `momo://payment?orderId=${bookingId}&amount=${finalAmount}&orderInfo=Thanh%20toan%20don%20hang%20${bookingId}`;
      
      transactionInfo = {
        bankName: "Momo",
        accountNumber: "1234567890",
        accountName: "CJ MTB VIETNAM",
        amount: finalAmount,
        content: `Thanh toan don hang ${bookingId}`,
      };
    } else {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: "Phương thức thanh toán không hỗ trợ" });
    }

    const qrCodeImage = await QRCode.toDataURL(qrData);

    await transaction.commit();

    res.json({
      success: true,
      qrCode: qrCodeImage,
      bookingId,
      totalPrice: finalAmount,
      paymentMethod,
      transactionInfo,
    });
  } catch (error) {
    console.error("Lỗi khi sinh mã QR:", error);
    if (transaction) await transaction.rollback();
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  } finally {
    if (pool) await pool.close();
  }
};

const handleMomoCallback = async (req, res) => {
  const {
    partnerCode,
    orderId,
    requestId,
    amount,
    orderInfo,
    orderType,
    transId,
    resultCode,
    message,
    payType,
    responseTime,
    extraData,
    signature,
  } = req.body;

  try {
    const rawData = `partnerCode=${partnerCode}&orderId=${orderId}&requestId=${requestId}&amount=${amount}&orderInfo=${orderInfo}&orderType=${orderType}&transId=${transId}&resultCode=${resultCode}&message=${message}&payType=${payType}&responseTime=${responseTime}&extraData=${extraData}`;
    const computedSignature = crypto
      .createHmac("sha256", process.env.MOMO_SECRET_KEY || "test_secret_key")
      .update(rawData)
      .digest("hex");

    if (computedSignature !== signature) {
      return res.status(400).json({ success: false, message: "Chữ ký HMAC không hợp lệ" });
    }

    if (resultCode !== 0) {
      return res.json({ success: false, message: "Thanh toán thất bại", momoMessage: message });
    }

    let pool;
    try {
      pool = await sql.connect(dbConfig);
      const request = pool.request();

      request.input("bookingId", sql.Int, orderId);
      request.input("amount", sql.Decimal(10, 2), parseFloat(amount));
      request.input("paymentMethod", sql.VarChar, "Online");

      const bookingCheck = await request.query(
        `SELECT Status FROM Booking 
         WHERE BookingID = @bookingId`
      );

      if (!bookingCheck.recordset.length || bookingCheck.recordset[0].Status !== "Pending") {
        return res.json({ success: false, message: "Đặt vé không hợp lệ hoặc đã được xử lý" });
      }

      const paymentResult = await request.query(
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

      const customerResult = await request.query(
        `SELECT CustomerID FROM Booking WHERE BookingID = @bookingId`
      );
      const customerId = customerResult.recordset[0].CustomerID;

      const paymentDetailsResult = await request
        .input("paymentId", sql.Int, paymentId)
        .input("bookingId", sql.Int, orderId)
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

      const bookingProductsResult = await request
        .input("bookingId", sql.Int, orderId)
        .query(
          `SELECT bp.ProductID, p.ProductName, bp.Quantity, bp.TotalPriceBookingProduct
           FROM BookingProduct bp
           JOIN Product p ON bp.ProductID = p.ProductID
           WHERE bp.BookingID = @bookingId`
        );

      const customerEmailResult = await request
        .input("customerId", sql.Int, customerId)
        .query(
          `SELECT CustomerEmail
           FROM Customer
           WHERE CustomerID = @customerId`
        );

      const customerEmail = customerEmailResult.recordset[0]?.CustomerEmail || "unknown@example.com";
      const notificationMessage = generateNotificationContent(
        paymentDetailsResult.recordset[0],
        paymentDetailsResult.recordset[0],
        bookingProductsResult.recordset,
        0, // Giả định không có giảm giá trong callback
        parseFloat(amount)
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
        0, // Giả định không có giảm giá trong callback
        parseFloat(amount)
      );

      res.json({ success: true, message: "Thanh toán thành công" });
    } catch (error) {
      console.error("Lỗi khi xử lý callback Momo:", error);
      res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
    } finally {
      if (pool) await pool.close();
    }
  } catch (error) {
    console.error("Lỗi khi xác thực callback Momo:", error);
    res.status(400).json({ success: false, message: "Callback không hợp lệ", error: error.message });
  }
};

const simulateMomoPayment = async (req, res) => {
  const { bookingId } = req.params;
  const { selectedProducts = [], voucherId } = req.body;
  const customerId = req.user?.customerID;

  let pool;
  let transaction;
  try {
    pool = await sql.connect(dbConfig);
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    // SỬA: Thêm WITH (UPDLOCK) để khóa hàng booking khi kiểm tra
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
    // SỬA: Kiểm tra trạng thái cụ thể và trả về thông báo chi tiết
    if (booking.Status !== "Pending") {
      await transaction.rollback();
      console.log("Đặt vé không hợp lệ:", { bookingId, status: booking.Status });
      return res.status(400).json({
        success: false,
        message: `Đặt vé không hợp lệ do trạng thái hiện tại là '${booking.Status}'`
      });
    }

    // Tính tổng giá vé
    const seatPriceRequest = transaction.request();
    seatPriceRequest.input("bookingId", sql.Int, bookingId);
    const seatPriceResult = await seatPriceRequest.query(
      `SELECT SUM(TicketPrice) as SeatTotalPrice 
       FROM BookingSeat 
       WHERE BookingID = @bookingId`
    );
    let totalPrice = parseFloat(seatPriceResult.recordset[0].SeatTotalPrice || 0);
    let productTotal = 0;

    // Xử lý sản phẩm
    if (selectedProducts.length > 0) {
      const productIds = selectedProducts.map((p) => p.productId);
      const productRequest = transaction.request();
      productRequest.input("ProductIDs", sql.VarChar, productIds.join(","));
      const productsResult = await productRequest.query(
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
          const insertProductRequest = transaction.request();
          insertProductRequest.input("bookingId", sql.Int, bookingId);
          insertProductRequest.input("productId", sql.Int, product.productId);
          insertProductRequest.input("quantity", sql.Int, quantity);
          insertProductRequest.input("totalPrice", sql.Decimal(10, 2), productTotalPrice);
          await insertProductRequest.query(
            `INSERT INTO BookingProduct (BookingID, ProductID, Quantity, TotalPriceBookingProduct)
             VALUES (@bookingId, @productId, @quantity, @totalPrice)`
          );
        }
      }
    }

    totalPrice += productTotal;
    let discountAmount = 0;

    // Xử lý voucher
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
        const voucherUsageRequest = transaction.request();
        voucherUsageRequest.input("voucherId", sql.Int, voucherId);
        voucherUsageRequest.input("customerId", sql.Int, customerId);
        await voucherUsageRequest.query(
          `INSERT INTO VoucherUsage (VoucherID, CustomerID, UsedAt)
           VALUES (@voucherId, @customerId, GETDATE());
           UPDATE Voucher SET UsageCount = UsageCount + 1 WHERE BonusID = @voucherId`
        );
      }
    }

    const finalAmount = Math.max(0, totalPrice - discountAmount);

    // Lưu thông tin thanh toán
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

    // Cập nhật trạng thái đặt vé và ghế
    const updateRequest = transaction.request();
    updateRequest.input("bookingId", sql.Int, bookingId);
    await updateRequest.query(
      `UPDATE Booking SET Status = 'Confirmed' WHERE BookingID = @bookingId;
       UPDATE BookingSeat SET Status = 'Booked' WHERE BookingID = @bookingId;
       UPDATE CinemaHallSeat SET Status = 'Booked'
       WHERE SeatID IN (SELECT SeatID FROM BookingSeat WHERE BookingID = @bookingId)`
    );

    // Lấy chi tiết thanh toán
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

    // Lấy danh sách sản phẩm
    const bookingProductsRequest = transaction.request();
    bookingProductsRequest.input("bookingId", sql.Int, bookingId);
    const bookingProductsResult = await bookingProductsRequest.query(
      `SELECT bp.ProductID, p.ProductName, bp.Quantity, bp.TotalPriceBookingProduct
       FROM BookingProduct bp
       JOIN Product p ON bp.ProductID = p.ProductID
       WHERE bp.BookingID = @bookingId`
    );

    // Lấy email khách hàng
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

    // Lưu thông báo
    const notificationRequest = transaction.request();
    notificationRequest.input("customerId", sql.Int, customerId);
    notificationRequest.input("message", sql.NVarChar(sql.MAX), notificationMessage);
    await notificationRequest.query(
      `INSERT INTO Notification (CustomerID, Message, DateSent, IsRead)
       VALUES (@customerId, @message, GETDATE(), 0)`
    );

    // Gửi email xác nhận
    await sendPaymentConfirmationEmail(
      customerEmail,
      paymentDetailsResult.recordset[0],
      paymentDetailsResult.recordset[0],
      bookingProductsResult.recordset,
      discountAmount,
      finalAmount
    );

    await transaction.commit();

    res.json({
      success: true,
      message: "Thanh toán Momo thành công",
      paymentId,
      bookingId,
      finalAmount
    });
  } catch (error) {
    console.error("Lỗi khi giả lập thanh toán Momo:", error);
    if (transaction) await transaction.rollback();
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  } finally {
    if (pool) await pool.close();
  }
};

module.exports = {
  processPayment,
  getApplicableVouchers,
  getPaymentDetails,
  confirmPayment,
  generateQRCode,
  handleMomoCallback,
  simulateMomoPayment,
};