import { createClient } from '@/lib/supabase/server';
import DailySheetForm from '@/components/daily-sheet/DailySheetForm';
import Link from 'next/link';

export default async function AppDailySheetPage() {
  const supabase = await createClient();

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
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-16">
      {/* Header Application */}
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition">
            <span>←</span> Retour au site
          </Link>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-2">
            <span className="text-xl">⛽</span>
            <span className="font-bold text-white text-sm">BENIN PETRO · HLACOMEY</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
            ● Tour 24h Actif
          </span>
          <Link
            href="/login"
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition"
          >
            Déconnexion
          </Link>
        </div>
      </header>

      {/* Formulaire Métier Numérisé */}
      <main className="max-w-7xl mx-auto px-4 mt-6">
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-sm">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>📋</span> Fiche Journalière & Contrôle Caisse
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Saisie des index compteurs, réconciliation des ventes, détection des pertes cuves et calcul automatique de caisse.
              </p>
            </div>
          </div>

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
        </div>
      </main>
    </div>
  );
}

