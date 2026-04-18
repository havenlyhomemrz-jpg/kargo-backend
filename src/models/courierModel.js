const { run, get, all } = require('../db');

function normalizeCourier(row) {
  if (!row) {
    return null;
  }

  return {
    ...row,
    balance: Number(row.balance),
  };
}

async function loginCourier(name, code) {
  const row = await get('SELECT * FROM couriers WHERE name = ? AND code = ?', [name, code]);
  return normalizeCourier(row);
}

async function findCourierById(id) {
  const row = await get('SELECT * FROM couriers WHERE id = ?', [id]);
  return normalizeCourier(row);
}

async function findCourierByName(name) {
  const row = await get('SELECT * FROM couriers WHERE name = ?', [name]);
  return normalizeCourier(row);
}

async function findCourierByCode(code) {
  const row = await get('SELECT * FROM couriers WHERE code = ?', [code]);
  return normalizeCourier(row);
}

async function createCourier(courierData) {
  const result = await run(
    `INSERT INTO couriers (name, code, phone, balance, updatedAt)
     VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [courierData.name, courierData.code, courierData.phone, Number(courierData.balance || 0)]
  );

  return findCourierById(result.lastID);
}

async function updateCourier(id, courierData) {
  await run(
    `UPDATE couriers
     SET name = ?, code = ?, phone = ?, balance = ?, updatedAt = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [courierData.name, courierData.code, courierData.phone, Number(courierData.balance || 0), id]
  );

  return findCourierById(id);
}

async function updateCourierBalance(id, amount) {
  await run(
    `UPDATE couriers
     SET balance = balance + ?, updatedAt = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [Number(amount), id]
  );

  return findCourierById(id);
}

async function deleteCourier(id) {
  const result = await run('DELETE FROM couriers WHERE id = ?', [id]);
  return result.changes > 0;
}

async function getAllCouriers() {
  const rows = await all('SELECT * FROM couriers ORDER BY id ASC');
  return rows.map(normalizeCourier);
}

module.exports = {
  loginCourier,
  findCourierById,
  findCourierByName,
  findCourierByCode,
  createCourier,
  updateCourier,
  updateCourierBalance,
  deleteCourier,
  getAllCouriers,
};