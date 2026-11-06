'use client';

import React from 'react';
import { PaymentRecord, Expense, PaymentMethod, LoyaltyCard, FuelProduct } from '@/types';
import { formatAmount } from '@/lib/calculations';

interface PaymentsExpensesSectionProps {
  paymentRecords: PaymentRecord[];
  expenses: Expense[];
  paymentMethods: PaymentMethod[];
  loyaltyCards: LoyaltyCard[];
  fuelProducts: FuelProduct[];
  reportAmount: number;
  advanceAmount: number;
  momoAmount: number;
  momoBalance: number;
  currencySymbol: string;
  onPaymentChange: (records: PaymentRecord[]) => void;
  onExpensesChange: (expenses: Expense[]) => void;
  onReportChange: (val: number) => void;
  onAdvanceChange: (val: number) => void;
  onMomoAmountChange: (val: number) => void;
  onMomoBalanceChange: (val: number) => void;
}

const EXPENSE_CATEGORIES = [
  'Carburant générateur',
  'Nettoyage',
  'Maintenance',
  'Avance salaire',
  'Achat urgent',
  'Transport',
  'Autre',
];

export default function PaymentsExpensesSection({
  paymentRecords,
  expenses,
  paymentMethods,
  loyaltyCards,
  fuelProducts,
  reportAmount,
  advanceAmount,
  momoAmount,
  momoBalance,
  currencySymbol,
  onPaymentChange,
  onExpensesChange,
  onReportChange,
  onAdvanceChange,
  onMomoAmountChange,
  onMomoBalanceChange,
}: PaymentsExpensesSectionProps) {

  const fmt = (n: number) => formatAmount(n, currencySymbol);

  // ── TPE ────────────────────────────────────────────
  const tpeRecords = paymentRecords.filter(p => p.payment_method_code === 'tpe');
  const updateTPE = (fuelName: string, amount: number) => {
    const existing = paymentRecords.filter(p => p.payment_method_code === 'tpe' && p.fuel_product_name !== fuelName);
    const updated = [...existing, { payment_method_code: 'tpe', fuel_product_name: fuelName, amount }];
    onPaymentChange([...paymentRecords.filter(p => p.payment_method_code !== 'tpe'), ...updated]);
  };

  // ── Cartes fidélité ────────────────────────────────
  const loyaltyRecords = paymentRecords.filter(p => p.loyalty_card_id);
  const updateLoyalty = (cardId: string, fuelName: string, cardName: string, amount: number) => {
    const others = paymentRecords.filter(p => !(p.loyalty_card_id === cardId && p.fuel_product_name === fuelName));
    if (amount > 0) {
      onPaymentChange([...others, { payment_method_code: 'loyalty', loyalty_card_id: cardId, loyalty_card_name: cardName, fuel_product_name: fuelName, amount }]);
    } else {
      onPaymentChange(others);
    }
  };

  // ── MOMO ───────────────────────────────────────────
  const momoRecord = paymentRecords.find(p => p.payment_method_code === 'momo');
  const updateMomo = (amount: number) => {
    const others = paymentRecords.filter(p => p.payment_method_code !== 'momo');
    onPaymentChange([...others, { payment_method_code: 'momo', amount }]);
    onMomoAmountChange(amount);
  };

  // ── Cash ────────────────────────────────────────────
  const cashRecord = paymentRecords.find(p => p.payment_method_code === 'cash');
  const updateCash = (amount: number) => {
    const others = paymentRecords.filter(p => p.payment_method_code !== 'cash');
    onPaymentChange([...others, { payment_method_code: 'cash', amount }]);
  };

  // ── Dépenses ────────────────────────────────────────
  const addExpense = () => {
    onExpensesChange([...expenses, { description: '', category: 'Autre', amount: 0 }]);
  };
  const updateExpense = (idx: number, field: keyof Expense, value: string | number) => {
    const updated = [...expenses];
    updated[idx] = { ...updated[idx], [field]: value };
    onExpensesChange(updated);
  };
  const removeExpense = (idx: number) => {
    onExpensesChange(expenses.filter((_, i) => i !== idx));
  };

  const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const totalTPE = tpeRecords.reduce((s, p) => s + p.amount, 0);
  const totalLoyalty = loyaltyRecords.reduce((s, p) => s + p.amount, 0);
  const totalMomo = momoRecord?.amount || 0;
  const totalCash = cashRecord?.amount || 0;
  const totalTickets = totalTPE + totalLoyalty + totalMomo + totalCash;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

      {/* ── COLONNE GAUCHE : DÉPENSES ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-red-700 uppercase tracking-wide flex items-center gap-2">
            <span>💸</span> Dépenses
          </h2>
          <span className="text-sm font-bold text-red-600">{fmt(totalExpenses)}</span>
        </div>

        <div className="space-y-2">
          {expenses.map((exp, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Motif de la dépense"
                value={exp.description}
                onChange={e => updateExpense(idx, 'description', e.target.value)}
                className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-xs focus:border-red-400 outline-none"
              />
              <select
                value={exp.category}
                onChange={e => updateExpense(idx, 'category', e.target.value)}
                className="border border-gray-300 rounded px-1 py-1.5 text-xs focus:border-red-400 outline-none"
              >
                {EXPENSE_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Montant"
                value={exp.amount || ''}
                onChange={e => updateExpense(idx, 'amount', Number(e.target.value))}
                className="w-28 border border-gray-300 rounded px-2 py-1.5 text-xs text-right focus:border-red-400 outline-none"
              />
              <button
                onClick={() => removeExpense(idx)}
                className="text-red-400 hover:text-red-600 text-lg leading-none"
              >×</button>
            </div>
          ))}
        </div>

        <button
          onClick={addExpense}
          className="mt-3 w-full border border-dashed border-red-300 text-red-500 hover:bg-red-50 rounded py-1.5 text-xs font-medium transition"
        >
          + Ajouter une dépense
        </button>
      </div>

      {/* ── COLONNE DROITE : PAIEMENTS ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h2 className="text-base font-bold text-green-700 uppercase tracking-wide flex items-center gap-2 mb-3">
          <span>💳</span> Paiements Reçus
        </h2>

        {/* TPE */}
        <div className="mb-3">
          <div className="text-xs font-bold text-gray-600 mb-1 uppercase">TPE (Carte bancaire)</div>
          {fuelProducts.map(fp => (
            <div key={fp.id} className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-500 w-20">{fp.name}</span>
              <input
                type="number"
                placeholder="0"
                value={tpeRecords.find(r => r.fuel_product_name === fp.name)?.amount || ''}
                onChange={e => updateTPE(fp.name, Number(e.target.value))}
                className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs text-right focus:border-green-400 outline-none"
              />
              <span className="text-xs text-gray-400">{currencySymbol}</span>
            </div>
          ))}
        </div>

        {/* Cartes fidélité */}
        {loyaltyCards.length > 0 && (
          <div className="mb-3">
            <div className="text-xs font-bold text-gray-600 mb-1 uppercase">Cartes Réseau</div>
            {loyaltyCards.map(card => (
              fuelProducts.map(fp => (
                <div key={`${card.id}-${fp.id}`} className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-500 w-32 truncate">{fp.name} - {card.name}</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={loyaltyRecords.find(r => r.loyalty_card_id === card.id && r.fuel_product_name === fp.name)?.amount || ''}
                    onChange={e => updateLoyalty(card.id, fp.name, card.name, Number(e.target.value))}
                    className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs text-right focus:border-green-400 outline-none"
                  />
                  <span className="text-xs text-gray-400">{currencySymbol}</span>
                </div>
              ))
            ))}
          </div>
        )}

        {/* MOMO */}
        <div className="mb-3">
          <div className="text-xs font-bold text-gray-600 mb-1 uppercase">Mobile Money (MOMO)</div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-500 w-20">Montant</span>
            <input
              type="number"
              placeholder="0"
              value={momoRecord?.amount || ''}
              onChange={e => updateMomo(Number(e.target.value))}
              className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs text-right focus:border-green-400 outline-none"
            />
            <span className="text-xs text-gray-400">{currencySymbol}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-20">Solde MOMO</span>
            <input
              type="number"
              placeholder="0"
              value={momoBalance || ''}
              onChange={e => onMomoBalanceChange(Number(e.target.value))}
              className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs text-right focus:border-orange-400 outline-none"
            />
            <span className="text-xs text-gray-400">{currencySymbol}</span>
          </div>
        </div>

        {/* Cash */}
        <div className="mb-3">
          <div className="text-xs font-bold text-gray-600 mb-1 uppercase">Cash (Espèces)</div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-20">Recette</span>
            <input
              type="number"
              placeholder="0"
              value={cashRecord?.amount || ''}
              onChange={e => updateCash(Number(e.target.value))}
              className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs text-right focus:border-green-400 outline-none"
            />
            <span className="text-xs text-gray-400">{currencySymbol}</span>
          </div>
        </div>

        {/* Total tickets */}
        <div className="border-t border-gray-200 pt-2 mt-2">
          <div className="flex justify-between text-sm font-bold text-green-700">
            <span>TOTAL TICKETS</span>
            <span>{fmt(totalTickets)}</span>
          </div>
        </div>
      </div>

      {/* ── REPORT + AVANCE ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h2 className="text-base font-bold text-orange-700 uppercase tracking-wide mb-3 flex items-center gap-2">
          <span>🔄</span> Report & Avance
        </h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600 w-32">Report précédent</label>
            <input
              type="number"
              placeholder="0"
              value={reportAmount || ''}
              onChange={e => onReportChange(Number(e.target.value))}
              className="flex-1 border border-orange-300 rounded px-3 py-2 text-sm text-right focus:border-orange-500 outline-none"
            />
            <span className="text-xs text-gray-400">{currencySymbol}</span>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600 w-32">Avance versée</label>
            <input
              type="number"
              placeholder="0"
              value={advanceAmount || ''}
              onChange={e => onAdvanceChange(Number(e.target.value))}
              className="flex-1 border border-orange-300 rounded px-3 py-2 text-sm text-right focus:border-orange-500 outline-none"
            />
            <span className="text-xs text-gray-400">{currencySymbol}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

