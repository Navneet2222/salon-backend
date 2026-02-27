const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const authMiddleware = require('../middleware/authMiddleware');

// 1. PUBLIC ROUTES (Customers browsing the app)
// These do not use authMiddleware because anyone can view shops
router.get('/', shopController.getAllShops); 
router.get('/:id', shopController.getShopById);

// 2. PRIVATE ROUTES (Shop Owners managing their business)
// These must use authMiddleware so only logged-in owners can make changes
// Note: We place /my-shop above /:id in the routing logic if it was a generic GET, 
// but since they are distinct paths, we are safe!
router.post('/', authMiddleware, shopController.createShop);
router.get('/owner/my-shop', authMiddleware, shopController.getMyShop); // Changed route slightly for better structure

module.exports = router;