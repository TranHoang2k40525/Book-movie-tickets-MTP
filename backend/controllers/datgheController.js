const sql = require("mssql");
const { dbConfig } = require("../config/db");
const { broadcastSeatUpdate } = require("../websocket");

// Hàm lấy sơ đồ ghế cho API
const getSeatMapByShow = async (req, res) => {
    let pool = null;
    try {
        const { showId } = req.params;
        if (!showId || isNaN(showId)) {
            return res.status(400).json({ error: "showId không hợp lệ" });
        }

        console.log(`[${new Date().toISOString()}] Lấy sơ đồ ghế cho showId: ${showId}, user:`, req.user);

        pool = await sql.connect(dbConfig);

        const hallQuery = `
            SELECT ch.HallID, ch.HallName, ch.TotalSeats, c.CinemaName
            FROM CinemaHall ch
            JOIN Cinema c ON ch.CinemaID = c.CinemaID
            JOIN Show s ON s.HallID = ch.HallID
            WHERE s.ShowID = @showId
        `;
        const hallResult = await pool
            .request()
            .input("showId", sql.Int, parseInt(showId))
            .query(hallQuery);

        if (!hallResult.recordset[0]) {
            return res.status(404).json({ error: "Không tìm thấy phòng chiếu cho suất chiếu này" });
        }

        const hall = hallResult.recordset[0];

        const seatsQuery = `
            SELECT 
                chs.SeatID,
                chs.SeatNumber,
                chs.SeatType,
                chs.SeatPrice,
                CASE 
                    WHEN bs.Status = 'Reserved' AND bs.HoldUntil > GETDATE() THEN 'reserved'
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
        const seatsResult = await pool
            .request()
            .input("hallId", sql.Int, hall.HallID)
            .input("showId", sql.Int, parseInt(showId))
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

        const response = {
            hall: {
        hallId: hall.HallID,
        hallName: hall.HallName,
                cinemaName: hall.CinemaName,
                totalSeats: hall.TotalSeats,
            },
            seatLayout,
        };

        res.status(200).json(response);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Lỗi khi lấy sơ đồ ghế:`, error);
        return res.status(500).json({ error: "Lỗi server khi lấy sơ đồ ghế", message: error.message });
    } finally {
        if (pool) {
            await pool.close();
        }
    }
};

// Hàm giải phóng ghế hết hạn (cho cron job)
const releaseExpiredSeatsCron = async () => {
    let pool = null;
    let transaction = null;
    try {
        pool = await sql.connect(dbConfig);
        transaction = new sql.Transaction(pool);
    await transaction.begin(sql.ISOLATION_LEVEL_SERIALIZABLE);

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

        const checkResult = await transaction.request().query(`
            SELECT COUNT(*) AS ExpiredCount
            FROM BookingSeat
            WHERE Status = 'Reserved' AND HoldUntil < DATEADD(SECOND, -5, DATEADD(HOUR, 7, GETUTCDATE()))
        `);
        const expiredCount = checkResult.recordset[0].ExpiredCount;

        if (expiredCount === 0) {
            console.log(`[${new Date().toISOString()}] Không có ghế hết hạn để giải phóng`);
            await transaction.commit();
            return;
        }

        const affectedShows = await transaction.request().query(`
            SELECT DISTINCT ShowID
            FROM BookingSeat
      WHERE Status = 'Reserved' AND HoldUntil < DATEADD(SECOND, -5, DATEADD(HOUR, 7, GETUTCDATE()))
        `);

        const result = await transaction.request().query(`
            UPDATE CinemaHallSeat
            SET Status = 'Available'
            OUTPUT DELETED.SeatID
            WHERE SeatID IN (
                SELECT SeatID
                FROM BookingSeat
        WHERE Status = 'Reserved' AND HoldUntil < DATEADD(SECOND, -5, DATEADD(HOUR, 7, GETUTCDATE()))
            );

            DELETE FROM BookingSeat
      WHERE Status = 'Reserved' AND HoldUntil < DATEADD(SECOND, -5, DATEADD(HOUR, 7, GETUTCDATE()));

            DELETE FROM Booking
            WHERE BookingID NOT IN (
                SELECT DISTINCT BookingID
                FROM BookingSeat
            )
      AND Status = 'Pending';
        `);

        if (result.recordset.length > 0) {
            console.log(`[${new Date().toISOString()}] Ghế được giải phóng:`, result.recordset);
            for (const show of affectedShows.recordset) {
                broadcastSeatUpdate(show.ShowID);
                console.log(`[${new Date().toISOString()}] Gửi thông báo cập nhật ghế cho showId: ${show.ShowID}`);
            }
        }
        await transaction.commit();
        console.log(`[${new Date().toISOString()}] Đã commit transaction cron job`);
    } catch (err) {
        console.error(`[${new Date().toISOString()}] Lỗi khi giải phóng ghế hết hạn:`, err);
        if (transaction) {
            console.log(`[${new Date().toISOString()}] Rollback transaction cron job...`);
            await transaction.rollback();
            console.log(`[${new Date().toISOString()}] Đã rollback transaction cron job`);
        }
    } finally {
    if (pool && pool.connected) {
            await pool.close();
        }
    }
};

