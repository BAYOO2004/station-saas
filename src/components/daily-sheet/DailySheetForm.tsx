'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DailySheetFormData, FuelSale, FuelProduct, FuelPump, Lubricant, GasProduct, PaymentMethod, LoyaltyCard, Station } from '@/types';
import { recomputeSheetTotals, todayDate, formatAmount } from '@/lib/calculations';
import { generateDailySheetPDF, downloadPDF, openPDFForPrint } from '@/lib/pdf/generateDailySheet';
import FuelSalesSection from './FuelSalesSection';
import LubricantSalesSection from './LubricantSalesSection';
import GasSalesSection from './GasSalesSection';
import PaymentsExpensesSection from './PaymentsExpensesSection';
import CashSummarySection from './CashSummarySection';

interface DailySheetFormProps {
  station: Station;
  products: FuelProduct[];
  pumps: FuelPump[];
  lubricants: Lubricant[];
  gasProducts: GasProduct[];
  paymentMethods: PaymentMethod[];
  loyaltyCards: LoyaltyCard[];
  currencySymbol: string;
  existingSheetId?: string;
  initialData?: Partial<DailySheetFormData>;
  onSave?: (sheetId: string) => void;
}

function buildInitialFormData(
  products: FuelProduct[],
  pumps: FuelPump[],
  lubricants: Lubricant[],
  gasProducts: GasProduct[],
  initial?: Partial<DailySheetFormData>
): DailySheetFormData {
  // Construire les lignes de ventes carburant (une par pompe par produit)
  const fuel_sales: FuelSale[] = products.flatMap(prod => {
    const productPumps = pumps.filter(p => p.fuel_product_id === prod.id && p.is_active);
    if (productPumps.length === 0) {
      return [{
        fuel_product_id: prod.id,
        fuel_product_name: prod.name,
        pump_id: undefined,
        pump_number: undefined,
        index_start: 0, index_end: 0, sorties: 0, rc: 0, ventes: 0,
        ventes_communes: 0, unit_price: prod.unit_price, amount: 0,
      } as FuelSale];
    }
    return productPumps.map(pump => ({
      fuel_product_id: prod.id,
      fuel_product_name: prod.name,
      pump_id: pump.id,
      pump_number: pump.pump_number,
      index_start: 0, index_end: 0, sorties: 0, rc: 0, ventes: 0,
      unit_price: prod.unit_price, amount: 0,
    } as FuelSale));
  });

  const lubricant_sales = lubricants.map(lub => ({
    lubricant_id: lub.id,
    lubricant_name: lub.name,
    stock_opening: 0, stock_in: 0, quantity_sold: 0, stock_closing: 0,
    unit_price: lub.unit_price, amount: 0,
  }));

  const gas_sales = gasProducts.map(gas => ({
    gas_product_id: gas.id,
    gas_product_name: gas.name,
    stock_opening: 0, stock_in: 0, quantity_sold: 0, consigne: 0,
    stock_closing_before: 0, stock_closing_final: 0,
    unit_price: gas.unit_price, amount: 0,
  }));

  return {
    sheet_date: todayDate(),
    tour_manager: '',
    shift_manager: '',
    fuel_sales,
    lubricant_sales,
    gas_sales,
    payment_records: [],
    expenses: [],
    report_amount: 0,
    advance_amount: 0,
    momo_amount: 0,
    momo_balance: 0,
    notes: '',
    ...initial,
  };
}

