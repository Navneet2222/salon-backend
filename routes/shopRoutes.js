const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const authMiddleware = require('../middleware/authMiddleware');

// 1. Create a new shop (Requires Owner Login)
router.post('/', authMiddleware, shopController.createShop);

// 2. Get the logged-in owner's specific shop (Requires Owner Login)
router.get('/owner/my-shop', authMiddleware, shopController.getMyShop);

// 3. Get ALL shops for the Customer Marketplace (Public - no token needed)
router.get('/', shopController.getAllShops);

// 4. Update an existing shop with new image/details (Requires Owner Login)
router.put('/:id', authMiddleware, shopController.updateShop);

module.exports = router;