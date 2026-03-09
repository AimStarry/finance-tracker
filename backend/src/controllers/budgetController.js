const db = require('../config/database');

// GET /api/budgets
const getAll = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT b.budget_id, b.user_id, b.category_id, b.name,
             b.monthly_limit, b.start_month, b.end_month,
             b.is_active, b.alert_threshold, b.created_at, b.updated_at,
             c.name AS category_name, c.icon AS category_icon,
             COALESCE(SUM(t.amount), 0) AS spent
      FROM budgets b
      LEFT JOIN categories c ON b.category_id = c.category_id
      LEFT JOIN merchants  m ON m.category_id = b.category_id
      LEFT JOIN transactions t
             ON t.merchant_id = m.merchant_id
            AND t.user_id = b.user_id
            AND t.transaction_type = 'expense'
            AND DATE_TRUNC('month', t.transaction_date) = DATE_TRUNC('month', CURRENT_DATE)
      WHERE b.user_id = $1 AND b.is_active = true
      GROUP BY b.budget_id, c.name, c.icon
      ORDER BY b.created_at DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) { next(err); }
};

// POST /api/budgets
const create = async (req, res, next) => {
  try {
    const { name, category_id, monthly_limit, start_month, end_month, alert_threshold } = req.body;
    if (!category_id || !monthly_limit || !start_month)
      return res.status(400).json({ error: 'category_id, monthly_limit and start_month are required' });

    const budgetName = name || ('Budget ' + new Date(start_month).toLocaleString('default', { month: 'long', year: 'numeric' }));

    const result = await db.query(`
      INSERT INTO budgets (user_id, name, category_id, monthly_limit, start_month, end_month, alert_threshold)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [req.user.id, budgetName, category_id, monthly_limit, start_month, end_month || null, alert_threshold || 80]);

    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};

// PUT /api/budgets/:id
const update = async (req, res, next) => {
  try {
    const { name, monthly_limit, start_month, end_month, is_active, alert_threshold } = req.body;
    const result = await db.query(`
      UPDATE budgets SET
        name            = COALESCE($1, name),
        monthly_limit   = COALESCE($2, monthly_limit),
        start_month     = COALESCE($3, start_month),
        end_month       = COALESCE($4, end_month),
        is_active       = COALESCE($5, is_active),
        alert_threshold = COALESCE($6, alert_threshold),
        updated_at      = NOW()
      WHERE budget_id = $7 AND user_id = $8
      RETURNING *
    `, [name, monthly_limit, start_month, end_month, is_active, alert_threshold, req.params.id, req.user.id]);

    if (!result.rows[0]) return res.status(404).json({ error: 'Budget not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

// DELETE /api/budgets/:id
const remove = async (req, res, next) => {
  try {
    const result = await db.query(
      'DELETE FROM budgets WHERE budget_id = $1 AND user_id = $2 RETURNING budget_id',
      [req.params.id, req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Budget not found' });
    res.json({ message: 'Budget deleted' });
  } catch (err) { next(err); }
};

module.exports = { getAll, create, update, remove };
