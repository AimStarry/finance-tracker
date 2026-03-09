const db = require('../config/database');

// GET /api/merchants — list all merchants (global, not per user)
const getAll = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT m.merchant_id, m.name, m.website, m.is_subscription,
             m.category_id,
             c.name AS category_name,
             c.icon AS category_icon
      FROM merchants m
      LEFT JOIN categories c ON m.category_id = c.category_id
      ORDER BY m.name ASC
    `);
    res.json(result.rows);
  } catch (err) { next(err); }
};

// GET /api/merchants/categories — list all categories
const getCategories = async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT category_id, name, description, icon FROM categories ORDER BY name ASC'
    );
    res.json(result.rows);
  } catch (err) { next(err); }
};

// POST /api/merchants — create a new merchant
const create = async (req, res, next) => {
  try {
    const { name, category_id, website, is_subscription } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const result = await db.query(`
      INSERT INTO merchants (name, category_id, website, is_subscription)
      VALUES ($1, $2, $3, $4) RETURNING *
    `, [name, category_id || null, website || null, is_subscription || false]);
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};

module.exports = { getAll, getCategories, create };
