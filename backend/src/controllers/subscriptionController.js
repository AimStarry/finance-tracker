const db = require('../config/database');

// GET /api/subscriptions
const getAll = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT s.subscription_id, s.user_id, s.merchant_id, s.name,
             s.amount, s.billing_cycle, s.next_billing_date, s.is_active,
             s.currency, s.status, s.notes,
             m.name    AS merchant_name,
             m.website AS merchant_website,
             c.category_id, c.name AS category_name, c.icon AS category_icon
      FROM subscriptions s
      LEFT JOIN merchants  m ON s.merchant_id = m.merchant_id
      LEFT JOIN categories c ON m.category_id = c.category_id
      WHERE s.user_id = $1
      ORDER BY s.next_billing_date ASC NULLS LAST
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) { next(err); }
};

// POST /api/subscriptions
// Accepts merchant_name (string) or merchant_id (int). Auto-creates merchant if name given.
const create = async (req, res, next) => {
  try {
    const { merchant_name, merchant_id, name, amount, billing_cycle, next_billing_date, notes } = req.body;
    if (!amount) return res.status(400).json({ error: 'amount is required' });

    let resolvedMerchantId = merchant_id || null;
    let resolvedName = name;

    if (!resolvedMerchantId && merchant_name && merchant_name.trim()) {
      const existing = await db.query(
        'SELECT merchant_id FROM merchants WHERE LOWER(name) = LOWER($1)', [merchant_name.trim()]
      );
      if (existing.rows.length > 0) {
        resolvedMerchantId = existing.rows[0].merchant_id;
      } else {
        const newM = await db.query(
          'INSERT INTO merchants (name, is_subscription) VALUES ($1, true) RETURNING merchant_id',
          [merchant_name.trim()]
        );
        resolvedMerchantId = newM.rows[0].merchant_id;
      }
      if (!resolvedName) resolvedName = merchant_name.trim();
    }

    const result = await db.query(`
      INSERT INTO subscriptions (user_id, merchant_id, name, amount, billing_cycle, next_billing_date, is_active, status, notes)
      VALUES ($1, $2, $3, $4, $5, $6, true, 'active', $7)
      RETURNING *
    `, [req.user.id, resolvedMerchantId, resolvedName, amount,
        billing_cycle || 'monthly', next_billing_date || null, notes || null]);

    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};

// PUT /api/subscriptions/:id
const update = async (req, res, next) => {
  try {
    const { amount, billing_cycle, next_billing_date, is_active, notes } = req.body;
    const status = is_active === false ? 'paused' : is_active === true ? 'active' : undefined;

    const result = await db.query(`
      UPDATE subscriptions SET
        amount            = COALESCE($1, amount),
        billing_cycle     = COALESCE($2, billing_cycle),
        next_billing_date = COALESCE($3, next_billing_date),
        is_active         = COALESCE($4, is_active),
        status            = COALESCE($5, status),
        notes             = COALESCE($6, notes),
        updated_at        = NOW()
      WHERE subscription_id = $7 AND user_id = $8
      RETURNING *
    `, [amount, billing_cycle, next_billing_date, is_active, status, notes, req.params.id, req.user.id]);

    if (!result.rows[0]) return res.status(404).json({ error: 'Subscription not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

// DELETE /api/subscriptions/:id
const remove = async (req, res, next) => {
  try {
    const result = await db.query(
      'DELETE FROM subscriptions WHERE subscription_id = $1 AND user_id = $2 RETURNING subscription_id',
      [req.params.id, req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Subscription not found' });
    res.json({ message: 'Subscription deleted' });
  } catch (err) { next(err); }
};

module.exports = { getAll, create, update, remove };
