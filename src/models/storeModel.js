const { run, get, all } = require('../db');

function normalizeStore(row) {
  if (!row) {
    return null;
  }

  return {
    ...row,
    metroPrice: Number(row.metroPrice),
    outsidePrice: Number(row.outsidePrice),
    balance: Number(row.balance),
  };
}

async function loginStore(name, code) {
  const row = await get('SELECT * FROM shops WHERE name = ? AND code = ?', [name, code]);
  return normalizeStore(row);
}

async function findStoreById(id) {
  const row = await get('SELECT * FROM shops WHERE id = ?', [id]);
  return normalizeStore(row);
}

async function findStoreByNameAndCode(name, code) {
  const row = await get('SELECT * FROM shops WHERE name = ? AND code = ?', [name, code]);
  return normalizeStore(row);
}

async function findStoreByName(name) {
  const row = await get('SELECT * FROM shops WHERE name = ?', [name]);
  return normalizeStore(row);
}

async function findStoreByCode(code) {
  const row = await get('SELECT * FROM shops WHERE code = ?', [code]);
  return normalizeStore(row);
}

async function createStore(storeData) {
  const result = await run(
    `INSERT INTO shops (name, code, phone, address, metroPrice, outsidePrice, balance, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [
      storeData.name,
      storeData.code,
      storeData.phone,
      storeData.address,
      Number(storeData.metroPrice),
      Number(storeData.outsidePrice),
      Number(storeData.balance || 0),
    ]
  );

  return findStoreById(result.lastID);
}

async function updateStore(id, storeData) {
  await run(
    `UPDATE shops
     SET name = ?, code = ?, phone = ?, address = ?, metroPrice = ?, outsidePrice = ?, balance = ?, updatedAt = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [
      storeData.name,
      storeData.code,
      storeData.phone,
      storeData.address,
      Number(storeData.metroPrice),
      Number(storeData.outsidePrice),
      Number(storeData.balance || 0),
      id,
    ]
  );

  return findStoreById(id);
}

async function updateStoreBalance(id, amount) {
  await run(
    `UPDATE shops
     SET balance = balance + ?, updatedAt = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [Number(amount), id]
  );

  return findStoreById(id);
}

async function deleteStore(id) {
  const result = await run('DELETE FROM shops WHERE id = ?', [id]);
  return result.changes > 0;
}

async function getAllStores() {
  const rows = await all('SELECT * FROM shops ORDER BY id ASC');
  return rows.map(normalizeStore);
}

module.exports = {
  loginStore,
  findStoreById,
  findStoreByNameAndCode,
  findStoreByName,
  findStoreByCode,
  createStore,
  updateStore,
  updateStoreBalance,
  deleteStore,
  getAllStores,
};