const db = require('../config/database');

// GET /api/transactions
const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, transaction_type, start_date, end_date, payment_method } = req.query;
    const offset = (page - 1) * limit;
    const conditions = ['t.user_id = $1'];
    const params = [req.user.id];
    let idx = 2;

    if (transaction_type) { conditions.push(`t.transaction_type = $${idx++}`); params.push(transaction_type); }
    if (payment_method)   { conditions.push(`t.payment_method = $${idx++}`);   params.push(payment_method); }
    if (start_date)       { conditions.push(`t.transaction_date >= $${idx++}`); params.push(start_date); }
    if (end_date)         { conditions.push(`t.transaction_date <= $${idx++}`); params.push(end_date); }

    const where = conditions.join(' AND ');

    const [rows, count] = await Promise.all([
      db.query(`
        SELECT t.transaction_id, t.user_id, t.merchant_id, t.category_id, t.amount,
               t.transaction_date, t.is_recurring, t.created_at, t.notes,
               t.payment_method, t.transaction_type, t.description,
               m.name  AS merchant_name,
               COALESCE(c2.category_id, c.category_id) AS resolved_category_id,
               COALESCE(c2.name, c.name)   AS category_name,
               COALESCE(c2.icon, c.icon)   AS category_icon
        FROM transactions t
        LEFT JOIN merchants  m  ON t.merchant_id  = m.merchant_id
        LEFT JOIN categories c  ON m.category_id  = c.category_id
        LEFT JOIN categories c2 ON t.category_id  = c2.category_id
        WHERE ${where}
        ORDER BY t.transaction_date DESC, t.created_at DESC
        LIMIT $${idx} OFFSET $${idx + 1}
      `, [...params, limit, offset]),
      db.query(`SELECT COUNT(*) FROM transactions t WHERE ${where}`, params),
    ]);

    res.json({
      data: rows.rows,
      pagination: {
        total: parseInt(count.rows[0].count),
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count.rows[0].count / limit),
      },
    });
  } catch (err) { next(err); }
};

// GET /api/transactions/:id
const getOne = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT t.*, m.name AS merchant_name,
             COALESCE(c2.name, c.name) AS category_name,
             COALESCE(c2.icon, c.icon) AS category_icon
      FROM transactions t
      LEFT JOIN merchants  m  ON t.merchant_id  = m.merchant_id
      LEFT JOIN categories c  ON m.category_id  = c.category_id
      LEFT JOIN categories c2 ON t.category_id  = c2.category_id
      WHERE t.transaction_id = $1 AND t.user_id = $2
    `, [req.params.id, req.user.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Transaction not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

// POST /api/transactions
// Accepts merchant_name (string) or merchant_id (int). Auto-creates merchant if name given.
const create = async (req, res, next) => {
  try {
    const { merchant_name, merchant_id, category_id, amount, transaction_type,
            transaction_date, notes, description, payment_method, is_recurring } = req.body;

    if (!amount || !transaction_type)
      return res.status(400).json({ error: 'amount and transaction_type are required' });

    let resolvedMerchantId = merchant_id || null;

    // Auto-create merchant from name if no merchant_id provided
    if (!resolvedMerchantId && merchant_name && merchant_name.trim()) {
      const existing = await db.query(
        'SELECT merchant_id FROM merchants WHERE LOWER(name) = LOWER($1)', [merchant_name.trim()]
      );
      if (existing.rows.length > 0) {
        resolvedMerchantId = existing.rows[0].merchant_id;
      } else {
        const newM = await db.query(
          'INSERT INTO merchants (name, category_id) VALUES ($1, $2) RETURNING merchant_id',
          [merchant_name.trim(), category_id || null]
        );
        resolvedMerchantId = newM.rows[0].merchant_id;
      }
    }

    const result = await db.query(`
      INSERT INTO transactions
        (user_id, merchant_id, category_id, amount, transaction_type, transaction_date,
         notes, description, payment_method, is_recurring)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [req.user.id, resolvedMerchantId, category_id || null, amount, transaction_type,
        transaction_date || new Date(), notes, description, payment_method, is_recurring || false]);

    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};

// PUT /api/transactions/:id
const update = async (req, res, next) => {
  try {
    const { merchant_name, merchant_id, category_id, amount, transaction_type,
            transaction_date, notes, description, payment_method, is_recurring } = req.body;

    let resolvedMerchantId = merchant_id;

    if (!resolvedMerchantId && merchant_name && merchant_name.trim()) {
      const existing = await db.query(
        'SELECT merchant_id FROM merchants WHERE LOWER(name) = LOWER($1)', [merchant_name.trim()]
      );
      if (existing.rows.length > 0) {
        resolvedMerchantId = existing.rows[0].merchant_id;
      } else {
        const newM = await db.query(
          'INSERT INTO merchants (name, category_id) VALUES ($1, $2) RETURNING merchant_id',
          [merchant_name.trim(), category_id || null]
        );
        resolvedMerchantId = newM.rows[0].merchant_id;
      }
    }

    const result = await db.query(`
      UPDATE transactions SET
        merchant_id      = COALESCE($1, merchant_id),
        category_id      = COALESCE($2, category_id),
        amount           = COALESCE($3, amount),
        transaction_type = COALESCE($4, transaction_type),
        transaction_date = COALESCE($5, transaction_date),
        notes            = COALESCE($6, notes),
        description      = COALESCE($7, description),
        payment_method   = COALESCE($8, payment_method),
        is_recurring     = COALESCE($9, is_recurring),
        updated_at       = NOW()
      WHERE transaction_id = $10 AND user_id = $11
      RETURNING *
    `, [resolvedMerchantId, category_id, amount, transaction_type, transaction_date,
        notes, description, payment_method, is_recurring, req.params.id, req.user.id]);

    if (!result.rows[0]) return res.status(404).json({ error: 'Transaction not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

// DELETE /api/transactions/:id
const remove = async (req, res, next) => {
  try {
    const result = await db.query(
      'DELETE FROM transactions WHERE transaction_id = $1 AND user_id = $2 RETURNING transaction_id',
      [req.params.id, req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Transaction not found' });
    res.json({ message: 'Transaction deleted' });
  } catch (err) { next(err); }
};

module.exports = { getAll, getOne, create, update, remove };
