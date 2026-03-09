const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL
  ? process.env.DATABASE_URL.replace(/^postgres:\/\//, 'postgresql://')
  : null;

const pool = new Pool(
  connectionString
    ? { connectionString, ssl: { rejectUnauthorized: false } }
    : {
        host:     process.env.DB_HOST     || 'localhost',
        port:     parseInt(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME     || 'finance_tracker',
        user:     process.env.DB_USER     || 'finance_user',
        password: process.env.DB_PASSWORD || 'finance_pass',
      }
);

const query  = (text, params) => pool.query(text, params);
const getClient = () => pool.connect();

module.exports = { query, getClient };