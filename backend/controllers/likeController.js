const sql = require("mssql");
const { dbConfig } = require("../config/db");

const likeMovie = async (req, res) => {
  const { movieId } = req.body;
  const customerId = req.user.CustomerID; // Giả sử middleware auth đã gán thông tin user

  if (!movieId || !customerId) {
    return res.status(400).json({ message: "Missing movieId or customerId" });
  }

  try {
    const pool = await sql.connect(dbConfig);
    const request = pool.request();

    // Kiểm tra xem người dùng đã thích phim chưa
    const checkQuery = `
      SELECT IsLiked 
      FROM LikeMovie 
      WHERE CustomerID = @CustomerID AND MovieID = @MovieID
    `;
    request.input("CustomerID", sql.Int, customerId);
    request.input("MovieID", sql.Int, movieId);
    const result = await request.query(checkQuery);

    if (result.recordset.length > 0) {
      // Đã có bản ghi
      const isLiked = result.recordset[0].IsLiked;
      if (isLiked) {
        // Nếu đã thích, hủy thích bằng cách cập nhật IsLiked = 0 hoặc xóa
        const unlikeQuery = `
          UPDATE LikeMovie 
          SET IsLiked = 0 
          WHERE CustomerID = @CustomerID AND MovieID = @MovieID
        `;
        await request.query(unlikeQuery);
        return res.status(200).json({ message: "Unliked successfully", isLiked: false });
      } else {
        // Nếu đã có bản ghi nhưng IsLiked = 0, cập nhật thành IsLiked = 1
        const likeQuery = `
          UPDATE LikeMovie 
          SET IsLiked = 1 
          WHERE CustomerID = @CustomerID AND MovieID = @MovieID
        `;
        await request.query(likeQuery);
        return res.status(200).json({ message: "Liked successfully", isLiked: true });
      }
    } else {
      // Chưa có bản ghi, tạo mới với IsLiked = 1
      const insertQuery = `
        INSERT INTO LikeMovie (CustomerID, MovieID, IsLiked)
        VALUES (@CustomerID, @MovieID, 1)
      `;
      await request.query(insertQuery);
      return res.status(201).json({ message: "Liked successfully", isLiked: true });
    }
  } catch (error) {
    console.error("Error handling like:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getLikeStatus = async (req, res) => {
  const { movieId } = req.params;
  const customerId = req.user.CustomerID;

  try {
    const pool = await sql.connect(dbConfig);
    const request = pool.request();

    const query = `
      SELECT IsLiked, 
             (SELECT COUNT(*) FROM LikeMovie WHERE MovieID = @MovieID AND IsLiked = 1) as LikeCount
      FROM LikeMovie 
      WHERE CustomerID = @CustomerID AND MovieID = @MovieID
    `;
    request.input("CustomerID", sql.Int, customerId);
    request.input("MovieID", sql.Int, movieId);
    const result = await request.query(query);

    if (result.recordset.length > 0) {
      return res.status(200).json({
        isLiked: result.recordset[0].IsLiked,
        likes: result.recordset[0].LikeCount,
      });
    } else {
      return res.status(200).json({
        isLiked: false,
        likes: await getTotalLikes(movieId),
      });
    }
  } catch (error) {
    console.error("Error fetching like status:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getTotalLikes = async (movieId) => {
  try {
    const pool = await sql.connect(dbConfig);
    const request = pool.request();
    const query = `
      SELECT COUNT(*) as LikeCount 
      FROM LikeMovie 
      WHERE MovieID = @MovieID AND IsLiked = 1
    `;
    request.input("MovieID", sql.Int, movieId);
    const result = await request.query(query);
    return result.recordset[0].LikeCount;
  } catch (error) {
    console.error("Error counting likes:", error);
    return 0;
  }
};

module.exports = { likeMovie, getLikeStatus };