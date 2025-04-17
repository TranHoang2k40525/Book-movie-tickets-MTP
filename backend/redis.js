// backend/redis.js
const Redis = require('redis');

const redisClient = Redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.on('connect', () => console.log('Connected to Redis'));

// Kết nối Redis
const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
  return redisClient;
};

// Khóa ghế với SETNX
const lockSeat = async (showId, seatId, userId) => {
  const key = `seat:${showId}:${seatId}`;
  const value = JSON.stringify({ userId, lockTime: Date.now() });
  const locked = await redisClient.set(key, value, {
    NX: true, // Chỉ set nếu key chưa tồn tại
    EX: 60, // Hết hạn sau 60 giây
  });
  return locked === 'OK';
};

// Lấy thông tin khóa ghế
const getSeatLock = async (showId, seatId) => {
  const key = `seat:${showId}:${seatId}`;
  const lockData = await redisClient.get(key);
  return lockData ? JSON.parse(lockData) : null;
};

// Hủy khóa ghế
const unlockSeat = async (showId, seatId) => {
  const key = `seat:${showId}:${seatId}`;
  await redisClient.del(key);
};

// Lấy danh sách ghế khóa cho showId
const getLockedSeatsForShow = async (showId) => {
  const keys = await redisClient.keys(`seat:${showId}:*`);
  const lockedSeats = await Promise.all(
    keys.map(async (key) => {
      const lockData = await redisClient.get(key);
      if (lockData) {
        const seatId = parseInt(key.split(':').pop());
        return seatId;
      }
      return null;
    })
  );
  return lockedSeats.filter((id) => id !== null);
};

module.exports = {
  connectRedis,
  redisClient,
  lockSeat,
  getSeatLock,
  unlockSeat,
  getLockedSeatsForShow,
};