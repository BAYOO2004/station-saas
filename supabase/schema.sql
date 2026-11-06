-- ============================================================
-- SaaS Gestion Station-Service — Schéma Supabase PostgreSQL
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TENANTS (Propriétaires / Entreprises)
-- ============================================================
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  country VARCHAR(100) DEFAULT 'Bénin',
  currency VARCHAR(10) DEFAULT 'XOF', -- FCFA
  currency_symbol VARCHAR(5) DEFAULT 'FCFA',
  plan VARCHAR(50) DEFAULT 'starter', -- starter, pro, business, enterprise
  plan_expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STATIONS (Par tenant)
-- ============================================================
CREATE TABLE stations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50), -- Code court ex: HLACOMEY
  network VARCHAR(100), -- Ex: BENIN PETRO, ORYX, TOTAL
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Bénin',
  phone VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- USERS (Gérants, Propriétaires)
-- ============================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID UNIQUE, -- Supabase Auth user ID
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(50) DEFAULT 'manager', -- owner, manager, admin
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User ↔ Station assignments
CREATE TABLE user_stations (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  station_id UUID REFERENCES stations(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, station_id)
);

-- ============================================================
-- PRODUITS CARBURANTS (Par station)
-- ============================================================
CREATE TABLE fuel_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id UUID REFERENCES stations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL, -- Ex: Essence 1, Gasoil 1
  code VARCHAR(20), -- Ex: ESS1, GASOIL1
  product_type VARCHAR(50) DEFAULT 'fuel', -- fuel, lubricant, gas
  unit_price DECIMAL(15, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pompes/Pistolets par produit
CREATE TABLE fuel_pumps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id UUID REFERENCES stations(id) ON DELETE CASCADE,
  fuel_product_id UUID REFERENCES fuel_products(id) ON DELETE CASCADE,
  pump_number INTEGER NOT NULL,
  name VARCHAR(100), -- Ex: Pompe 1 Essence
  is_active BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- LUBRIFIANTS (Par station)
-- ============================================================
CREATE TABLE lubricants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id UUID REFERENCES stations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL, -- Ex: HE 50, 50 SL
  unit VARCHAR(20) DEFAULT 'L', -- Litre, bidon
  unit_price DECIMAL(15, 2) DEFAULT 0,
  min_stock_alert INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- GAZ (Par station)
-- ============================================================
CREATE TABLE gas_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id UUID REFERENCES stations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL, -- Ex: Bouteille 6kg, 12kg
  unit VARCHAR(20) DEFAULT 'bouteille',
  unit_price DECIMAL(15, 2) DEFAULT 0,
  consigne_price DECIMAL(15, 2) DEFAULT 0,
  min_stock_alert INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MODES DE PAIEMENT (Par station)
-- ============================================================
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id UUID REFERENCES stations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL, -- Cash, MOMO, TPE, Ticket
  code VARCHAR(50) NOT NULL, -- cash, momo, tpe, ticket
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0
);

-- Cartes de fidélité / Cartes réseau (TPA Ad9000, etc.)
CREATE TABLE loyalty_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id UUID REFERENCES stations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL, -- Ex: Classic, Privilege, Noblesse, Sublim Carte
  network VARCHAR(100), -- Ex: TPA Ad9000
  fuel_type VARCHAR(50), -- Essence, Gasoil, Tous
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0
);

-- ============================================================
-- SHIFTS / TOURS (Configuration par station)
-- ============================================================
CREATE TABLE shift_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id UUID REFERENCES stations(id) ON DELETE CASCADE,
  shift_name VARCHAR(100) NOT NULL, -- Ex: Tour 1, Matin, 24h
  start_time TIME, -- Heure début (si applicable)
  end_time TIME,   -- Heure fin
  duration_hours INTEGER DEFAULT 24,
  is_active BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- FICHES JOURNALIÈRES (Entrée principale)
