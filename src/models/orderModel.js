const { run, get, all } = require('../db');

const ORDER_SELECT_COLUMNS = `
  id,
  customername AS "customerName",
  customerphone AS "customerPhone",
  phone,
  time,
  deliverytype AS "deliveryType",
  metro,
  metroname AS "metroName",
  address,
  price,
  status,
  storeid AS "storeId",
  storename AS "storeName",
  storephone AS "storePhone",
  storeaddress AS "storeAddress",
  courierid AS "courierId",
  cancelreason AS "cancelReason",
  cancelledby AS "cancelledBy",
  iscountedinearnings AS "isCountedInEarnings",
  createdat AS "createdAt",
  updatedat AS "updatedAt"
`;

function isCancelledStatus(status) {
  return status === 'cancelled' || status === 'legv_edildi';
}

function shouldCountInFinancials(status, cancelledBy) {
  if (status === 'delivered') {
    return true;
  }

  return isCancelledStatus(status) && cancelledBy === 'courier';
}

function normalizeOrder(row) {
  if (!row) {
    return null;
  }

  const priceValue = Number(row.price ?? 0);
  const rawIsCountedInEarnings = row.isCountedInEarnings;
  const normalizedIsCountedInEarnings =
    rawIsCountedInEarnings === true
    || rawIsCountedInEarnings === 1
    || rawIsCountedInEarnings === '1'
    || rawIsCountedInEarnings === 'true';

  return {
    ...row,
    price: Number.isFinite(priceValue) ? priceValue : 0,
    isCountedInEarnings: normalizedIsCountedInEarnings,
  };
}

async function createOrder(orderData) {
  const result = await run(
    `INSERT INTO orders (
      customerName,
      customerPhone,
      phone,
      time,
      deliveryType,
      metro,
      metroName,
      address,
      price,
      status,
      storeId,
      storeName,
      storePhone,
      storeAddress,
      courierId,
      cancelReason,
      cancelledBy,
      isCountedInEarnings,
      updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [
      orderData.customerName || null,
      orderData.customerPhone || orderData.phone,
      orderData.phone || orderData.customerPhone,
      orderData.time,
      orderData.deliveryType,
      orderData.metro || orderData.metroName || null,
      orderData.metroName || orderData.metro || null,
      orderData.address || null,
      Number(orderData.price),
      'pending',
      orderData.storeId,
      orderData.storeName || null,
      orderData.storePhone || null,
      orderData.storeAddress || null,
      null,
      null,
      null,
      1,
    ]
  );

  return getOrderById(result.lastID);
}

async function getOrderById(id) {
  const row = await get(
    `SELECT ${ORDER_SELECT_COLUMNS}
     FROM orders
     WHERE id = ?`,
    [id]
  );
  return normalizeOrder(row);
}

async function getOrdersByStoreId(storeId) {
  const rows = await all(
    `SELECT ${ORDER_SELECT_COLUMNS}
     FROM orders
     WHERE storeId = ?
     ORDER BY id DESC`,
    [storeId]
  );
  return rows.map(normalizeOrder);
}

async function getApprovedOrders() {
  const rows = await all(
    `SELECT ${ORDER_SELECT_COLUMNS}
     FROM orders
     WHERE status = ?
     ORDER BY id DESC`,
    ['approved']
  );
  return rows.map(normalizeOrder);
}

async function getPendingOrders() {
  const rows = await all(
    `SELECT ${ORDER_SELECT_COLUMNS}
     FROM orders
     WHERE status IN (?, ?)
     ORDER BY id DESC`,
    ['pending', 'teyin_edildi']
  );

  return rows.map(normalizeOrder);
}

async function getOrdersByCourierId(courierId) {
  const rows = await all(
    `SELECT ${ORDER_SELECT_COLUMNS}
     FROM orders
     WHERE courierId = ?
     ORDER BY id DESC`,
    [courierId]
  );
  return rows.map(normalizeOrder);
}

async function getCourierPanelOrders(courierId) {
  const rows = await all(
    `SELECT ${ORDER_SELECT_COLUMNS}
     FROM orders
     WHERE courierId = ?
     ORDER BY updatedAt DESC, createdAt DESC, id DESC`,
    [courierId]
  );

  return rows.map(normalizeOrder);
}

async function updateOrderStatus(id, status, cancelReason = null, cancelledBy = null, courierId = undefined) {
  const order = await getOrderById(id);
  if (!order) {
    return null;
  }

  const normalizedStatus = isCancelledStatus(status) ? 'cancelled' : status;
  const sanitizedReason = typeof cancelReason === 'string' ? cancelReason.trim() : '';
  const nextCancelReason = isCancelledStatus(normalizedStatus) ? sanitizedReason || order.cancelReason || null : null;
  const nextCancelledBy = isCancelledStatus(normalizedStatus) ? cancelledBy || order.cancelledBy || null : null;
  const nextCourierId = courierId !== undefined ? courierId : order.courierId;
  const isCountedInEarnings = shouldCountInFinancials(normalizedStatus, nextCancelledBy) ? 1 : 0;

  await run(
    `UPDATE orders
     SET status = ?,
         cancelReason = ?,
         cancelledBy = ?,
         courierId = ?,
         isCountedInEarnings = ?,
         updatedAt = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [normalizedStatus, nextCancelReason, nextCancelledBy, nextCourierId, isCountedInEarnings, id]
  );

  return getOrderById(id);
}

async function approveOrder(id) {
  return updateOrderStatus(id, 'approved');
}

async function assignToCourier(id, courierId) {
  await run(
    `UPDATE orders
     SET courierId = ?, status = ?, updatedAt = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [courierId, 'teyin_edildi', id]
  );

  return getOrderById(id);
}

async function reassignOrder(id, newCourierId) {
  return assignToCourier(id, newCourierId);
}

async function unassignOrder(id) {
  await run(
    `UPDATE orders
     SET courierId = NULL, status = ?, updatedAt = CURRENT_TIMESTAMP
     WHERE id = ?`,
    ['pending', id]
  );

  return getOrderById(id);
}

async function cancelOrder(id, cancelReason = null, cancelledBy = null) {
  const order = await getOrderById(id);
  if (!order || isCancelledStatus(order.status)) {
    return null;
  }

  return updateOrderStatus(id, 'cancelled', cancelReason, cancelledBy);
}

async function getAllOrders() {
  const rows = await all(
    `SELECT ${ORDER_SELECT_COLUMNS}
     FROM orders
     ORDER BY id DESC`
  );
  return rows.map(normalizeOrder);
}

module.exports = {
  createOrder,
  getOrderById,
  getOrdersByStoreId,
  getApprovedOrders,
  getPendingOrders,
  getCourierPanelOrders,
  getOrdersByCourierId,
  updateOrderStatus,
  approveOrder,
  assignToCourier,
  reassignOrder,
  unassignOrder,
  cancelOrder,
  getAllOrders,
};