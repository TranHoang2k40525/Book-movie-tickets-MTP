// backend/websocket.js
const { WebSocketServer } = require('ws');
const sql = require('mssql');
const { dbConfig } = require('./config/db');
const { verifyToken } = require('./utils/JsonWebToken'); // Import verifyToken từ JsonWebToken.js

const clients = new Map(); // Map<showId, Set<WebSocket>>

async function validateShowId(showId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input('showId', sql.Int, showId)
      .query('SELECT ShowID FROM Show WHERE ShowID = @showId');
    await pool.close();
    return result.recordset.length > 0;
  } catch (err) {
    console.error('Error validating showId:', err);
    return false;
  }
}

function initializeWebSocket(server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', async (ws, req) => {
    console.log('WebSocket client connected');
    console.log('Request URL:', req.url);

    const url = new URL(req.url, `http://${req.headers.host}`);
    const showId = url.searchParams.get('showId');
    const token = url.searchParams.get('token');

    // Log chi tiết để debug
    console.log('Received showId:', showId);
    console.log('Received token:', token);
    console.log('JWT_SECRET:', process.env.JWT_SECRET);

    // Xác thực token
    if (!token) {
      console.log('No token provided, closing WebSocket connection');
      ws.close(1008, 'Authentication required');
      return;
    }

    let decoded;
    try {
      decoded = verifyToken(token); // Sử dụng verifyToken từ JsonWebToken.js
      console.log('Token verified, user:', decoded.customerID);
    } catch (err) {
      console.log('Invalid token, closing WebSocket connection:', err.message);
      ws.close(1008, 'Invalid token');
      return;
    }

    // Kiểm tra showId
    if (!showId || isNaN(showId)) {
      console.log('Invalid showId, closing WebSocket connection');
      ws.close(1008, 'showId required');
      return;
    }

    // Xác thực showId tồn tại
    const isValidShowId = await validateShowId(showId);
    if (!isValidShowId) {
      console.log('Non-existent showId, closing WebSocket connection');
      ws.close(1008, 'Invalid showId');
      return;
    }

    // Thêm client vào danh sách
    if (!clients.has(showId)) {
      clients.set(showId, new Set());
    }
    clients.get(showId).add(ws);
    ws.isAlive = true; // Đánh dấu client còn sống
    console.log(`Client connected to showId: ${showId}, total clients: ${clients.get(showId).size}`);

    // Xử lý ping-pong để kiểm tra kết nối
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      if (showId && clients.has(showId)) {
        clients.get(showId).delete(ws);
        if (clients.get(showId).size === 0) {
          clients.delete(showId);
        }
      }
    });
  });

  // Ping clients định kỳ để kiểm tra kết nối
  const pingInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!ws.isAlive) {
        console.log('Client not responding, terminating connection');
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 10000); // Ping mỗi 10 giây

  wss.on('close', () => {
    clearInterval(pingInterval);
  });
}

function broadcastSeatUpdate(showId, seatLayout) {
  if (clients.has(showId)) {
    const clientCount = clients.get(showId).size;
    console.log(`Broadcasting seat update for showId: ${showId}, clients: ${clientCount}`);
    clients.get(showId).forEach((client) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({ type: 'SEAT_UPDATE', seatLayout }));
        console.log(`Sent seat update to client for showId: ${showId}`);
      }
    });
  } else {
    console.log(`No clients connected for showId: ${showId}`);
  }
}

module.exports = { initializeWebSocket, broadcastSeatUpdate };