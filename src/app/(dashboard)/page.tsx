import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardOverview from '@/components/dashboard/DashboardOverview';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: dbUser } = await supabase
    .from('users')
    .select('*, user_stations(station_id)')
    .eq('auth_id', user.id)
    .single();

  const stationId = dbUser?.user_stations?.[0]?.station_id;
  if (!stationId) redirect('/settings/onboarding');

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const last7Start = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

  const [
    { data: station },
    { data: todaySheet },
    { data: yesterdaySheet },
    { data: monthSheets },
    { data: last7Sheets },
    { data: pendingAlerts },
    { data: tenant },
  ] = await Promise.all([
    supabase.from('stations').select('*').eq('id', stationId).single(),
    supabase.from('daily_sheets').select('total_sales, final_cash, fuel_sales(fuel_product_name, ventes, amount)')
      .eq('station_id', stationId).eq('sheet_date', today).maybeSingle(),
    supabase.from('daily_sheets').select('total_sales')
      .eq('station_id', stationId).eq('sheet_date', yesterday).maybeSingle(),
    supabase.from('daily_sheets').select('total_sales')
      .eq('station_id', stationId).gte('sheet_date', monthStart).lte('sheet_date', today),
    supabase.from('daily_sheets').select('sheet_date, total_sales')
      .eq('station_id', stationId).gte('sheet_date', last7Start).order('sheet_date'),
    supabase.from('alerts').select('id').eq('station_id', stationId).eq('is_read', false),
    supabase.from('tenants').select('currency_symbol').eq('id', dbUser?.tenant_id).single(),
  ]);

  const monthTotal = monthSheets?.reduce((s: number, sh: any) => s + (sh.total_sales || 0), 0) || 0;

  // Agréger ventes par produit pour aujourd'hui
  const fuelBreakdown: any[] = [];
  if (todaySheet?.fuel_sales) {
    const map: Record<string, { product: string; volume: number; amount: number }> = {};
    for (const sale of (todaySheet.fuel_sales as any[])) {
      if (!map[sale.fuel_product_name]) {
        map[sale.fuel_product_name] = { product: sale.fuel_product_name, volume: 0, amount: 0 };
      }
      map[sale.fuel_product_name].volume += sale.ventes || 0;
      map[sale.fuel_product_name].amount += sale.amount || 0;
    }
    fuelBreakdown.push(...Object.values(map));
  }

  const stats = {
    today_sales: todaySheet?.total_sales || 0,
    yesterday_sales: yesterdaySheet?.total_sales || 0,
    month_sales: monthTotal,
    today_cash: todaySheet?.final_cash || 0,
    pending_alerts: pendingAlerts?.length || 0,
    fuel_breakdown: fuelBreakdown,
    daily_trend: (last7Sheets || []).map((sh: any) => ({
      date: sh.sheet_date,
      amount: sh.total_sales || 0,
    })),
  };

  return (
    <DashboardOverview
      stats={stats}
      station={station!}
      currencySymbol={tenant?.currency_symbol || 'FCFA'}
      pendingAlerts={pendingAlerts?.length || 0}
    />
  );
}

