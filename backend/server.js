const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const net = require('net'); 

const app = express();
const port = 3000;
const host = '192.168.126.105'; 

app.use(cors());
app.use(bodyParser.json());

// Hàm giải phóng cổng
const freePort = (port) => {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.once('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                const { exec } = require('child_process');
                exec(`netstat -aon | findstr :${port}`, (err, stdout) => {
                    if (err) return reject(err);
                    const lines = stdout.split('\n');
                    for (const line of lines) {
                        const match = line.match(/LISTENING\s+(\d+)/);
                        if (match) {
                            const pid = match[1];
                            exec(`taskkill /PID ${pid} /F`, (err) => {
                                if (err) return reject(err);
                                resolve();
                            });
                            return;
                        }
                    }
                    resolve();
                });
            } else {
                reject(err);
            }
        });
        server.once('listening', () => {
            server.close();
            resolve();
        });
        server.listen(port, host);
    });
};

// Cấu hình kết nối SQL Server
const dbConfig = {
    user: 'sa',
    password: '123456789',
    server: 'localhost',
    database: 'MTB 67CS1',
    port: 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

// Route mặc định
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Movie Ticket Booking API!' });
});

// API đăng nhập
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    console.log('Email nhận được:', email); 
    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Vui lòng cung cấp email và mật khẩu!' });
        }

        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT * FROM Account WHERE AccountName = @email');

        console.log('Kết quả truy vấn:', result.recordset); 
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Tài khoản không tồn tại!' });
        }

        const account = result.recordset[0];
        const isMatch = password === account.AccountPassword;
        if (!isMatch) {
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

    try {
        const pool = await sql.connect(dbConfig);

        // Kiểm tra email đã tồn tại
        const checkEmail = await pool.request()
            .input('email', sql.VarChar, customerEmail)
            .query('SELECT * FROM Account WHERE AccountName = @email');
        if (checkEmail.recordset.length > 0) {
            return res.status(400).json({ message: 'Email đã được sử dụng!' });
        }
        const checkPhone = await pool.request()
            .input('phone', sql.VarChar, customerPhone)
            .query('SELECT * FROM Account WHERE AccountName = @phone');
        if (checkPhone.recordset.length > 0) {
            return res.status(400).json({ message: 'Phone đã được sử dụng!' });
        }
        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Thêm Account
        const accountResult = await pool.request()
            .input('AccountName', sql.VarChar, customerEmail)
            .input('AccountPassword', sql.VarChar, hashedPassword)
            .input('AccountType', sql.VarChar, 'Customer')
            .query('INSERT INTO Account (AccountName, AccountPassword, AccountType) OUTPUT INSERTED.AccountID VALUES (@AccountName, @AccountPassword, @AccountType)');

        const accountId = accountResult.recordset[0].AccountID;

        // Thêm Customer
        await pool.request()
            .input('CustomerName', sql.NVarChar, customerName)
            .input('CustomerEmail', sql.VarChar, customerEmail)
            .input('CustomerPhone', sql.VarChar, customerPhone)
            .input('AccountID', sql.Int, accountId)
            .input('CustomerGender', sql.VarChar, customerGender)
            .input('CustomerDate', sql.Date, customerDate)
            .input('CustomerAddress', sql.NVarChar, customerAddress)
            .query('INSERT INTO Customer (CustomerName, CustomerEmail, CustomerPhone, AccountID, CustomerGender, CustomerDate, CustomerAddress) VALUES (@CustomerName, @CustomerEmail, @CustomerPhone, @AccountID, @CustomerGender, @CustomerDate, @CustomerAddress)');

        res.json({ message: 'Đăng ký thành công!' });
    } catch (err) {
        console.error('Lỗi đăng ký:', err);
        res.status(500).json({ message: 'Lỗi server!', error: err.message });
    }
});

// API đặt lại mật khẩu
app.post('/api/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('email', sql.VarChar, email)
            .input('newPassword', sql.VarChar, hashedPassword)
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


// Chạy server sau khi giải phóng cổng
freePort(port)
    .then(() => {
        // Kết nối SQL Server
        sql.connect(dbConfig)
            .then(() => console.log('Connected to SQL Server'))
            .catch(err => console.error('Database connection failed:', err));

        app.listen(port, host, () => {
            console.log(`Server running at http://${host}:${port}`);
        });
    })
    .catch(err => {
        console.error('Không thể giải phóng cổng:', err);
        process.exit(1);
    });