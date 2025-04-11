// backend/routes/intern.js
const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const internController = require('../controllers/internController');

router.use(authMiddleware);


router.get('/', internController.getAll);
router.get('/check-availability', internController.checkAvailability);
router.post('/add', requireRole(['superadmin', 'admin']), internController.add);
router.put('/:id', requireRole(['superadmin', 'admin']), internController.update);
router.get('/:id', internController.getDetail);
router.delete('/:id', internController.delete);
router.patch('/missing/:id', requireRole(['superadmin', 'admin']), internController.setMissingStatus);
router.get('/mentors', internController.getMentors);

router.get('/riwayat-data', internController.getHistory);

module.exports = router;