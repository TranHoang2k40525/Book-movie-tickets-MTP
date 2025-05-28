const sql = require("mssql");
const { dbConfig } = require("../config/db");

const getAllMovies = async (req, res) => {
  try {
    const { filter } = req.query;
    const pool = await sql.connect(dbConfig);
    let query = "";

    if (filter === "showing") {
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
    } else if (filter === "upcoming") {
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
    } else if (filter === "special") {
      query = `
        SELECT 
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
        WHERE m.MovieID IN (1, 4, 10, 20, 25, 15)
      `;
    } else {
      query = "SELECT * FROM Movie";
    }

    const result = await pool.request().query(query);

    const movies = result.recordset.map((movie) => {
      if (movie.ImageUrl && Buffer.isBuffer(movie.ImageUrl)) {
        movie.ImageUrl = movie.ImageUrl.toString("base64");
      }
      return movie;
    });

    res.json({ movies });
  } catch (err) {
    console.error("Lỗi khi lấy danh sách phim:", err);
    res.status(500).json({ message: "Lỗi server!", error: err.message });
  }
};

const getMoviesAndShowtimesByCinema = async (req, res) => {
  try {
    const { cinemaId } = req.params;
    const { date } = req.query;

    const pool = await sql.connect(dbConfig);

    const result = await pool
      .request()
      .input("CinemaID", sql.Int, cinemaId)
      .input("ShowDate", sql.Date, date)
      .query(`
        SELECT 
          m.MovieID, 
          m.MovieTitle, 
          m.MovieAge, 
          m.ImageUrl, 
          m.MovieGenre, 
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

    const movies = [];
    const movieMap = new Map();

    for (const row of result.recordset) {
      const movieId = row.MovieID;

      if (!movieMap.has(movieId)) {
        movieMap.set(movieId, {
          movieId: row.MovieID,
          title: row.MovieTitle,
          ageRating: row.MovieAge || "T16",
          imageUrl: row.Image ? (Buffer.isBuffer(row.ImageUrl) ? `data:image/jpeg;base64,${row.ImageUrl.toString("base64")}` : `/assets/images/${row.ImageUrl}`) : null,
          genre: row.MovieGenre || '',
          showtimes: [],
        });
      }

      const movie = movieMap.get(movieId);
      const showTime = new Date(row.ShowTime);
      const hours = showTime.getUTCHours().toString().padStart(2, "0");
      const minutes = showTime.getUTCMinutes().toString().padStart(2, "0");
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
    res.status(500).json({ message: "Server error" });
  }
};

const getMovieById = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("movieId", sql.Int, id)
      .query("SELECT * FROM Movie WHERE MovieID = @movieId");

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy phim!" });
    }

    const movie = result.recordset[0];
    if (movie.ImageUrl && Buffer.isBuffer(movie.ImageUrl)) {
      movie.ImageUrl = movie.ImageUrl.toString("base64");
      
    } else if (movie.ImageUrl && !movie.ImageUrl.startsWith('data:image')) {
      movie.ImageUrl = `/assets/images/${movie.ImageUrl}`;
    }

    if (movie.MovieTrailer) {
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const cleanTrailer = movie.MovieTrailer.replace(/^.*[\\\/]/, "");
      movie.MovieTrailer = `${baseUrl}/Video/${cleanTrailer}`;
    }

    res.json({ movie });
  } catch (err) {
    console.error("Lỗi khi lấy thông tin phim:", err);
    res.status(500).json({ message: "Lỗi server!", error: err.message });
  }
};

const addMovie = async (req, res) => {
  try {
    if (req.user.AccountType !== 'ADMIN') {
      return res.status(403).json({ message: 'Chỉ admin mới có quyền thêm phim!' });
    }

    const {
      MovieTitle,
      MovieDescription,
      MovieLanguage,
      MovieGenre,
      MovieReleaseDate,
      MovieRuntime,
      ImageUrl,
      MovieActor,
      MovieDirector,
      MovieAge,
      MovieTrailer
    } = req.body;

    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('MovieTitle', sql.NVarChar, MovieTitle)
      .input('MovieDescription', sql.NVarChar, MovieDescription)
      .input('MovieLanguage', sql.NVarChar, MovieLanguage)
      .input('MovieGenre', sql.NVarChar, MovieGenre)
      .input('MovieReleaseDate', sql.Date, MovieReleaseDate)
      .input('MovieRuntime', sql.Int, MovieRuntime)
      .input('ImageUrl', sql.NVarChar, ImageUrl)
      .input('MovieActor', sql.NVarChar, MovieActor)
      .input('MovieDirector', sql.NVarChar, MovieDirector)
      .input('MovieAge', sql.NVarChar, MovieAge)
      .input('MovieTrailer', sql.NVarChar, MovieTrailer)
      .query(`
        INSERT INTO Movie (
          MovieTitle, MovieDescription, MovieLanguage, MovieGenre,
          MovieReleaseDate, MovieRuntime, ImageUrl, MovieActor,
          MovieDirector, MovieAge, MovieTrailer
        )
        VALUES (
          @MovieTitle, @MovieDescription, @MovieLanguage, @MovieGenre,
          @MovieReleaseDate, @MovieRuntime, @ImageUrl, @MovieActor,
          @MovieDirector, @MovieAge, @MovieTrailer
        );
        SELECT SCOPE_IDENTITY() as MovieID;
      `);

    const movieId = result.recordset[0].MovieID;
    res.status(201).json({
      message: 'Thêm phim mới thành công!',
      movieId: movieId
    });
  } catch (err) {
    console.error('Lỗi khi thêm phim:', err);
    res.status(500).json({ message: 'Lỗi server!', error: err.message });
  }
};

const updateMovie = async (req, res) => {
  try {
    if (req.user.AccountType !== 'ADMIN') {
      return res.status(403).json({ message: 'Chỉ admin mới có quyền sửa phim!' });
    }

    const { id } = req.params;
    const {
      MovieTitle,
      MovieDescription,
      MovieLanguage,
      MovieGenre,
      MovieReleaseDate,
      MovieRuntime,
      ImageUrl,
      MovieActor,
      MovieDirector,
      MovieAge,
      MovieTrailer
    } = req.body;

    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('MovieID', sql.Int, id)
      .input('MovieTitle', sql.NVarChar, MovieTitle)
      .input('MovieDescription', sql.NVarChar, MovieDescription)
      .input('MovieLanguage', sql.NVarChar, MovieLanguage)
      .input('MovieGenre', sql.NVarChar, MovieGenre)
      .input('MovieReleaseDate', sql.Date, MovieReleaseDate)
      .input('MovieRuntime', sql.Int, MovieRuntime)
      .input('ImageUrl', sql.NVarChar, ImageUrl)
      .input('MovieActor', sql.NVarChar, MovieActor)
      .input('MovieDirector', sql.NVarChar, MovieDirector)
      .input('MovieAge', sql.NVarChar, MovieAge)
      .input('MovieTrailer', sql.NVarChar, MovieTrailer)
      .query(`
        UPDATE Movie
        SET MovieTitle = @MovieTitle,
            MovieDescription = @MovieDescription,
            MovieLanguage = @MovieLanguage,
            MovieGenre = @MovieGenre,
            MovieReleaseDate = @MovieReleaseDate,
            MovieRuntime = @MovieRuntime,
            ImageUrl = @ImageUrl,
            MovieActor = @MovieActor,
            MovieDirector = @MovieDirector,
            MovieAge = @MovieAge,
            MovieTrailer = @MovieTrailer
        WHERE MovieID = @MovieID;
        
        SELECT * FROM Movie WHERE MovieID = @MovieID;
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy phim!' });
    }

    res.json({
      message: 'Cập nhật phim thành công!',
      movie: result.recordset[0]
    });
  } catch (err) {
    console.error('Lỗi khi cập nhật phim:', err);
    res.status(500).json({ message: 'Lỗi server!', error: err.message });
  }
};

