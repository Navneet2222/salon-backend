const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect the route to create a service
router.post('/', authMiddleware, serviceController.createService);

// Make the route to view services public
router.get('/:shopId', serviceController.getServicesByShop);

module.exports = router;