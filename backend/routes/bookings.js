const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');
const db = require('../config/db');
const authenticateToken = require('../middleware/authMiddleware');
const { createNotification } = require('./notifications');

// Lấy tất cả ghế và trạng thái của một suất chiếu 
router.get('/shows/:showId/seats', bookingController.getShowSeats);

// Khóa ghế và tạo đặt chỗ tạm thời
router.post('/shows/:showId/hold-seats', authMiddleware, bookingController.holdSeats);

// Xác nhận đặt vé sau khi thanh toán
router.post('/:bookingId/confirm', authMiddleware, bookingController.confirmBooking);

// Lấy thông tin trạng thái đặt vé
router.get('/:bookingId', authMiddleware, bookingController.getBookingStatus);

// Hủy đặt vé
router.delete('/:bookingId', authMiddleware, bookingController.cancelBooking);

// Kiểm tra ghế có còn trống không
router.post('/shows/:showId/check-availability', bookingController.checkSeatsAvailability);

// Gia hạn thời gian giữ ghế
router.put('/:bookingId/extend', authMiddleware, bookingController.extendSeatHold);

// Lấy danh sách vé của người dùng
router.get('/bookings', authMiddleware, async (req, res) => {
  try {
    const customerId = req.user.customerId;
    
    const query = `
      SELECT b.BookingID, b.CustomerID, b.ShowID, b.TotalSeats, b.Status,
             s.ShowDate, s.StartTime,
             m.MovieID, m.MovieTitle, m.MovieDescription, m.MovieRuntime, m.MovieImageUrl,
             c.CinemaID, c.CinemaName, c.Address as CinemaAddress,
             r.RoomID, r.RoomName,
             GROUP_CONCAT(bs.SeatID) as SeatIDs,
             GROUP_CONCAT(st.SeatNumber) as SeatNumbers,
             t.Price as TicketPrice,
             cu.CustomerName
      FROM Booking b
      JOIN Show s ON b.ShowID = s.ShowID
      JOIN Movie m ON s.MovieID = m.MovieID
      JOIN Cinema c ON s.CinemaID = c.CinemaID
      JOIN Room r ON s.RoomID = r.RoomID
      JOIN BookingSeat bs ON b.BookingID = bs.BookingID
      JOIN Seat st ON bs.SeatID = st.SeatID
      JOIN Customer cu ON b.CustomerID = cu.CustomerID
      JOIN Ticket t ON s.ShowID = t.ShowID
      WHERE b.CustomerID = ?
      GROUP BY b.BookingID
      ORDER BY s.ShowDate DESC, s.StartTime DESC
    `;
    
    const [bookings] = await db.execute(query, [customerId]);
    
    // Chuyển đổi dữ liệu
    const processedBookings = bookings.map(booking => {
      // Tạo DateTime từ ShowDate và StartTime
      const showDate = new Date(booking.ShowDate);
      const [hours, minutes, seconds] = booking.StartTime.split(':');
      showDate.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds));
      
      return {
        ...booking,
        MovieDateTime: showDate,
        // Chuyển ImageUrl thành dạng URL nếu cần
        MovieImageUrl: booking.MovieImageUrl 
          ? `http://192.168.1.108:3000/assets/images/${booking.MovieImageUrl}` 
          : null
      };
    });
    
    res.json({ bookings: processedBookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy danh sách vé' });
  }
});

// Lấy chi tiết một vé
router.get('/bookings/:id', authMiddleware, async (req, res) => {
  try {
    const bookingId = req.params.id;
    const customerId = req.user.customerId;
    
    const query = `
      SELECT b.BookingID, b.CustomerID, b.ShowID, b.TotalSeats, b.Status,
             s.ShowDate, s.StartTime,
             m.MovieID, m.MovieTitle, m.MovieDescription, m.MovieRuntime, m.MovieImageUrl,
             c.CinemaID, c.CinemaName, c.Address as CinemaAddress,
             r.RoomID, r.RoomName,
             GROUP_CONCAT(bs.SeatID) as SeatIDs,
             GROUP_CONCAT(st.SeatNumber) as SeatNumbers,
             t.Price as TicketPrice,
             cu.CustomerName
      FROM Booking b
      JOIN Show s ON b.ShowID = s.ShowID
      JOIN Movie m ON s.MovieID = m.MovieID
      JOIN Cinema c ON s.CinemaID = c.CinemaID
      JOIN Room r ON s.RoomID = r.RoomID
      JOIN BookingSeat bs ON b.BookingID = bs.BookingID
      JOIN Seat st ON bs.SeatID = st.SeatID
      JOIN Customer cu ON b.CustomerID = cu.CustomerID
      JOIN Ticket t ON s.ShowID = t.ShowID
      WHERE b.BookingID = ? AND b.CustomerID = ?
      GROUP BY b.BookingID
    `;
    
    const [bookings] = await db.execute(query, [bookingId, customerId]);
    
    if (bookings.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy vé' });
    }
    
    // Chuyển đổi dữ liệu
    const booking = bookings[0];
    const showDate = new Date(booking.ShowDate);
    const [hours, minutes, seconds] = booking.StartTime.split(':');
    showDate.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds));
    
    const processedBooking = {
      ...booking,
      MovieDateTime: showDate,
      // Chuyển ImageUrl thành dạng URL nếu cần
      MovieImageUrl: booking.MovieImageUrl 
        ? `http://192.168.1.108:3000/assets/images/${booking.MovieImageUrl}` 
        : null
    };
    
    res.json({ booking: processedBooking });
  } catch (error) {
    console.error('Error fetching booking details:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy chi tiết vé' });
  }
});

// Kiểm tra vé sắp hết hạn và gửi thông báo
router.get('/bookings/check-expiration', authMiddleware, async (req, res) => {
  try {
    const customerId = req.user.customerId;
    
    // Lấy các vé sắp hết hạn (1 ngày)
    const query = `
      SELECT b.BookingID, m.MovieTitle, s.ShowDate, s.StartTime
      FROM Booking b
      JOIN Show s ON b.ShowID = s.ShowID
      JOIN Movie m ON s.MovieID = m.MovieID
      WHERE b.CustomerID = ? AND b.Status = 'Confirmed'
      AND DATEDIFF(s.ShowDate, CURDATE()) = 1
    `;
    
    const [expiringBookings] = await db.execute(query, [customerId]);
    
    // Gửi thông báo cho mỗi vé sắp hết hạn
    const notifications = [];
    for (const booking of expiringBookings) {
      const message = `Vé của bạn sắp hết hạn, xin vui lòng bạn đến xem và trải nghiệm bộ phim ${booking.MovieTitle} để có những giây phút đáng nhớ, không để quá hạn`;
      
      // Kiểm tra xem đã gửi thông báo cho vé này chưa (để tránh gửi trùng lặp)
      const checkQuery = `
        SELECT NotificationID FROM Notification
        WHERE CustomerID = ? AND Message LIKE ? AND DATEDIFF(NOW(), DateSent) <= 1
      `;
      
      const [existingNotifications] = await db.execute(
        checkQuery, 
        [customerId, `%${booking.MovieTitle}%`]
      );
      
      if (existingNotifications.length === 0) {
        const notificationId = await createNotification(customerId, message);
        notifications.push({ bookingId: booking.BookingID, notificationId });
      }
    }
    
    res.json({ 
      message: 'Kiểm tra vé sắp hết hạn thành công', 
      expiringBookings: expiringBookings.length,
      notificationsSent: notifications.length,
      notifications 
    });
  } catch (error) {
    console.error('Error checking expired bookings:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi kiểm tra vé sắp hết hạn' });
  }
});

module.exports = router; 