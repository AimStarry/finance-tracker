-- ============================================================
-- Demo Data Seed (run AFTER schema and categories)
-- Creates a demo user and sample transactions
-- ============================================================

-- Demo user (password: demo1234)
INSERT INTO users (id, email, password, full_name) VALUES
  ('00000000-0000-0000-0000-000000000001',
   'demo@financetracker.com',
   '$2b$10$rQ2fXg9HkL1mN3oP5qR7suXyZ8aB1cD2eF3gH4iJ5kL6mN7oP8qR9s',
   'Demo User')
ON CONFLICT DO NOTHING;

-- User-specific categories
INSERT INTO categories (id, user_id, name, icon, color, is_default) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Food & Dining',  'utensils',     '#EF4444', true),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Transport',      'car',          '#3B82F6', true),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Utilities',      'zap',          '#F59E0B', true),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Entertainment',  'film',         '#8B5CF6', true),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Salary',         'briefcase',    '#22C55E', true)
ON CONFLICT DO NOTHING;

-- Sample transactions (last 30 days)
INSERT INTO transactions (user_id, category_id, amount, type, description, transaction_date) VALUES
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', 5000.00, 'income',  'Monthly Salary',        CURRENT_DATE - INTERVAL '28 days'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 85.50,  'expense', 'Grocery Run',            CURRENT_DATE - INTERVAL '25 days'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 45.00,  'expense', 'Gas Station',            CURRENT_DATE - INTERVAL '22 days'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 120.00, 'expense', 'Electric Bill',          CURRENT_DATE - INTERVAL '20 days'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 32.00,  'expense', 'Restaurant Dinner',      CURRENT_DATE - INTERVAL '18 days'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 15.99,  'expense', 'Netflix Subscription',   CURRENT_DATE - INTERVAL '15 days'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 67.20,  'expense', 'Weekly Groceries',       CURRENT_DATE - INTERVAL '12 days'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 38.50,  'expense', 'Uber Rides',             CURRENT_DATE - INTERVAL '9 days'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 24.75,  'expense', 'Coffee Shop',            CURRENT_DATE - INTERVAL '5 days'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 60.00,  'expense', 'Internet Bill',          CURRENT_DATE - INTERVAL '3 days');

-- Sample subscriptions
INSERT INTO subscriptions (user_id, category_id, name, amount, billing_cycle, next_billing_date, status) VALUES
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'Netflix',        15.99, 'monthly',  CURRENT_DATE + INTERVAL '15 days', 'active'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'Spotify',        9.99,  'monthly',  CURRENT_DATE + INTERVAL '8 days',  'active'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'iCloud Storage', 2.99,  'monthly',  CURRENT_DATE + INTERVAL '21 days', 'active'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'Adobe CC',       54.99, 'monthly',  CURRENT_DATE + INTERVAL '5 days',  'active');

-- Sample budgets
INSERT INTO budgets (user_id, category_id, name, amount, period, start_date, is_active) VALUES
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Food Budget',      400.00, 'monthly', DATE_TRUNC('month', CURRENT_DATE), true),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Transport Budget', 200.00, 'monthly', DATE_TRUNC('month', CURRENT_DATE), true),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'Utilities Budget', 250.00, 'monthly', DATE_TRUNC('month', CURRENT_DATE), true),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'Entertainment',    100.00, 'monthly', DATE_TRUNC('month', CURRENT_DATE), true);
