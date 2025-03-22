const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  server: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT),
  options: {
    encrypt: false, // Nếu dùng local SQL Server, để false
    trustServerCertificate: true // Bỏ qua lỗi chứng chỉ trong local
  }
};

const connectDB = async () => {
  try {
    const pool = await sql.connect(dbConfig);
    console.log('Connected to SQL Server database: MTB 67CS1');
    return pool;
  } catch (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
};

module.exports = connectDB;