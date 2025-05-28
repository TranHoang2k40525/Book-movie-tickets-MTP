const sql = require("mssql");
const { dbConfig } = require("../config/db");

const getRevenue = async (req, res) => {
    if (req.user.AccountType !== "ADMIN") {
        return res.status(403).json({ message: "Chỉ admin mới có quyền xem thống kê!" });
    }

    try {
        const pool = await sql.connect(dbConfig);
        // Thống kê doanh thu theo tháng
        const monthlyRevenue = await pool.request().query(`
            SELECT 
                FORMAT(p.PaymentDate, 'yyyy-MM') as Month,
                SUM(p.Amount) as TotalRevenue,
                COUNT(DISTINCT b.BookingID) as BookingCount
            FROM Payment p
            JOIN Booking b ON p.BookingID = b.BookingID
            WHERE b.Status = 'Confirmed'
            GROUP BY FORMAT(p.PaymentDate, 'yyyy-MM')
            ORDER BY Month DESC
        `);

        // Thống kê doanh thu theo thể loại phim
        const genreRevenue = await pool.request().query(`
            SELECT 
                m.MovieGenre,
                SUM(p.Amount) as TotalRevenue,
                COUNT(DISTINCT b.BookingID) as BookingCount
            FROM Payment p
            JOIN Booking b ON p.BookingID = b.BookingID
            JOIN Show s ON b.ShowID = s.ShowID
            JOIN Movie m ON s.MovieID = m.MovieID
            WHERE b.Status = 'Confirmed'
            GROUP BY m.MovieGenre
        `);

        // Thống kê chi tiết theo rạp
        const cinemaStats = await pool.request().query(`
            SELECT 
                c.CinemaID,
                COALESCE(c.CinemaName, 'Không xác định') as CinemaName,
                COUNT(DISTINCT b.BookingID) as BookingCount,
                COUNT(DISTINCT bs.BookingSeatID) as TicketCount,
                SUM(bs.TicketPrice) as TicketRevenue,
                ISNULL(SUM(bp.TotalPriceBookingProduct), 0) as ComboRevenue,
                SUM(bs.TicketPrice) + ISNULL(SUM(bp.TotalPriceBookingProduct), 0) as TotalRevenue,
                COUNT(DISTINCT s.ShowID) as ShowCount,
                COUNT(DISTINCT m.MovieID) as MovieCount
            FROM Cinema c
            LEFT JOIN CinemaHall ch ON c.CinemaID = ch.CinemaID
            LEFT JOIN Show s ON ch.HallID = s.HallID
            LEFT JOIN Movie m ON s.MovieID = m.MovieID
            LEFT JOIN Booking b ON s.ShowID = b.ShowID
            LEFT JOIN BookingSeat bs ON b.BookingID = bs.BookingID
            LEFT JOIN Payment p ON b.BookingID = p.BookingID
            LEFT JOIN BookingProduct bp ON b.BookingID = bp.BookingID
            WHERE b.Status = 'Confirmed'
            AND CONVERT(date, p.PaymentDate) BETWEEN DATEADD(month, -1, GETDATE()) AND GETDATE()
            GROUP BY c.CinemaID, c.CinemaName
            ORDER BY TotalRevenue DESC
        `);

        res.json({
            monthlyRevenue: monthlyRevenue.recordset,
            genreRevenue: genreRevenue.recordset,
            cinemaStats: cinemaStats.recordset
        });
    } catch (err) {
        console.error("Lỗi khi lấy thống kê doanh thu:", err);
        res.status(500).json({ message: "Lỗi server!", error: err.message });
    }
};

