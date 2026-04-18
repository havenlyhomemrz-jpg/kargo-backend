const { createStore: createStoreModel, findStoreByName, findStoreByCode, findStoreById, getAllStores, deleteStore } = require('../models/storeModel');
const { createCourier: createCourierModel, findCourierByName, findCourierByCode, findCourierById, getAllCouriers, deleteCourier } = require('../models/courierModel');
const { approveOrder: approveOrderModel, getOrderById, getPendingOrders, assignToCourier, reassignOrder, unassignOrder, cancelOrder, getAllOrders, getOrdersByCourierId, getOrdersByStoreId, updateOrderStatus: updateOrderStatusModel } = require('../models/orderModel');
const { cancelPayment } = require('../models/paymentModel');

function isCancelledStatus(status) {
  return status === 'cancelled' || status === 'legv_edildi';
}

function getAdminDeleteCode() {
  return typeof process.env.ADMIN_DELETE_CODE === 'string'
    ? process.env.ADMIN_DELETE_CODE.trim()
    : '';
}

async function attachCourierDetails(order) {
  if (!order) {
    return order;
  }

  const courier = order.courierId ? await findCourierById(order.courierId) : null;
  return {
    ...order,
    courierName: courier ? courier.name : null
  };
}

function getDashboard(req, res) {
  res.json({ message: 'Admin paneli', user: req.user });
}

function getProvidedAdminCode(req) {
  if (!req?.body || typeof req.body !== 'object') {
    return '';
  }

  const rawValue = req.body.code ?? req.body.adminCode ?? req.body.adminPassword ?? '';
  return typeof rawValue === 'string' ? rawValue.trim() : '';
}

function verifyCurrentAdminCode(adminCode) {
  const configuredCode = getAdminDeleteCode();
  if (!configuredCode || typeof adminCode !== 'string' || !adminCode.trim()) {
    return false;
  }

  return configuredCode === adminCode.trim();
}

async function requireValidAdminCode(req, res) {
  const configuredCode = getAdminDeleteCode();
  if (!configuredCode) {
    res.status(500).json({
      success: false,
      message: 'ADMIN_DELETE_CODE konfiqurasiya edilməyib'
    });
    return null;
  }

  const adminCode = getProvidedAdminCode(req);
  const isValidAdminCode = verifyCurrentAdminCode(adminCode);

  if (!isValidAdminCode) {
    res.status(401).json({ success: false, message: 'Admin kodu yanlışdır' });
    return null;
  }

  return adminCode;
}