-- ============================================================
CREATE TABLE daily_sheets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id UUID REFERENCES stations(id) ON DELETE CASCADE,
  submitted_by UUID REFERENCES users(id),
  sheet_date DATE NOT NULL,
  shift_id UUID REFERENCES shift_configs(id),
  shift_name VARCHAR(100), -- Copie du nom pour historique
  
  -- Responsables
  tour_manager VARCHAR(255), -- Tour de M.
  shift_manager VARCHAR(255), -- Responsable de tour
  
  -- Totaux calculés
  total_fuel_sales DECIMAL(15, 2) DEFAULT 0,
  total_lubricant_sales DECIMAL(15, 2) DEFAULT 0,
  total_gas_sales DECIMAL(15, 2) DEFAULT 0,
  total_sales DECIMAL(15, 2) DEFAULT 0,
  
  -- Paiements reçus
  total_cash DECIMAL(15, 2) DEFAULT 0,
  total_momo DECIMAL(15, 2) DEFAULT 0,
  total_tpe DECIMAL(15, 2) DEFAULT 0,
  total_tickets DECIMAL(15, 2) DEFAULT 0,
  total_loyalty_cards DECIMAL(15, 2) DEFAULT 0,
  total_payments_received DECIMAL(15, 2) DEFAULT 0,
  
  -- Dépenses
  total_expenses DECIMAL(15, 2) DEFAULT 0,
  
  -- Caisse
  report_amount DECIMAL(15, 2) DEFAULT 0, -- Report du tour précédent
  advance_amount DECIMAL(15, 2) DEFAULT 0, -- Avances
  final_cash DECIMAL(15, 2) DEFAULT 0, -- CAISSE FINALE
  
  -- MOMO détail
  momo_amount DECIMAL(15, 2) DEFAULT 0,
  momo_balance DECIMAL(15, 2) DEFAULT 0, -- Solde MOMO
  
  -- Statut
  status VARCHAR(50) DEFAULT 'draft', -- draft, submitted, validated
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE (station_id, sheet_date, shift_id)
);

-- ============================================================
-- VENTES CARBURANTS (Lignes par produit)
-- ============================================================
CREATE TABLE fuel_sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  daily_sheet_id UUID REFERENCES daily_sheets(id) ON DELETE CASCADE,
  station_id UUID REFERENCES stations(id),
  fuel_product_id UUID REFERENCES fuel_products(id),
  fuel_product_name VARCHAR(100), -- Copie nom
  pump_id UUID REFERENCES fuel_pumps(id),
  pump_number INTEGER,
  
  -- Index compteurs
  index_start DECIMAL(15, 3) DEFAULT 0,
  index_end DECIMAL(15, 3) DEFAULT 0,
  sorties DECIMAL(15, 3) DEFAULT 0, -- index_end - index_start
  rc DECIMAL(15, 3) DEFAULT 0, -- Retour comptoir / correction
  ventes DECIMAL(15, 3) DEFAULT 0, -- sorties - rc
  
  -- Ventes communes (si plusieurs pompes regroupées)
  ventes_communes DECIMAL(15, 3) DEFAULT 0,
  
  -- Prix et montant
  unit_price DECIMAL(15, 2) DEFAULT 0,
  amount DECIMAL(15, 2) DEFAULT 0, -- ventes * unit_price
  
  -- Jauge cuve
  jauge_start DECIMAL(15, 3), -- Niveau cuve début
  jauge_end DECIMAL(15, 3),   -- Niveau cuve fin
  jauge_theoretical DECIMAL(15, 3), -- Niveau théorique calculé
  jauge_variance DECIMAL(15, 3), -- Écart (alerte si > seuil)
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- VENTES LUBRIFIANTS
-- ============================================================
CREATE TABLE lubricant_sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  daily_sheet_id UUID REFERENCES daily_sheets(id) ON DELETE CASCADE,
  station_id UUID REFERENCES stations(id),
  lubricant_id UUID REFERENCES lubricants(id),
  lubricant_name VARCHAR(100),
  
  stock_opening DECIMAL(10, 2) DEFAULT 0,
  stock_in DECIMAL(10, 2) DEFAULT 0,  -- Entrées
  quantity_sold DECIMAL(10, 2) DEFAULT 0,
  stock_closing DECIMAL(10, 2) DEFAULT 0,
  
  unit_price DECIMAL(15, 2) DEFAULT 0,
  amount DECIMAL(15, 2) DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- VENTES GAZ
-- ============================================================
CREATE TABLE gas_sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  daily_sheet_id UUID REFERENCES daily_sheets(id) ON DELETE CASCADE,
  station_id UUID REFERENCES stations(id),
  gas_product_id UUID REFERENCES gas_products(id),
  gas_product_name VARCHAR(100),
  
  stock_opening INTEGER DEFAULT 0,   -- NBV ouverture
  stock_in INTEGER DEFAULT 0,        -- Entrées
  quantity_sold INTEGER DEFAULT 0,   -- Ventes
  consigne INTEGER DEFAULT 0,        -- Consigne
  stock_closing_before INTEGER DEFAULT 0, -- NBV avant
  stock_closing_final INTEGER DEFAULT 0,  -- N Final
  
  unit_price DECIMAL(15, 2) DEFAULT 0,
  amount DECIMAL(15, 2) DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PAIEMENTS PAR MODE (TPE, MOMO, Cartes fidélité)
