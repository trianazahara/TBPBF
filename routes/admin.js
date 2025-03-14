// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const pool = require('../config/database');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const adminController = require('../controllers/adminController');
const internController = require('../controllers/internController');

router.use(authMiddleware);
router.use(requireRole(['superadmin']));

// Get admin
router.get('/', adminController.getAdmin);

// Add admin
router.post('/', adminController.addAdmin);

// Update admin 
router.patch('/:id', adminController.editAdmin);

// Delete admin
router.delete('/:id', adminController.deleteAdmin);

module.exports = router;