const express = require('express');
const { getDashboard, verifyAdminCodeController, createStore, createCourier, getPendingOrdersController, approveOrder, assignOrderToCourier, reassignOrderController, unassignOrderController, getAllCouriersController, getAllOrdersController, getAllStoresController, deleteCourierController, deleteStoreController, cancelPaymentController, cancelOrderController } = require('../controllers/adminController');
const { authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();
router.use(authorizeRoles('admin'));

router.get('/', getDashboard);
router.post('/verify-code', verifyAdminCodeController);
router.post('/store/create', createStore);
router.post('/courier/create', createCourier);
router.post('/orders/:id/approve', approveOrder);
router.post('/orders/:id/assign', assignOrderToCourier);
router.post('/orders/:id/reassign', reassignOrderController);
router.post('/orders/:id/unassign', unassignOrderController);
router.post('/orders/:id/cancel', cancelOrderController);
router.post('/payments/:id/cancel', cancelPaymentController);
router.get('/orders', getAllOrdersController);
router.get('/stores', getAllStoresController);

module.exports = router;
