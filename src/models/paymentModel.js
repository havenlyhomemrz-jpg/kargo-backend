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

function normalizePayment(row) {
  if (!row) {
    return null;
  }

  return {
    ...row,
    amount: Number(row.amount),
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
  const row = await get('SELECT * FROM payments WHERE id = ?', [paymentId]);
  return normalizePayment(row);
}

async function getPaymentsByStoreId(storeId) {
  const rows = await all('SELECT * FROM payments WHERE storeId = ? ORDER BY id DESC', [storeId]);
  return rows.map(normalizePayment);
}

async function getAllPayments() {
  const rows = await all('SELECT * FROM payments ORDER BY id DESC');
  return rows.map(normalizePayment);
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
  deletePayment,
  cancelPayment,
  approvePayment,
};
