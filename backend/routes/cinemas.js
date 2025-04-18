const express = require('express');
const sql = require('mssql');
const axios = require('axios');
const router = express.Router();

<<<<<<< HEAD
=======
// Cấu hình SQL Server
const dbConfig = {
    user: 'your_username', // Thay bằng username SQL Server của bạn
    password: 'your_password', // Thay bằng password SQL Server của bạn
    server: 'your_server', // Thay bằng server SQL Server, ví dụ: 'localhost' hoặc IP
    database: 'MTB 67CS1',
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
};

>>>>>>> 259430187e2398ff2d9c39e096d87a1c6ce7111b
// Google Maps API Key
require('dotenv').config();
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// Công thức Haversine tính khoảng cách (km)
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Bán kính Trái Đất (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Lấy kinh độ, vĩ độ từ địa chỉ qua Google Maps Geocoding API
async function getLatLngFromAddress(address) {
    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                address,
                key: GOOGLE_API_KEY,
            },
        });
        const { lat, lng } = response.data.results[0].geometry.location;
        return { latitude: lat, longitude: lng };
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
}

// API lấy danh sách rạp phim kèm khoảng cách
router.get('/cinemas/:customerId', async (req, res) => {
    const { customerId } = req.params;

    try {
        let pool = await sql.connect(dbConfig);

        // Lấy thông tin khách hàng
        let customerResult = await pool.request()
            .input('customerId', sql.Int, customerId)
            .query('SELECT CustomerAddress, Latitude, Longitude FROM Customer WHERE CustomerID = @customerId');

        if (!customerResult.recordset.length) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        let { CustomerAddress, Latitude, Longitude } = customerResult.recordset[0];

        // Nếu Latitude hoặc Longitude là NULL, lấy từ Google Maps
        if (!Latitude || !Longitude) {
            const coords = await getLatLngFromAddress(CustomerAddress);
            if (!coords) {
                return res.status(400).json({ error: 'Cannot get coordinates for customer address' });
            }
            Latitude = coords.latitude;
            Longitude = coords.longitude;

            // Cập nhật tọa độ vào database
            await pool.request()
                .input('customerId', sql.Int, customerId)
                .input('latitude', sql.Float, Latitude)
                .input('longitude', sql.Float, Longitude)
                .query('UPDATE Customer SET Latitude = @latitude, Longitude = @longitude WHERE CustomerID = @customerId');
        }

        // Lấy danh sách rạp phim
        let cinemasResult = await pool.request()
            .query('SELECT CinemaID, CinemaName, latitude, longitude FROM Cinema');

        // Tính khoảng cách
        const cinemasWithDistance = cinemasResult.recordset.map(cinema => ({
            cinemaId: cinema.CinemaID,
            cinemaName: cinema.CinemaName,
            distance: haversineDistance(
                Latitude,
                Longitude,
                cinema.latitude,
                cinema.longitude
            ).toFixed(2),
        }));

        // Sắp xếp theo khoảng cách
        cinemasWithDistance.sort((a, b) => a.distance - b.distance);

        res.json(cinemasWithDistance);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// API cập nhật địa chỉ khách hàng
router.put('/update-customer-address', async (req, res) => {
    const { customerId, address } = req.body;

    try {
        let pool = await sql.connect(dbConfig);

        // Lấy tọa độ mới từ Google Maps
        const coords = await getLatLngFromAddress(address);
        if (!coords) {
            return res.status(400).json({ error: 'Cannot get coordinates for address' });
        }

        // Cập nhật địa chỉ và tọa độ
        await pool.request()
            .input('customerId', sql.Int, customerId)
            .input('address', sql.NVarChar, address)
            .input('latitude', sql.Float, coords.latitude)
            .input('longitude', sql.Float, coords.longitude)
            .query(`
                UPDATE Customer 
                SET CustomerAddress = @address, Latitude = @latitude, Longitude = @longitude 
                WHERE CustomerID = @customerId
            `);

        res.json({ message: 'Address updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

<<<<<<< HEAD
=======
module.exports = router;
const express = require('express');
const router = express.Router();
const {
    getNearbyCinemas,
    updateCustomerAddress
} = require('../controllers/cinemaController');

// Route: GET /api/cinemas/:customerId
router.get('/cinemas/:customerId', getNearbyCinemas);

// Route: PUT /api/update-customer-address
router.put('/update-customer-address', updateCustomerAddress);

>>>>>>> 259430187e2398ff2d9c39e096d87a1c6ce7111b
module.exports = router;