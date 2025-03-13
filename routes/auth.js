// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const authController = require('../controllers/authController');

// Login
router.post('/login', authController.login);

// Get current user
router.get('/me', authMiddleware, authController.getMe);
router.post('/check-username', authController.checkUsername);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;