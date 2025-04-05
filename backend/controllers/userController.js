const sql = require('mssql');
const { dbConfig } = require('../config/db');
const { isValidEmail } = require('../utils/validators');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Khóa bí mật cho JWT và mã hóa
const JWT_SECRET = process.env.JWT_SECRET || 'your-secure-jwt-secret-key-should-be-in-env';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-encryption-key-here'; // Phải đúng 32 ký tự
const IV_LENGTH = 16; // Độ dài IV cho AES

// Hàm mã hóa dữ liệu
const encrypt = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

// Hàm giải mã dữ liệu
const decrypt = (text) => {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

// Middleware xác thực token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: "Không có token xác thực" });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    req.user = user;
    next();
  });
};

// Lấy thông tin tài khoản (có bảo mật)
const getAccount = async (req, res) => {
    const { accountID } = req.user; // Lấy từ token đã xác thực
  
    try {
      let pool = await sql.connect(dbConfig);
      let result = await pool
        .request()
        .input("accountID", sql.Int, accountID)
        .query("SELECT AccountID, Username, Email, Role, Status, CreatedAt FROM Account WHERE AccountID = @accountID");
  
      if (result.recordset.length === 0) {
        return res.status(404).json({ message: "Tài khoản không tồn tại" });
      }
  
      res.json({ account: result.recordset[0] });
    } catch (error) {
      console.error("Lỗi khi lấy thông tin tài khoản:", error);
      res.status(500).json({ message: "Lỗi server" });
    }
};

// Lấy thông tin khách hàng (có bảo mật)
const getCustomer = async (req, res) => {
    const { accountID } = req.user; // Lấy từ token đã xác thực
  
    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool
        .request()
        .input("accountID", sql.Int, accountID)
        .query(`
          SELECT CustomerID, CustomerName, CustomerPhone, CustomerEmail, 
                 CustomerDate, CustomerGender, CustomerAddress, AvatarUrl 
          FROM Customer 
          WHERE AccountID = @accountID
        `);
  
      if (result.recordset.length === 0) {
        return res.status(404).json({ message: "Khách hàng không tồn tại!" });
      }
  
      const customer = result.recordset[0];
      
      // Trả về dữ liệu đã được mã hóa dưới dạng token
      const token = jwt.sign(
        { 
          customerData: encrypt(JSON.stringify(customer)),
          timestamp: Date.now()
        }, 
        JWT_SECRET, 
        { expiresIn: '1h' }
      );
      
      res.json({ 
        message: "Lấy thông tin khách hàng thành công!", 
        token 
      });
    } catch (err) {
      console.error("Lỗi lấy thông tin khách hàng:", err);
      res.status(500).json({ message: "Lỗi server!", error: err.message });
    }
};

// Cập nhật avatar (bảo mật với payload)
const updateAvatar = async (req, res) => { 
    try {
      // Giải mã payload từ request
      const { payload, signature } = req.body;
      
      if (!payload || !signature) {
        return res.status(400).json({ message: "Thiếu thông tin xác thực" });
      }
      
      // Xác minh chữ ký
      const verify = crypto.createVerify('SHA256');
      verify.update(payload);
      const isValid = verify.verify(
        crypto.createPublicKey(process.env.PUBLIC_KEY || 'public-key-string'), 
        Buffer.from(signature, 'base64')
      );
      
      if (!isValid) {
        return res.status(403).json({ message: "Chữ ký không hợp lệ" });
      }
      
      // Giải mã payload
      const decrypted = decrypt(payload);
      const { customerID, avatarUrl } = JSON.parse(decrypted);
      
      if (!customerID || !avatarUrl) {
        return res.status(400).json({ message: "Thiếu thông tin cần thiết" });
      }
      
      // Xác thực customerID thuộc về người dùng hiện tại
      if (customerID !== req.user.customerID) {
        return res.status(403).json({ message: "Không có quyền thực hiện thao tác này" });
      }
      
      const pool = await sql.connect(dbConfig);
      await pool.request()
        .input('customerID', sql.Int, customerID)
        .input('avatarUrl', sql.VarChar(255), avatarUrl)
        .query('UPDATE [dbo].[Customer] SET AvatarUrl = @avatarUrl WHERE CustomerID = @customerID');
      
      // Tạo log hoạt động
      await pool.request()
        .input('customerID', sql.Int, customerID)
        .input('action', sql.NVarChar(100), 'UPDATE_AVATAR')
        .input('details', sql.NVarChar(255), 'Cập nhật avatar')
        .input('ipAddress', sql.VarChar(50), req.ip)
        .query(`
          INSERT INTO ActivityLog (CustomerID, Action, Details, IPAddress, Timestamp)
          VALUES (@customerID, @action, @details, @ipAddress, GETDATE())
        `);
      
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Lỗi server' });
    }
};