async function verifyAdminCodeController(req, res) {
  try {
    const adminCode = await requireValidAdminCode(req, res);
    if (!adminCode) {
      return;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Verify admin code error:', error);
    res.status(500).json({
      success: false,
      message: 'Admin kodu yoxlanılarkən xəta baş verdi'
    });
  }
}

async function getPendingOrdersController(req, res) {
  try {
    const orders = await getPendingOrders();
    const ordersWithCouriers = await Promise.all(orders.map(attachCourierDetails));
    res.json({ orders: ordersWithCouriers });
  } catch (error) {
    console.error('Get pending orders error:', error);
    res.status(500).json({ error: 'Gözləyən sifarişlər alınarkən xəta baş verdi' });
  }
}

async function createStore(req, res) {
  const { name, code, phone, address, metroPrice, outsidePrice } = req.body;

  if (!name || !code || !phone || !address || !metroPrice || !outsidePrice) {
    return res.status(400).json({ error: 'Bütün sahələr doldurulmalıdır' });
  }

  const metro = parseFloat(metroPrice);
  const outside = parseFloat(outsidePrice);
  if (Number.isNaN(metro) || Number.isNaN(outside) || metro < 0 || outside < 0) {
    return res.status(400).json({ error: 'Qiymətlər müsbət rəqəm olmalıdır' });
  }

  try {
    const existingName = await findStoreByName(name);
    if (existingName) {
      return res.status(409).json({ error: 'Bu adla mağaza artıq mövcuddur' });
    }

    const existingCode = await findStoreByCode(code);
    if (existingCode) {
      return res.status(409).json({ error: 'Bu kodla mağaza artıq mövcuddur' });
    }

    const newStore = await createStoreModel({
      name,
      code,
      phone,
      address,
      metroPrice: metro,
      outsidePrice: outside
    });

    res.status(201).json({
      message: 'Mağaza uğurla yaradıldı',
      store: newStore
    });
  } catch (error) {
    console.error('Store creation error:', error);
    res.status(500).json({ error: 'Mağaza yaradılarkən xəta baş verdi' });
  }
}

async function createCourier(req, res) {
  const { name, code, phone } = req.body;

  if (!name || !code || !phone) {
    return res.status(400).json({ error: 'Bütün sahələr doldurulmalıdır' });
  }

  try {
    const existingName = await findCourierByName(name);
    if (existingName) {
      return res.status(409).json({ error: 'Bu adla kuryer artıq mövcuddur' });
    }

    const existingCode = await findCourierByCode(code);
    if (existingCode) {
      return res.status(409).json({ error: 'Bu kodla kuryer artıq mövcuddur' });
    }

    const newCourier = await createCourierModel({
      name,
      code,
      phone
    });

    res.status(201).json({
      message: 'Kuryer uğurla yaradıldı',
      courier: newCourier
    });
  } catch (error) {
    console.error('Courier creation error:', error);
    res.status(500).json({ error: 'Kuryer yaradılarkən xəta baş verdi' });
  }
}

async function approveOrder(req, res) {
  const { id } = req.params;

  try {
    const existingOrder = await getOrderById(id);
    if (!existingOrder) {
      return res.status(404).json({ error: 'Sifariş tapılmadı' });
    }

    const order = await approveOrderModel(id);
    res.json({
      message: 'Sifariş təsdiqləndi',
      order
    });
  } catch (error) {
    console.error('Order approval error:', error);
    res.status(500).json({ error: 'Sifariş təsdiqlənərkən xəta baş verdi' });
  }
}

async function assignOrderToCourier(req, res) {
  const { id } = req.params;
  const { courierId } = req.body;

  if (!courierId) {
    return res.status(400).json({ error: 'Kuryer ID məcburidir' });
  }

  try {
    const courier = await findCourierById(courierId);
    if (!courier) {
      return res.status(404).json({ error: 'Kuryer tapılmadı' });
    }

    const existingOrder = await getOrderById(id);
    if (!existingOrder) {
      return res.status(404).json({ error: 'Sifariş tapılmadı' });
    }

    const order = await assignToCourier(id, courierId);
    res.json({
      message: 'Sifariş kuryerə təyin edildi',
      order: await attachCourierDetails(order)
    });
  } catch (error) {
    console.error('Order assignment error:', error);
    res.status(500).json({ error: 'Sifariş təyin edilərkən xəta baş verdi' });
  }
}

async function reassignOrderController(req, res) {
  const { id } = req.params;
  const { courierId } = req.body;

  if (!courierId) {
    return res.status(400).json({ error: 'Kuryer ID məcburidir' });
  }

  try {
    const courier = await findCourierById(courierId);
    if (!courier) {
      return res.status(404).json({ error: 'Kuryer tapılmadı' });
    }

    const existingOrder = await getOrderById(id);
    if (!existingOrder) {
      return res.status(404).json({ error: 'Sifariş tapılmadı' });
    }

    const order = await reassignOrder(id, courierId);
    res.json({
      message: 'Sifariş başqa kuryerə təyin edildi',
      order: await attachCourierDetails(order)
    });
  } catch (error) {
    console.error('Order reassignment error:', error);
    res.status(500).json({ error: 'Sifariş yenidən təyin edilərkən xəta baş verdi' });
  }
}

async function unassignOrderController(req, res) {
  const { id } = req.params;

  try {
    const adminCode = await requireValidAdminCode(req, res);
    if (!adminCode) {
      return;
    }

    const existingOrder = await getOrderById(id);
    if (!existingOrder) {
      return res.status(404).json({ error: 'Sifariş tapılmadı' });
    }

    const order = await unassignOrder(id);
    res.json({
      message: 'Sifariş kuryerdən geri alındı',
      order: await attachCourierDetails(order)
    });
  } catch (error) {
    console.error('Order unassignment error:', error);
    res.status(500).json({ error: 'Sifariş geri alınarkən xəta baş verdi' });
  }
}

async function getAllCouriersController(req, res) {
  try {
    const [courierRows, orders] = await Promise.all([getAllCouriers(), getAllOrders()]);
    const couriers = courierRows.map(({ id, name, phone, code, password }) => ({
      id,
      name,
      phone,
      code,
      password,
      orderCount: orders.filter((order) => String(order?.courierId) === String(id)).length
    }));
    res.json({ couriers });
  } catch (error) {
    console.error('Get couriers error:', error);
    res.status(500).json({ error: 'Kuryerlər alınarkən xəta baş verdi' });
  }
}

async function getAllOrdersController(req, res) {
  try {
    const orders = await getAllOrders();
    const ordersWithCouriers = await Promise.all(orders.map(attachCourierDetails));
    res.json({ orders: ordersWithCouriers });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ error: 'Bütün sifarişlər alınarkən xəta baş verdi' });
  }
}

async function getAllStoresController(req, res) {
  try {
    const [storeRows, orders] = await Promise.all([getAllStores(), getAllOrders()]);
    const stores = storeRows.map((store) => ({
      ...store,
      orderCount: orders.filter((order) => String(order?.storeId) === String(store?.id)).length
    }));
    res.json({ stores });
  } catch (error) {
    console.error('Get all stores error:', error);
    res.status(500).json({ error: 'Bütün mağazalar alınarkən xəta baş verdi' });
  }
}

