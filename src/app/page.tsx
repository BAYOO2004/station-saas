import { createClient } from '@/lib/supabase/server';
import DailySheetForm from '@/components/daily-sheet/DailySheetForm';
import Link from 'next/link';

// Page d'accueil : Accès direct à la fiche journalière et démonstration
export default async function HomePage() {
  const supabase = await createClient();

  // On récupère la station de démo ou la première station existante
  let { data: station } = await supabase
    .from('stations')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (!station) {
    station = {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'HLACOMEY',
      network: 'BENIN PETRO',
      country: 'Bénin',
      tenant_id: '11111111-1111-1111-1111-111111111111',
      code: 'HLA',
      is_active: true,
      created_at: new Date().toISOString(),
    };
  }

  // Chargement des données pour la station
  const [
    { data: products },
    { data: pumps },
    { data: lubricants },
    { data: gasProducts },
    { data: paymentMethods },
    { data: loyaltyCards },
  ] = await Promise.all([
    supabase.from('fuel_products').select('*').eq('station_id', station.id).eq('is_active', true).order('sort_order'),
    supabase.from('fuel_pumps').select('*').eq('station_id', station.id).eq('is_active', true).order('pump_number'),
    supabase.from('lubricants').select('*').eq('station_id', station.id).eq('is_active', true).order('sort_order'),
    supabase.from('gas_products').select('*').eq('station_id', station.id).eq('is_active', true).order('sort_order'),
    supabase.from('payment_methods').select('*').eq('station_id', station.id).eq('is_active', true).order('sort_order'),
    supabase.from('loyalty_cards').select('*').eq('station_id', station.id).eq('is_active', true).order('sort_order'),
  ]);

  // Valeurs de secours si la base vient juste d'être initialisée
  const finalProducts = (products && products.length > 0) ? products : [
    { id: 'p1', name: 'ESSENCE', code: 'ESS', unit_price: 750, is_active: true, sort_order: 1, station_id: station.id },
    { id: 'p2', name: 'GASOIL', code: 'GAS', unit_price: 765, is_active: true, sort_order: 2, station_id: station.id },
  ];

  const finalPumps = (pumps && pumps.length > 0) ? pumps : [
    { id: 'pm1', pump_number: 1, name: 'Pompe 1', fuel_product_id: 'p1', is_active: true, station_id: station.id },
    { id: 'pm2', pump_number: 2, name: 'Pompe 2', fuel_product_id: 'p1', is_active: true, station_id: station.id },
    { id: 'pm3', pump_number: 1, name: 'Pompe 1', fuel_product_id: 'p2', is_active: true, station_id: station.id },
    { id: 'pm4', pump_number: 2, name: 'Pompe 2', fuel_product_id: 'p2', is_active: true, station_id: station.id },
  ];

  const finalLubricants = (lubricants && lubricants.length > 0) ? lubricants : [
    { id: 'l1', name: 'HE 50', unit: 'L', unit_price: 2500, min_stock_alert: 5, is_active: true, sort_order: 1, station_id: station.id },
    { id: 'l2', name: '50 5L', unit: 'Bidon', unit_price: 12000, min_stock_alert: 5, is_active: true, sort_order: 2, station_id: station.id },
    { id: 'l3', name: '50 1L', unit: 'Bidon', unit_price: 3000, min_stock_alert: 5, is_active: true, sort_order: 3, station_id: station.id },
    { id: 'l4', name: '40 5L', unit: 'Bidon', unit_price: 11500, min_stock_alert: 5, is_active: true, sort_order: 4, station_id: station.id },
  ];

  const finalGas = (gasProducts && gasProducts.length > 0) ? gasProducts : [
    { id: 'g1', name: 'Bouteille 6kg', unit: 'Bouteille', unit_price: 4500, consigne_price: 15000, min_stock_alert: 5, is_active: true, sort_order: 1, station_id: station.id },
    { id: 'g2', name: 'Bouteille 12.5kg', unit: 'Bouteille', unit_price: 10000, consigne_price: 25000, min_stock_alert: 5, is_active: true, sort_order: 2, station_id: station.id },
  ];

  const finalLoyalty = (loyaltyCards && loyaltyCards.length > 0) ? loyaltyCards : [
    { id: 'c1', name: 'CLASSIC', network: 'TPA Ad9000', is_active: true, sort_order: 1, station_id: station.id },
    { id: 'c2', name: 'PRIVILEGE', network: 'TPA Ad9000', is_active: true, sort_order: 2, station_id: station.id },
    { id: 'c3', name: 'NOBLESSE', network: 'TPA Ad9000', is_active: true, sort_order: 3, station_id: station.id },
    { id: 'c4', name: 'SUBLIM CARTE', network: 'TPA Ad9000', is_active: true, sort_order: 4, station_id: station.id },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Banner Station */}
      <header className="bg-blue-800 text-white px-6 py-4 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">⛽</span>
          <div>
            <h1 className="text-xl font-bold tracking-tight">BENIN PETRO — Station HLACOMEY</h1>
            <p className="text-xs text-blue-200">Gestion journalière numérique & contrôle en temps réel</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="text-xs bg-blue-900 hover:bg-blue-950 px-3 py-1.5 rounded-lg border border-blue-700 transition"
          >
            🔐 Espace Gérant
          </Link>
        </div>
      </header>

      {/* Formulaire de Fiche Journalière Directe */}
      <main className="mt-4">
        <DailySheetForm
          station={station}
          products={finalProducts}
          pumps={finalPumps}
          lubricants={finalLubricants}
          gasProducts={finalGas}
          paymentMethods={paymentMethods || []}
          loyaltyCards={finalLoyalty}
          currencySymbol="FCFA"
        />
      </main>
    </div>
  );
}
