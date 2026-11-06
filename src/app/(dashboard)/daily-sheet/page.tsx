import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

// Page: Liste des fiches journalières
export default async function DailySheetListPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: dbUser } = await supabase
    .from('users')
    .select('*, user_stations(station_id)')
    .eq('auth_id', user.id)
    .single();

  const stationId = dbUser?.user_stations?.[0]?.station_id;
  if (!stationId) redirect('/settings');

  const { data: sheets } = await supabase
    .from('daily_sheets')
    .select('id, sheet_date, total_sales, total_fuel_sales, final_cash, status, shift_name, tour_manager')
    .eq('station_id', stationId)
    .order('sheet_date', { ascending: false })
    .limit(60);

  const { data: tenant } = await supabase
    .from('tenants')
    .select('currency_symbol')
    .eq('id', dbUser?.tenant_id)
    .single();

  const currencySymbol = tenant?.currency_symbol || 'FCFA';

  const statusConfig = {
    draft: { label: 'Brouillon', color: 'bg-yellow-100 text-yellow-700', icon: '📝' },
    submitted: { label: 'Soumise', color: 'bg-blue-100 text-blue-700', icon: '✅' },
    validated: { label: 'Validée', color: 'bg-green-100 text-green-700', icon: '🏆' },
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📋 Fiches Journalières</h1>
          <p className="text-gray-500 text-sm mt-1">{sheets?.length || 0} fiches enregistrées</p>
        </div>
        <Link
          href="/daily-sheet/new"
          className="bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-800 transition flex items-center gap-2 shadow-sm"
        >
          ➕ Nouvelle fiche
        </Link>
      </div>

      {/* Liste */}
      {sheets && sheets.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tour</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Ventes Total</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Caisse</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Statut</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sheets.map(sheet => {
                const cfg = statusConfig[sheet.status as keyof typeof statusConfig] || statusConfig.draft;
                return (
                  <tr key={sheet.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-800 text-sm">
                        {new Date(sheet.sheet_date).toLocaleDateString('fr-FR', {
                          weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {sheet.tour_manager || sheet.shift_name || '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-mono font-semibold text-gray-800 text-sm">
                        {new Intl.NumberFormat('fr-FR').format(sheet.total_sales || 0)} {currencySymbol}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-mono text-green-700 font-semibold text-sm">
                        {new Intl.NumberFormat('fr-FR').format(sheet.final_cash || 0)} {currencySymbol}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <Link
                          href={`/daily-sheet/${sheet.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Voir
                        </Link>
                        {sheet.status === 'draft' && (
                          <Link
                            href={`/daily-sheet/${sheet.id}/edit`}
                            className="text-orange-500 hover:text-orange-700 text-sm font-medium"
                          >
                            Modifier
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucune fiche pour l'instant</h3>
          <p className="text-gray-500 text-sm mb-6">Commencez par créer votre première fiche journalière</p>
          <Link
            href="/daily-sheet/new"
            className="bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-800 transition inline-flex items-center gap-2"
          >
            ➕ Créer ma première fiche
          </Link>
        </div>
      )}
    </div>
  );
}

