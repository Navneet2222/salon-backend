const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const authMiddleware = require('../middleware/authMiddleware');

// 1. Add a new service
router.post('/', authMiddleware, serviceController.createService);

// 2. Fetch all services for a specific shop
router.get('/:shopId', serviceController.getServicesByShop);

// 3. Update a service
router.put('/:id', authMiddleware, serviceController.updateService);

// 4. Delete a service
router.delete('/:id', authMiddleware, serviceController.deleteService);

module.exports = router;