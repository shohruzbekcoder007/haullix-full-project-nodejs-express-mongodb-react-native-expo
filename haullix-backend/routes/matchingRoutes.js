const express = require('express');
const router = express.Router();
const matchingController = require('../controllers/matchingController');
const { authenticate, requireUser, requireRole } = require('../middleware/auth');

router.get('/return-loads', authenticate, requireUser, requireRole('driver'), matchingController.findMatchingLoads);

module.exports = router;
