const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate, requireUser } = require('../middleware/auth');

router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/save-profile', authenticate, authController.saveProfile);
router.post('/switch-role', authenticate, requireUser, authController.switchRole);
router.get('/profile', authenticate, requireUser, authController.getProfile);
router.post('/avatar', authenticate, requireUser, authController.uploadAvatar);
router.delete('/avatar', authenticate, requireUser, authController.deleteAvatar);
router.get('/avatar/:userId', authController.getAvatar);

module.exports = router;
