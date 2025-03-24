const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;
const host = '0.0.0.0'; // Chấp nhận kết nối từ mọi IP

app.use(cors());
app.use(bodyParser.json());

// Lưu trữ OTP tạm thời với thời gian hết hạn
const otpStorage = new Map(); // Sử dụng Map để quản lý OTP

// Cấu hình kết nối SQL Server
const dbConfig = {
    user: 'sa',
    password: '123456789',
    server: 'localhost',
    database: 'MTB 67CS1',
    port: 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
};

// Hàm kiểm tra định dạng email
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Route mặc định
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Movie Ticket Booking API!' });
});

// API đăng nhập
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Vui lòng cung cấp email và mật khẩu!' });
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({ message: 'Email không hợp lệ!' });
    }

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT * FROM Account WHERE AccountName = @email');

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Tài khoản không tồn tại!' });
        }

        const account = result.recordset[0];
        if (password !== account.AccountPassword) {
            return res.status(401).json({ message: 'Mật khẩu không đúng!' });
        }

        res.json({ message: 'Đăng nhập thành công!', user: account });
    } catch (err) {
        console.error('Lỗi đăng nhập:', err);
        res.status(500).json({ message: 'Lỗi server!', error: err.message });
    }
});

// API đăng ký
app.post('/api/register', async (req, res) => {
    const { customerName, customerEmail, customerPhone, password, customerGender, customerDate, customerAddress } = req.body;

    if (!customerName || !customerEmail || !customerPhone || !password) {
        return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin bắt buộc!' });
    }

    if (!isValidEmail(customerEmail)) {
        return res.status(400).json({ message: 'Email không hợp lệ!' });
    }

    try {
        const pool = await sql.connect(dbConfig);

        // Kiểm tra email đã tồn tại
        const checkEmail = await pool.request()
            .input('email', sql.VarChar, customerEmail)
            .query('SELECT * FROM Account WHERE AccountName = @email');
        if (checkEmail.recordset.length > 0) {
            return res.status(400).json({ message: 'Email đã được sử dụng!' });
        }

        // Kiểm tra số điện thoại đã tồn tại
        const checkPhone = await pool.request()
            .input('phone', sql.VarChar, customerPhone)
            .query('SELECT * FROM Account WHERE AccountName = @phone');
        if (checkPhone.recordset.length > 0) {
            return res.status(400).json({ message: 'Số điện thoại đã được sử dụng!' });
        }

        // Thêm Account (không mã hóa mật khẩu)
        const accountResult = await pool.request()
            .input('AccountName', sql.VarChar, customerEmail)
            .input('AccountPassword', sql.VarChar, password)
            .input('AccountType', sql.VarChar, 'Customer')
            .query('INSERT INTO Account (AccountName, AccountPassword, AccountType) OUTPUT INSERTED.AccountID VALUES (@AccountName, @AccountPassword, @AccountType)');

        const accountId = accountResult.recordset[0].AccountID;

        // Thêm Customer
        await pool.request()
            .input('CustomerName', sql.NVarChar, customerName)
            .input('CustomerEmail', sql.VarChar, customerEmail)
            .input('CustomerPhone', sql.VarChar, customerPhone)
            .input('AccountID', sql.Int, accountId)
            .input('CustomerGender', sql.VarChar, customerGender || null)
            .input('CustomerDate', sql.Date, customerDate || null)
            .input('CustomerAddress', sql.NVarChar, customerAddress || null)
            .query('INSERT INTO Customer (CustomerName, CustomerEmail, CustomerPhone, AccountID, CustomerGender, CustomerDate, CustomerAddress) VALUES (@CustomerName, @CustomerEmail, @CustomerPhone, @AccountID, @CustomerGender, @CustomerDate, @CustomerAddress)');

        res.json({ message: 'Đăng ký thành công!' });
    } catch (err) {
        console.error('Lỗi đăng ký:', err);
        res.status(500).json({ message: 'Lỗi server!', error: err.message });
    }
});

// API xác thực tài khoản và cấp OPT tự độngđộng
app.post('/api/send-otp', async (req, res) => {
    const { email } = req.body;
  
    if (!email) {
      return res.status(400).json({ message: 'Vui lòng cung cấp email!' });
    }
  
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Email không hợp lệ!' });
    }
  
    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request()
        .input('email', sql.VarChar, email)
        .query('SELECT * FROM Account WHERE AccountName = @email');
  
      if (result.recordset.length === 0) {
        return res.status(404).json({ message: 'Tài khoản không tồn tại!' });
      }
  
      // Không tạo OTP ở đây, client sẽ tạo
      res.json({ message: `Mã OTP đã được gửi đến ${email}` });
    } catch (err) {
      console.error('Lỗi gửi OTP:', err);
      res.status(500).json({ message: 'Lỗi server!', error: err.message });
    }
  });

// API đặt lại mật khẩu
app.post('/api/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
        return res.status(400).json({ message: 'Vui lòng cung cấp email và mật khẩu mới!' });
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({ message: 'Email không hợp lệ!' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự!' });
    }

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('email', sql.VarChar, email)
            .input('newPassword', sql.VarChar, newPassword)
            .query('UPDATE Account SET AccountPassword = @newPassword WHERE AccountName = @email');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Tài khoản không tồn tại!' });
        }

        res.json({ message: 'Đổi mật khẩu thành công!' });
    } catch (err) {
        console.error('Lỗi đặt lại mật khẩu:', err);
        res.status(500).json({ message: 'Lỗi server!', error: err.message });
    }
});

// Kết nối SQL Server và chạy server
sql.connect(dbConfig)
    .then(() => {
        console.log('Connected to SQL Server');
        app.listen(port, host, () => {
            console.log(`Server running at http://${host}:${port}`);
        });
    })
    .catch(err => {
        console.error('Database connection failed:', err);
        process.exit(1);
    });

// Xử lý lỗi không bắt được
process.on('uncaughtException', (err) => {
    console.error('Unhandled Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});