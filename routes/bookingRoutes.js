const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Assuming you have an auth middleware to protect routes
const authMiddleware = require('../middleware/authMiddleware'); 

// 1. Create a new booking (Customer)
router.post('/', authMiddleware, bookingController.createBooking);

// 2. Get the live queue for a specific shop (Owner/Customer)
router.get('/queue', authMiddleware, bookingController.getQueue);

// 3. Update booking status (Owner marks 'in-chair' or 'completed')
router.put('/:id/status', authMiddleware, bookingController.updateStatus);

module.exports = router;