const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, requireUser, requireRole } = require('../middleware/auth');

router.use(authenticate, requireUser);

router.get('/', orderController.getOrders);
router.get('/active-tracking', orderController.getActiveTracking);
router.post('/', requireRole('cargo_owner'), orderController.createOrder);
router.get('/:id', orderController.getOrder);
router.put('/:id', requireRole('cargo_owner'), orderController.updateOrder);
router.delete('/:id', requireRole('cargo_owner'), orderController.deleteOrder);
router.post('/:id/accept', requireRole('driver'), orderController.acceptOrder);
router.post('/:id/complete', requireRole('driver'), orderController.completeOrder);
router.post('/:id/review', requireRole('cargo_owner'), orderController.reviewDriver);

module.exports = router;
