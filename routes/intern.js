// backend/routes/intern.js
const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const internController = require('../controllers/internController');

router.use(authMiddleware);

router.post('/add', requireRole(['superadmin', 'admin']), internController.add);
router.put('/:id', requireRole(['superadmin', 'admin']), internController.update);
router.delete('/:id', internController.delete);

router.get('/riwayat-data', internController.getHistory);

module.exports = router;