const getBookingStats = async (req, res) => {
    if (req.user.AccountType !== "ADMIN") {
        return res.status(403).json({ message: "Chỉ admin mới có quyền xem thống kê!" });
    }

    try {
        const pool = await sql.connect(dbConfig);
        // Thống kê đặt vé theo phim
        const movieStats = await pool.request().query(`
            SELECT 
                m.MovieID,
                m.MovieTitle,
                COUNT(DISTINCT b.BookingID) as BookingCount,
                SUM(b.TotalSeats) as TotalSeats,
                SUM(p.Amount) as TotalRevenue
            FROM Movie m
            JOIN Show s ON m.MovieID = s.MovieID
            JOIN Booking b ON s.ShowID = b.ShowID
            JOIN Payment p ON b.BookingID = p.BookingID
            WHERE b.Status = 'Confirmed'
            GROUP BY m.MovieID, m.MovieTitle
            ORDER BY BookingCount DESC
        `);

        // Thống kê theo rạp chiếu
        const cinemaStats = await pool.request().query(`
            SELECT 
                c.CinemaID,
                c.CinemaName,
                COUNT(DISTINCT b.BookingID) as BookingCount,
                SUM(p.Amount) as TotalRevenue
            FROM Cinema c
            JOIN CinemaHall ch ON c.CinemaID = ch.CinemaID
            JOIN Show s ON ch.HallID = s.HallID
            JOIN Booking b ON s.ShowID = b.ShowID
            JOIN Payment p ON b.BookingID = p.BookingID
            WHERE b.Status = 'Confirmed'
            GROUP BY c.CinemaID, c.CinemaName
        `);

        res.json({
            movieStats: movieStats.recordset,
            cinemaStats: cinemaStats.recordset
        });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server!", error: err.message });
    }
};

const getUserStats = async (req, res) => {
    if (req.user.AccountType !== "ADMIN") {
        return res.status(403).json({ message: "Chỉ admin mới có quyền xem thống kê!" });
    }

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query(`
            SELECT 
                COUNT(DISTINCT a.AccountID) as TotalUsers,
                SUM(CASE WHEN a.AccountType = 'USER' THEN 1 ELSE 0 END) as RegularUsers,
                SUM(CASE WHEN a.AccountType = 'ADMIN' THEN 1 ELSE 0 END) as AdminUsers,
                SUM(CASE WHEN a.IsActive = 1 THEN 1 ELSE 0 END) as ActiveUsers,
                SUM(CASE WHEN a.IsActive = 0 THEN 1 ELSE 0 END) as InactiveUsers,
                COUNT(DISTINCT b.CustomerID) as BookingUsers
            FROM Account a
            LEFT JOIN Customer c ON a.AccountID = c.AccountID
            LEFT JOIN Booking b ON c.CustomerID = b.CustomerID AND b.Status = 'Confirmed'
        `);
        
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ message: "Lỗi server!", error: err.message });
    }
};

// Lấy thống kê tổng quan cho dashboard
const getDashboardStats = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        
        // Lấy các thống kê cơ bản
        const result = await pool.request().query(`
            SELECT 
                (SELECT COUNT(*) FROM Cinema) as totalCinemas,
                (SELECT COUNT(*) FROM Movie) as totalMovies,
                (
                    SELECT ISNULL(SUM(bs.TicketPrice), 0)
                    FROM BookingSeat bs
                    JOIN Booking b ON bs.BookingID = b.BookingID
                    JOIN Payment p ON b.BookingID = p.BookingID
                    WHERE CONVERT(date, p.PaymentDate) = CONVERT(date, GETDATE())
                    AND b.Status = 'Confirmed'
                ) as todayRevenue,
                (
                    SELECT COUNT(*)
                    FROM BookingSeat bs
                    JOIN Booking b ON bs.BookingID = b.BookingID
                    JOIN Payment p ON b.BookingID = p.BookingID
                    WHERE CONVERT(date, p.PaymentDate) = CONVERT(date, GETDATE())
                    AND b.Status = 'Confirmed'
                ) as todayTickets
        `);

        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi khi lấy thống kê dashboard:', err);
        res.status(500).json({ message: 'Lỗi server!', error: err.message });
    }
};

