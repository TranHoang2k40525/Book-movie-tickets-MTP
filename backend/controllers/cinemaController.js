const { connectDB, sql } = require('../config/db');
const { getLatLngFromAddress } = require('../controllers/googleMapsService');

function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

const getNearbyCinemas = async (req, res) => {
    const { customerId } = req.params;

    try {
        const pool = await connectDB();
        const customerResult = await pool.request()
            .input('customerId', sql.Int, customerId)
            .query('SELECT CustomerAddress, Latitude, Longitude FROM Customer WHERE CustomerID = @customerId');

        if (!customerResult.recordset.length) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        let { CustomerAddress, Latitude, Longitude } = customerResult.recordset[0];

        if (!Latitude || !Longitude) {
            const coords = await getLatLngFromAddress(CustomerAddress);
            if (!coords) {
                return res.status(400).json({ error: 'Unable to fetch coordinates' });
            }

            Latitude = coords.latitude;
            Longitude = coords.longitude;

            await pool.request()
                .input('customerId', sql.Int, customerId)
                .input('latitude', sql.Float, Latitude)
                .input('longitude', sql.Float, Longitude)
                .query('UPDATE Customer SET Latitude = @latitude, Longitude = @longitude WHERE CustomerID = @customerId');
        }

        const cinemasResult = await pool.request()
            .query('SELECT CinemaID, CinemaName, Latitude, Longitude FROM Cinema');

        const cinemasWithDistance = cinemasResult.recordset.map(c => ({
            cinemaId: c.CinemaID,
            cinemaName: c.CinemaName,
            distance: haversineDistance(Latitude, Longitude, c.Latitude, c.Longitude).toFixed(2)
        })).sort((a, b) => a.distance - b.distance);

        res.json(cinemasWithDistance);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

const updateCustomerAddress = async (req, res) => {
    const { customerId, address } = req.body;

    try {
        const pool = await connectDB();
        const coords = await getLatLngFromAddress(address);
        if (!coords) {
            return res.status(400).json({ error: 'Unable to get coordinates' });
        }

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
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getNearbyCinemas,
    updateCustomerAddress
};
