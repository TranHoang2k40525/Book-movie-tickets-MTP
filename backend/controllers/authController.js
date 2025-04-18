const sql = require("mssql");
const { dbConfig } = require("../config/db");
const { isValidEmail } = require("../utils/validators");
const bcrypt = require("bcrypt");
const SALT_ROUNDS = 10;
const { verifyRefreshToken, generateToken, generateRefreshToken } = require("../utils/JsonWebToken");
const login = async (req, res) => {
  const { email, password } = req.body;

  console.log("Email nhận được:", email); // Thêm log để kiểm tra

  if (!email || !password) {
    return res.status(400).json({ message: "Vui lòng cung cấp email và mật khẩu!" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Email không hợp lệ!" });
  }

  try {
    const pool = await sql.connect(dbConfig);
    const accountResult = await pool
      .request()
      .input("email", sql.VarChar, email)
      .query("SELECT * FROM Account WHERE AccountName = @email");

    console.log("Kết quả truy vấn:", accountResult.recordset); // Thêm log để kiểm tra

    if (accountResult.recordset.length === 0) {
      return res.status(404).json({ message: "Tài khoản không tồn tại!" });
    }

    const account = accountResult.recordset[0];
    const isPasswordMatch = await bcrypt.compare(password, account.AccountPassword);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Mật khẩu không đúng!" });
    }

    const customerResult = await pool
      .request()
      .input("accountID", sql.Int, account.AccountID)
      .query("SELECT * FROM Customer WHERE AccountID = @accountID");

    if (customerResult.recordset.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy thông tin khách hàng!" });
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
      AvatarUrl: customer.AvatarUrl,
    };

      const accessToken = generateToken(userData);
      const refreshToken = generateRefreshToken(userData);

    res.json({
      message: "Đăng nhập thành công!",
      user: userData,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error("Lỗi đăng nhập:", err);
    res.status(500).json({ message: "Lỗi server!", error: err.message });
  }
};

// Đăng ký
const register = async (req, res) => {
  const { customerName, customerEmail, customerPhone, password, customerGender, customerDate, customerAddress } = req.body;

  if (!customerName || !customerEmail || !customerPhone || !password) {
    return res.status(400).json({ message: "Vui lòng cung cấp đầy đủ thông tin bắt buộc!" });
  }

  if (!isValidEmail(customerEmail)) {
    return res.status(400).json({ message: "Email không hợp lệ!" });
  }

  let pool;
  let transaction;

  try {
    pool = await sql.connect(dbConfig);
    transaction = new sql.Transaction(pool);

    await transaction.begin();

    const checkEmail = await transaction
      .request()
      .input("email", sql.VarChar, customerEmail)
      .query("SELECT * FROM Account WHERE AccountName = @email");
    if (checkEmail.recordset.length > 0) {
      throw new Error("Email đã được sử dụng!");
    }

    const checkPhone = await transaction
      .request()
      .input("phone", sql.VarChar, customerPhone)
      .query("SELECT * FROM Account WHERE AccountName = @phone");
    if (checkPhone.recordset.length > 0) {
      throw new Error("Số điện thoại đã được sử dụng!");
    }
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const accountResult = await transaction
      .request()
      .input("AccountName", sql.VarChar, customerEmail)
      .input("AccountPassword", sql.VarChar, hashedPassword)
      .input("AccountType", sql.VarChar, "Customer")
      .query(
        "INSERT INTO Account (AccountName, AccountPassword, AccountType) OUTPUT INSERTED.AccountID VALUES (@AccountName, @AccountPassword, @AccountType)"
      );

    const accountId = accountResult.recordset[0].AccountID;

    const maxIdResult = await transaction
      .request()
      .query("SELECT MAX(CustomerID) AS MaxID FROM Customer WITH (UPDLOCK, HOLDLOCK)");
    const maxId = maxIdResult.recordset[0].MaxID || 0;
    const customerId = maxId + 1;

    await transaction
      .request()
      .input("CustomerID", sql.Int, customerId)
      .input("CustomerName", sql.NVarChar, customerName)
      .input("CustomerEmail", sql.VarChar, customerEmail)
      .input("CustomerPhone", sql.VarChar, customerPhone)
      .input("AccountID", sql.Int, accountId)
      .input("CustomerGender", sql.VarChar, customerGender || null)
      .input("CustomerDate", sql.Date, customerDate || null)
      .input("CustomerAddress", sql.NVarChar, customerAddress || null)
      .query(
        "INSERT INTO Customer (CustomerID, CustomerName, CustomerEmail, CustomerPhone, AccountID, CustomerGender, CustomerDate, CustomerAddress) VALUES (@CustomerID, @CustomerName, @CustomerEmail, @CustomerPhone, @AccountID, @CustomerGender, @CustomerDate, @CustomerAddress)"
      );

    await transaction.commit();

    res.json({ message: "Đăng ký thành công!" });
  } catch (err) {
    if (transaction) await transaction.rollback();
    console.error("Lỗi đăng ký:", err);
    res.status(500).json({ message: "Lỗi server!", error: err.message });
  } finally {
    if (pool) pool.close();
  }
};

// Gửi OTP
const sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Vui lòng cung cấp email!" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Email không hợp lệ!" });
  }

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("email", sql.VarChar, email)
      .query("SELECT * FROM Account WHERE AccountName = @email");

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Tài khoản không tồn tại!" });
    }

    res.json({ message: `Mã OTP đã được gửi đến ${email}` });
  } catch (err) {
    console.error("Lỗi gửi OTP:", err);
    res.status(500).json({ message: "Lỗi server!", error: err.message });
  }
};

// Đặt lại mật khẩu
const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ message: "Vui lòng cung cấp email và mật khẩu mới!" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Email không hợp lệ!" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: "Mật khẩu phải có ít nhất 6 ký tự!" });
  }

  try {
    const pool = await sql.connect(dbConfig);
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    const result = await pool
      .request()
      .input("email", sql.VarChar, email)
      .input("newPassword", sql.VarChar, hashedPassword)
      .query("UPDATE Account SET AccountPassword = @newPassword WHERE AccountName = @email");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Tài khoản không tồn tại!" });
    }

    res.json({ message: "Đổi mật khẩu thành công!" });
  } catch (err) {
    console.error("Lỗi đặt lại mật khẩu:", err);
    res.status(500).json({ message: "Lỗi server!", error: err.message });
  }
};
// Làm mới token
const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token không được cung cấp!" });
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    const userData = {
      AccountID: payload.AccountID,
      AccountName: payload.AccountName,
      AccountType: payload.AccountType,
      customerID: payload.customerID,
      customerName: payload.customerName,
      customerEmail: payload.customerEmail,
      customerPhone: payload.customerPhone,
      CustomerGender: payload.CustomerGender,
      CustomerDate: payload.CustomerDate,
      CustomerAddress: payload.CustomerAddress,
      AvatarUrl: payload.AvatarUrl,
    };

    const newAccessToken = generateToken(userData);
    const newRefreshToken = generateRefreshToken(userData);

    res.json({
      message: "Làm mới token thành công!",
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    console.error("Lỗi làm mới token:", err);
    res.status(401).json({ message: "Refresh token không hợp lệ hoặc đã hết hạn!" });
  }
};

module.exports = {
  login,
  register,
  sendOtp,
  resetPassword,
  refreshToken,
};