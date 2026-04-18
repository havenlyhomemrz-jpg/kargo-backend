const express = require('express');
const { getStoreDashboard, createOrder, getStoreOrders } = require('../controllers/storeController');
const { authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();
router.use(authorizeRoles('store'));

router.get('/', getStoreDashboard);
router.post('/orders', createOrder);
router.get('/orders', getStoreOrders);

module.exports = router;
