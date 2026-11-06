'use client';

import React from 'react';
import { formatAmount, checkCashBalance } from '@/lib/calculations';

interface CashSummarySectionProps {
  total_fuel_sales: number;
  total_lubricant_sales: number;
  total_gas_sales: number;
  total_sales: number;
  total_payments_received: number;
  total_expenses: number;
  reportAmount: number;
  advanceAmount: number;
  finalCash: number;
  currencySymbol: string;
  status: 'draft' | 'submitted' | 'validated';
  onSubmit: () => void;
  onSaveDraft: () => void;
  isSaving: boolean;
}

export default function CashSummarySection({
  total_fuel_sales,
  total_lubricant_sales,
  total_gas_sales,
  total_sales,
  total_payments_received,
  total_expenses,
  reportAmount,
  advanceAmount,
  finalCash,
  currencySymbol,
  status,
  onSubmit,
  onSaveDraft,
  isSaving,
}: CashSummarySectionProps) {
  const fmt = (n: number) => formatAmount(n, currencySymbol);
  const { isBalanced, variance } = checkCashBalance(total_sales, total_payments_received);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
      <h2 className="text-base font-bold text-blue-800 uppercase tracking-wide mb-4 flex items-center gap-2">
        <span>💰</span> Récapitulatif Caisse
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Ventes par catégorie */}
        <div>
          <div className="text-xs font-bold text-gray-500 uppercase mb-2">Ventes</div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">⛽ Carburants (Total 1)</span>
              <span className="font-mono font-semibold">{fmt(total_fuel_sales)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">🛢️ Lubrifiants (Total 2)</span>
              <span className="font-mono font-semibold">{fmt(total_lubricant_sales)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">🔵 Gaz (Total 3)</span>
              <span className="font-mono font-semibold">{fmt(total_gas_sales)}</span>
            </div>
            <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-bold text-blue-800">
              <span>TOTAL 1+2+3</span>
              <span className="text-lg font-mono">{fmt(total_sales)}</span>
            </div>
          </div>

          {/* Vérification équilibre */}
          <div className={`mt-3 p-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
            isBalanced ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            <span>{isBalanced ? '✅' : '⚠️'}</span>
            <span>
              {isBalanced
                ? 'Caisse équilibrée'
                : `Écart de ${fmt(Math.abs(variance))} détecté`}
            </span>
          </div>
        </div>

        {/* Calcul caisse finale */}
        <div>
          <div className="text-xs font-bold text-gray-500 uppercase mb-2">Calcul Caisse</div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total paiements reçus</span>
              <span className="font-mono text-green-700">+ {fmt(total_payments_received)}</span>
            </div>
            {reportAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Report précédent</span>
                <span className="font-mono text-green-700">+ {fmt(reportAmount)}</span>
              </div>
            )}
            {total_expenses > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Dépenses</span>
                <span className="font-mono text-red-600">– {fmt(total_expenses)}</span>
              </div>
            )}
            {advanceAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Avance versée</span>
                <span className="font-mono text-orange-600">– {fmt(advanceAmount)}</span>
              </div>
            )}
          </div>

          {/* CAISSE FINALE — Grande case */}
          <div className="mt-4 bg-blue-700 text-white rounded-xl p-4 text-center">
            <div className="text-xs uppercase tracking-widest opacity-80 mb-1">CAISSE</div>
            <div className="text-3xl font-bold font-mono tracking-tight">
              {fmt(finalCash)}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6 justify-end">
        <button
          onClick={onSaveDraft}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"
        >
          {isSaving ? '...' : '💾 Brouillon'}
        </button>
        <button
          onClick={onSubmit}
          disabled={isSaving || status === 'validated'}
          className="px-6 py-2.5 rounded-lg bg-blue-700 text-white text-sm font-bold hover:bg-blue-800 transition disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving ? (
            <span className="animate-spin">⟳</span>
          ) : (
            <span>✅</span>
          )}
          {status === 'validated' ? 'Validée' : 'Soumettre la fiche'}
        </button>
      </div>
    </div>
  );
}