// Lấy thống kê doanh thu
const getRevenueStats = async (req, res) => {
    const { startDate, endDate } = req.query;
    try {
        const pool = await sql.connect(dbConfig);
        
        // Lấy doanh thu theo ngày
        const revenueResult = await pool.request()
            .input('startDate', sql.Date, startDate)
            .input('endDate', sql.Date, endDate)
            .query(`
                SELECT 
                    CONVERT(date, p.PaymentDate) as bookingDate,
                    SUM(bs.TicketPrice) as revenue
                FROM Payment p
                JOIN Booking b ON p.BookingID = b.BookingID
                JOIN BookingSeat bs ON b.BookingID = bs.BookingID
                WHERE b.Status = 'Confirmed'
                AND CONVERT(date, p.PaymentDate) BETWEEN @startDate AND @endDate
                GROUP BY CONVERT(date, p.PaymentDate)
                ORDER BY bookingDate
            `);

        // Lấy thống kê theo rạp
        const cinemaStatsResult = await pool.request()
            .input('startDate', sql.Date, startDate)
            .input('endDate', sql.Date, endDate)
            .query(`
                SELECT 
                    c.CinemaName,
                    COUNT(bs.SeatID) as totalTickets,
                    SUM(bs.TicketPrice) as ticketRevenue,
                    ISNULL(SUM(bp.TotalPriceBookingProduct), 0) as comboRevenue,
                    SUM(bs.TicketPrice) + ISNULL(SUM(bp.TotalPriceBookingProduct), 0) as totalRevenue
                FROM Cinema c
                JOIN CinemaHall ch ON c.CinemaID = ch.CinemaID
                JOIN Show s ON ch.HallID = s.HallID
                JOIN BookingSeat bs ON s.ShowID = bs.ShowID
                JOIN Booking b ON bs.BookingID = b.BookingID
                JOIN Payment p ON b.BookingID = p.BookingID
                LEFT JOIN BookingProduct bp ON b.BookingID = bp.BookingID
                WHERE b.Status = 'Confirmed'
                AND CONVERT(date, p.PaymentDate) BETWEEN @startDate AND @endDate
                GROUP BY c.CinemaName
                ORDER BY totalRevenue DESC
            `);

        // Lấy số khách hàng mới
        const newCustomersResult = await pool.request()
            .input('startDate', sql.Date, startDate)
            .input('endDate', sql.Date, endDate)
            .query(`
                SELECT COUNT(*) as newCustomers
                FROM Customer
                WHERE CONVERT(date, CustomerDate) BETWEEN @startDate AND @endDate
            `);

        const revenues = revenueResult.recordset.map(r => r.revenue);
        const dates = revenueResult.recordset.map(r => r.bookingDate.toISOString().split('T')[0]);

        res.json({
            dates,
            revenues,
            totalRevenue: revenues.reduce((a, b) => a + b, 0),
            cinemaStats: cinemaStatsResult.recordset,
            newCustomers: newCustomersResult.recordset[0].newCustomers
        });
    } catch (err) {
        console.error('Lỗi khi lấy thống kê doanh thu:', err);
        res.status(500).json({ message: 'Lỗi server!', error: err.message });
    }
};

// Lấy thống kê vé bán
const getTicketStats = async (req, res) => {
    const { startDate, endDate } = req.query;
    try {
        const pool = await sql.connect(dbConfig);
        
        // Lấy số vé bán theo ngày
        const result = await pool.request()
            .input('startDate', sql.Date, startDate)
            .input('endDate', sql.Date, endDate)
            .query(`
                SELECT 
                    CONVERT(date, p.PaymentDate) as bookingDate,
                    COUNT(*) as ticketCount
                FROM Payment p
                JOIN Booking b ON p.BookingID = b.BookingID
                JOIN BookingSeat bs ON b.BookingID = bs.BookingID
                WHERE b.Status = 'Confirmed'
                AND CONVERT(date, p.PaymentDate) BETWEEN @startDate AND @endDate
                GROUP BY CONVERT(date, p.PaymentDate)
                ORDER BY bookingDate
            `);

        const tickets = result.recordset.map(r => r.ticketCount);
        const dates = result.recordset.map(r => r.bookingDate.toISOString().split('T')[0]);
        const totalTickets = tickets.reduce((a, b) => a + b, 0);

        res.json({
            dates,
            tickets,
            totalTickets
        });
    } catch (err) {
        console.error('Lỗi khi lấy thống kê vé:', err);
        res.status(500).json({ message: 'Lỗi server!', error: err.message });
    }
};