// Hàm giải phóng ghế hết hạn (cho transaction)
const releaseExpiredSeats = async (transaction) => {
    try {
        const reservedCheck = await transaction.request().query(`
            SELECT COUNT(*) AS ReservedCount
            FROM BookingSeat
      WHERE Status = 'Reserved'
        `);
        const reservedCount = reservedCheck.recordset[0].ReservedCount;

        if (reservedCount === 0) {
            console.log(`[${new Date().toISOString()}] Không có ghế Reserved trong transaction`);
            return;
        }

        const affectedShows = await transaction.request().query(`
            SELECT DISTINCT ShowID
            FROM BookingSeat
            WHERE Status = 'Pending' AND HoldUntil < DATEADD(SECOND, -5, DATEADD(HOUR, 7, GETDATE()));
        `);

        const checkResult = await transaction.request().query(`
            SELECT COUNT(*) AS ExpiredCount
            FROM BookingSeat
            WHERE Status = 'Pending' AND HoldUntil < DATEADD(SECOND, -5, DATEADD(HOUR, 7, GETDATE()));
        `);
        const expiredCount = checkResult.recordset[0].ExpiredCount;

        if (expiredCount === 0) {
            console.log(`[${new Date().toISOString()}] Không có ghế hết hạn trong transaction`);
            return;
        }

        const result = await transaction.request().query(`
            UPDATE CinemaHallSeat
            SET Status = 'Available'
            OUTPUT DELETED.SeatID
            WHERE SeatID IN (
                SELECT SeatID
                FROM BookingSeat
        WHERE Status = 'Reserved' AND HoldUntil < DATEADD(SECOND, -5, DATEADD(HOUR, 7, GETUTCDATE()))
            );

            DELETE FROM BookingSeat
      WHERE Status = 'Reserved' AND HoldUntil < DATEADD(SECOND, -5, DATEADD(HOUR, 7, GETUTCDATE()));

            DELETE FROM Booking
            WHERE BookingID NOT IN (
                SELECT DISTINCT BookingID
                FROM BookingSeat
            )
            AND Status = 'Pending';
        `);

        if (result.recordset.length > 0) {
            console.log(`[${new Date().toISOString()}] Đã giải phóng ghế hết hạn trong transaction:`, result.recordset);
            for (const show of affectedShows.recordset) {
                broadcastSeatUpdate(show.ShowID);
                console.log(`[${new Date().toISOString()}] Gửi thông báo cập nhật ghế cho showId: ${show.ShowID}`);
            }
        }
    } catch (err) {
        console.error(`[${new Date().toISOString()}] Lỗi khi giải phóng ghế lỗi thời hạn:`, err);
        throw err;
    }
}

