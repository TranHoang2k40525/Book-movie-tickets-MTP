const { WebSocketServer } = require('ws');
const sql = require('mssql');
const { dbConfig } = require('./config/db');
const { verifyToken } = require('./utils/JsonWebToken');
const NodeCache = require('node-cache');

const clients = new Map(); // Map<showId (number), Set<WebSocket>>
const cache = new NodeCache({ stdTTL: 300 }); // Cache 5 phút

async function getSeatMapByShowForBroadcast(showId) {
  const cacheKey = `seatMap_${showId}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log(`[${new Date().toISOString()}] Lấy sơ đồ ghế từ cache cho showId: ${showId}`);
    return cached;
  }

  let pool = null;
  try {
    pool = await sql.connect(dbConfig);
    const hallQuery = `
      SELECT ch.HallID, ch.HallName, ch.TotalSeats, c.CinemaName
      FROM CinemaHall ch
      JOIN Cinema c ON ch.CinemaID = c.CinemaID
      JOIN Show s ON s.HallID = ch.HallID
      WHERE s.ShowID = @showId
    `;
    const hallResult = await pool
      .request()
      .input("showId", sql.Int, showId)
      .query(hallQuery);

    if (!hallResult.recordset[0]) {
      throw new Error("Không tìm thấy phòng chiếu cho suất chiếu này");
    }

    const hall = hallResult.recordset[0];

    const seatsQuery = `
      SELECT 
        chs.SeatID,
        chs.SeatNumber,
        chs.SeatType,
        chs.SeatPrice,
        CASE 
          WHEN bs.Status = 'Reserved' AND bs.HoldUntil > GETDATE() THEN 'reserved'
          WHEN chs.Status = 'Reserved' THEN 'reserved'
          WHEN chs.Status = 'Locked' THEN 'locked'
          WHEN chs.Status = 'Booked' THEN 'booked'
          WHEN chs.Status IS NULL OR chs.Status = 'Available' THEN 'available'
        END AS SeatStatus
      FROM CinemaHallSeat chs
      LEFT JOIN BookingSeat bs ON chs.SeatID = bs.SeatID AND bs.ShowID = @showId
      WHERE chs.HallID = @hallId
      ORDER BY chs.SeatNumber
    `;
    const seatsResult = await pool
      .request()
      .input("hallId", sql.Int, hall.HallID)
      .input("showId", sql.Int, showId)
      .query(seatsQuery);

    const seatMap = {};
    seatsResult.recordset.forEach((seat) => {
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

    const rows = Object.keys(seatMap).sort();
    const seatLayout = rows.map((row) => ({
      row,
      seats: seatMap[row],
    }));

    const result = {
      hall: {
        hallId: hall.HallID,
        hallName: hall.HallName,
        cinemaName: hall.CinemaName,
        totalSeats: hall.TotalSeats,
      },
      seatLayout,
    };

    cache.set(cacheKey, result);
    console.log(`[${new Date().toISOString()}] Lưu sơ đồ ghế vào cache cho showId: ${showId}`);
    return result;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Lỗi khi lấy sơ đồ ghế cho showId: ${showId}:`, error);
    throw error;
  } finally {
    if (pool && pool.connected) {
      await pool.close();
    }
  }
}

async function validateShowId(showId) {
  let pool = null;
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input('showId', sql.Int, showId)
      .query('SELECT ShowID FROM Show WHERE ShowID = @showId');
    return result.recordset.length > 0;
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Lỗi khi xác thực showId: ${showId}:`, err);
    return false;
  } finally {
    if (pool && pool.connected) {
      await pool.close();
    }
  }
}

async function sendInitialSeatMap(ws, showId) {
  try {
    const updateKey = `seatUpdate_${showId}`;
    const lastUpdate = cache.get(updateKey);
    if (lastUpdate) {
      console.log(`[${new Date().toISOString()}] Phát hiện cập nhật ghế gần đây cho showId: ${showId}, thời gian: ${new Date(lastUpdate).toISOString()}`);
    }
    ws.send(JSON.stringify({ type: 'SEAT_UPDATE' }));
    console.log(`[${new Date().toISOString()}] Gửi thông báo khởi tạo cho client với showId: ${showId}`);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Lỗi khi gửi thông báo khởi tạo cho showId: ${showId}:`, err);
  }
}

