const { createOrder: createOrderModel, getOrdersByStoreId } = require('../models/orderModel');
const { findStoreById } = require('../models/storeModel');

function getStoreDashboard(req, res) {
  res.json({ message: 'Mağaza paneli', user: req.user });
}

async function createOrder(req, res) {
  const { customerName, customerPhone, phone, time, deliveryType, metroName, address } = req.body;
  const storeId = req.user.sub; // from JWT
  const customerPhoneValue = customerPhone || phone;

  if (!customerPhoneValue || !time || !deliveryType) {
    return res.status(400).json({ error: 'Müştəri telefonu, vaxt və çatdırılma növü tələb olunur' });
  }

  const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (!timePattern.test(time)) {
    return res.status(400).json({ error: 'Vaxt HH:mm 24 saat formatında olmalıdır' });
  }

  if (deliveryType === 'metro' && !metroName) {
    return res.status(400).json({ error: 'Metro adı tələb olunur' });
  }

  if (deliveryType === 'outside' && !address) {
    return res.status(400).json({ error: 'Ünvan tələb olunur' });
  }

  try {
    const store = await findStoreById(storeId);
    if (!store) {
      return res.status(404).json({ error: 'Mağaza tapılmadı' });
    }

    const price = deliveryType === 'metro' ? store.metroPrice : store.outsidePrice;

    const newOrder = await createOrderModel({
      customerName,
      customerPhone: customerPhoneValue,
      phone: customerPhoneValue,
      time,
      deliveryType,
      metro: metroName,
      metroName,
      address,
      price,
      storeId,
      storeName: store.name,
      storePhone: store.phone,
      storeAddress: store.address
    });

    res.status(201).json({
      message: 'Sifariş uğurla yaradıldı',
      order: newOrder
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Sifariş yaradılarkən xəta baş verdi' });
  }
}

async function getStoreOrders(req, res) {
  const storeId = req.user.sub;

  try {
    const orders = await getOrdersByStoreId(storeId);
    res.json({ orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Sifarişlər alınarkən xəta baş verdi' });
  }
}

module.exports = {
  getStoreDashboard,
  createOrder,
  getStoreOrders
};
