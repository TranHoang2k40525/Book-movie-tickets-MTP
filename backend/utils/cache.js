const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // Cache 10 phút

const setTempData = (key, value) => cache.set(key, value);
const getTempData = (key) => cache.get(key);
const deleteTempData = (key) => cache.del(key);

module.exports = { setTempData, getTempData, deleteTempData };