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

const getCinemasByCity = async (req, res) => {
    const { cityId } = req.params;
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('cityId', sql.Int, cityId)
            .query(`
                SELECT 
                    c.CinemaID,
                    c.CinemaName,
                    c.CityAddress,
                    c.latitude,
                    c.longitude,
                    ci.CityName
                FROM [dbo].[Cinema] c
                INNER JOIN [dbo].[City] ci ON c.CityID = ci.CityID
                WHERE c.CityID = @cityId
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy rạp nào trong khu vực này!' });
        }

        res.json({ cinemas: result.recordset });
    } catch (err) {
        console.error('Lỗi khi lấy danh sách rạp theo khu vực:', err);
        res.status(500).json({ message: 'Lỗi server!', error: err.message });
    }
};

module.exports = {
    getCities,
    getCinemas,
    getCinemasByCity
};