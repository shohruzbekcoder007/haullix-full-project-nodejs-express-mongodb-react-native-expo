const express = require('express');
const router = express.Router();
const matchingController = require('../controllers/matchingController');

router.get('/return-loads', matchingController.findMatchingLoads);

module.exports = router;
