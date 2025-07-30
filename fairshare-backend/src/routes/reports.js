const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/summary', reportsController.getSummary);
router.get('/charts', reportsController.getCharts);
router.get('/export', reportsController.exportReports);

module.exports = router; 