import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/reports — Rapports agrégés
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const stationId = searchParams.get('station_id');
  const type = searchParams.get('type') || 'daily'; // daily | weekly | monthly
  const startDate = searchParams.get('start_date') || new Date().toISOString().split('T')[0];
  const endDate = searchParams.get('end_date') || startDate;

  const { data: sheets, error } = await supabase
    .from('daily_sheets')
    .select(`
      *,
      fuel_sales(*),
      lubricant_sales(*),
      gas_sales(*),
      expenses(*),
      payment_records(*)
    `)
    .eq('station_id', stationId)
    .gte('sheet_date', startDate)
    .lte('sheet_date', endDate)
    .order('sheet_date', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Agréger les données
  const summary = {
    period: { start: startDate, end: endDate },
    total_sales: sheets.reduce((s: number, sh: any) => s + (sh.total_sales || 0), 0),
    total_fuel: sheets.reduce((s: number, sh: any) => s + (sh.total_fuel_sales || 0), 0),
    total_lubricant: sheets.reduce((s: number, sh: any) => s + (sh.total_lubricant_sales || 0), 0),
    total_gas: sheets.reduce((s: number, sh: any) => s + (sh.total_gas_sales || 0), 0),
    total_cash: sheets.reduce((s: number, sh: any) => s + (sh.total_cash || 0), 0),
    total_momo: sheets.reduce((s: number, sh: any) => s + (sh.total_momo || 0), 0),
    total_tpe: sheets.reduce((s: number, sh: any) => s + (sh.total_tpe || 0), 0),
    total_expenses: sheets.reduce((s: number, sh: any) => s + (sh.total_expenses || 0), 0),
    sheets_count: sheets.length,
    daily_breakdown: sheets.map((sh: any) => ({
      date: sh.sheet_date,
      total_sales: sh.total_sales,
      total_cash: sh.final_cash,
      status: sh.status,
    })),
    // Ventes par produit carburant
    fuel_by_product: aggregateFuelByProduct(sheets),
  };

  return NextResponse.json({ summary, sheets });
}

function aggregateFuelByProduct(sheets: any[]) {
  const map: Record<string, { name: string; volume: number; amount: number }> = {};
  for (const sheet of sheets) {
    for (const sale of (sheet.fuel_sales || [])) {
      if (!map[sale.fuel_product_name]) {
        map[sale.fuel_product_name] = { name: sale.fuel_product_name, volume: 0, amount: 0 };
      }
      map[sale.fuel_product_name].volume += sale.ventes || 0;
      map[sale.fuel_product_name].amount += sale.amount || 0;
    }
  }
  return Object.values(map);
}

