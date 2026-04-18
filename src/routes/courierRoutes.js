const express = require('express');
const { getCourierDashboard, getAvailableOrders, takeOrder, updateOrderStatus, getCourierOrders } = require('../controllers/courierController');
const { authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();
router.use(authorizeRoles('courier'));

router.get('/', getCourierDashboard);
router.get('/orders/available', getAvailableOrders);
router.post('/orders/:id/take', takeOrder);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/orders', getCourierOrders);

module.exports = router;
