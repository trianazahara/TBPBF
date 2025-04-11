// backend/routes/bidangRoutes.js
const express = require('express');
const router = express.Router();
const bidangController = require('../controllers/bidangController');

// Get all bidang
router.get('/', bidangController.getAll);

module.exports = router;