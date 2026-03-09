export interface User {
  user_id: number;
  email: string;
  full_name: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  category_id: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface Merchant {
  merchant_id: number;
  name: string;
  category_id?: number;
  website?: string;
  is_subscription: boolean;
  category_name?: string;
  category_icon?: string;
}

export interface Transaction {
  transaction_id: number;
  user_id: number;
  merchant_id?: number;
  category_id?: number;
  amount: number;
  transaction_date: string;
  is_recurring: boolean;
  created_at: string;
  updated_at?: string;
  notes?: string;
  description?: string;
  payment_method?: string;
  transaction_type: 'income' | 'expense';
  // joined fields
  merchant_name?: string;
  category_name?: string;
  category_icon?: string;
}

export interface Budget {
  budget_id: number;
  user_id: number;
  category_id: number;
  name: string;
  monthly_limit: number;
  start_month: string;
  end_month?: string;
  is_active: boolean;
  alert_threshold?: number;
  created_at: string;
  updated_at: string;
  // joined fields
  category_name?: string;
  category_icon?: string;
  spent: number;
}

export interface Subscription {
  subscription_id: number;
  user_id: number;
  merchant_id?: number;
  name?: string;
  amount: number;
  billing_cycle: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  next_billing_date: string;
  is_active: boolean;
  status?: string;
  currency?: string;
  notes?: string;
  // joined fields
  merchant_name?: string;
  merchant_website?: string;
  category_id?: number;
  category_name?: string;
  category_icon?: string;
}

export interface DashboardSummary {
  balance: number;
  total_income: number;
  total_expenses: number;
  monthly_income: number;
  monthly_expenses: number;
  monthly_savings: number;
  monthly_subscriptions: number;
}

export interface BurnRate {
  spent_so_far: number;
  daily_burn_rate: number;
  projected_monthly: number;
  monthly_income: number;
  remaining_days: number;
  day_of_month: number;
  days_in_month: number;
  on_track: boolean;
}

export interface SpendingTrend {
  month: string;
  month_date: string;
  income: number;
  expenses: number;
}

export interface CategorySpending {
  category_id: number;
  name: string;
  icon?: string;
  total: number;
  transaction_count: number;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface TransactionResponse {
  data: Transaction[];
  pagination: Pagination;
}
