// backend/controllers/userController.js
const sql = require("mssql");
const { dbConfig } = require("../config/db");
const { isValidEmail } = require("../utils/validators");

// Lấy thông tin tài khoản
const getAccount = async (req, res) => {
  try {
    const accountID = req.user.AccountID; // Lấy từ req.user
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
  try {
    const accountID = req.user.AccountID;

    const pool = await sql.connect(dbConfig);

    console.log("Fetching customer for AccountID:", accountID);
    
    console.log("SQL connection established");

    const result = await pool
      .request()
      .input("accountID", sql.Int, accountID)
      .query("SELECT * FROM [MTB 67CS1].[dbo].[Customer] WHERE AccountID = @accountID");

    if (result.recordset.length === 0) {
      console.log("No customer found for AccountID:", accountID);
      return res.status(404).json({ message: "Khách hàng không tồn tại!" });
    }

    const customer = result.recordset[0];
    
    res.json({ message: "Lấy thông tin khách hàng thành công!", customer });
  } catch (err) {
    console.error("Lỗi lấy thông tin khách hàng:", err.message);
    res.status(500).json({ message: "Lỗi server!", error: err.message });
  }
};


// Cập nhật avatar
const updateAvatar = async (req, res) => {
  const { avatarUrl } = req.body;
  const customerID = req.user.customerID; // Lấy từ req.user

  // Kiểm tra avatarUrl
  if (!avatarUrl) {
    return res.status(400).json({ message: "Vui lòng cung cấp avatarUrl!" });
  }

  try {
    const pool = await sql.connect(dbConfig);
    const accountID = req.user.AccountID;
    const customerResult = await pool
      .request()
      .input("customerID", sql.Int, customerID)
      .input("accountID", sql.Int, accountID)
      .query(
        "SELECT * FROM Customer WHERE CustomerID = @customerID AND AccountID = @accountID"
      );

    if (customerResult.recordset.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy khách hàng!" });
    }
    await pool
      .request()
      .input("avatarUrl", sql.VarChar, avatarUrl)
      .input("customerID", sql.Int, customerID)
      .query("UPDATE Customer SET AvatarUrl = @avatarUrl WHERE CustomerID = @customerID");

    res.json({ message: "Cập nhật avatar thành công!" });
  } catch (err) {
    console.error("Lỗi cập nhật avatar:", err);
    res.status(500).json({ message: "Lỗi server!", error: err.message });
  }
};

// Cập nhật thông tin khách hàng
const updateCustomer = async (req, res) => {
  const {
    customerName,
    customerEmail,
    customerPhone,
    customerGender,
    customerDate,
    customerAddress,
  } = req.body;
  const customerID = req.user.customerID; // Lấy từ req.user

  // Kiểm tra các trường bắt buộc
  if (!customerName || !customerEmail || !customerPhone) {
    return res.status(400).json({ message: "Vui lòng cung cấp đầy đủ thông tin bắt buộc!" });
  }

  try {
    const pool = await sql.connect(dbConfig);
    const accountID = req.user.AccountID;
    const customerResult = await pool
      .request()
      .input("customerID", sql.Int, customerID)
      .input("accountID", sql.Int, accountID)
      .query(
        "SELECT * FROM Customer WHERE CustomerID = @customerID AND AccountID = @accountID"
      );

    if (customerResult.recordset.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy khách hàng!" });
    }

    await pool
      .request()
      .input("customerID", sql.Int, customerID)
      .input("customerName", sql.NVarChar, customerName)
      .input("customerEmail", sql.VarChar, customerEmail)
      .input("customerPhone", sql.VarChar, customerPhone)
      .input("customerGender", sql.VarChar, customerGender || null)
      .input("customerDate", sql.Date, customerDate || null)
      .input("customerAddress", sql.NVarChar, customerAddress || null)
      .query(
        "UPDATE Customer SET CustomerName = @customerName, CustomerEmail = @customerEmail, CustomerPhone = @customerPhone, CustomerGender = @customerGender, CustomerDate = @customerDate, CustomerAddress = @customerAddress WHERE CustomerID = @customerID"
      );

    res.json({ message: "Cập nhật thông tin khách hàng thành công!" });
  } catch (err) {
    console.error("Lỗi cập nhật thông tin khách hàng:", err);
    res.status(500).json({ message: "Lỗi server!", error: err.message });
  }
};

// Xóa tài khoản
const deleteAccount = async (req, res) => {
  const accountID = req.user.AccountID; // Lấy từ req.user

  try {
    const pool = await sql.connect(dbConfig);

    // Xóa thông tin trong bảng Customer trước
    await pool
      .request()
      .input("accountID", sql.Int, accountID)
      .query("DELETE FROM Customer WHERE AccountID = @accountID");

    // Sau đó xóa trong bảng Account
    const result = await pool
      .request()
      .input("accountID", sql.Int, accountID)
      .query("DELETE FROM Account WHERE AccountID = @accountID");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Tài khoản không tồn tại!" });
    }

    res.json({ message: "Xóa tài khoản thành công!" });
  } catch (err) {
    console.error("Lỗi xóa tài khoản:", err);
    res.status(500).json({ message: "Lỗi server!", error: err.message });
  }
};

module.exports = {
  getAccount,
  getCustomer,
  updateAvatar,
  updateCustomer,
  deleteAccount,
};



