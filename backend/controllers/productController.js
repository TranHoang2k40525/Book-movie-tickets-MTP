const sql = require('mssql');
const { dbConfig } = require('../config/db');

const getAllProducts = async (req, res) => {
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT ProductID, ProductName, ProductDescription, ProductPrice, ImageProduct
      FROM [MTB 67CS1].[dbo].[Product]
    `);
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách sản phẩm' });
  } finally {
    if (pool) {
      await pool.close(); // Đảm bảo đóng pool
    }
  }
};
module.exports = getAllProducts;