const deleteMovie = async (req, res) => {
  try {
    if (req.user.AccountType !== 'ADMIN') {
      return res.status(403).json({ message: 'Chỉ admin mới có quyền xóa phim!' });
    }

    const { id } = req.params;
    const pool = await sql.connect(dbConfig);

    // Kiểm tra xem phim có suất chiếu nào không
    const showCheck = await pool.request()
      .input('MovieID', sql.Int, id)
      .query('SELECT COUNT(*) as ShowCount FROM Show WHERE MovieID = @MovieID');

    if (showCheck.recordset[0].ShowCount > 0) {
      return res.status(400).json({
        message: 'Không thể xóa phim này vì đã có suất chiếu được tạo!'
      });
    }

    const result = await pool.request()
      .input('MovieID', sql.Int, id)
      .query('DELETE FROM Movie WHERE MovieID = @MovieID');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Không tìm thấy phim!' });
    }

    res.json({ message: 'Xóa phim thành công!' });
  } catch (err) {
    console.error('Lỗi khi xóa phim:', err);
    res.status(500).json({ message: 'Lỗi server!', error: err.message });
  }
};


// Các hàm khác giữ nguyên
const getMoviesShowingToday = async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const currentDate = new Date().toISOString().split("T")[0];
    const result = await pool
      .request()
      .input("showDate", sql.Date, currentDate)
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

    const movies = result.recordset.map((movie) => {
      if (movie.ImageUrl && Buffer.isBuffer(movie.ImageUrl)) {
        movie.ImageUrl = `data:image/jpeg;base64,${movie.ImageUrl.toString("base64")}`;
      } else if (movie.ImageUrl && !movie.ImageUrl.startsWith('data:image')) {
        movie.ImageUrl = `/assets/images/${movie.ImageUrl}`;
      }
      return movie;
    });

    if (movies.length === 0) {
      return res
        .status(404)
        .json({ message: "Không có phim nào đang chiếu hôm nay!" });
    }

    res.json({ movies });
  } catch (err) {
    console.error("Lỗi khi lấy danh sách phim đang chiếu hôm nay:", err);
    res.status(500).json({ message: "Lỗi server!", error: err.message });
  }
};

