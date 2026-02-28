const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route to create a new account
router.post('/register', authController.register);

// Route to log into an existing account
router.post('/login', authController.login);

module.exports = router;