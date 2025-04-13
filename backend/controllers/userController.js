const sql = require('mssql');
const { dbConfig } = require('../config/db');
const { isValidEmail } = require('../utils/validators');

// Lấy thông tin tài khoản
const getAccount = async (req, res) => {
    const { accountID } = req.body;
  
    try {
      let pool = await sql.connect(dbConfig);
      let result = await pool
        .request()
        .input("accountID", sql.Int, accountID)
        .query("SELECT * FROM Account WHERE AccountID = @accountID");
  
      if (result.recordset.length === 0) {
        return res.status(404).json({ message: "Tài khoản không tồn tại" });
      }
  
      res.json({ account: result.recordset[0] });
    } catch (error) {
      console.error("Lỗi khi lấy thông tin tài khoản:", error);
      res.status(500).json({ message: "Lỗi server" });
    }
};

// Lấy thông tin khách hàng
const getCustomer = async (req, res) => {
    const { accountID } = req.body;
  
    if (!accountID) {
      return res.status(400).json({ message: "Vui lòng cung cấp AccountID!" });
    }
  
    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool
        .request()
        .input("accountID", sql.Int, accountID)
        .query("SELECT * FROM Customer WHERE AccountID = @accountID");
  
      if (result.recordset.length === 0) {
        return res.status(404).json({ message: "Khách hàng không tồn tại!" });
      }
  
      const customer = result.recordset[0];
      res.json({ message: "Lấy thông tin khách hàng thành công!", customer });
    } catch (err) {
      console.error("Lỗi lấy thông tin khách hàng:", err);
      res.status(500).json({ message: "Lỗi server!", error: err.message });
    }
};

// Cập nhật avatar
const updateAvatar = async (req, res) => { 
    try {
      const { customerID, avatarUrl } = req.body;
      
      const pool = await sql.connect(dbConfig);
      await pool.request()
        .input('customerID', sql.Int, customerID)
        .input('avatarUrl', sql.VarChar(255), avatarUrl)
        .query('UPDATE [dbo].[Customer] SET AvatarUrl = @avatarUrl WHERE CustomerID = @customerID');
      
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Database error' });
    }
};

// Cập nhật thông tin khách hàng
const updateCustomer = async (req, res) => {
    const { accountID, customerName, customerPhone, customerEmail, customerDate, customerGender, customerAddress } = req.body;

    if (!accountID || !customerName || !customerPhone || !customerEmail) {
        return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin bắt buộc!' });
    }

    if (!isValidEmail(customerEmail)) {
        return res.status(400).json({ message: 'Email không hợp lệ!' });
    }

    try {
        const pool = await sql.connect(dbConfig);

        const result = await pool.request().input('accountID', sql.Int, accountID)
        .input('CustomerName', sql.NVarChar, customerName)
        .input('CustomerPhone', sql.VarChar, customerPhone)
        .input('CustomerEmail', sql.VarChar, customerEmail)
        .input('CustomerDate', sql.Date, customerDate || null)
        .input('CustomerGender', sql.VarChar, customerGender || null)
        .input('CustomerAddress', sql.NVarChar, customerAddress || null)
        .query(`
            UPDATE Customer 
            SET CustomerName = @CustomerName, 
                CustomerPhone = @CustomerPhone, 
                CustomerEmail = @CustomerEmail, 
                CustomerDate = @CustomerDate, 
                CustomerGender = @CustomerGender, 
                CustomerAddress = @CustomerAddress 
            WHERE AccountID = @accountID
        `);

    if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ message: 'Khách hàng không tồn tại!' });
    }

    res.json({ message: 'Cập nhật thông tin thành công!' });
} catch (err) {
    console.error('Lỗi cập nhật thông tin:', err);
    res.status(500).json({ message: 'Lỗi server!', error: err.message });
}
};

// Xóa tài khoản
const deleteAccount = async (req, res) => {
const { accountID } = req.body;

if (!accountID) {
    return res.status(400).json({ message: 'Vui lòng cung cấp AccountID!' });
}

try {
    const pool = await sql.connect(dbConfig);

    // Xóa thông tin trong bảng Customer trước
    await pool.request()
        .input('accountID', sql.Int, accountID)
        .query('DELETE FROM Customer WHERE AccountID = @accountID');

    // Sau đó xóa trong bảng Account
    const result = await pool.request()
        .input('accountID', sql.Int, accountID)
        .query('DELETE FROM Account WHERE AccountID = @accountID');

    if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ message: 'Tài khoản không tồn tại!' });
    }

    res.json({ message: 'Xóa tài khoản thành công!' });
} catch (err) {
    console.error('Lỗi xóa tài khoản:', err);
    res.status(500).json({ message: 'Lỗi server!', error: err.message });
}
};

module.exports = {
getAccount,
getCustomer,
updateAvatar,
updateCustomer,
deleteAccount
};
