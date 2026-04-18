const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const databasePath = path.resolve(__dirname, '..', 'database.sqlite');
const db = new Database(databasePath);
const ADMIN_USERNAME = 'rskuryer';
const ADMIN_PASSWORD = 'uncharted0833';
const ADMIN_ROLE = 'admin';
const BCRYPT_SALT_ROUNDS = 10;

function execute(statement, method, params = []) {
  if (Array.isArray(params)) {
    return statement[method](...params);
  }

  if (params && typeof params === 'object') {
    return statement[method](params);
  }

  if (params === undefined || params === null) {
    return statement[method]();
  }

  return statement[method](params);
}

function run(sql, params = []) {
  return Promise.resolve().then(() => {
    const statement = db.prepare(sql);
    const result = execute(statement, 'run', params);

    return {
      lastID: Number(result.lastInsertRowid),
      changes: result.changes,
    };
  });
}

function get(sql, params = []) {
  return Promise.resolve().then(() => {
    const statement = db.prepare(sql);
    const row = execute(statement, 'get', params);
    return row || null;
  });
}

function all(sql, params = []) {
  return Promise.resolve().then(() => {
    const statement = db.prepare(sql);
    const rows = execute(statement, 'all', params);
    return rows || [];
  });
}

async function initDatabase() {
  await run('PRAGMA foreign_keys = ON');
  await run('PRAGMA journal_mode = WAL');

  await run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      code TEXT NOT NULL,
      role TEXT NOT NULL,
      username TEXT,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`
  );

  await run(
    `CREATE TABLE IF NOT EXISTS shops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      code TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      metroPrice REAL NOT NULL,
      outsidePrice REAL NOT NULL,
      balance REAL NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`
  );

  await run(
    `CREATE TABLE IF NOT EXISTS couriers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      code TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL,
      balance REAL NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`
  );

  await run(
    `CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customerName TEXT,
      customerPhone TEXT NOT NULL,
      phone TEXT NOT NULL,
      time TEXT NOT NULL,
      deliveryType TEXT NOT NULL,
      metro TEXT,
      metroName TEXT,
      address TEXT,
      price REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      storeId INTEGER NOT NULL,
      storeName TEXT,
      storePhone TEXT,
      storeAddress TEXT,
      courierId INTEGER,
      cancelReason TEXT,
      cancelledBy TEXT,
      isCountedInEarnings INTEGER NOT NULL DEFAULT 1,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (storeId) REFERENCES shops(id) ON DELETE CASCADE,
      FOREIGN KEY (courierId) REFERENCES couriers(id) ON DELETE SET NULL
    )`
  );

  await run(
    `CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      storeId INTEGER NOT NULL,
      amount REAL NOT NULL,
      note TEXT,
      file TEXT,
      receiptUrl TEXT,
      receiptName TEXT,
      receiptType TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (storeId) REFERENCES shops(id) ON DELETE CASCADE
    )`
  );

  await run(
    `CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT,
      category TEXT,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`
  );

  const existingAdmin = await get(
    `SELECT id
     FROM users
     WHERE role = ?
     LIMIT 1`,
    [ADMIN_ROLE]
  );

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, BCRYPT_SALT_ROUNDS);

    await run(
      `INSERT INTO users (name, code, role, username, updatedAt)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [ADMIN_USERNAME, passwordHash, ADMIN_ROLE, ADMIN_USERNAME]
    );
  }
}

module.exports = {
  databasePath,
  run,
  get,
  all,
  initDatabase,
};