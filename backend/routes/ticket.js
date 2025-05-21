// backend/routes/ticket.js
const express = require('express');
const router = express.Router();
const { getTickets, getTicketById } = require('../controllers/ticketController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getTickets);
router.get('/:bookingId', authMiddleware, getTicketById);


module.exports = router;