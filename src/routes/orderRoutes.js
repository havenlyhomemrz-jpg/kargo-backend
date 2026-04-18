const express = require('express');
const { createOrder } = require('../controllers/storeController');
const { getPendingOrdersController, assignOrderToCourier, updateOrderStatusController } = require('../controllers/adminController');
const { authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', authorizeRoles('store'), createOrder);
router.get('/', authorizeRoles('admin'), getPendingOrdersController);
router.put('/assign/:id', authorizeRoles('admin'), assignOrderToCourier);
router.put('/status/:id', authorizeRoles('courier', 'admin'), updateOrderStatusController);

module.exports = router;