async function deleteCourierController(req, res) {
  const { id } = req.params;
  try {
    const adminCode = await requireValidAdminCode(req, res);
    if (!adminCode) {
      return;
    }

    const courier = await findCourierById(id);
    if (!courier) {
      return res.status(404).json({ error: 'Kuryer tapılmadı' });
    }

    const activeOrders = (await getOrdersByCourierId(id)).filter(
      (order) => !['delivered', 'cancelled'].includes(order.status) && !isCancelledStatus(order.status)
    );

    if (activeOrders.length > 0) {
      return res.status(400).json({ error: 'Bu kuryerin aktiv sifarişləri var!' });
    }

    await deleteCourier(id);
    res.json({ message: 'Kuryer uğurla silindi' });
  } catch (error) {
    console.error('Delete courier error:', error);
    res.status(500).json({ error: 'Kuryer silinərkən xəta baş verdi' });
  }
}

async function deleteStoreController(req, res) {
  const { id } = req.params;
  try {
    const adminCode = await requireValidAdminCode(req, res);
    if (!adminCode) {
      return;
    }

    const store = await findStoreById(id);
    if (!store) {
      return res.status(404).json({ error: 'Mağaza tapılmadı' });
    }

    const relatedOrders = await getOrdersByStoreId(id);
    if (relatedOrders.length > 0) {
      return res.status(400).json({ error: 'Bu mağazanın sifarişləri var!' });
    }

    await deleteStore(id);
    res.json({ message: 'Mağaza uğurla silindi' });
  } catch (error) {
    console.error('Delete store error:', error);
    res.status(500).json({ error: 'Mağaza silinərkən xəta baş verdi' });
  }
}

async function updateOrderStatusController(req, res) {
  const { id } = req.params;
  const { status, cancelReason } = req.body;
  const userId = req.user.sub;
  const validStatuses = ['pending', 'approved', 'delivered', 'cancelled', 'legv_edildi'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Yanlış status' });
  }

  try {
    const order = await getOrderById(id);
    if (!order) {
      return res.status(404).json({ error: 'Sifariş tapılmadı' });
    }

    if (req.user.role === 'courier' && String(order.courierId) !== String(userId)) {
      return res.status(403).json({ error: 'Bu sifarişə icazəniz yoxdur' });
    }

    const normalizedStatus = isCancelledStatus(status) ? 'cancelled' : status;
    const sanitizedCancelReason = typeof cancelReason === 'string' ? cancelReason.trim() : '';
    if (isCancelledStatus(normalizedStatus) && !sanitizedCancelReason) {
      return res.status(400).json({ error: 'Ləğv səbəbi tələb olunur' });
    }

    const updatedOrder = await updateOrderStatusModel(
      id,
      normalizedStatus,
      isCancelledStatus(normalizedStatus) ? sanitizedCancelReason : null,
      isCancelledStatus(normalizedStatus)
        ? (req.user.role === 'courier' ? 'courier' : 'admin')
        : null
    );

    res.json({
      message: 'Status yeniləndi',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Status yenilənərkən xəta baş verdi' });
  }
}

async function cancelPaymentController(req, res) {
  const { id } = req.params;

  try {
    const adminCode = await requireValidAdminCode(req, res);
    if (!adminCode) {
      return;
    }

    const payment = await cancelPayment(id);
    if (!payment) {
      return res.status(404).json({ error: 'Ödəniş tapılmadı və ya artıq ləğv edilmişdir' });
    }

    res.json({
      message: 'Ödəniş uğurla ləğv edildi',
      payment
    });
  } catch (error) {
    console.error('Cancel payment error:', error);
    res.status(500).json({ error: 'Ödəniş ləğv edilərkən xəta baş verdi' });
  }
}

async function cancelOrderController(req, res) {
  const { id } = req.params;
  const { cancelReason } = req.body;

  const sanitizedCancelReason = typeof cancelReason === 'string' ? cancelReason.trim() : '';
  if (!sanitizedCancelReason) {
    return res.status(400).json({ error: 'Ləğv səbəbi tələb olunur' });
  }

  try {
    const adminCode = await requireValidAdminCode(req, res);
    if (!adminCode) {
      return;
    }

    const order = await cancelOrder(id, sanitizedCancelReason, 'admin');
    if (!order) {
      return res.status(404).json({ error: 'Sifariş tapılmadı və ya artıq ləğv edilmişdir' });
    }

    res.json({
      message: 'Sifariş uğurla ləğv edildi',
      order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ error: 'Sifariş ləğv edilərkən xəta baş verdi' });
  }
}

module.exports = {
  getDashboard,
  verifyAdminCodeController,
  createStore,
  createCourier,
  getPendingOrdersController,
  approveOrder,
  assignOrderToCourier,
  reassignOrderController,
  unassignOrderController,
  getAllCouriersController,
  getAllOrdersController,
  getAllStoresController,
  deleteCourierController,
  deleteStoreController,
  updateOrderStatusController,
  cancelPaymentController,
  cancelOrderController
};