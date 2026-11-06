import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DailySheetFormData } from '@/types';

// GET /api/sheets — Liste les fiches de la station courante
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const stationId = searchParams.get('station_id');
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');
  const limit = parseInt(searchParams.get('limit') || '30');

  let query = supabase
    .from('daily_sheets')
    .select(`
      *,
      fuel_sales(*),
      lubricant_sales(*),
      gas_sales(*),
      expenses(*),
      payment_records(*)
    `)
    .order('sheet_date', { ascending: false })
    .limit(limit);

  if (stationId) query = query.eq('station_id', stationId);
  if (startDate) query = query.gte('sheet_date', startDate);
  if (endDate) query = query.lte('sheet_date', endDate);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

// POST /api/sheets — Crée une nouvelle fiche
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const body = await request.json();
  const { fuel_sales, lubricant_sales, gas_sales, expenses, payment_records, ...sheetData } = body;

  // Récupérer l'utilisateur interne
  const { data: dbUser } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single();

  // Créer la fiche
  const { data: sheet, error: sheetError } = await supabase
    .from('daily_sheets')
    .insert({ ...sheetData, submitted_by: dbUser?.id })
    .select()
    .single();

  if (sheetError) return NextResponse.json({ error: sheetError.message }, { status: 500 });

  // Insérer les lignes de ventes en parallèle
  const inserts = [];

  if (fuel_sales?.length) {
    inserts.push(
      supabase.from('fuel_sales').insert(
        fuel_sales.map((s: any) => ({ ...s, daily_sheet_id: sheet.id, station_id: sheetData.station_id }))
      )
    );
  }

  if (lubricant_sales?.length) {
    inserts.push(
      supabase.from('lubricant_sales').insert(
        lubricant_sales.map((s: any) => ({ ...s, daily_sheet_id: sheet.id, station_id: sheetData.station_id }))
      )
    );
  }

  if (gas_sales?.length) {
    inserts.push(
      supabase.from('gas_sales').insert(
        gas_sales.map((s: any) => ({ ...s, daily_sheet_id: sheet.id, station_id: sheetData.station_id }))
      )
    );
  }

  if (expenses?.length) {
    inserts.push(
      supabase.from('expenses').insert(
        expenses.map((e: any) => ({ ...e, daily_sheet_id: sheet.id, station_id: sheetData.station_id }))
      )
    );
  }

  if (payment_records?.length) {
    inserts.push(
      supabase.from('payment_records').insert(
        payment_records.map((p: any) => ({ ...p, daily_sheet_id: sheet.id, station_id: sheetData.station_id }))
      )
    );
  }

  await Promise.all(inserts);

  // Vérifier et créer des alertes si nécessaire
  await checkAndCreateAlerts(supabase, sheet, fuel_sales, body);

  return NextResponse.json(sheet, { status: 201 });
}

async function checkAndCreateAlerts(supabase: any, sheet: any, fuelSales: any[], body: any) {
  const alerts = [];

  // Alerte: écart de caisse
  const cashVariance = Math.abs((body.total_payments_received || 0) - (body.total_sales || 0));
  if (cashVariance > 1000) {
    alerts.push({
      station_id: sheet.station_id,
      daily_sheet_id: sheet.id,
      alert_type: 'cash_variance',
      severity: cashVariance > 50000 ? 'critical' : 'warning',
      title: 'Écart de caisse détecté',
      message: `Écart de ${new Intl.NumberFormat('fr-FR').format(cashVariance)} FCFA entre ventes et paiements reçus`,
    });
  }

  // Alerte: écart jauge
  if (fuelSales) {
    for (const sale of fuelSales) {
      if (sale.jauge_variance && Math.abs(sale.jauge_variance) > 100) {
        alerts.push({
          station_id: sheet.station_id,
          daily_sheet_id: sheet.id,
          alert_type: 'jauge_variance',
          severity: Math.abs(sale.jauge_variance) > 500 ? 'critical' : 'warning',
          title: `Écart jauge — ${sale.fuel_product_name}`,
          message: `Écart de ${sale.jauge_variance > 0 ? '+' : ''}${sale.jauge_variance} L sur la cuve ${sale.fuel_product_name}`,
        });
      }
    }
  }

  if (alerts.length > 0) {
    await supabase.from('alerts').insert(alerts);
  }
}

