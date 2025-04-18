const axios = require('axios');
require('dotenv').config();

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

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
        console.error('Geocoding error:', error.message);
        return null;
    }
}

module.exports = {
    getLatLngFromAddress
};
