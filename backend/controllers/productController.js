const sql = require('mssql');
const { dbConfig } = require('../config/db');
const path = require('path');
const fs = require('fs');

// Hàm lấy tất cả sản phẩm từ database
const getAllProducts = async (req, res) => {
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    
    // Truy vấn lấy tất cả sản phẩm từ bảng Product
    const result = await pool.request().query(`
      SELECT 
        ProductID, 
        ProductName, 
        ProductDescription, 
        ProductPrice, 
        ImageProduct
      FROM [MTB 67CS1].[dbo].[Product]
    `);

    // Chuyển đổi kết quả truy vấn thành mảng sản phẩm với đường dẫn ảnh đúng
    const products = await Promise.all(result.recordset.map(async product => {
      // Mỗi sản phẩm sẽ có các ghi chú mặc định
      const notes = [
        'Áp dụng giá Lễ, Tết cho các sản phẩm bắp nước đối với giao dịch có suất chiếu vào ngày Lễ, Tết',
        'Nhận hàng trong ngày xem phim (khi mua cùng vé)'
      ];
      
      let imageUrl = null;
      
      // Xử lý hình ảnh nhị phân từ SQL Server
      if (product.ImageProduct) {
        // Kiểm tra xem dữ liệu ảnh có dạng Buffer không
        if (Buffer.isBuffer(product.ImageProduct)) {
          // Tạo thư mục nếu chưa tồn tại
          const productImagesPath = path.join(__dirname, '../assets/images/products');
          if (!fs.existsSync(productImagesPath)) {
            fs.mkdirSync(productImagesPath, { recursive: true });
          }
          
          // Tạo tên file dựa trên ProductID
          const imageName = `product_${product.ProductID}.jpg`;
          const imagePath = path.join(productImagesPath, imageName);
          
          // Lưu ảnh vào file
          fs.writeFileSync(imagePath, product.ImageProduct);
          
          // Tạo URL cho ảnh từ server
          imageUrl = `${req.protocol}://${req.get('host')}/assets/images/products/${imageName}`;
        } else {
          // Nếu không phải Buffer, có thể là base64 string
          // Format base64 string để sử dụng trong data URL
          const base64Data = product.ImageProduct.toString('base64');
          imageUrl = `data:image/jpeg;base64,${base64Data}`;
        }
      } 
      
      return {
        ProductID: product.ProductID,
        ProductName: product.ProductName || `Sản phẩm ${product.ProductID}`,
        ProductDescription: product.ProductDescription || 'Không có mô tả',
        ProductPrice: product.ProductPrice || 0,
        // Trả về URL ảnh cho frontend
        ImageUrl: imageUrl,
        // Thêm trường Notes cho phía frontend sử dụng
        Notes: notes
      };
    }));

    

    res.status(200).json(products);
  } catch (err) {
    console.error('Lỗi khi lấy danh sách sản phẩm:', err);
    
    // Trả về sản phẩm mẫu trong trường hợp lỗi
    const sampleProducts = getSampleProducts(req);
    res.status(200).json(sampleProducts);
  } finally {
    if (pool) {
      await pool.close(); // Đảm bảo đóng pool
    }
  }
};


module.exports = { getAllProducts };