// Hàm giữ ghế
const holdSeats = async (req, res) => {
    console.log(`[${new Date().toISOString()}] Running updated holdSeats version - 2025-05-30`);
    const { showId, seatIds, selectedProducts } = req.body;
    const { customerID, AccountID, AccountType, AccountName } = req.user || {};

    // Kiểm tra quyền người dùng
    if (!AccountType || (!customerID && AccountType !== 'ADMIN')) {
        return res.status(401).json({ error: "Không tìm thấy thông tin người dùng hợp lệ" });
    }

    // Sử dụng AccountID cho ADMIN, customerID cho USER
    let userId = AccountType === 'ADMIN' ? AccountID : customerID;

    // Kiểm tra đầu vào
    if (!showId || isNaN(showId) || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
        return res.status(400).json({ message: "Danh sách ghế hoặc suất chiếu không hợp lệ" });
    }

    // Kiểm tra trùng lặp ghế
    const uniqueSeatIds = new Set(seatIds.map(id => parseInt(id)));
    if (uniqueSeatIds.size !== seatIds.length) {
        return res.status(400).json({ message: "Danh sách seatIds chứa ghế trùng lặp" });
    }
    // Xác nhận seatIds là số nguyên
    const validatedSeatIds = Array.from(uniqueSeatIds).filter(id => !isNaN(id));
    if (validatedSeatIds.length !== uniqueSeatIds.size) {
        return res.status(400).json({ message: "Danh sách seatIds chứa giá trị không hợp lệ" });
    }

    let pool = null;
    let transaction = null;
    try {
        console.log(`[${new Date().toISOString()}] Kết nối đến SQL Server...`);
        pool = await sql.connect(dbConfig);
        console.log(`[${new Date().toISOString()}] Đã kết nối SQL Server`);

        const serverTimeResult = await pool
            .request()
            .query(
                `SELECT 
                    DATEADD(HOUR, 7, GETUTCDATE()) AS ServerTime,
                    DATEADD(MINUTE, 5, DATEADD(HOUR, 7, GETUTCDATE())) AS HoldUntil
                `
            );
        const holdUntil = serverTimeResult.recordset[0].HoldUntil;
        const formattedExpirationTime = holdUntil.toISOString().replace("Z", "+07:00");
        console.log(
            `[${new Date().toISOString()}]`,
            "Node.js time:", new Date(),
            "SQL Server time:", serverTimeResult.recordset[0].ServerTime,
            "HoldUntil:", holdUntil,
            "Formatted expirationTime:", formattedExpirationTime
        );

        console.log(`[${new Date().toISOString()}] Khởi tạo transaction...`);
        transaction = new sql.Transaction(pool);
        await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);
        console.log(`[${new Date().toISOString()}] Đã bắt đầu transaction`);

        console.log(`[${new Date().toISOString()}] Bắt đầu giữ ghế:`, { showId, seatIds: validatedSeatIds, userId, AccountType });

        await releaseExpiredSeats(transaction);

        // Kiểm tra và tạo Customer cho ADMIN
        if (AccountType === 'ADMIN') {
            const customerCheck = await transaction
                .request()
                .input("userId", sql.Int, userId)
                .query(`SELECT CustomerID FROM Customer WHERE CustomerID = @userId OR AccountID = @userId`);
            
            if (customerCheck.recordset.length === 0) {
                console.log(`[${new Date().toISOString()}] Tạo bản ghi Customer mới cho ADMIN:`, { userId, AccountName });
                await transaction
                    .request()
                    .input("customerId", sql.Int, userId)
                    .input("email", sql.VarChar, AccountName || `admin_${userId}@example.com`)
                    
                    .input("accountId", sql.Int, userId)
                    .query(`
                        INSERT INTO Customer (CustomerID, CustomerEmail, AccountID)
                        VALUES (@customerId, @email, @accountId)
                    `);
            }
        }

        // Kiểm tra ghế có sẵn
        let query = `SELECT SeatID, Status, SeatPrice, SeatNumber 
                    FROM CinemaHallSeat WITH (UPDLOCK, ROWLOCK)
                    WHERE SeatID IN (`;
        const seatParams = validatedSeatIds.map((_, index) => `@seat${index}`);
        query += seatParams.join(",");
        query += `) AND HallID = (SELECT HallID FROM Show WHERE ShowID = @showId)`;

        const request = transaction.request();
        validatedSeatIds.forEach((id, index) => {
            request.input(`seat${index}`, sql.Int, id);
        });
        request.input("showId", sql.Int, parseInt(showId));

        console.log(`[${new Date().toISOString()}] Kiểm tra ghế có sẵn...`);
        const availableSeats = await request.query(query);
        console.log(`[${new Date().toISOString()}] Kết quả kiểm tra ghế:`, availableSeats.recordset);

        if (availableSeats.recordset.length !== validatedSeatIds.length) {
            await transaction.rollback();
            const unavailableSeats = validatedSeatIds.filter(
                (id) => !availableSeats.recordset.some((seat) => seat.SeatID === id)
            );
            console.log(`[${new Date().toISOString()}] Ghế không khả dụng:`, unavailableSeats);
            return res.status(400).json({
                message: "Một số ghế không tồn tại hoặc không thuộc suất chiếu này",
                unavailableSeats,
            });
        }

        const nonAvailableSeats = availableSeats.recordset.filter(
            (seat) => seat.Status !== "Available" && seat.Status !== null
        );
        if (nonAvailableSeats.length > 0) {
            console.log(`[${new Date().toISOString()}] Xung đột ghế:`, {
                showId,
                seatIds: nonAvailableSeats.map((seat) => seat.SeatID),
                timestamp: new Date(),
            });
            await transaction.rollback();
            return res.status(400).json({
                message: "Một số ghế đã được đặt hoặc khóa",
                unavailableSeats: nonAvailableSeats.map((seat) => seat.SeatID),
            });
        }

        // Tạo Booking
        console.log(`[${new Date().toISOString()}] Tạo Booking với CustomerID:`, userId);
        const bookingResult = await transaction
            .request()
            .input("userId", sql.Int, userId)
            .input("showId", sql.Int, parseInt(showId))
            .input("totalSeats", sql.Int, validatedSeatIds.length)
            .input("status", sql.VarChar, "Pending")
            .query(
                `INSERT INTO Booking (CustomerID, ShowID, TotalSeats, Status)
                OUTPUT INSERTED.BookingID
                VALUES (@userId, @showId, @totalSeats, @status)`
            );
        const bookingId = bookingResult.recordset[0].BookingID;
        console.log(`[${new Date().toISOString()}] Đã tạo Booking:`, bookingId);

        // Tạo BookingSeat
        const seatDetails = [];
        for (const seatId of validatedSeatIds) {
            const seat = availableSeats.recordset.find((s) => s.SeatID === seatId);
            const seatPrice = seat.SeatPrice || 75000;
            console.log(`[${new Date().toISOString()}] Tạo BookingSeat cho ghế:`, seatId);
            await transaction
                .request()
                .input("bookingId", sql.Int, bookingId)
                .input("showId", sql.Int, parseInt(showId))
                .input("seatId", sql.Int, seatId)
                .input("status", sql.VarChar, "Reserved")
                .input("ticketPrice", sql.Decimal(10, 2), seatPrice)
                .input("holdUntil", sql.DateTime, holdUntil)
                .query(
                    `INSERT INTO BookingSeat (BookingID, ShowID, SeatID, Status, TicketPrice, HoldUntil)
                    VALUES (@bookingId, @showId, @seatId, @status, @ticketPrice, @holdUntil)`
                );
            console.log(`[${new Date().toISOString()}] Đã tạo BookingSeat cho ghế:`, seatId);
            seatDetails.push({
                seatId,
                seatNumber: seat.SeatNumber || `Seat${seatId}`,
                status: "Reserved",
                price: seatPrice,
            });
        }

        // Xử lý selectedProducts (nếu có)
        if (selectedProducts && Array.isArray(selectedProducts) && selectedProducts.length > 0) {
            for (const product of selectedProducts) {
                if (!product.productId || !product.quantity || !product.price || isNaN(product.quantity) || isNaN(product.price)) {
                    await transaction.rollback();
                    console.log(`[${new Date().toISOString()}] Sản phẩm không hợp lệ:`, product);
                    return res.status(400).json({ message: "Danh sách sản phẩm không hợp lệ" });
                }
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
                console.log(`[${new Date().toISOString()}] Đã thêm sản phẩm:`, product.productId);
            }
        }

        // Cập nhật trạng thái ghế
        let updateQuery = `UPDATE CinemaHallSeat SET Status = 'Reserved' WHERE SeatID IN (`;
        updateQuery += seatParams.join(",");
        updateQuery += `)`;

        const updateRequest = transaction.request();
        validatedSeatIds.forEach((id, index) => {
            updateRequest.input(`seat${index}`, sql.Int, id);
        });

        console.log(`[${new Date().toISOString()}] Cập nhật trạng thái ghế...`);
        await updateRequest.query(updateQuery);
        console.log(`[${new Date().toISOString()}] Đã cập nhật trạng thái ghế thành Reserved:`, validatedSeatIds);

        // Gửi thông báo WebSocket
        broadcastSeatUpdate(parseInt(showId));
        console.log(`[${new Date().toISOString()}] Gửi thông báo cập nhật ghế cho showId: ${showId}`);

        // Commit transaction
        console.log(`[${new Date().toISOString()}] Commit transaction...`);
        await transaction.commit();
        console.log(`[${new Date().toISOString()}] Đã commit transaction`);

        res.json({
            bookingId,
            expirationTime: formattedExpirationTime,
            bookingStatus: "Pending",
            seats: seatDetails,
        });
    } catch (err) {
        console.error(`[${new Date().toISOString()}] Lỗi trong quá trình giữ ghế:`, err);
        if (transaction) {
            console.log(`[${new Date().toISOString()}] Rollback transaction...`);
            await transaction.rollback();
            console.log(`[${new Date().toISOString()}] Đã rollback transaction`);
        }
        return res.status(500).json({ message: "Lỗi server khi giữ ghế", error: err.message });
    } finally {
        if (pool) {
            await pool.close();
            console.log(`[${new Date().toISOString()}] Đã đóng kết nối pool`);
        }
    }
};

