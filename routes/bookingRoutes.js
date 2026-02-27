const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');

// All booking routes require the user to be logged in
router.use(authMiddleware);

// Customer Routes
router.post('/', bookingController.createBooking);

// Shop Owner Routes
router.get('/queue', bookingController.getShopQueue);
router.put('/:id/status', bookingController.updateBookingStatus);

module.exports = router;