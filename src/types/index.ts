// ============================================================
// TYPES GLOBAUX — SaaS Gestion Station-Service
// ============================================================

export type Currency = {
  code: string;
  name: string;
  symbol: string;
  country: string;
};

export type Tenant = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  country: string;
  currency: string;
  currency_symbol: string;
  plan: 'starter' | 'pro' | 'business' | 'enterprise';
  plan_expires_at?: string;
  is_active: boolean;
  created_at: string;
};

export type Station = {
  id: string;
  tenant_id: string;
  name: string;
  code?: string;
  network?: string; // Ex: BENIN PETRO, ORYX, TOTAL
  address?: string;
  city?: string;
  country: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
};

export type User = {
  id: string;
  auth_id?: string;
  tenant_id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'owner' | 'manager' | 'admin';
  is_active: boolean;
  station_ids?: string[];
};

export type FuelProduct = {
  id: string;
  station_id: string;
  name: string;
  code?: string;
  unit_price: number;
  is_active: boolean;
  sort_order: number;
};

export type FuelPump = {
  id: string;
  station_id: string;
  fuel_product_id: string;
  pump_number: number;
  name?: string;
  is_active: boolean;
};

export type Lubricant = {
  id: string;
  station_id: string;
  name: string;
  unit: string;
  unit_price: number;
  min_stock_alert: number;
  is_active: boolean;
  sort_order: number;
};

export type GasProduct = {
  id: string;
  station_id: string;
  name: string;
  unit: string;
  unit_price: number;
  consigne_price: number;
  min_stock_alert: number;
  is_active: boolean;
  sort_order: number;
};

export type PaymentMethod = {
  id: string;
  station_id: string;
  name: string;
  code: string; // cash | momo | tpe | ticket
  is_active: boolean;
  sort_order: number;
};

export type LoyaltyCard = {
  id: string;
  station_id: string;
  name: string;
  network?: string;
  fuel_type?: string; // Essence | Gasoil | Tous
  is_active: boolean;
  sort_order: number;
};

export type ShiftConfig = {
  id: string;
  station_id: string;
  shift_name: string;
  start_time?: string;
  end_time?: string;
  duration_hours: number;
  is_active: boolean;
};

// ============================================================
// FICHE JOURNALIÈRE
// ============================================================

export type DailySheet = {
  id: string;
  station_id: string;
  submitted_by?: string;
  sheet_date: string; // YYYY-MM-DD
  shift_id?: string;
  shift_name?: string;
  tour_manager?: string;
  shift_manager?: string;

  total_fuel_sales: number;
  total_lubricant_sales: number;
  total_gas_sales: number;
  total_sales: number;

  total_cash: number;
  total_momo: number;
  total_tpe: number;
  total_tickets: number;
  total_loyalty_cards: number;
  total_payments_received: number;

  total_expenses: number;
  report_amount: number;
  advance_amount: number;
  final_cash: number;

  momo_amount: number;
  momo_balance: number;

  status: 'draft' | 'submitted' | 'validated';
  notes?: string;

  created_at: string;
  updated_at: string;

  // Relations (eager loaded)
  fuel_sales?: FuelSale[];
  lubricant_sales?: LubricantSale[];
  gas_sales?: GasSale[];
  expenses?: Expense[];
  payment_records?: PaymentRecord[];
};

export type FuelSale = {
  id?: string;
  daily_sheet_id?: string;
  station_id?: string;
  fuel_product_id: string;
  fuel_product_name: string;
  pump_id?: string;
  pump_number?: number;

  index_start: number;
  index_end: number;
  sorties: number; // index_end - index_start (auto)
  rc: number;
  ventes: number; // sorties - rc (auto)
  ventes_communes?: number;

  unit_price: number;
  amount: number; // ventes * unit_price (auto)

  jauge_start?: number;
  jauge_end?: number;
  jauge_theoretical?: number;
  jauge_variance?: number;
};

export type LubricantSale = {
  id?: string;
  daily_sheet_id?: string;
  station_id?: string;
  lubricant_id: string;
  lubricant_name: string;

  stock_opening: number;
  stock_in: number;
  quantity_sold: number;
  stock_closing: number; // auto: opening + in - sold

  unit_price: number;
  amount: number; // quantity_sold * unit_price (auto)
};

export type GasSale = {
  id?: string;
  daily_sheet_id?: string;
  station_id?: string;
  gas_product_id: string;
  gas_product_name: string;

  stock_opening: number;
  stock_in: number;
  quantity_sold: number;
  consigne: number;
  stock_closing_before: number;
  stock_closing_final: number;

  unit_price: number;
  amount: number; // quantity_sold * unit_price (auto)
};

export type PaymentRecord = {
  id?: string;
  daily_sheet_id?: string;
  station_id?: string;
  payment_method_id?: string;
  payment_method_code: string; // cash | momo | tpe | ticket
  loyalty_card_id?: string;
  loyalty_card_name?: string;
  fuel_product_name?: string; // Essence | Gasoil (pour TPE/cartes)
  amount: number;
};

export type Expense = {
  id?: string;
  daily_sheet_id?: string;
  station_id?: string;
  description: string;
  category: string;
  amount: number;
};

export type Delivery = {
  id: string;
  station_id: string;
  fuel_product_id: string;
  fuel_product_name: string;
  delivery_date: string;
  quantity: number;
  unit_price?: number;
  total_amount?: number;
  supplier?: string;
  bl_number?: string;
  notes?: string;
  created_at: string;
};

export type Alert = {
  id: string;
  station_id: string;
  daily_sheet_id?: string;
  alert_type: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message?: string;
  is_read: boolean;
  is_resolved: boolean;
  created_at: string;
};

// ============================================================
// FORMULAIRE — État local de la fiche journalière
// ============================================================
export type DailySheetFormData = {
  sheet_date: string;
  shift_id?: string;
  tour_manager: string;
  shift_manager: string;
  fuel_sales: FuelSale[];
  lubricant_sales: LubricantSale[];
  gas_sales: GasSale[];
  payment_records: PaymentRecord[];
  expenses: Expense[];
  report_amount: number;
  advance_amount: number;
  momo_amount: number;
  momo_balance: number;
  notes: string;
};

// ============================================================
// DASHBOARD STATS
// ============================================================
export type DashboardStats = {
  today_sales: number;
  yesterday_sales: number;
  month_sales: number;
  today_cash: number;
  pending_alerts: number;
  fuel_breakdown: { product: string; volume: number; amount: number }[];
  daily_trend: { date: string; amount: number }[];
};

