const { getApprovedOrders, getOrdersByCourierId, getCourierPanelOrders, updateOrderStatus: updateOrderStatusModel, getOrderById } = require('../models/orderModel');

function isCancelledStatus(status) {
  return status === 'cancelled' || status === 'legv_edildi';
}

function removePrice(order) {
  const { price, ...orderWithoutPrice } = order;
  return orderWithoutPrice;
}

function getCourierDashboard(req, res) {
  res.json({ message: 'Kuryer paneli', user: req.user });
}

async function getAvailableOrders(req, res) {
  try {
    const orders = await getApprovedOrders();
    const ordersWithoutPrice = orders.map(removePrice);
    res.json({ orders: ordersWithoutPrice });
  } catch (error) {
    console.error('Get available orders error:', error);
    res.status(500).json({ error: 'Sifarişlər alınarkən xəta baş verdi' });
  }
}

async function takeOrder(req, res) {
  const { id } = req.params;
  const courierId = req.user.sub;

  try {
    const order = await getOrderById(id);
    if (!order) {
      return res.status(404).json({ error: 'Sifariş tapılmadı' });
    }

    if (order.status !== 'pending' && order.status !== 'approved') {
      return res.status(400).json({ error: 'Sifariş artıq götürülüb' });
    }

    const updatedOrder = await updateOrderStatusModel(id, 'kuryerde', null, null, courierId);

    res.json({
      message: 'Sifariş götürüldü',
      order: removePrice(updatedOrder)
    });
  } catch (error) {
    console.error('Take order error:', error);
    res.status(500).json({ error: 'Sifariş götürülərkən xəta baş verdi' });
  }
}

async function updateOrderStatus(req, res) {
  const { id } = req.params;
  const { status, cancelReason } = req.body;
  const courierId = req.user.sub;

  // Allow courier to set pickup/in-transit, delivery and cancel states.
  const validStatuses = ['approved', 'goturuldu', 'picked', 'picked_up', 'assigned', 'yoldadir', 'kuryerde', 'delivered', 'cancelled', 'legv_edildi'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Yanlış status' });
  }

  try {
    const order = await getOrderById(id);
    if (!order) {
      return res.status(404).json({ error: 'Sifariş tapılmadı' });
    }

    const isPickupTransition = status === 'picked_up' || status === 'assigned' || status === 'picked' || status === 'goturuldu' || status === 'kuryerde';

    // Compare as strings to handle type mismatches
    if (order.courierId != null && String(order.courierId) !== String(courierId)) {
      return res.status(403).json({ error: 'Bu sifarişə icazəniz yoxdur' });
    }

    const normalizedStatus = isCancelledStatus(status) ? 'cancelled' : status;
    const sanitizedCancelReason = typeof cancelReason === 'string' ? cancelReason.trim() : '';
    if (isCancelledStatus(normalizedStatus) && !sanitizedCancelReason) {
      return res.status(400).json({ error: 'Ləğv səbəbi tələb olunur' });
    }

    const updatedOrder = await updateOrderStatusModel(
      id,
      status,
      isCancelledStatus(normalizedStatus) ? sanitizedCancelReason : null,
      isCancelledStatus(normalizedStatus) ? 'courier' : null,
      isPickupTransition ? courierId : undefined
    );

    res.json({
      message: 'Status yeniləndi',
      order: removePrice(updatedOrder)
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Status yenilənərkən xəta baş verdi' });
  }
}

async function getCourierOrders(req, res) {
  const courierId = req.user.sub;

  try {
    const allCourierOrders = await getCourierPanelOrders(courierId);
    const orders = allCourierOrders.map(removePrice);
    res.json({ orders });
  } catch (error) {
    console.error('Get courier orders error:', error);
    res.status(500).json({ error: 'Sifarişlər alınarkən xəta baş verdi' });
  }
}

module.exports = {
  getCourierDashboard,
  getAvailableOrders,
  takeOrder,
  updateOrderStatus,
  getCourierOrders
};
