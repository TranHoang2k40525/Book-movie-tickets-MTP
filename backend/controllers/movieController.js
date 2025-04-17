const sql = require('mssql');
const { dbConfig } = require('../config/db');

const getAllMovies = async (req, res) => {
  try {
    const { filter } = req.query; // Lấy tham số filter từ query
    const pool = await sql.connect(dbConfig);
    let query = '';

    if (filter === 'showing') {
      // Phim đang chiếu hôm nay (dựa trên ShowDate)
      query = `
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
        WHERE CONVERT(date, s.ShowDate) = CONVERT(date, GETDATE())
      `;
    } else if (filter === 'upcoming') {
      // Phim sắp chiếu (ShowDate trong tương lai)
      query = `
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
        WHERE CONVERT(date, s.ShowDate) > CONVERT(date, GETDATE())
      
      `;
    } else {
      // Mặc định: trả tất cả phim (cho danh sách dọc hoặc tab Đặc biệt)
      query = 'SELECT * FROM Movie';
    }

    const result = await pool.request().query(query);
    
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
const getMoviesAndShowtimesByCinema = async (req, res) => {
  try {
    const { cinemaId } = req.params;
    const { date } = req.query; // Ngày được gửi từ frontend (định dạng YYYY-MM-DD)

    const pool = await sql.connect(dbConfig);

    // Truy vấn lấy danh sách phim và lịch chiếu tại rạp
    const result = await pool.request()
      .input('CinemaID', sql.Int, cinemaId)
      .input('ShowDate', sql.Date, date)
      .query(`
        SELECT 
          m.MovieID, 
          m.MovieTitle, 
          m.MovieAge, 
          s.ShowID, 
          s.ShowDate, 
          s.ShowTime,
          ch.HallID, 
          ch.HallName
        FROM Movie m
        INNER JOIN Show s ON m.MovieID = s.MovieID
        INNER JOIN CinemaHall ch ON s.HallID = ch.HallID
        WHERE ch.CinemaID = @CinemaID
        AND CAST(s.ShowDate AS DATE) = @ShowDate
        ORDER BY m.MovieTitle, s.ShowTime
      `);

    // Nhóm dữ liệu theo phim
    const movies = [];
    const movieMap = new Map();

    for (const row of result.recordset) {
      const movieId = row.MovieID;

      if (!movieMap.has(movieId)) {
        movieMap.set(movieId, {
          movieId: row.MovieID,
          title: row.MovieTitle,
          ageRating: row.MovieAge || 'T16', // Sử dụng MovieAge làm độ tuổi giới hạn
          showtimes: [],
        });
      }

      const movie = movieMap.get(movieId);
      // Chuyển ShowTime thành định dạng HH:mm
      const showTime = new Date(row.ShowTime);
      const hours = showTime.getUTCHours().toString().padStart(2, '0');
      const minutes = showTime.getUTCMinutes().toString().padStart(2, '0');
      const formattedTime = `${hours}:${minutes}`;

      movie.showtimes.push({
        showId: row.ShowID,
        startTime: formattedTime,
        hallName: row.HallName,
      });
    }

    for (const movie of movieMap.values()) {
      movies.push(movie);
    }
    res.status(200).json(movies);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
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

    // Tạo URL trailer cục bộ
    if (movie.MovieTrailer) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const cleanTrailer = movie.MovieTrailer.replace(/^.*[\\\/]/, '');
      movie.MovieTrailer = `${baseUrl}/Video/${cleanTrailer}`;
    
    }

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
// Lấy sơ đồ ghế ngồi cho một suất chiếu
const getSeatMapByShow = async (req, res) => {
  try {
    const { showId } = req.params;
    let pool = await sql.connect(dbConfig);

    // Truy vấn thông tin rạp và phòng chiếu
    const hallQuery = `
      SELECT ch.HallID, ch.HallName, ch.TotalSeats, c.CinemaName
      FROM CinemaHall ch
      JOIN Cinema c ON ch.CinemaID = c.CinemaID
      JOIN Show s ON s.HallID = ch.HallID
      WHERE s.ShowID = @showId
    `;
    const hallResult = await pool.request()
      .input('showId', sql.Int, showId)
      .query(hallQuery);

    if (!hallResult.recordset[0]) {
      return res.status(404).json({ error: 'Không tìm thấy phòng chiếu cho suất chiếu này' });
    }

    const hall = hallResult.recordset[0];

    // Truy vấn danh sách ghế và trạng thái
    const seatsQuery = `
      SELECT 
        chs.SeatID,
        chs.SeatNumber,
        chs.SeatType,
        chs.SeatPrice,
        CASE 
          WHEN bs.BookingSeatID IS NOT NULL AND bs.Status = 'Booked' THEN 'booked'
          ELSE 'available'
        END AS SeatStatus
      FROM CinemaHallSeat chs
      LEFT JOIN BookingSeat bs ON chs.SeatID = bs.SeatID AND bs.ShowID = @showId
      WHERE chs.HallID = @hallId
      ORDER BY chs.SeatNumber
    `;
    const seatsResult = await pool.request()
      .input('showId', sql.Int, showId)
      .input('hallId', sql.Int, hall.HallID)
      .query(seatsQuery);

    // Xử lý dữ liệu ghế thành định dạng sơ đồ
    const seatMap = {};
    seatsResult.recordset.forEach(seat => {
      const rowMatch = seat.SeatNumber.match(/([A-H])(\d+)/);
      if (rowMatch) {
        const row = rowMatch[1];
        const number = parseInt(rowMatch[2]);
        if (!seatMap[row]) {
          seatMap[row] = [];
        }
        seatMap[row][number - 1] = {
          seatId: seat.SeatID,
          seatNumber: seat.SeatNumber,
          type: seat.SeatType.toLowerCase(),
          price: seat.SeatPrice,
          status: seat.SeatStatus,
        };
      }
    });

    // Tạo danh sách hàng ghế
    const rows = Object.keys(seatMap).sort();
    const seatLayout = rows.map(row => ({
      row,
      seats: seatMap[row],
    }));

    res.status(200).json({
      hall: {
        hallId: hall.HallID,
        hallName: hall.HallName,
        cinemaName: hall.CinemaName,
        totalSeats: hall.TotalSeats,
      },
      seatLayout,
    });
  } catch (error) {
    console.error('Error fetching seat map:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy sơ đồ ghế ngồi' });
  }
};
module.exports = {
  getAllMovies,
  getMovieById,
  getShowtimesByMovieId,
  getCinemasByMovieAndDate,
  getShowtimesByCinemaAndDate,
  getMoviesShowingToday,
  getMoviesAndShowtimesByCinema,
  getSeatMapByShow,
};