// Tạo payload bảo mật cho cập nhật avatar
const createSecureAvatarPayload = (req, res) => {
  try {
    const { customerID, avatarUrl } = req.body;
    
    // Xác thực người dùng
    if (customerID !== req.user.customerID) {
      return res.status(403).json({ message: "Không có quyền thực hiện thao tác này" });
    }
    
    // Tạo payload và mã hóa
    const data = { customerID, avatarUrl, timestamp: Date.now() };
    const encryptedPayload = encrypt(JSON.stringify(data));
    
    // Tạo chữ ký số
    const sign = crypto.createSign('SHA256');
    sign.update(encryptedPayload);
    const signature = sign.sign(
      process.env.PRIVATE_KEY || 'private-key-string', 
      'base64'
    );
    
    res.json({
      payload: encryptedPayload,
      signature,
      expires: Date.now() + 600000 // 10 phút
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
};

// Cập nhật thông tin khách hàng (có bảo mật)
const updateCustomer = async (req, res) => {
    // Giải mã payload từ request
    const { payload, signature } = req.body;
    
    if (!payload || !signature) {
      return res.status(400).json({ message: "Thiếu thông tin xác thực" });
    }
    
    // Xác minh chữ ký
    const verify = crypto.createVerify('SHA256');
    verify.update(payload);
    const isValid = verify.verify(
      crypto.createPublicKey(process.env.PUBLIC_KEY || 'public-key-string'), 
      Buffer.from(signature, 'base64')
    );
    
    if (!isValid) {
      return res.status(403).json({ message: "Chữ ký không hợp lệ" });
    }
    
    // Giải mã payload
    const decrypted = decrypt(payload);
    const { 
      accountID, 
      customerName, 
      customerPhone, 
      customerEmail, 
      customerDate, 
      customerGender, 
      customerAddress,
      timestamp
    } = JSON.parse(decrypted);
    
    // Kiểm tra thời gian hết hạn (10 phút)
    if (Date.now() - timestamp > 600000) {
      return res.status(400).json({ message: "Payload đã hết hạn" });
    }

    if (!accountID || !customerName || !customerPhone || !customerEmail) {
        return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin bắt buộc!' });
    }

    // Xác thực accountID thuộc về người dùng hiện tại
    if (accountID !== req.user.accountID) {
        return res.status(403).json({ message: "Không có quyền thực hiện thao tác này" });
    }

    if (!isValidEmail(customerEmail)) {
        return res.status(400).json({ message: 'Email không hợp lệ!' });
    }

    try {
        const pool = await sql.connect(dbConfig);

        const result = await pool.request()
            .input('accountID', sql.Int, accountID)
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

        // Ghi log hoạt động
        await pool.request()
            .input('accountID', sql.Int, accountID)
            .input('action', sql.NVarChar(100), 'UPDATE_CUSTOMER')
            .input('details', sql.NVarChar(255), 'Cập nhật thông tin khách hàng')
            .input('ipAddress', sql.VarChar(50), req.ip)
            .query(`
                INSERT INTO ActivityLog (AccountID, Action, Details, IPAddress, Timestamp)
                VALUES (@accountID, @action, @details, @ipAddress, GETDATE())
            `);

        res.json({ message: 'Cập nhật thông tin thành công!' });
    } catch (err) {
        console.error('Lỗi cập nhật thông tin:', err);
        res.status(500).json({ message: 'Lỗi server!', error: err.message });
    }
};

// Tạo payload bảo mật cho cập nhật thông tin
const createSecureCustomerPayload = (req, res) => {
  try {
    const { 
      accountID, 
      customerName, 
      customerPhone, 
      customerEmail, 
      customerDate, 
      customerGender, 
      customerAddress 
    } = req.body;
    
    // Xác thực người dùng
    if (accountID !== req.user.accountID) {
      return res.status(403).json({ message: "Không có quyền thực hiện thao tác này" });
    }
    
    // Tạo payload và mã hóa
    const data = { 
      accountID, 
      customerName, 
      customerPhone, 
      customerEmail, 
      customerDate, 
      customerGender, 
      customerAddress,
      timestamp: Date.now()
    };
    
    const encryptedPayload = encrypt(JSON.stringify(data));
    
    // Tạo chữ ký số
    const sign = crypto.createSign('SHA256');
    sign.update(encryptedPayload);
    const signature = sign.sign(
      process.env.PRIVATE_KEY || 'private-key-string', 
      'base64'
    );
    
    res.json({
      payload: encryptedPayload,
      signature,
      expires: Date.now() + 600000 // 10 phút
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
};

// Xóa tài khoản (có bảo mật)
const deleteAccount = async (req, res) => {
    const { accountID } = req.user; // Lấy từ token đã xác thực

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

        // Ghi log hoạt động vào bảng riêng biệt để lưu trữ lịch sử xóa tài khoản
        await pool.request()
            .input('accountID', sql.Int, accountID)
            .input('action', sql.NVarChar(100), 'DELETE_ACCOUNT')
            .input('details', sql.NVarChar(255), 'Xóa tài khoản')
            .input('ipAddress', sql.VarChar(50), req.ip)
            .query(`
                INSERT INTO DeletedAccountLog (AccountID, Action, Details, IPAddress, Timestamp)
                VALUES (@accountID, @action, @details, @ipAddress, GETDATE())
            `);

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
    createSecureAvatarPayload,
    updateCustomer,
    createSecureCustomerPayload,
    deleteAccount,
    authenticateToken
};