-- Default categories (not tied to any user — global defaults)
-- These will be copied per user on registration via the backend

INSERT INTO categories (id, user_id, name, icon, color, is_default) VALUES
  (uuid_generate_v4(), NULL, 'Food & Dining',   'utensils',      '#EF4444', true),
  (uuid_generate_v4(), NULL, 'Transport',        'car',           '#3B82F6', true),
  (uuid_generate_v4(), NULL, 'Utilities',        'zap',           '#F59E0B', true),
  (uuid_generate_v4(), NULL, 'Healthcare',       'heart',         '#EC4899', true),
  (uuid_generate_v4(), NULL, 'Entertainment',    'film',          '#8B5CF6', true),
  (uuid_generate_v4(), NULL, 'Shopping',         'shopping-bag',  '#10B981', true),
  (uuid_generate_v4(), NULL, 'Education',        'book',          '#06B6D4', true),
  (uuid_generate_v4(), NULL, 'Housing',          'home',          '#6366F1', true),
  (uuid_generate_v4(), NULL, 'Salary',           'briefcase',     '#22C55E', true),
  (uuid_generate_v4(), NULL, 'Investments',      'trending-up',   '#14B8A6', true),
  (uuid_generate_v4(), NULL, 'Other',            'more-horizontal','#9CA3AF', true)
ON CONFLICT DO NOTHING;
