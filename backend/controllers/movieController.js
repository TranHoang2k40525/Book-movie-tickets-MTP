const sql = require('mssql');
const { dbConfig } = require('../config/db');

const getAllMovies = async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .query('SELECT * FROM Movie');
    
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

    const movie = result.recordset[0];
    if (movie.ImageUrl && Buffer.isBuffer(movie.ImageUrl)) {
      movie.ImageUrl = movie.ImageUrl.toString('base64');
    }
    movie.MovieTrailer = `http://192.168.1.101:3000/Video/${movie.MovieTrailer}`;

    res.json({ movie });
  } catch (err) {
    console.error('Lỗi khi lấy thông tin phim:', err);
    res.status(500).json({ message: 'Lỗi server!', error: err.message });
  }
};
const getMoviesShowingToday = async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const currentDate = new Date().toISOString().split('T')[0]; // Lấy ngày hiện tại (2025-04-06)
    const result = await pool.request()
      .input('showDate', sql.Date, currentDate)
      .query(`
        SELECT DISTINCT 
          m.MovieID, 
          m.MovieTitle, 
          m.MovieDescription, 
          m.MovieLanguage, 
          m.MovieGenre, 
          m.MovieReleaseDate, 
          m.MovieRuntime, 
          m.ImageUrl, 
          m.MovieActor, 
          m.MovieDirector, 
          m.MovieAge, 
          m.MovieTrailer
        FROM [dbo].[Movie] m
        INNER JOIN [dbo].[Show] s ON m.MovieID = s.MovieID
        WHERE CONVERT(date, s.ShowDate) = @showDate
      `);

    const movies = result.recordset.map(movie => {
      if (movie.ImageUrl && Buffer.isBuffer(movie.ImageUrl)) {
        movie.ImageUrl = movie.ImageUrl.toString('base64');
      }
      return movie;
    });

    if (movies.length === 0) {
      return res.status(404).json({ message: 'Không có phim nào đang chiếu hôm nay!' });
    }

    res.json({ movies });
  } catch (err) {
    console.error('Lỗi khi lấy danh sách phim đang chiếu hôm nay:', err);
    res.status(500).json({ message: 'Lỗi server!', error: err.message });
  }
};
const getShowtimesByMovieId = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('movieId', sql.Int, id)
      .query(`
        SELECT 
          s.ShowID, 
          s.ShowTime, 
          s.ShowDate, 
          ch.HallID, 
          ch.HallName, 
          ch.TotalSeats, 
          c.CinemaID, 
          c.CinemaName, 
          c.CityAddress, 
          c.latitude, 
          c.longitude
        FROM [dbo].[Show] s
        INNER JOIN [dbo].[CinemaHall] ch ON s.HallID = ch.HallID
        INNER JOIN [dbo].[Cinema] c ON ch.CinemaID = c.CinemaID
        WHERE s.MovieID = @movieId
        ORDER BY s.ShowDate, s.ShowTime
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy lịch chiếu cho phim này!' });
    }

    res.json({ showtimes: result.recordset });
  } catch (err) {
    console.error('Lỗi khi lấy lịch chiếu phim:', err);
    res.status(500).json({ message: 'Lỗi server!', error: err.message });
  }
};

const getCinemasByMovieAndDate = async (req, res) => {
    const { id: movieId } = req.params;
    const { date } = req.query;
    try {
      const formattedDate = new Date(date).toISOString().split('T')[0]; // Đảm bảo định dạng ngày
      const pool = await sql.connect(dbConfig);
      const result = await pool.request()
        .input('movieId', sql.Int, movieId)
        .input('showDate', sql.Date, formattedDate)
        .query(`
          SELECT DISTINCT 
            c.CinemaID, 
            c.CinemaName, 
            c.CityAddress, 
            c.latitude, 
            c.longitude
          FROM [dbo].[Show] s
          INNER JOIN [dbo].[CinemaHall] ch ON s.HallID = ch.HallID
          INNER JOIN [dbo].[Cinema] c ON ch.CinemaID = c.CinemaID
          WHERE s.MovieID = @movieId AND s.ShowDate = @showDate
        `);
  
      if (result.recordset.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy rạp chiếu phim nào cho ngày này!' });
      }
  
      res.json({ cinemas: result.recordset });
    } catch (err) {
      console.error('Lỗi khi lấy danh sách rạp:', err);
      res.status(500).json({ message: 'Lỗi server!', error: err.message });
    }
  };

const getShowtimesByCinemaAndDate = async (req, res) => {
  const { movieId, cinemaId } = req.params;
  const { date } = req.query;
  try {
    console.log('movieId:', movieId, 'cinemaId:', cinemaId, 'date:', date);

    const formattedDate = date;
    const movieIdInt = parseInt(movieId, 10);
    const cinemaIdInt = parseInt(cinemaId, 10);

    if (isNaN(movieIdInt) || isNaN(cinemaIdInt)) {
      return res.status(400).json({ message: 'movieId và cinemaId phải là số hợp lệ!' });
    }

    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('movieId', sql.Int, movieIdInt)
      .input('cinemaId', sql.Int, cinemaIdInt)
      .input('showDate', sql.Date, formattedDate)
      .query(`
        SELECT 
          s.ShowID, 
          s.ShowTime, 
          s.ShowDate, 
          ch.HallName,
          ch.HallID
        FROM [dbo].[Show] s
        INNER JOIN [dbo].[CinemaHall] ch ON s.HallID = ch.HallID
        WHERE s.MovieID = @movieId 
        AND ch.CinemaID = @cinemaId 
        AND CONVERT(date, s.ShowDate) = @showDate
        ORDER BY s.ShowTime
      `);

    if (result.recordset.length === 0) {
      console.log('Không tìm thấy lịch chiếu cho movieId:', movieIdInt, 'cinemaId:', cinemaIdInt, 'ngày:', formattedDate);
      return res.status(404).json({ message: 'Không tìm thấy lịch chiếu cho rạp này!' });
    }

    // Thêm logic kiểm tra isPassed
    const currentTime = new Date();
    const selectedDate = new Date(formattedDate);
    const areSameDay = (
      selectedDate.getFullYear() === currentTime.getFullYear() &&
      selectedDate.getMonth() === currentTime.getMonth() &&
      selectedDate.getDate() === currentTime.getDate()
    );

    const showtimesWithStatus = result.recordset.map(show => {
      // Chuyển ShowTime thành chuỗi và điều chỉnh múi giờ
      const showTimeDate = new Date(show.ShowTime);
      const hours = showTimeDate.getUTCHours().toString().padStart(2, '0'); // Lấy giờ theo UTC để tránh lệch múi giờ
      const minutes = showTimeDate.getUTCMinutes().toString().padStart(2, '0');
      const seconds = showTimeDate.getUTCSeconds().toString().padStart(2, '0');
      const showTimeStr = `${hours}:${minutes}:${seconds}`; // Định dạng thành HH:mm:ss

      let isPassed = false;
      if (areSameDay) {
        const [hoursNum, minutesNum] = showTimeStr.split(':').map(Number);
        const showDateTime = new Date();
        showDateTime.setHours(hoursNum, minutesNum, 0, 0);
        isPassed = currentTime > showDateTime;
      }

      return {
        ...show,
        ShowTime: showTimeStr, // Trả về ShowTime dưới dạng chuỗi
        isPassed
      };
    });

    res.json({ showtimes: showtimesWithStatus });
  } catch (err) {
    console.error('Lỗi khi lấy giờ chiếu:', err);
    res.status(500).json({ message: 'Lỗi server!', error: err.message });
  }
};
module.exports = {
  getAllMovies,
  getMovieById,
  getShowtimesByMovieId,
  getCinemasByMovieAndDate,
  getShowtimesByCinemaAndDate,
  getMoviesShowingToday
};