export default function DailySheetForm({
  station,
  products,
  pumps,
  lubricants,
  gasProducts,
  paymentMethods,
  loyaltyCards,
  currencySymbol,
  existingSheetId,
  initialData,
  onSave,
}: DailySheetFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<DailySheetFormData>(
    () => buildInitialFormData(products, pumps, lubricants, gasProducts, initialData)
  );
  const [totals, setTotals] = useState(() => recomputeSheetTotals(
    buildInitialFormData(products, pumps, lubricants, gasProducts, initialData)
  ));
  const [status, setStatus] = useState<'draft' | 'submitted' | 'validated'>('draft');
  const [isSaving, setIsSaving] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Recalcul totaux à chaque changement
  useEffect(() => {
    setTotals(recomputeSheetTotals(form));
  }, [form]);

  // Auto-save brouillon toutes les 2 min
  useEffect(() => {
    const timer = setInterval(() => {
      handleSaveDraft(true); // silent save
    }, 120_000);
    return () => clearInterval(timer);
  }, [form]);

  const updateForm = useCallback((patch: Partial<DailySheetFormData>) => {
    setForm(prev => ({ ...prev, ...patch }));
  }, []);

  const handleSaveDraft = async (silent = false) => {
    if (!silent) setIsSaving(true);
    try {
      const payload = { ...form, ...totals, status: 'draft', station_id: station.id };
      const url = existingSheetId ? `/api/sheets/${existingSheetId}` : '/api/sheets';
      const method = existingSheetId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setLastSaved(new Date());
        if (!silent) {
          const data = await res.json();
          if (!existingSheetId && onSave) onSave(data.id);
        }
      }
    } catch (err) {
      console.error('Erreur sauvegarde', err);
    } finally {
      if (!silent) setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      const payload = { ...form, ...totals, status: 'submitted', station_id: station.id };
      const url = existingSheetId ? `/api/sheets/${existingSheetId}` : '/api/sheets';
      const method = existingSheetId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setStatus('submitted');
        // Auto-generate PDF and send
        await handlePrint(data.id);
        if (onSave) onSave(data.id);
        router.push('/daily-sheet');
      }
    } catch (err) {
      console.error('Erreur soumission', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = async (sheetId?: string) => {
    setIsPrinting(true);
    try {
      const sheetWithTotals = {
        ...form,
        ...totals,
        id: sheetId || existingSheetId || '',
        station_id: station.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status,
      };
      const blob = await generateDailySheetPDF(sheetWithTotals as any, station, currencySymbol);
      openPDFForPrint(blob);
    } finally {
      setIsPrinting(false);
    }
  };

  const handleDownload = async () => {
    const sheetWithTotals = {
      ...form,
      ...totals,
      id: existingSheetId || '',
      station_id: station.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status,
    };
    const blob = await generateDailySheetPDF(sheetWithTotals as any, station, currencySymbol);
    downloadPDF(blob, `fiche-${form.sheet_date}-${station.code || station.name}.pdf`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* ── TOP BAR ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div>
          <h1 className="text-lg font-bold text-gray-800">📋 Fiche Journalière</h1>
          <div className="text-sm text-gray-500">{station.network} · {station.name}</div>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {/* Date */}
          <input
            type="date"
            value={form.sheet_date}
            onChange={e => updateForm({ sheet_date: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
          />

          {/* Tour de M. */}
          <input
            type="text"
            placeholder="Tour de M."
            value={form.tour_manager}
            onChange={e => updateForm({ tour_manager: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none w-36"
          />

          {/* Respo de tour */}
          <input
            type="text"
            placeholder="Respo de tour"
            value={form.shift_manager}
            onChange={e => updateForm({ shift_manager: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none w-36"
          />

          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => handlePrint()}
              disabled={isPrinting}
              className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50 transition flex items-center gap-1.5"
            >
              🖨️ Imprimer
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50 transition flex items-center gap-1.5"
            >
              ⬇️ PDF
            </button>
          </div>
        </div>

        {lastSaved && (
          <div className="text-xs text-green-600 w-full text-right">
            ✅ Brouillon sauvegardé à {lastSaved.toLocaleTimeString('fr-FR')}
          </div>
        )}
      </div>

      {/* ── SECTIONS PRINCIPALES ── */}
      <FuelSalesSection
        fuelSales={form.fuel_sales}
        products={products}
        pumps={pumps}
        currencySymbol={currencySymbol}
        onChange={sales => updateForm({ fuel_sales: sales })}
      />

      <LubricantSalesSection
        lubricantSales={form.lubricant_sales}
        lubricants={lubricants}
        currencySymbol={currencySymbol}
        onChange={sales => updateForm({ lubricant_sales: sales })}
      />

      <GasSalesSection
        gasSales={form.gas_sales}
        gasProducts={gasProducts}
        currencySymbol={currencySymbol}
        onChange={sales => updateForm({ gas_sales: sales })}
      />

      <PaymentsExpensesSection
        paymentRecords={form.payment_records}
        expenses={form.expenses}
        paymentMethods={paymentMethods}
        loyaltyCards={loyaltyCards}
        fuelProducts={products}
        reportAmount={form.report_amount}
        advanceAmount={form.advance_amount}
        momoAmount={form.momo_amount}
        momoBalance={form.momo_balance}
        currencySymbol={currencySymbol}
        onPaymentChange={records => updateForm({ payment_records: records })}
        onExpensesChange={exps => updateForm({ expenses: exps })}
        onReportChange={val => updateForm({ report_amount: val })}
        onAdvanceChange={val => updateForm({ advance_amount: val })}
        onMomoAmountChange={val => updateForm({ momo_amount: val })}
        onMomoBalanceChange={val => updateForm({ momo_balance: val })}
      />

      <CashSummarySection
        {...totals}
        reportAmount={form.report_amount}
        advanceAmount={form.advance_amount}
        finalCash={totals.final_cash}
        currencySymbol={currencySymbol}
        status={status}
        onSubmit={handleSubmit}
        onSaveDraft={() => handleSaveDraft()}
        isSaving={isSaving}
      />
    </div>
  );
}

