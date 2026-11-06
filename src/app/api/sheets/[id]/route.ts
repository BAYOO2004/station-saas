import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/sheets/[id] — Récupère une fiche
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { data, error } = await supabase
    .from('daily_sheets')
    .select(`
      *,
      fuel_sales(*),
      lubricant_sales(*),
      gas_sales(*),
      expenses(*),
      payment_records(*)
    `)
    .eq('id', id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

// PUT /api/sheets/[id] — Met à jour une fiche existante
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const body = await request.json();
  const { fuel_sales, lubricant_sales, gas_sales, expenses, payment_records, ...sheetData } = body;

  // Mise à jour de la fiche principale
  const { data: sheet, error } = await supabase
    .from('daily_sheets')
    .update(sheetData)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Supprimer et recréer les lignes (upsert simple)
  const stationId = sheetData.station_id;

  await Promise.all([
    supabase.from('fuel_sales').delete().eq('daily_sheet_id', id),
    supabase.from('lubricant_sales').delete().eq('daily_sheet_id', id),
    supabase.from('gas_sales').delete().eq('daily_sheet_id', id),
    supabase.from('expenses').delete().eq('daily_sheet_id', id),
    supabase.from('payment_records').delete().eq('daily_sheet_id', id),
  ]);

  const inserts = [];

  if (fuel_sales?.length)
    inserts.push(supabase.from('fuel_sales').insert(fuel_sales.map((s: any) => ({ ...s, daily_sheet_id: id, station_id: stationId }))));
  if (lubricant_sales?.length)
    inserts.push(supabase.from('lubricant_sales').insert(lubricant_sales.map((s: any) => ({ ...s, daily_sheet_id: id, station_id: stationId }))));
  if (gas_sales?.length)
    inserts.push(supabase.from('gas_sales').insert(gas_sales.map((s: any) => ({ ...s, daily_sheet_id: id, station_id: stationId }))));
  if (expenses?.length)
    inserts.push(supabase.from('expenses').insert(expenses.map((e: any) => ({ ...e, daily_sheet_id: id, station_id: stationId }))));
  if (payment_records?.length)
    inserts.push(supabase.from('payment_records').insert(payment_records.map((p: any) => ({ ...p, daily_sheet_id: id, station_id: stationId }))));

  await Promise.all(inserts);

  return NextResponse.json(sheet);
}

// DELETE /api/sheets/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { error } = await supabase.from('daily_sheets').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
