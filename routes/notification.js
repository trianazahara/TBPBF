// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware);

// Mengambil daftar notifikasi dengan pagination
router.get('/', notificationController.getNotifications);

// Mengambil jumlah notifikasi yang belum dibaca
router.get('/unread-count', notificationController.getUnreadCount);

// Menandai satu notifikasi sebagai sudah dibaca
router.put('/:id/read', notificationController.markAsRead);

// Menandai semua notifikasi sebagai sudah dibaca
router.put('/mark-all-read', notificationController.markAllAsRead);

module.exports = router;