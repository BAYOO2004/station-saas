import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DailySheetForm from '@/components/daily-sheet/DailySheetForm';

// Page: Nouvelle fiche journalière
export default async function NewDailySheetPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Récupérer l'utilisateur interne et sa station
  const { data: dbUser } = await supabase
    .from('users')
    .select('*, user_stations(station_id)')
    .eq('auth_id', user.id)
    .single();

  if (!dbUser) redirect('/login');

  const stationId = dbUser.user_stations?.[0]?.station_id;
  if (!stationId) redirect('/settings');

  // Charger toutes les configurations de la station en parallèle
  const [
    { data: station },
    { data: products },
    { data: pumps },
    { data: lubricants },
    { data: gasProducts },
    { data: paymentMethods },
    { data: loyaltyCards },
    { data: tenant },
  ] = await Promise.all([
    supabase.from('stations').select('*').eq('id', stationId).single(),
    supabase.from('fuel_products').select('*').eq('station_id', stationId).eq('is_active', true).order('sort_order'),
    supabase.from('fuel_pumps').select('*').eq('station_id', stationId).eq('is_active', true).order('pump_number'),
    supabase.from('lubricants').select('*').eq('station_id', stationId).eq('is_active', true).order('sort_order'),
    supabase.from('gas_products').select('*').eq('station_id', stationId).eq('is_active', true).order('sort_order'),
    supabase.from('payment_methods').select('*').eq('station_id', stationId).eq('is_active', true).order('sort_order'),
    supabase.from('loyalty_cards').select('*').eq('station_id', stationId).eq('is_active', true).order('sort_order'),
    supabase.from('tenants').select('currency_symbol').eq('id', dbUser.tenant_id).single(),
  ]);

  if (!station) redirect('/settings');

  return (
    <DailySheetForm
      station={station}
      products={products || []}
      pumps={pumps || []}
      lubricants={lubricants || []}
      gasProducts={gasProducts || []}
      paymentMethods={paymentMethods || []}
      loyaltyCards={loyaltyCards || []}
      currencySymbol={tenant?.currency_symbol || 'FCFA'}
    />
  );
}