// API hủy đặt vé
const cancelBooking = async (req, res) => {
    const { bookingId } = req.body;
    const { customerID, AccountID, AccountType } = req.user || {};

    // Kiểm tra quyền người dùng
    if (!AccountType || (!customerID && AccountType !== 'ADMIN')) {
        return res.status(401).json({ message: "Không tìm thấy thông tin người dùng hợp lệ" });
    }

    const userId = AccountType === 'ADMIN' ? AccountID : customerID;

    if (!bookingId || isNaN(bookingId)) {
        return res.status(400).json({ message: "BookingID không hợp lệ" });
    }

    let pool = null;
    let transaction = null;
    try {
        console.log(`[${new Date().toISOString()}] Kết nối đến SQL Server...`);
        pool = await sql.connect(dbConfig);
        console.log(`[${new Date().toISOString()}] Đã kết nối SQL Server`);

        console.log(`[${new Date().toISOString()}] Khởi tạo transaction...`);
        transaction = new sql.Transaction(pool);
        await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);
        console.log(`[${new Date().toISOString()}] Đã bắt đầu transaction`);

        // Kiểm tra booking
        let bookingCheckQuery = `
            SELECT BookingID, CustomerID, Status, ShowID
            FROM Booking 
            WHERE BookingID = @bookingId
        `;
        let bookingCheckRequest = transaction
            .request()
            .input("bookingId", sql.Int, parseInt(bookingId));

        // Nếu là USER, thêm điều kiện kiểm tra CustomerID
        if (AccountType !== 'ADMIN') {
            bookingCheckQuery += ` AND CustomerID = @userId`;
            bookingCheckRequest.input("userId", sql.Int, userId);
        }

        const bookingCheck = await bookingCheckRequest.query(bookingCheckQuery);

        if (bookingCheck.recordset.length === 0) {
            await transaction.rollback();
            console.log(`[${new Date().toISOString()}] Không tìm thấy đặt vé hoặc không có quyền:`, {
                bookingId,
                userId,
                AccountType,
            });
            return res.status(403).json({ message: "Không có quyền hủy đặt vé này" });
        }

        const booking = bookingCheck.recordset[0];

    if (booking.Status === "Cancelled") {
            await transaction.rollback();
            console.log(`[${new Date().toISOString()}] Đã hủy đặt vé trước đó:`, bookingId);
            return res.status(400).json({ message: "Đặt vé đã được hủy trước đó" });
        }

    if (booking.Status === "Confirmed") {
            await transaction.rollback();
            console.log(`[${new Date().toISOString()}] Không thể hủy đặt vé đã xác nhận:`, bookingId);
            return res.status(400).json({ message: "Không thể hủy đặt vé đã xác nhận" });
        }

        await transaction
            .request()
            .input("bookingId", sql.Int, parseInt(bookingId))
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

        broadcastSeatUpdate(booking.ShowID);
        console.log(`[${new Date().toISOString()}] Gửi thông báo cập nhật ghế cho showId: ${booking.ShowID}`);

        console.log(`[${new Date().toISOString()}] Đã hủy đặt vé và giải phóng ghế:`, bookingId);
        await transaction.commit();
        console.log(`[${new Date().toISOString()}] Đã commit transaction`);
        res.json({ message: "Đã hủy đặt vé và giải phóng ghế" });
    } catch (err) {
        console.error(`[${new Date().toISOString()}] Lỗi khi hủy đặt vé:`, err);
        if (transaction) {
            console.log(`[${new Date().toISOString()}] Rollback transaction...`);
            await transaction.rollback();
            console.log(`[${new Date().toISOString()}] Đã rollback transaction`);
        }
        return res.status(500).json({ message: "Lỗi server khi hủy đặt vé", error: err.message });
    } finally {
        if (pool) {
            await pool.close();
            console.log(`[${new Date().toISOString()}] Đã đóng kết nối pool`);
        }
    }
};

module.exports = { holdSeats, cancelBooking, getSeatMapByShow, releaseExpiredSeatsCron };