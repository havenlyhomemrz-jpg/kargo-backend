const {
  createPayment,
  getPaymentsByStoreId,
  getAllPayments,
  approvePayment,
  getStoreFinancialSummary,
  getAllStoresFinancialSummary,
} = require('../models/paymentModel');
const { findStoreById } = require('../models/storeModel');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const MIME_EXTENSION_MAP = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
  'text/plain': 'txt',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx'
};

function getAbsoluteUrl(req, value) {
  if (!value || typeof value !== 'string') {
    return null;
  }

  if (/^(data:|blob:|https?:)/i.test(value)) {
    return value;
  }

  const normalizedPath = value.startsWith('/') ? value : `/${value}`;
  return `${req.protocol}://${req.get('host')}${normalizedPath}`;
}

function normalizePaymentForResponse(req, payment) {
  const rawStatus = payment?.status;
  const normalizedStatus = rawStatus === 'approved'
    ? 'approved'
    : rawStatus === 'paid'
      ? 'approved'
      : rawStatus === 'cancelled'
        ? 'cancelled'
        : 'pending';

  const normalizedReceiptUrl = getAbsoluteUrl(
    req,
    payment?.receiptUrl || payment?.file || payment?.receipt?.receiptUrl || null
  );

  return {
    ...payment,
    status: normalizedStatus,
    receiptUrl: normalizedReceiptUrl,
    file: normalizedReceiptUrl
  };
}

function parseDataUrl(dataUrl) {
  if (typeof dataUrl !== 'string') {
    return null;
  }

  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    return null;
  }

  return {
    mimeType: match[1],
    base64Content: match[2]
  };
}

function getFileExtension(mimeType) {
  return MIME_EXTENSION_MAP[mimeType] || 'bin';
}

async function normalizeReceiptInput(req, receiptInput) {
  if (!receiptInput || typeof receiptInput !== 'object') {
    return null;
  }

  const receiptUrl = receiptInput.receiptUrl || receiptInput.url || null;
  const originalName = receiptInput.originalName || receiptInput.name || null;
  const mimeType = receiptInput.mimeType || receiptInput.type || null;

  if (!receiptUrl) {
    return null;
  }

  if (/^data:/i.test(receiptUrl)) {
    const parsedData = parseDataUrl(receiptUrl);
    if (!parsedData) {
      throw new Error('Invalid receipt data URL');
    }

    const extension = getFileExtension(parsedData.mimeType);
    const fileName = `receipt-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${extension}`;
    const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
    const outputPath = path.join(uploadsDir, fileName);

    await fs.promises.mkdir(uploadsDir, { recursive: true });
    await fs.promises.writeFile(outputPath, Buffer.from(parsedData.base64Content, 'base64'));

    return {
      receiptUrl: getAbsoluteUrl(req, `/uploads/${fileName}`),
      originalName: originalName || fileName,
      mimeType: mimeType || parsedData.mimeType
    };
  }

  return {
    receiptUrl: getAbsoluteUrl(req, receiptUrl),
    originalName,
    mimeType
  };
}

async function createPaymentController(req, res) {
  const storeId = req.user.sub;
  const { amount, note, file, receipt } = req.body;

  if (amount === undefined || amount === null || amount === '') {
    return res.status(400).json({ error: 'Ödəniş məbləği tələb olunur' });
  }

  const paymentAmount = Number(amount);
  if (Number.isNaN(paymentAmount) || paymentAmount < 0) {
    return res.status(400).json({ error: 'Ödəniş məbləği düzgün formatda olmalıdır' });
  }

  try {
    const store = await findStoreById(storeId);
    if (!store) {
      return res.status(404).json({ error: 'Mağaza tapılmadı' });
    }

    const receiptInput = receipt || (file ? { receiptUrl: file } : null);
    const normalizedReceipt = await normalizeReceiptInput(req, receiptInput);

    const payment = await createPayment({
      storeId,
      amount: paymentAmount,
      note,
      file: null,
      receipt: normalizedReceipt
    });

    res.status(201).json({ payment: normalizePaymentForResponse(req, payment) });
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ error: 'Ödəniş yaradılarkən xəta baş verdi' });
  }
}

async function getPaymentsByStoreIdController(req, res) {
  const requestedStoreId = req.params.storeId;

  if (req.user.role === 'store' && String(req.user.sub) !== String(requestedStoreId)) {
    return res.status(403).json({ error: 'Bu mağazanın ödənişlərinə baxmaq icazəniz yoxdur' });
  }

  try {
    const [payments, summary] = await Promise.all([
      getPaymentsByStoreId(requestedStoreId),
      getStoreFinancialSummary(requestedStoreId),
    ]);

    res.json({
      payments: payments.map((payment) => normalizePaymentForResponse(req, payment)),
      summary,
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Ödənişlər alınarkən xəta baş verdi' });
  }
}

async function getAllPaymentsController(req, res) {
  try {
    const requestedStoreId = req.query.storeId || req.query.store_id;
    if (requestedStoreId) {
      const [payments, summary] = await Promise.all([
        getPaymentsByStoreId(requestedStoreId),
        getStoreFinancialSummary(requestedStoreId),
      ]);

      return res.json({
        payments: payments.map((payment) => normalizePaymentForResponse(req, payment)),
        summaryByStore: [{ storeId: Number(requestedStoreId), ...summary }],
        summaryTotals: {
          totalAmount: Number(summary.totalAmount || 0),
          totalPaid: Number(summary.totalPaid || 0),
          remainingAmount: Number(summary.remainingAmount || 0),
        },
      });
    }

    const [payments, summaryByStore] = await Promise.all([
      getAllPayments(),
      getAllStoresFinancialSummary(),
    ]);

    const summaryTotals = summaryByStore.reduce(
      (accumulator, storeSummary) => ({
        totalAmount: accumulator.totalAmount + (Number(storeSummary?.totalAmount) || 0),
        totalPaid: accumulator.totalPaid + (Number(storeSummary?.totalPaid) || 0),
        remainingAmount: accumulator.remainingAmount + (Number(storeSummary?.remainingAmount) || 0),
      }),
      { totalAmount: 0, totalPaid: 0, remainingAmount: 0 }
    );

    return res.json({
      payments: payments.map((payment) => normalizePaymentForResponse(req, payment)),
      summaryByStore,
      summaryTotals,
    });
  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({ error: 'Ödənişlər alınarkən xəta baş verdi' });
  }
}

async function approvePaymentController(req, res) {
  const { id } = req.params;

  try {
    const payment = await approvePayment(id);
    if (!payment) {
      return res.status(404).json({ error: 'Ödəniş tapılmadı və ya artıq təsdiqlənib' });
    }

    return res.json({
      message: 'Ödəniş təsdiqləndi',
      payment: normalizePaymentForResponse(req, payment)
    });
  } catch (error) {
    console.error('Approve payment error:', error);
    return res.status(500).json({ error: 'Ödəniş təsdiqlənərkən xəta baş verdi' });
  }
}

module.exports = {
  createPaymentController,
  getPaymentsByStoreIdController,
  getAllPaymentsController,
  approvePaymentController
};
