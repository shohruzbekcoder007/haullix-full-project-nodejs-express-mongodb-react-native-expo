const express = require('express');
const router = express.Router();
const fineController = require('../controllers/fineController');

router.get('/check', fineController.checkFinesByPlate);
router.get('/radars', fineController.getRadarPoints);

module.exports = router;
