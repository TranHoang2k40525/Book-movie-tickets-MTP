<<<<<<< HEAD

const sql = require("mssql");

=======
const sql = require("mssql");
const sql = require("mssql");

// Cấu hình kết nối SQL Server từ biến môi trường
>>>>>>> 259430187e2398ff2d9c39e096d87a1c6ce7111b
// Cấu hình kết nối SQL Server từ biến môi trường
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT, 10),
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
<<<<<<< HEAD
=======
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT, 10),
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
>>>>>>> 259430187e2398ff2d9c39e096d87a1c6ce7111b
};

async function connectDB() {
  try {
    // Kiểm tra các biến môi trường cần thiết
    if (
      !dbConfig.user ||
      !dbConfig.password ||
      !dbConfig.server ||
      !dbConfig.database ||
      !dbConfig.port
    ) {
      throw new Error("Missing required database configuration variables");
    }
    const pool = await sql.connect(dbConfig);
    console.log("Connected to SQL Server");
    return pool;
  } catch (err) {
    console.error("Database connection failed:", err);
    throw err;
  }
<<<<<<< HEAD
=======
  try {
    // Kiểm tra các biến môi trường cần thiết
    if (
      !dbConfig.user ||
      !dbConfig.password ||
      !dbConfig.server ||
      !dbConfig.database ||
      !dbConfig.port
    ) {
      throw new Error("Missing required database configuration variables");
    }
    const pool = await sql.connect(dbConfig);
    console.log("Connected to SQL Server");
    return pool;
  } catch (err) {
    console.error("Database connection failed:", err);
    throw err;
  }
>>>>>>> 259430187e2398ff2d9c39e096d87a1c6ce7111b
}

module.exports = {
  dbConfig,
  connectDB,
<<<<<<< HEAD
=======
  dbConfig,
  connectDB,
>>>>>>> 259430187e2398ff2d9c39e096d87a1c6ce7111b
};