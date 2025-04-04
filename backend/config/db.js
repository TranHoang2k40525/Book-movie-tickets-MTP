const sql = require('mssql');

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

async function connectDB() {
    try {
        const pool = await sql.connect(dbConfig);
        console.log('Connected to SQL Server');
        return pool;
    } catch (err) {
        console.error('Database connection failed:', err);
        throw err;
    }
}

module.exports = {
    dbConfig,
    connectDB
};