const getShowtimesByMovieId = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("movieId", sql.Int, id)
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
      return res
        .status(404)
        .json({ message: "Không tìm thấy lịch chiếu cho phim này!" });
    }

    res.json({ showtimes: result.recordset });
  } catch (err) {
    console.error("Lỗi khi lấy lịch chiếu phim:", err);
    res.status(500).json({ message: "Lỗi server!", error: err.message });
  }
};

const getCinemasByMovieAndDate = async (req, res) => {
  const { id: movieId } = req.params;
  const { date } = req.query;
  try {
    const formattedDate = new Date(date).toISOString().split("T")[0];
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("movieId", sql.Int, movieId)
      .input("showDate", sql.Date, formattedDate)
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
      return res
        .status(404)
        .json({ message: "Không tìm thấy rạp chiếu phim nào cho ngày này!" });
    }

    res.json({ cinemas: result.recordset });
  } catch (err) {
    console.error("Lỗi khi lấy danh sách rạp:", err);
    res.status(500).json({ message: "Lỗi server!", error: err.message });
  }
};

const getShowtimesByCinemaAndDate = async (req, res) => {
  const { movieId, cinemaId } = req.params;
  const { date } = req.query;
  try {
    console.log("movieId:", movieId, "cinemaId:", cinemaId, "date:", date);

    const formattedDate = date;
    const movieIdInt = parseInt(movieId, 10);
    const cinemaIdInt = parseInt(cinemaId, 10);

    if (isNaN(movieIdInt) || isNaN(cinemaIdInt)) {
      return res
        .status(400)
        .json({ message: "movieId và cinemaId phải là số hợp lệ!" });
    }

    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("movieId", sql.Int, movieIdInt)
      .input("cinemaId", sql.Int, cinemaIdInt)
      .input("showDate", sql.Date, formattedDate)
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
      console.log(
        "Không tìm thấy lịch chiếu cho movieId:",
        movieIdInt,
        "cinemaId:",
        cinemaIdInt,
        "ngày:",
        formattedDate
      );
      return res
        .status(404)
        .json({ message: "Không tìm thấy lịch chiếu cho rạp này!" });
    }

    const currentTime = new Date();
    const selectedDate = new Date(formattedDate);
    const currentDate = new Date(currentTime.toISOString().split("T")[0]);

    const isPastDate = selectedDate < currentDate;
    const areSameDay =
      selectedDate.getFullYear() === currentTime.getFullYear() &&
      selectedDate.getMonth() === currentTime.getMonth() &&
      selectedDate.getDate() === currentTime.getDate();

    const showtimesWithStatus = result.recordset.map((show) => {
      const showTimeDate = new Date(show.ShowTime);
      const hours = showTimeDate.getUTCHours().toString().padStart(2, "0");
      const minutes = showTimeDate.getUTCMinutes().toString().padStart(2, "0");
      const seconds = showTimeDate.getUTCSeconds().toString().padStart(2, "0");
      const showTimeStr = `${hours}:${minutes}:${seconds}`;

      let isPassed = false;
      if (isPastDate) {
        isPassed = true;
      } else if (areSameDay) {
        const [hoursNum, minutesNum] = showTimeStr.split(":").map(Number);
        const showDateTime = new Date();
        showDateTime.setHours(hoursNum, minutesNum, 0, 0);
        isPassed = currentTime > showDateTime;
      }

      return {
        ...show,
        ShowTime: showTimeStr,
        isPassed,
      };
    });

    res.json({ showtimes: showtimesWithStatus });
  } catch (err) {
    console.error("Lỗi khi lấy giờ chiếu:", err);
    res.status(500).json({ message: "Lỗi server!", error: err.message });
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
  addMovie,
  updateMovie,
  deleteMovie,
};