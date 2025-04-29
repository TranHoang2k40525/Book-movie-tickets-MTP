const sql = require("mssql");
const { dbConfig } = require("../config/db");

// Lấy danh sách voucher mà khách hàng hiện tại có thể sử dụng
const getVouchers = async (req, res) => {
  try {
    const customerID = req.user.customerID; // Lấy từ authMiddleware
    const pool = await sql.connect(dbConfig);

    // Truy vấn lấy các loại voucher còn hoạt động, chưa hết hạn, chưa đạt giới hạn sử dụng
    // và khách hàng có quyền sử dụng (dựa trên IsRestricted và VoucherCustomer)
    const result = await pool
      .request()
      .input("customerID", sql.Int, customerID)
      .query(`
        SELECT v.VoucherID, v.Code, v.DiscountValue, v.StartDate, v.EndDate, v.Description, 
               v.IsActive, v.Title, v.ImageVoucher, v.UsageLimit, v.UsageCount, v.IsRestricted
        FROM Voucher v
        LEFT JOIN VoucherUsage vu ON v.VoucherID = vu.VoucherID AND vu.CustomerID = @customerID
        LEFT JOIN VoucherCustomer vc ON v.VoucherID = vc.VoucherID AND vc.CustomerID = @customerID
        WHERE v.IsActive = 1 
          AND v.EndDate >= GETDATE() 
          AND v.UsageCount < v.UsageLimit
          AND vu.VoucherUsageID IS NULL -- Khách hàng chưa sử dụng loại voucher này
          AND (v.IsRestricted = 0 OR vc.VoucherCustomerID IS NOT NULL) -- Áp dụng cho tất cả hoặc khách hàng được phép
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Không có voucher nào khả dụng!" });
    }

    // Chuyển đổi ImageVoucher (dạng varbinary) sang base64 để hiển thị
    const vouchers = result.recordset.map(voucher => {
      const imageBase64 = voucher.ImageVoucher
        ? Buffer.from(voucher.ImageVoucher).toString('base64')
        : null;
      return {
        VoucherID: voucher.VoucherID,
        Code: voucher.Code,
        DiscountValue: voucher.DiscountValue,
        StartDate: voucher.StartDate,
        EndDate: voucher.EndDate,
        Description: voucher.Description,
        IsActive: voucher.IsActive,
        Title: voucher.Title,
        ImageVoucher: imageBase64 ? `data:image/jpeg;base64,${imageBase64}` : null,
        UsageLimit: voucher.UsageLimit,
        UsageCount: voucher.UsageCount,
        IsRestricted: voucher.IsRestricted
      };
    });

    res.json({ message: "Lấy danh sách voucher thành công!", vouchers });
  } catch (err) {
    console.error("Lỗi khi lấy danh sách voucher:", err);
    res.status(500).json({ message: "Lỗi server!", error: err.message });
  }
};

// Sử dụng một loại voucher
const useVoucher = async (req, res) => {
  const { voucherID } = req.body;
  const customerID = req.user.customerID; // Lấy từ authMiddleware

  if (!voucherID) {
    return res.status(400).json({ message: "Vui lòng cung cấp voucherID!" });
  }

  try {
    const pool = await sql.connect(dbConfig);

    // Kiểm tra xem loại voucher có tồn tại, còn hoạt động, chưa hết hạn, chưa đạt giới hạn
    // và khách hàng có quyền sử dụng
    const voucherResult = await pool
      .request()
      .input("voucherID", sql.Int, voucherID)
      .input("customerID", sql.Int, customerID)
      .query(`
        SELECT v.* 
        FROM Voucher v
        LEFT JOIN VoucherCustomer vc ON v.VoucherID = vc.VoucherID AND vc.CustomerID = @customerID
        WHERE v.VoucherID = @voucherID 
          AND v.IsActive = 1 
          AND v.EndDate >= GETDATE() 
          AND v.UsageCount < v.UsageLimit
          AND (v.IsRestricted = 0 OR vc.VoucherCustomerID IS NOT NULL)
      `);

    if (voucherResult.recordset.length === 0) {
      return res.status(404).json({ message: "Voucher không tồn tại, đã hết hạn, đã đạt giới hạn sử dụng, hoặc bạn không có quyền sử dụng!" });
    }

    // Kiểm tra xem khách hàng đã sử dụng loại voucher này chưa
    const usageResult = await pool
      .request()
      .input("voucherID", sql.Int, voucherID)
      .input("customerID", sql.Int, customerID)
      .query(`
        SELECT * FROM VoucherUsage
        WHERE VoucherID = @voucherID AND CustomerID = @customerID
      `);

    if (usageResult.recordset.length > 0) {
      return res.status(400).json({ message: "Bạn đã sử dụng loại voucher này rồi!" });
    }

    // Thêm bản ghi vào bảng VoucherUsage
    await pool
      .request()
      .input("voucherID", sql.Int, voucherID)
      .input("customerID", sql.Int, customerID)
      .query(`
        INSERT INTO VoucherUsage (VoucherID, CustomerID, UsedAt)
        VALUES (@voucherID, @customerID, GETDATE())
      `);

    // Tăng UsageCount trong bảng Voucher
    await pool
      .request()
      .input("voucherID", sql.Int, voucherID)
      .query(`
        UPDATE Voucher
        SET UsageCount = UsageCount + 1
        WHERE VoucherID = @voucherID
      `);

    res.json({ message: "Sử dụng voucher thành công!" });
  } catch (err) {
    console.error("Lỗi khi sử dụng voucher:", err);
    res.status(500).json({ message: "Lỗi server!", error: err.message });
  }
};

module.exports = {
  getVouchers,
  useVoucher
};