const express = require('express');
const router = express.Router();
const db = require('../config/db');
const sql = require('mssql');
const authMiddleware = require('../middleware/authMiddleware');

// Lấy danh sách thông báo của người dùng
router.get('/notifications', authMiddleware, async (req, res) => {
  let pool;
  try {
    const customerId = req.user.customerID;
    
    pool = await db.connectDB();
    const request = new sql.Request(pool);
    
    const result = await request
      .input('CustomerID', sql.Int, customerId)
      .query(`
        SELECT * FROM Notification 
        WHERE CustomerID = @CustomerID 
        ORDER BY DateSent DESC
      `);
    
    res.json({ notifications: result.recordset });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy thông báo' });
  } finally {
    if (pool) await pool.close();
  }
});

// Lấy chi tiết một thông báo
router.get('/notifications/:id', authMiddleware, async (req, res) => {
  let pool;
  try {
    const notificationId = req.params.id;
    const customerId = req.user.customerID;
    
    pool = await db.connectDB();
    const request = new sql.Request(pool);
    
    const result = await request
      .input('NotificationID', sql.Int, notificationId)
      .input('CustomerID', sql.Int, customerId)
      .query(`
        SELECT * FROM Notification 
        WHERE NotificationID = @NotificationID AND CustomerID = @CustomerID
      `);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy thông báo' });
    }
    
    res.json({ notification: result.recordset[0] });
  } catch (error) {
    console.error('Error fetching notification details:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy chi tiết thông báo' });
  } finally {
    if (pool) await pool.close();
  }
});

// Đánh dấu thông báo đã đọc
router.put('/notifications/:id/read', authMiddleware, async (req, res) => {
  let pool;
  try {
    const notificationId = req.params.id;
    const customerId = req.user.customerID;
    
    pool = await db.connectDB();
    const request = new sql.Request(pool);
    
    // Kiểm tra thông báo có thuộc về người dùng không
    const checkResult = await request
      .input('NotificationID', sql.Int, notificationId)
      .input('CustomerID', sql.Int, customerId)
      .query(`
        SELECT NotificationID FROM Notification 
        WHERE NotificationID = @NotificationID AND CustomerID = @CustomerID
      `);
    
    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy thông báo' });
    }
    
    // Cập nhật trạng thái đã đọc - sử dụng request mới để tránh trùng tham số
    const updateRequest = new sql.Request(pool);
    await updateRequest
      .input('NotifID', sql.Int, notificationId)
      .query(`
        UPDATE Notification 
        SET IsRead = 1 
        WHERE NotificationID = @NotifID
      `);
    
    res.json({ message: 'Đã đánh dấu thông báo là đã đọc' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi cập nhật trạng thái thông báo' });
  } finally {
    if (pool) await pool.close();
  }
});

// Tạo thông báo mới (sử dụng trong hệ thống)
const createNotification = async (customerId, message) => {
  let pool;
  try {
    pool = await db.connectDB();
    const request = new sql.Request(pool);
    
    const result = await request
      .input('CustomerID', sql.Int, customerId)
      .input('Message', sql.NVarChar(sql.MAX), message)
      .input('DateSent', sql.DateTime, new Date())
      .query(`
        INSERT INTO Notification (CustomerID, Message, DateSent, IsRead)
        VALUES (@CustomerID, @Message, @DateSent, 0)
        SELECT SCOPE_IDENTITY() AS NotificationID
      `);
      
    return result.recordset[0].NotificationID;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  } finally {
    if (pool) await pool.close();
  }
};

module.exports = router;
module.exports.createNotification = createNotification; 