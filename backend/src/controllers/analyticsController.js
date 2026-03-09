const db = require('../config/database');

// GET /api/analytics/summary
// transactions use transaction_type ('income'/'expense'), no direct category — goes via merchants
const getSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [totalIncome, totalExpenses, monthlyIncome, monthlyExpenses, activeSubs] = await Promise.all([
      db.query(`SELECT COALESCE(SUM(amount),0) AS total FROM transactions WHERE user_id=$1 AND transaction_type='income'`, [userId]),
      db.query(`SELECT COALESCE(SUM(amount),0) AS total FROM transactions WHERE user_id=$1 AND transaction_type='expense'`, [userId]),
      db.query(`SELECT COALESCE(SUM(amount),0) AS total FROM transactions
                WHERE user_id=$1 AND transaction_type='income'
                  AND DATE_TRUNC('month', transaction_date)=DATE_TRUNC('month', CURRENT_DATE)`, [userId]),
      db.query(`SELECT COALESCE(SUM(amount),0) AS total FROM transactions
                WHERE user_id=$1 AND transaction_type='expense'
                  AND DATE_TRUNC('month', transaction_date)=DATE_TRUNC('month', CURRENT_DATE)`, [userId]),
      db.query(`SELECT COALESCE(SUM(amount),0) AS total FROM subscriptions WHERE user_id=$1 AND is_active=true`, [userId]),
    ]);

    const income   = parseFloat(totalIncome.rows[0].total);
    const expenses = parseFloat(totalExpenses.rows[0].total);
    const mIncome  = parseFloat(monthlyIncome.rows[0].total);
    const mExpenses= parseFloat(monthlyExpenses.rows[0].total);

    res.json({
      balance:                income - expenses,
      total_income:           income,
      total_expenses:         expenses,
      monthly_income:         mIncome,
      monthly_expenses:       mExpenses,
      monthly_savings:        mIncome - mExpenses,
      monthly_subscriptions:  parseFloat(activeSubs.rows[0].total),
    });
  } catch (err) { next(err); }
};

// GET /api/analytics/burn-rate
const getBurnRate = async (req, res, next) => {
  try {
    const userId     = req.user.id;
    const today      = new Date();
    const dayOfMonth = today.getDate();
    const daysInMonth= new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    const [spentRes, incomeRes] = await Promise.all([
      db.query(`SELECT COALESCE(SUM(amount),0) AS spent FROM transactions
                WHERE user_id=$1 AND transaction_type='expense'
                  AND DATE_TRUNC('month', transaction_date)=DATE_TRUNC('month', CURRENT_DATE)`, [userId]),
      db.query(`SELECT COALESCE(SUM(amount),0) AS income FROM transactions
                WHERE user_id=$1 AND transaction_type='income'
                  AND DATE_TRUNC('month', transaction_date)=DATE_TRUNC('month', CURRENT_DATE)`, [userId]),
    ]);

    const spent          = parseFloat(spentRes.rows[0].spent);
    const monthlyIncome  = parseFloat(incomeRes.rows[0].income);
    const dailyRate      = dayOfMonth > 0 ? spent / dayOfMonth : 0;
    const projected      = dailyRate * daysInMonth;

    res.json({
      spent_so_far:     spent,
      daily_burn_rate:  parseFloat(dailyRate.toFixed(2)),
      projected_monthly:parseFloat(projected.toFixed(2)),
      monthly_income:   monthlyIncome,
      remaining_days:   daysInMonth - dayOfMonth,
      day_of_month:     dayOfMonth,
      days_in_month:    daysInMonth,
      on_track:         projected <= monthlyIncome,
    });
  } catch (err) { next(err); }
};

// GET /api/analytics/trends — last 6 months income vs expense
const getTrends = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', transaction_date), 'Mon YYYY') AS month,
        DATE_TRUNC('month', transaction_date)                       AS month_date,
        SUM(CASE WHEN transaction_type='income'  THEN amount ELSE 0 END) AS income,
        SUM(CASE WHEN transaction_type='expense' THEN amount ELSE 0 END) AS expenses
      FROM transactions
      WHERE user_id=$1
        AND transaction_date >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', transaction_date)
      ORDER BY month_date ASC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) { next(err); }
};

// GET /api/analytics/by-category
// categories has no user_id — it's a global lookup table
// spending is resolved via: transactions -> merchants -> categories
const getByCategory = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT c.category_id, c.name, c.icon,
             COALESCE(SUM(t.amount), 0)  AS total,
             COUNT(t.transaction_id)     AS transaction_count
      FROM categories c
      INNER JOIN merchants m  ON m.category_id  = c.category_id
      INNER JOIN transactions t ON t.merchant_id = m.merchant_id
        AND t.user_id = $1
        AND t.transaction_type = 'expense'
        AND DATE_TRUNC('month', t.transaction_date) = DATE_TRUNC('month', CURRENT_DATE)
      GROUP BY c.category_id, c.name, c.icon
      ORDER BY total DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) { next(err); }
};

module.exports = { getSummary, getBurnRate, getTrends, getByCategory };
