function inferMimeTypeFromDataUrl(value) {
  if (typeof value !== 'string' || !value.startsWith('data:')) {
    return null;
  }

  const mimeType = value.slice(5, value.indexOf(';'));
  return mimeType || null;
}

function normalizeReceipt(paymentData) {
  if (paymentData.receipt && typeof paymentData.receipt === 'object') {
    return {
      receiptUrl: paymentData.receipt.receiptUrl || paymentData.receipt.url || null,
      receiptName: paymentData.receipt.originalName || paymentData.receipt.name || null,
      receiptType: paymentData.receipt.mimeType || paymentData.receipt.type || null
    };
  }

  return {
    receiptUrl: paymentData.file || null,
    receiptName: paymentData.fileName || null,
    receiptType: paymentData.fileType || inferMimeTypeFromDataUrl(paymentData.file)
  };
}

const { run, get, all } = require('../db');

const PAYMENT_SELECT_COLUMNS = `
  id,
  storeid AS "storeId",
  amount,
  note,
  file,
  receipturl AS "receiptUrl",
  receiptname AS "receiptName",
  receipttype AS "receiptType",
  status,
  createdat AS "createdAt",
  updatedat AS "updatedAt"
`;

function normalizePayment(row) {
  if (!row) {
    return null;
  }

  const amountValue = Number(row.amount ?? 0);

  return {
    ...row,
    amount: Number.isFinite(amountValue) ? amountValue : 0,
  };
}

async function createPayment(paymentData) {
  if (paymentData.storeId === undefined || paymentData.storeId === null || paymentData.storeId === '') {
    throw new Error('storeId is required for payment creation');
  }

  const receipt = normalizeReceipt(paymentData);

  const result = await run(
    `INSERT INTO payments (
      storeId,
      amount,
      note,
      file,
      receiptUrl,
      receiptName,
      receiptType,
      status,
      updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [
      paymentData.storeId,
      Number(paymentData.amount) || 0,
      paymentData.note || null,
      receipt.receiptUrl,
      receipt.receiptUrl,
      receipt.receiptName,
      receipt.receiptType,
      'pending',
    ]
  );

  return getPaymentById(result.lastID);
}

async function getPaymentById(paymentId) {
  const row = await get(
    `SELECT ${PAYMENT_SELECT_COLUMNS}
     FROM payments
     WHERE id = ?`,
    [paymentId]
  );
  return normalizePayment(row);
}

async function getPaymentsByStoreId(storeId) {
  const rows = await all(
    `SELECT ${PAYMENT_SELECT_COLUMNS}
     FROM payments
     WHERE storeId = ?
     ORDER BY id DESC`,
    [storeId]
  );
  return rows.map(normalizePayment);
}

async function getAllPayments() {
  const rows = await all(
    `SELECT ${PAYMENT_SELECT_COLUMNS}
     FROM payments
     ORDER BY id DESC`
  );
  return rows.map(normalizePayment);
}

async function getStoreFinancialSummary(storeId) {
  const row = await get(
    `SELECT
       COALESCE(order_totals.total_amount, 0) AS "totalAmount",
       COALESCE(payment_totals.total_paid, 0) AS "totalPaid",
       GREATEST(
         COALESCE(order_totals.total_amount, 0) - COALESCE(payment_totals.total_paid, 0),
         0
       ) AS "remainingAmount"
     FROM (SELECT ?::INTEGER AS store_id) requested_store
     LEFT JOIN (
       SELECT
         storeid,
         SUM(
           CASE
             WHEN status = 'cancelled' AND cancelledby = 'admin' THEN 0
             ELSE COALESCE(price, 0)
           END
         ) AS total_amount
       FROM orders
       GROUP BY storeid
     ) order_totals ON order_totals.storeid = requested_store.store_id
     LEFT JOIN (
       SELECT
         storeid,
         SUM(COALESCE(amount, 0)) AS total_paid
       FROM payments
       WHERE status = 'approved'
       GROUP BY storeid
     ) payment_totals ON payment_totals.storeid = requested_store.store_id`,
    [storeId]
  );

  return {
    totalAmount: Number(row?.totalAmount ?? 0),
    totalPaid: Number(row?.totalPaid ?? 0),
    remainingAmount: Number(row?.remainingAmount ?? 0),
  };
}

async function getAllStoresFinancialSummary() {
  const rows = await all(
    `SELECT
       shops.id AS "storeId",
       COALESCE(order_totals.total_amount, 0) AS "totalAmount",
       COALESCE(payment_totals.total_paid, 0) AS "totalPaid",
       GREATEST(
         COALESCE(order_totals.total_amount, 0) - COALESCE(payment_totals.total_paid, 0),
         0
       ) AS "remainingAmount"
     FROM shops
     LEFT JOIN (
       SELECT
         storeid,
         SUM(
           CASE
             WHEN status = 'cancelled' AND cancelledby = 'admin' THEN 0
             ELSE COALESCE(price, 0)
           END
         ) AS total_amount
       FROM orders
       GROUP BY storeid
     ) order_totals ON order_totals.storeid = shops.id
     LEFT JOIN (
       SELECT
         storeid,
         SUM(COALESCE(amount, 0)) AS total_paid
       FROM payments
       WHERE status = 'approved'
       GROUP BY storeid
     ) payment_totals ON payment_totals.storeid = shops.id
     ORDER BY shops.id ASC`
  );

  return rows.map((row) => ({
    storeId: Number(row?.storeId),
    totalAmount: Number(row?.totalAmount ?? 0),
    totalPaid: Number(row?.totalPaid ?? 0),
    remainingAmount: Number(row?.remainingAmount ?? 0),
  }));
}

async function deletePayment(paymentId) {
  const payment = await getPaymentById(paymentId);
  if (!payment) {
    return null;
  }

  await run('DELETE FROM payments WHERE id = ?', [paymentId]);
  return payment;
}

async function cancelPayment(paymentId) {
  const payment = await getPaymentById(paymentId);
  if (!payment || payment.status === 'cancelled') {
    return null;
  }

  await run(
    `UPDATE payments
     SET status = ?, updatedAt = CURRENT_TIMESTAMP
     WHERE id = ?`,
    ['cancelled', paymentId]
  );

  return getPaymentById(paymentId);
}

async function approvePayment(paymentId) {
  const payment = await getPaymentById(paymentId);
  if (!payment || payment.status !== 'pending') {
    return null;
  }

  await run(
    `UPDATE payments
     SET status = ?, updatedAt = CURRENT_TIMESTAMP
     WHERE id = ?`,
    ['approved', paymentId]
  );

  return getPaymentById(paymentId);
}

module.exports = {
  createPayment,
  getPaymentById,
  getPaymentsByStoreId,
  getAllPayments,
  getStoreFinancialSummary,
  getAllStoresFinancialSummary,
  deletePayment,
  cancelPayment,
  approvePayment,
};