-- ============================================================
CREATE TABLE payment_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  daily_sheet_id UUID REFERENCES daily_sheets(id) ON DELETE CASCADE,
  station_id UUID REFERENCES stations(id),
  payment_method_id UUID REFERENCES payment_methods(id),
  payment_method_code VARCHAR(50), -- cash, momo, tpe
  loyalty_card_id UUID REFERENCES loyalty_cards(id),
  loyalty_card_name VARCHAR(100),
  fuel_product_name VARCHAR(100), -- Essence ou Gasoil pour le TPE/cartes
  amount DECIMAL(15, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DÉPENSES
-- ============================================================
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  daily_sheet_id UUID REFERENCES daily_sheets(id) ON DELETE CASCADE,
  station_id UUID REFERENCES stations(id),
  description TEXT NOT NULL, -- Motif
  category VARCHAR(100) DEFAULT 'autre', -- carburant_generateur, nettoyage, maintenance, salaire, autre
  amount DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- APPROVISIONNEMENTS / LIVRAISONS
-- ============================================================
CREATE TABLE deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id UUID REFERENCES stations(id) ON DELETE CASCADE,
  fuel_product_id UUID REFERENCES fuel_products(id),
  fuel_product_name VARCHAR(100),
  delivery_date DATE NOT NULL,
  quantity DECIMAL(15, 3) NOT NULL,
  unit_price DECIMAL(15, 2),
  total_amount DECIMAL(15, 2),
  supplier VARCHAR(255),
  bl_number VARCHAR(100), -- Numéro bon de livraison
  notes TEXT,
  recorded_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ALERTES
-- ============================================================
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id UUID REFERENCES stations(id) ON DELETE CASCADE,
  daily_sheet_id UUID REFERENCES daily_sheets(id),
  alert_type VARCHAR(100) NOT NULL, -- jauge_variance, cash_variance, low_stock, missing_sheet
  severity VARCHAR(20) DEFAULT 'warning', -- info, warning, critical
  title VARCHAR(255) NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CONFIGURATION ALERTES PAR STATION
-- ============================================================
CREATE TABLE alert_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id UUID REFERENCES stations(id) ON DELETE CASCADE,
  alert_type VARCHAR(100) NOT NULL,
  threshold DECIMAL(15, 2), -- Seuil déclenchement
  is_active BOOLEAN DEFAULT TRUE,
  notify_email BOOLEAN DEFAULT TRUE,
  notify_whatsapp BOOLEAN DEFAULT FALSE,
  notify_sms BOOLEAN DEFAULT FALSE
);

-- ============================================================
-- CURRENCY (Devises supportées)
-- ============================================================
CREATE TABLE currencies (
  code VARCHAR(10) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  country VARCHAR(100)
);

INSERT INTO currencies VALUES 
  ('XOF', 'Franc CFA Ouest Africain', 'FCFA', 'Afrique de l''Ouest'),
  ('XAF', 'Franc CFA Afrique Centrale', 'FCFA', 'Afrique Centrale'),
  ('NGN', 'Naira Nigérian', '₦', 'Nigeria'),
  ('GHS', 'Cedi Ghanéen', 'GH₵', 'Ghana'),
  ('MAD', 'Dirham Marocain', 'MAD', 'Maroc'),
  ('USD', 'Dollar Américain', '$', 'États-Unis'),
  ('EUR', 'Euro', '€', 'Europe');

-- ============================================================
-- ROW LEVEL SECURITY (Multi-tenant isolation)
-- ============================================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE lubricant_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE gas_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Policy: Users only see data from their tenant
CREATE POLICY "tenant_isolation_stations" ON stations
  FOR ALL USING (
    tenant_id = (SELECT tenant_id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "tenant_isolation_daily_sheets" ON daily_sheets
  FOR ALL USING (
    station_id IN (
      SELECT s.id FROM stations s
      WHERE s.tenant_id = (SELECT tenant_id FROM users WHERE auth_id = auth.uid())
    )
  );

-- ============================================================
-- INDEXES pour performance
-- ============================================================
CREATE INDEX idx_daily_sheets_station_date ON daily_sheets(station_id, sheet_date);
CREATE INDEX idx_fuel_sales_sheet ON fuel_sales(daily_sheet_id);
CREATE INDEX idx_lubricant_sales_sheet ON lubricant_sales(daily_sheet_id);
CREATE INDEX idx_gas_sales_sheet ON gas_sales(daily_sheet_id);
CREATE INDEX idx_expenses_sheet ON expenses(daily_sheet_id);
CREATE INDEX idx_alerts_station ON alerts(station_id, is_read);
CREATE INDEX idx_deliveries_station_date ON deliveries(station_id, delivery_date);

-- ============================================================
-- TRIGGERS: updated_at auto
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_stations_updated_at BEFORE UPDATE ON stations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_daily_sheets_updated_at BEFORE UPDATE ON daily_sheets FOR EACH ROW EXECUTE FUNCTION update_updated_at();

