const sql = require('mssql');
const { dbConfig } = require('../config/db');

// Lấy danh sách phim
const getAllMovies = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .query('SELECT * FROM Movie');
        
        // Chuyển ImageUrl từ Buffer sang Base64
        const movies = result.recordset.map(movie => {
            if (movie.ImageUrl && Buffer.isBuffer(movie.ImageUrl)) {
                movie.ImageUrl = movie.ImageUrl.toString('base64');
            }
            return movie;
        });

        res.json({ movies });
    } catch (err) {
        console.error('Lỗi khi lấy danh sách phim:', err);
        res.status(500).json({ message: 'Lỗi server!', error: err.message });
    }
};

// Lấy thông tin chi tiết phim
const getMovieById = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('movieId', sql.Int, id)
            .query('SELECT * FROM Movie WHERE MovieID = @movieId');
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy phim!' });
        }

        // Chuyển ImageUrl từ Buffer sang Base64
        const movie = result.recordset[0];
        if (movie.ImageUrl && Buffer.isBuffer(movie.ImageUrl)) {
            movie.ImageUrl = movie.ImageUrl.toString('base64');
        }

        res.json({ movie });
    } catch (err) {
        console.error('Lỗi khi lấy thông tin phim:', err);
        res.status(500).json({ message: 'Lỗi server!', error: err.message });
    }
};

module.exports = {
    getAllMovies,
    getMovieById
};