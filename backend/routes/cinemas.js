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

module.exports = router;