// Lấy thống kê doanh thu chi tiết
const getRevenueStatistics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Vui lòng cung cấp startDate và endDate' });
        }

        const pool = await sql.connect(dbConfig);
        
        // Thống kê doanh thu từ vé
        const ticketRevenue = await pool.request()
            .input('startDate', sql.Date, startDate)
            .input('endDate', sql.Date, endDate)
            .query(`
                SELECT 
                    FORMAT(p.PaymentDate, 'yyyy-MM-dd') as Date,
                    COUNT(DISTINCT b.BookingID) as TotalBookings,
                    SUM(bs.TicketPrice) as TicketRevenue,
                    COUNT(bs.BookingSeatID) as TicketsSold
                FROM Payment p
                JOIN Booking b ON p.BookingID = b.BookingID
                JOIN BookingSeat bs ON b.BookingID = bs.BookingID
                WHERE CONVERT(date, p.PaymentDate) BETWEEN @startDate AND @endDate
                AND b.Status = 'Confirmed'
                GROUP BY FORMAT(p.PaymentDate, 'yyyy-MM-dd')
                ORDER BY Date
            `);

        // Thống kê doanh thu từ sản phẩm
        const productRevenue = await pool.request()
            .input('startDate', sql.Date, startDate)
            .input('endDate', sql.Date, endDate)
            .query(`
                SELECT 
                    FORMAT(p.PaymentDate, 'yyyy-MM-dd') as Date,
                    SUM(bp.TotalPriceBookingProduct) as ProductRevenue,
                    SUM(bp.Quantity) as ProductQuantity
                FROM Payment p
                JOIN Booking b ON p.BookingID = b.BookingID
                JOIN BookingProduct bp ON b.BookingID = bp.BookingID
                WHERE CONVERT(date, p.PaymentDate) BETWEEN @startDate AND @endDate
                AND b.Status = 'Confirmed'
                GROUP BY FORMAT(p.PaymentDate, 'yyyy-MM-dd')
                ORDER BY Date
            `);

        // Tổng hợp dữ liệu
        const revenueData = new Map();
        
        ticketRevenue.recordset.forEach(record => {
            revenueData.set(record.Date, {
                date: record.Date,
                ticketRevenue: record.TicketRevenue || 0,
                ticketsSold: record.TicketsSold || 0,
                totalBookings: record.TotalBookings || 0,
                productRevenue: 0,
                productQuantity: 0
            });
        });

        productRevenue.recordset.forEach(record => {
            if (revenueData.has(record.Date)) {
                const existing = revenueData.get(record.Date);
                existing.productRevenue = record.ProductRevenue || 0;
                existing.productQuantity = record.ProductQuantity || 0;
            } else {
                revenueData.set(record.Date, {
                    date: record.Date,
                    ticketRevenue: 0,
                    ticketsSold: 0,
                    totalBookings: 0,
                    productRevenue: record.ProductRevenue || 0,
                    productQuantity: record.ProductQuantity || 0
                });
            }
        });

        const result = Array.from(revenueData.values())
            .sort((a, b) => a.date.localeCompare(b.date))
            .map(item => ({
                ...item,
                totalRevenue: (item.ticketRevenue || 0) + (item.productRevenue || 0)
            }));

        res.json(result);
    } catch (err) {
        console.error('Lỗi khi lấy thống kê doanh thu:', err);
        res.status(500).json({ message: 'Lỗi server!', error: err.message });
    }
};

module.exports = {
    getRevenue,
    getBookingStats,
    getUserStats,
    getDashboardStats,
    getRevenueStats,
    getTicketStats,
    getRevenueStatistics
};