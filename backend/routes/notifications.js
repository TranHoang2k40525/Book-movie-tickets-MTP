const express = require('express');
const router = express.Router();
const db = require('../config/db');
const sql = require('mssql');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/notifications', authMiddleware, async (req, res) => {
  let pool;
  try {
    const customerId = req.user.customerID;
    
    pool = await db.connectDB();
    const request = new sql.Request(pool);
    
    const result = await request
      .input('CustomerID', sql.Int, customerId)
      .query(`
        SELECT NotificationID, CustomerID, Message, DateSent, IsRead
        FROM Notification 
        WHERE CustomerID = @CustomerID 
        ORDER BY DateSent DESC
      `);
    
    res.json({ 
      success: true,
      notifications: result.recordset 
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi lấy thông báo', details: error.message });
  } finally {
    if (pool) await pool.close();
  }
});

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
        SELECT NotificationID, CustomerID, Message, DateSent, IsRead
        FROM Notification 
        WHERE NotificationID = @NotificationID AND CustomerID = @CustomerID
      `);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy thông báo' });
    }
    
    res.json({ 
      success: true,
      notification: result.recordset[0] 
    });
  } catch (error) {
    console.error('Error fetching notification details:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi lấy chi tiết thông báo', details: error.message });
  } finally {
    if (pool) await pool.close();
  }
});

router.put('/notifications/:id/read', authMiddleware, async (req, res) => {
  let pool;
  try {
    const notificationId = req.params.id;
    const customerId = req.user.customerID;
    
    pool = await db.connectDB();
    const request = new sql.Request(pool);
    
    const checkResult = await request
      .input('NotificationID', sql.Int, notificationId)
      .input('CustomerID', sql.Int, customerId)
      .query(`
        SELECT NotificationID 
        FROM Notification 
        WHERE NotificationID = @NotificationID AND CustomerID = @CustomerID
      `);
    
    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy thông báo' });
    }
    
    const updateRequest = new sql.Request(pool);
    await updateRequest
      .input('NotifID', sql.Int, notificationId)
      .query(`
        UPDATE Notification 
        SET IsRead = 1 
        WHERE NotificationID = @NotifID
      `);
    
    res.json({ 
      success: true,
      message: 'Đã đánh dấu thông báo là đã đọc' 
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi cập nhật trạng thái thông báo', details: error.message });
  } finally {
    if (pool) await pool.close();
  }
});

const createNotification = async (customerId, message, deviceInfo = null, ipAddress = null) => {
  let pool;
  try {
    pool = await db.connectDB();
    const request = new sql.Request(pool);
    
    const result = await request
      .input('CustomerID', sql.Int, customerId)
      .input('Message', sql.NVarChar(sql.MAX), message)
      .input('DateSent', sql.DateTime, new Date())
      .input('DeviceInfo', sql.NVarChar(255), deviceInfo)
      .input('IPAddress', sql.VarChar(45), ipAddress)
      .query(`
        INSERT INTO Notification (CustomerID, Message, DateSent, IsRead, DeviceInfo, IPAddress)
        VALUES (@CustomerID, @Message, @DateSent, 0, @DeviceInfo, @IPAddress)
        SELECT SCOPE_IDENTITY() AS NotificationID
      `);
      
    console.log(`Created notification for customer ${customerId}: ${message}`);
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