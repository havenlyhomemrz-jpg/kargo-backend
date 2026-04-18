const bcrypt = require('bcryptjs');
const { run, get, all } = require('../db');

function normalizeUser(row) {
  return row || null;
}

function isBcryptHash(value) {
  return typeof value === 'string' && /^\$2[aby]\$/.test(value);
}

async function findUserByNameAndCode(name, code) {
  const row = await get(
    `SELECT id, name, code, role, username, createdAt, updatedAt
     FROM users
     WHERE name = ? AND code = ?`,
    [name, code]
  );

  return normalizeUser(row);
}

async function findUserByUsername(username) {
  const row = await get(
    `SELECT id, name, code, role, username, createdAt, updatedAt
     FROM users
     WHERE username = ?`,
    [username]
  );

  return normalizeUser(row);
}

async function findAdminByIdentifier(identifier) {
  const row = await get(
    `SELECT id, name, code, role, username, createdAt, updatedAt
     FROM users
     WHERE role = 'admin' AND (username = ? OR name = ?)
     LIMIT 1`,
    [identifier, identifier]
  );

  return normalizeUser(row);
}

async function createUser(userData) {
  const result = await run(
    `INSERT INTO users (name, code, role, username, updatedAt)
     VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [userData.name, userData.code, userData.role, userData.username || null]
  );

  return getUserById(result.lastID);
}

async function getUserById(id) {
  const row = await get(
    `SELECT id, name, code, role, username, createdAt, updatedAt
     FROM users
     WHERE id = ?`,
    [id]
  );

  return normalizeUser(row);
}

async function getAllUsers() {
  const rows = await all(
    `SELECT id, name, code, role, username, createdAt, updatedAt
     FROM users
     ORDER BY id ASC`
  );

  return rows.map(normalizeUser);
}

async function updateUser(id, userData) {
  await run(
    `UPDATE users
     SET name = ?, code = ?, role = ?, username = ?, updatedAt = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [userData.name, userData.code, userData.role, userData.username || null, id]
  );

  return getUserById(id);
}

async function deleteUser(id) {
  const result = await run('DELETE FROM users WHERE id = ?', [id]);
  return result.changes > 0;
}

async function verifyUserPassword(user, password) {
  if (!user || typeof password !== 'string') {
    return false;
  }

  if (isBcryptHash(user.code)) {
    return bcrypt.compare(password, user.code);
  }

  return user.code === password;
}

module.exports = {
  findUserByNameAndCode,
  findUserByUsername,
  findAdminByIdentifier,
  createUser,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  verifyUserPassword,
};
