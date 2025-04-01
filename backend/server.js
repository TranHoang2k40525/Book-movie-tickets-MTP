const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const WebSocket = require('ws');
const app = express();
const port = 3000;
const host = '0.0.0.0'; // Chấp nhận kết nối từ mọi IP
app.use('/assets', express.static(path.join(__dirname, 'assets')));
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

// API lấy danh sách phim theo id (thông tin phim chi tiết)
app.get('/api/movies/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('movieId', sql.Int, id)
            .query('SELECT * FROM Movie WHERE MovieID = @movieId');
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy phim!' });
        }

        // Chuyển ImageUrl từ Buffer sang Base64
        const movie = result.recordset[0];
        if (movie.ImageUrl && Buffer.isBuffer(movie.ImageUrl)) {
            movie.ImageUrl = movie.ImageUrl.toString('base64');
        }

        res.json({ movie });
    } catch (err) {
        console.error('Lỗi khi lấy thông tin phim:', err);
        res.status(500).json({ message: 'Lỗi server!', error: err.message });
    }
});
// API lấy danh sách phim
app.get('/api/movies', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .query('SELECT * FROM Movie');
        
        // Chuyển ImageUrl từ Buffer sang Base64
        const movies = result.recordset.map(movie => {
            if (movie.ImageUrl && Buffer.isBuffer(movie.ImageUrl)) {
                movie.ImageUrl = movie.ImageUrl.toString('base64');
            }
            return movie;
        });

        console.log('Movies:', movies);
        res.json({ movies });
    } catch (err) {
        console.error('Lỗi khi lấy danh sách phim:', err);
        res.status(500).json({ message: 'Lỗi server!', error: err.message });
    }
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
        const accountResult = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT * FROM Account WHERE AccountName = @email');

        if (accountResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Tài khoản không tồn tại!' });
        }

        const account = accountResult.recordset[0];
        if (password !== account.AccountPassword) {
            return res.status(401).json({ message: 'Mật khẩu không đúng!' });
        }

        // Lấy thông tin từ bảng Customer dựa trên AccountID
        const customerResult = await pool.request()
            .input('accountID', sql.Int, account.AccountID)
            .query('SELECT * FROM Customer WHERE AccountID = @accountID');

        if (customerResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy thông tin khách hàng!' });
        }

        const customer = customerResult.recordset[0];
        const userData = {
            AccountID: account.AccountID,
            AccountName: account.AccountName,
            AccountType: account.AccountType,
            customerID: customer.CustomerID,
            customerName: customer.CustomerName,
            customerEmail: customer.CustomerEmail,
            customerPhone: customer.CustomerPhone,
            CustomerGender: customer.CustomerGender,
            CustomerDate: customer.CustomerDate,
            CustomerAddress: customer.CustomerAddress,
            AvatarUrl: customer.AvatarUrl, // Bao gồm AvatarUrl
        };

        res.json({ message: 'Đăng nhập thành công!', user: userData });
    } catch (err) {
        console.error('Lỗi đăng nhập:', err);
        res.status(500).json({ message: 'Lỗi server!', error: err.message });
    }
});
// API lấy thông tin tài khoản
app.post("/api/get-account", async (req, res) => {
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
  });
// API lấy thông tin khách hàng dựa trên AccountID
app.post("/api/get-customer", async (req, res) => {
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
// API thay đổi avaatar ( hehehehe)
app.post('/api/update-avatar', async (req, res) => { 
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
  });
// API cập nhật thông tin khách hàng (Kí tên Hoàng)
app.put('/api/update-customer', async (req, res) => {
    const { accountID, customerName, customerPhone, customerEmail, customerDate, customerGender, customerAddress } = req.body;

    if (!accountID || !customerName || !customerPhone || !customerEmail) {
        return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin bắt buộc!' });
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

        res.json({ message: 'Cập nhật thông tin thành công!' });
    } catch (err) {
        console.error('Lỗi cập nhật thông tin:', err);
        res.status(500).json({ message: 'Lỗi server!', error: err.message });
    }
});

// API xóa tài khoản
app.delete('/api/delete-account', async (req, res) => {
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
});

// API lấy danh sách thành phố
app.get('/api/cities', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .query('SELECT * FROM City');
        
        res.json({ cities: result.recordset });
    } catch (err) {
        console.error('Lỗi khi lấy danh sách thành phố:', err);
        res.status(500).json({ message: 'Lỗi server!', error: err.message });
    }
});

// API lấy danh sách rạp chiếu phim
app.get('/api/cinemas', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .query('SELECT * FROM Cinema');
        
        res.json({ cinemas: result.recordset });
    } catch (err) {
        console.error('Lỗi khi lấy danh sách rạp chiếu phim:', err);
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