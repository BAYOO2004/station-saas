-- ============================================================
-- DONNÉES DE DÉMONSTRATION (Exemple BENIN PETRO - HLACOMEY)
-- ============================================================

-- 1. Création d'un Tenant (Compte entreprise)
INSERT INTO tenants (id, name, email, country, currency, currency_symbol, plan)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'BENIN PETRO Group',
  'contact@beninpetro.bj',
  'Bénin',
  'XOF',
  'FCFA',
  'pro'
) ON CONFLICT (email) DO NOTHING;

-- 2. Création de la Station HLACOMEY
INSERT INTO stations (id, tenant_id, name, code, network, country)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'HLACOMEY',
  'HLA',
  'BENIN PETRO',
  'Bénin'
) ON CONFLICT DO NOTHING;

-- 3. Produits Carburants
INSERT INTO fuel_products (id, station_id, name, code, unit_price, sort_order)
VALUES 
  ('33333333-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'ESSENCE', 'ESS', 750, 1),
  ('33333333-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'GASOIL', 'GAS', 765, 2)
ON CONFLICT DO NOTHING;

-- Pompes (2 pompes Essence, 2 pompes Gasoil comme sur votre feuille)
INSERT INTO fuel_pumps (station_id, fuel_product_id, pump_number, name)
VALUES 
  ('22222222-2222-2222-2222-222222222222', '33333333-1111-1111-1111-111111111111', 1, 'Pompe ESSENCE 1'),
  ('22222222-2222-2222-2222-222222222222', '33333333-1111-1111-1111-111111111111', 2, 'Pompe ESSENCE 2'),
  ('22222222-2222-2222-2222-222222222222', '33333333-2222-2222-2222-222222222222', 1, 'Pompe GASOIL 1'),
  ('22222222-2222-2222-2222-222222222222', '33333333-2222-2222-2222-222222222222', 2, 'Pompe GASOIL 2')
ON CONFLICT DO NOTHING;

-- 4. Lubrifiants
INSERT INTO lubricants (station_id, name, unit_price, sort_order)
VALUES 
  ('22222222-2222-2222-2222-222222222222', 'HE 50', 2500, 1),
  ('22222222-2222-2222-2222-222222222222', '50 5L', 12000, 2),
  ('22222222-2222-2222-2222-222222222222', '50 1L', 3000, 3),
  ('22222222-2222-2222-2222-222222222222', '40 5L', 11500, 4)
ON CONFLICT DO NOTHING;

-- 5. Gaz
INSERT INTO gas_products (station_id, name, unit_price, consigne_price, sort_order)
VALUES 
  ('22222222-2222-2222-2222-222222222222', 'Bouteille 6kg', 4500, 15000, 1),
  ('22222222-2222-2222-2222-222222222222', 'Bouteille 12.5kg', 10000, 25000, 2)
ON CONFLICT DO NOTHING;

-- 6. Cartes fidélité / Réseau TPA Ad9000
INSERT INTO loyalty_cards (station_id, name, network, sort_order)
VALUES 
  ('22222222-2222-2222-2222-222222222222', 'CLASSIC', 'TPA Ad9000', 1),
  ('22222222-2222-2222-2222-222222222222', 'PRIVILEGE', 'TPA Ad9000', 2),
  ('22222222-2222-2222-2222-222222222222', 'NOBLESSE', 'TPA Ad9000', 3),
  ('22222222-2222-2222-2222-222222222222', 'SUBLIM CARTE', 'TPA Ad9000', 4)
ON CONFLICT DO NOTHING;

