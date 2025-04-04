const sql = require('mssql');
const { dbConfig } = require('../config/db');

// Lấy danh sách thành phố
const getCities = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .query('SELECT * FROM City');
        
        res.json({ cities: result.recordset });
    } catch (err) {
        console.error('Lỗi khi lấy danh sách thành phố:', err);
        res.status(500).json({ message: 'Lỗi server!', error: err.message });
    }
};

// Lấy danh sách rạp chiếu phim
const getCinemas = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .query('SELECT * FROM Cinema');
        
        res.json({ cinemas: result.recordset });
    } catch (err) {
        console.error('Lỗi khi lấy danh sách rạp chiếu phim:', err);
        res.status(500).json({ message: 'Lỗi server!', error: err.message });
    }
};

module.exports = {
    getCities,
    getCinemas
};