function initializeWebSocket(server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', async (ws, req) => {
    console.log(`[${new Date().toISOString()}] WebSocket client kết nối`);

    const url = new URL(req.url, `http://${req.headers.host}`);
    const showIdStr = url.searchParams.get('showId');
    const token = url.searchParams.get('token');

    const showId = parseInt(showIdStr, 10);
    if (isNaN(showId)) {
      console.log(`[${new Date().toISOString()}] showId không hợp lệ: ${showIdStr}, đóng kết nối WebSocket`);
      ws.close(1008, 'showId không hợp lệ');
      return;
    }

    console.log(`[${new Date().toISOString()}] Nhận showId: ${showId}, token: ${token}`);

    if (!token) {
      console.log(`[${new Date().toISOString()}] Không có token, đóng kết nối WebSocket`);
      ws.close(1008, 'Yêu cầu xác thực');
      return;
    }

    let decoded;
    try {
      decoded = verifyToken(token);
      console.log(`[${new Date().toISOString()}] Token xác thực, user: ${decoded.customerID}`);
    } catch (err) {
      console.log(`[${new Date().toISOString()}] Token không hợp lệ, đóng kết nối WebSocket: ${err.message}`);
      ws.close(1008, 'Token không hợp lệ');
      return;
    }

    const isValidShowId = await validateShowId(showId);
    if (!isValidShowId) {
      console.log(`[${new Date().toISOString()}] showId không tồn tại: ${showId}, đóng kết nối WebSocket`);
      ws.close(1008, 'showId không hợp lệ');
      return;
    }

    if (!clients.has(showId)) {
      clients.set(showId, new Set());
    }
    clients.get(showId).add(ws);
    ws.isAlive = true;
    ws.showId = showId; // Lưu showId vào ws để dễ quản lý
    console.log(`[${new Date().toISOString()}] Client kết nối với showId: ${showId}, tổng clients: ${clients.get(showId).size}`);

    await sendInitialSeatMap(ws, showId);

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('close', () => {
      console.log(`[${new Date().toISOString()}] WebSocket client ngắt kết nối`);
      if (ws.showId && clients.has(ws.showId)) {
        clients.get(ws.showId).delete(ws);
        console.log(`[${new Date().toISOString()}] Đã xóa client khỏi showId: ${ws.showId}, còn lại: ${clients.get(ws.showId).size} clients`);
        if (clients.get(ws.showId).size === 0) {
          clients.delete(ws.showId);
          console.log(`[${new Date().toISOString()}] Xóa danh sách client cho showId: ${ws.showId}`);
        }
      }
    });
  });

  const pingInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!ws.isAlive) {
        console.log(`[${new Date().toISOString()}] Client không phản hồi, hủy kết nối`);
        ws.terminate();
        if (ws.showId && clients.has(ws.showId)) {
          clients.get(ws.showId).delete(ws);
          console.log(`[${new Date().toISOString()}] Đã xóa client không phản hồi khỏi showId: ${ws.showId}, còn lại: ${clients.get(ws.showId).size} clients`);
          if (clients.get(ws.showId).size === 0) {
            clients.delete(ws.showId);
            console.log(`[${new Date().toISOString()}] Xóa danh sách client cho showId: ${ws.showId}`);
          }
        }
      } else {
        ws.isAlive = false;
        ws.ping();
      }
    });
  }, 30000); // Tăng lên 30 giây

  wss.on('close', () => {
    console.log(`[${new Date().toISOString()}] WebSocket server đóng`);
    clearInterval(pingInterval);
  });
}

function broadcastSeatUpdate(showId) {
  const updateKey = `seatUpdate_${showId}`;
  cache.set(updateKey, Date.now());
  console.log(`[${new Date().toISOString()}] Lưu timestamp cập nhật ghế cho showId: ${showId}`);

  if (clients.has(showId)) {
    const clientSet = clients.get(showId);
    const clientCount = clientSet.size;
    console.log(`[${new Date().toISOString()}] Gửi thông báo cập nhật ghế cho showId: ${showId}, clients: ${clientCount}`);
    clientSet.forEach((client) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({ type: 'SEAT_UPDATE' }));
        console.log(`[${new Date().toISOString()}] Đã gửi thông báo cập nhật ghế cho client với showId: ${showId}`);
      } else {
        console.log(`[${new Date().toISOString()}] Client không sẵn sàng cho showId: ${showId}, readyState: ${client.readyState}, xóa client`);
        clientSet.delete(client);
      }
    });
    if (clientSet.size === 0) {
      clients.delete(showId);
      console.log(`[${new Date().toISOString()}] Xóa danh sách client cho showId: ${showId} do không còn client hoạt động`);
    }
  } else {
    console.log(`[${new Date().toISOString()}] Không có client kết nối cho showId: ${showId}`);
  }
}

module.exports = { initializeWebSocket, broadcastSeatUpdate, getSeatMapByShowForBroadcast };