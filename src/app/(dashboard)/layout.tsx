import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/layout/Sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: dbUser } = await supabase
    .from('users')
    .select('*, user_stations(station_id)')
    .eq('auth_id', user.id)
    .single();

  const stationId = dbUser?.user_stations?.[0]?.station_id;

  const [{ data: station }, { data: unreadAlerts }] = await Promise.all([
    stationId
      ? supabase.from('stations').select('name, network').eq('id', stationId).single()
      : Promise.resolve({ data: null }),
    stationId
      ? supabase.from('alerts').select('id', { count: 'exact', head: true })
          .eq('station_id', stationId)
          .eq('is_read', false)
      : Promise.resolve({ data: null }),
  ]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        stationName={station?.name || 'Ma Station'}
        stationNetwork={station?.network || 'StationSaaS'}
        userFullName={dbUser?.full_name || user.email || ''}
        unreadAlerts={(unreadAlerts as any)?.length || 0}
      />
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
}

