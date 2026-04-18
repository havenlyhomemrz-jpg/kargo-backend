const { run, get, all } = require('../db');

function normalizeExpense(row) {
  if (!row) {
    return null;
  }

  return {
    ...row,
    amount: Number(row.amount),
  };
}

async function createExpense(expenseData) {
  const result = await run(
    `INSERT INTO expenses (title, amount, description, category, updatedAt)
     VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [
      expenseData.title,
      Number(expenseData.amount),
      expenseData.description || null,
      expenseData.category || null,
    ]
  );

  return getExpenseById(result.lastID);
}

async function getExpenseById(id) {
  const row = await get('SELECT * FROM expenses WHERE id = ?', [id]);
  return normalizeExpense(row);
}

async function getAllExpenses() {
  const rows = await all('SELECT * FROM expenses ORDER BY id DESC');
  return rows.map(normalizeExpense);
}

async function updateExpense(id, expenseData) {
  await run(
    `UPDATE expenses
     SET title = ?, amount = ?, description = ?, category = ?, updatedAt = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [
      expenseData.title,
      Number(expenseData.amount),
      expenseData.description || null,
      expenseData.category || null,
      id,
    ]
  );

  return getExpenseById(id);
}

async function deleteExpense(id) {
  const result = await run('DELETE FROM expenses WHERE id = ?', [id]);
  return result.changes > 0;
}

module.exports = {
  createExpense,
  getExpenseById,
  getAllExpenses,
  updateExpense,
  deleteExpense,
};