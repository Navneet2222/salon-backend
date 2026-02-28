const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const authMiddleware = require('../middleware/authMiddleware');

// 1. Add a new service to a shop (Requires Owner Login)
router.post('/', authMiddleware, serviceController.createService);

// 2. Fetch all services for a specific shop (Public - so customers can see them)
router.get('/:shopId', serviceController.getServicesByShop);

module.exports = router;