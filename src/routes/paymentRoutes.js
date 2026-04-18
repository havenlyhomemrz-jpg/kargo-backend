const express = require('express');
const { createPaymentController, getPaymentsByStoreIdController, getAllPaymentsController, approvePaymentController } = require('../controllers/paymentController');
const { authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', authorizeRoles('store'), createPaymentController);
router.get('/', authorizeRoles('admin'), getAllPaymentsController);
router.get('/store/:storeId', authorizeRoles('store', 'admin'), getPaymentsByStoreIdController);
router.put('/:id/approve', authorizeRoles('admin'), approvePaymentController);

module.exports = router;
