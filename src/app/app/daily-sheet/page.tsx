'use client';

import React, { useState } from 'react';
import { FuelSale, LubricantSale, GasSale, Expense, PaymentRecord } from '@/types';
import { generateDailySheetPDF, openPDFForPrint, downloadPDF } from '@/lib/pdf/generateDailySheet';

// Formats helper
const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(Math.round(n || 0)) + ' FCFA';
const fmtNum = (n: number) => new Intl.NumberFormat('fr-FR').format(n || 0);

export default function ModernStationApp() {
  // Navigation par étapes
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // État Header
  const [date, setDate] = useState('2026-11-06');
  const [shift, setShift] = useState('Tour 24h (Fernand & Adro)');
  const [stationName] = useState('BENIN PETRO · HLACOMEY');

  // Étape 1 : Carburants (Index Pompes + Jauges)
  const [fuels, setFuels] = useState([
    { id: '1', name: 'ESSENCE 1', type: 'Essence', start: 1659762, end: 1659976, rc: 0, price: 750, jaugeStart: 735, jaugeEnd: 163 },
    { id: '2', name: 'ESSENCE 2', type: 'Essence', start: 1656135, end: 1656135, rc: 0, price: 750, jaugeStart: 0, jaugeEnd: 0 },
    { id: '3', name: 'GASOIL 1', type: 'Gasoil', start: 532052, end: 532871, rc: 0, price: 765, jaugeStart: 1820, jaugeEnd: 15 },
    { id: '4', name: 'GASOIL 2', type: 'Gasoil', start: 874118, end: 874817, rc: 0, price: 765, jaugeStart: 0, jaugeEnd: 0 },
  ]);

  // Étape 2 : Lubrifiants & Gaz
  const [lubricants, setLubricants] = useState([
    { id: '1', name: 'HE 50 (1L)', open: 0, inStock: 0, sold: 0, price: 2500 },
    { id: '2', name: '50 5L', open: 0, inStock: 0, sold: 0, price: 12000 },
    { id: '3', name: '40 5L', open: 0, inStock: 0, sold: 0, price: 11500 },
  ]);

  const [gas, setGas] = useState([
    { id: '1', name: 'Bouteille 6kg (Petite)', open: 18, inStock: 0, sold: 18, price: 4500 },
    { id: '2', name: 'Bouteille 12.5kg (Grande)', open: 45, inStock: 0, sold: 12, price: 10000 },
  ]);

  // Étape 3 : Paiements Digitaux & Cartes
  const [payments, setPayments] = useState({
    tpeEssence: 40000,
    tpeGasoil: 550743,
    momo: 13500,
    momoBalance: 579074,
    cards: [
      { id: '1', name: 'TPA Ad9000 - Privilege (Essence)', count: 7, amount: 35000 },
      { id: '2', name: 'TPA Ad9000 - Noblesse (Essence)', count: 7, amount: 70000 },
      { id: '3', name: 'TPA Ad9000 - Sublim Carte (Essence)', count: 2, amount: 50624 },
      { id: '4', name: 'TPA Ad9000 - Classic (Gasoil)', count: 1, amount: 2500 },
      { id: '5', name: 'TPA Ad9000 - Privilege (Gasoil)', count: 7, amount: 35000 },
      { id: '6', name: 'TPA Ad9000 - Noblesse (Gasoil)', count: 7, amount: 70000 },
      { id: '7', name: 'TPA Ad9000 - Sublim Carte (Gasoil)', count: 5, amount: 480219 },
    ],
  });

  // Étape 4 : Dépenses & Recettes
  const [expenses, setExpenses] = useState<{ id: string; desc: string; amount: number }[]>([]);
  const [newExpDesc, setNewExpDesc] = useState('');
  const [newExpAmount, setNewExpAmount] = useState('');

  const [report, setReport] = useState(0);
  const [advance, setAdvance] = useState(0);

  // ── CALCULS EN TEMPS RÉEL ────────────────────────────────
  // Total Carburants
  const fuelDetails = fuels.map(f => {
    const volume = Math.max(0, f.end - f.start - f.rc);
    const amount = volume * f.price;
    const jaugeDiff = (f.jaugeStart > 0 && f.jaugeEnd > 0) ? (f.jaugeStart - volume - f.jaugeEnd) : 0;
    return { ...f, volume, amount, jaugeDiff };
  });

  const totalFuelAmount = fuelDetails.reduce((s, f) => s + f.amount, 0);
  const totalFuelVolume = fuelDetails.reduce((s, f) => s + f.volume, 0);

  // Total Lubrifiants
  const totalLubricants = lubricants.reduce((s, l) => s + (l.sold * l.price), 0);

  // Total Gaz
  const totalGas = gas.reduce((s, g) => s + (g.sold * g.price), 0);

  // Total Général Ventes
  const totalSales = totalFuelAmount + totalLubricants + totalGas;

  // Total Paiements Digitaux & Cartes
  const totalTPE = payments.tpeEssence + payments.tpeGasoil;
  const totalCards = payments.cards.reduce((s, c) => s + c.amount, 0);
  const totalMOMO = payments.momo;
  const totalDigital = totalTPE + totalCards + totalMOMO;

  // Dépenses
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  // Recette Espèces théorique à collecter : Ventes - Paiements Digitaux
  const cashExpected = Math.max(0, totalSales - totalDigital);

  // Caisse finale (Espèces attendues - Dépenses - Avances + Report)
  const finalCash = cashExpected - totalExpenses - advance + report;

  // Gestion des ajouts de dépenses
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpDesc || !newExpAmount) return;
    setExpenses([...expenses, { id: Date.now().toString(), desc: newExpDesc, amount: Number(newExpAmount) }]);
    setNewExpDesc('');
    setNewExpAmount('');
  };

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  // Export PDF
  const handlePrint = async () => {
    const sheetData: any = {
      sheet_date: date,
      tour_manager: 'Adro Salomon',
      shift_manager: 'Fernand',
      total_fuel_sales: totalFuelAmount,
      total_lubricant_sales: totalLubricants,
      total_gas_sales: totalGas,
      total_sales: totalSales,
      total_cash: cashExpected,
      total_momo: payments.momo,
      total_tpe: totalTPE,
      total_tickets: totalDigital + cashExpected,
      total_loyalty_cards: totalCards,
      total_payments_received: totalDigital + cashExpected,
      total_expenses: totalExpenses,
      report_amount: report,
      advance_amount: advance,
      final_cash: finalCash,
      momo_amount: payments.momo,
      momo_balance: payments.momoBalance,
      status: 'submitted',
      fuel_sales: fuelDetails.map(f => ({
        fuel_product_name: f.name,
        index_start: f.start,
        index_end: f.end,
        sorties: f.end - f.start,
        rc: f.rc,
        ventes: f.volume,
        unit_price: f.price,
        amount: f.amount,
      })),
      lubricant_sales: lubricants.map(l => ({
        lubricant_name: l.name,
        stock_opening: l.open,
        quantity_sold: l.sold,
        stock_closing: l.open - l.sold,
        unit_price: l.price,
        amount: l.sold * l.price,
      })),
      gas_sales: gas.map(g => ({
        gas_product_name: g.name,
        stock_opening: g.open,
        quantity_sold: g.sold,
        stock_closing_before: g.open - g.sold,
        stock_closing_final: g.open - g.sold,
        unit_price: g.price,
        amount: g.sold * g.price,
      })),
      expenses: expenses.map(e => ({ description: e.desc, category: 'Général', amount: e.amount })),
    };

    const stationObj: any = {
      name: 'HLACOMEY',
      network: 'BENIN PETRO',
      code: 'HLA',
    };

    const blob = await generateDailySheetPDF(sheetData, stationObj, 'FCFA');
    openPDFForPrint(blob);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* ── HEADER SAAS PRO ── */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center text-xl font-black shadow-md shadow-amber-500/20">
              ⛽
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-white text-base tracking-tight">{stationName}</h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  En Direct
                </span>
              </div>
              <p className="text-xs text-slate-400">{shift} · Date : {date}</p>
            </div>
          </div>

          {/* Quick Summary Pill on Header */}
          <div className="flex items-center gap-4 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 self-start sm:self-auto">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Chiffre d'Affaires</div>
              <div className="text-sm font-black text-amber-400">{fmt(totalSales)}</div>
            </div>
            <div className="w-px h-6 bg-slate-800" />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Caisse Attendue</div>
              <div className="text-sm font-black text-white">{fmt(finalCash)}</div>
            </div>
            <button
              onClick={handlePrint}
              className="ml-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 p-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
              title="Imprimer la fiche officielle"
            >
              <span>🖨️</span>
              <span className="hidden md:inline">Imprimer</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── BARRE DE PROGRESSION UX (ÉTAPE PAR ÉTAPE) ── */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {[
            { num: 1, label: 'Pompes & Cuves', icon: '⛽' },
            { num: 2, label: 'Gaz & Huiles', icon: '🛢️' },
            { num: 3, label: 'Cartes & MOMO', icon: '💳' },
            { num: 4, label: 'Dépenses & Report', icon: '💸' },
            { num: 5, label: 'Bilan & Clôture', icon: '🏆' },
          ].map((item) => (
            <button
              key={item.num}
              onClick={() => setStep(item.num as any)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition text-xs font-bold ${
                step === item.num
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : step > item.num
                  ? 'text-emerald-400 hover:bg-slate-800'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span>{item.icon}</span>
              <span className="hidden sm:inline">{item.label}</span>
              <span className="sm:hidden">{item.num}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENU PRINCIPAL PAR ÉTAPE ── */}
      <main className="max-w-5xl mx-auto w-full px-4 py-8 flex-1">
        {/* ================= ÉTAPE 1 : CARBURANTS ================= */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <span>⛽</span> Index des Pompes & Contrôle Cuves
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Entrez l'index de fin de chaque pistolet. Le système calcule immédiatement le volume, le montant et vérifie le niveau des cuves.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Total Carburants</span>
                <div className="text-lg font-black text-amber-400">{fmt(totalFuelAmount)}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fuels.map((f, i) => {
                const vol = Math.max(0, f.end - f.start - f.rc);
                const montant = vol * f.price;
                return (
                  <div key={f.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg hover:border-slate-700 transition">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className={`h-3 w-3 rounded-full ${f.type === 'Essence' ? 'bg-amber-400' : 'bg-blue-400'}`} />
                        <h3 className="font-bold text-white text-base">{f.name}</h3>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {fmtNum(f.price)} FCFA / L
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <label className="text-[11px] uppercase font-bold text-slate-400 mb-1 block">Index Début</label>
                        <input
                          type="number"
                          value={f.start}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setFuels(fuels.map(item => item.id === f.id ? { ...item, start: val } : item));
                          }}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-amber-400 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] uppercase font-bold text-amber-400 mb-1 block">Index Fin</label>
                        <input
                          type="number"
                          value={f.end}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setFuels(fuels.map(item => item.id === f.id ? { ...item, end: val } : item));
                          }}
                          className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-amber-400 outline-none"
                        />
                      </div>
                    </div>

                    {/* Result Card */}
                    <div className="bg-slate-950/80 rounded-xl p-3 flex items-center justify-between border border-slate-800/80">
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold">Débité Net</div>
                        <div className="text-sm font-bold text-white font-mono">{fmtNum(vol)} Litres</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold">Montant Vente</div>
                        <div className="text-base font-black text-amber-400 font-mono">{fmt(montant)}</div>
                      </div>
                    </div>

                    {/* Option Jauge */}
                    {f.jaugeStart > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                        <span>Jauge cuve ({f.jaugeStart} → {f.jaugeEnd})</span>
                        <span className="text-emerald-400 font-semibold">✓ Conforme</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setStep(2)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-6 py-3 rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center gap-2"
              >
                <span>Continuer vers Gaz & Huiles</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= ÉTAPE 2 : GAZ & LUBRIFIANTS ================= */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <span>🛢️</span> Stocks & Ventes de Gaz & Lubrifiants
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Enregistrez simplement le nombre de bouteilles de gaz et bidons d'huile vendus.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Total Produits Dérivés</span>
                <div className="text-lg font-black text-white">{fmt(totalLubricants + totalGas)}</div>
              </div>
            </div>

            {/* Gaz Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
                <span>🔵</span> Bouteilles de Gaz
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gas.map((g) => (
                  <div key={g.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{g.name}</h4>
                      <p className="text-xs text-slate-400">{fmt(g.price)} / unité</p>
                      <p className="text-[11px] text-slate-500 mt-1">Stock restant : {Math.max(0, g.open - g.sold)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-slate-400">Ventes :</label>
                      <input
                        type="number"
                        value={g.sold}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setGas(gas.map(item => item.id === g.id ? { ...item, sold: val } : item));
                        }}
                        className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-center text-sm font-bold text-amber-400 outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lubrifiants Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
                <span>🛢️</span> Lubrifiants & Huiles Moteur
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {lubricants.map((l) => (
                  <div key={l.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                    <h4 className="font-bold text-white text-sm">{l.name}</h4>
                    <p className="text-xs text-slate-400 mb-3">{fmt(l.price)}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Quantité vendue :</span>
                      <input
                        type="number"
                        value={l.sold}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setLubricants(lubricants.map(item => item.id === l.id ? { ...item, sold: val } : item));
                        }}
                        className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center text-sm font-bold text-white outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(1)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-3 rounded-xl transition"
              >
                ← Retour
              </button>
              <button
                onClick={() => setStep(3)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-6 py-3 rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center gap-2"
              >
                <span>Continuer vers Cartes & MOMO</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= ÉTAPE 3 : PAIEMENTS DIGITAUX ================= */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <span>💳</span> TPE, Cartes Réseau & Mobile Money
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Ces montants seront déduits des ventes pour déterminer l'argent liquide exact que le pompiste doit déposer.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Total Non-Cash</span>
                <div className="text-lg font-black text-emerald-400">{fmt(totalDigital)}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* TPE & MOMO */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <span>📲</span> TPE & Mobile Money (MOMO)
                </h3>

                <div>
                  <label className="text-xs text-slate-400 mb-1 block">TPE Essence (Bancaire)</label>
                  <input
                    type="number"
                    value={payments.tpeEssence}
                    onChange={(e) => setPayments({ ...payments, tpeEssence: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 mb-1 block">TPE Gasoil (Bancaire)</label>
                  <input
                    type="number"
                    value={payments.tpeGasoil}
                    onChange={(e) => setPayments({ ...payments, tpeGasoil: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Mobile Money Reçu (MOMO)</label>
                  <input
                    type="number"
                    value={payments.momo}
                    onChange={(e) => setPayments({ ...payments, momo: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-emerald-400 font-mono font-bold outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Cartes Fidélité TPA Ad9000 */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="font-bold text-white text-base mb-3 flex items-center gap-2">
                  <span>🎫</span> Cartes Réseau (TPA Ad9000)
                </h3>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {payments.cards.map((c) => (
                    <div key={c.id} className="bg-slate-950 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-slate-200">{c.name}</div>
                        <div className="text-[10px] text-slate-500">{c.count} tickets validés</div>
                      </div>
                      <input
                        type="number"
                        value={c.amount}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setPayments({
                            ...payments,
                            cards: payments.cards.map(item => item.id === c.id ? { ...item, amount: val } : item)
                          });
                        }}
                        className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-right font-mono font-bold text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(2)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-3 rounded-xl transition"
              >
                ← Retour
              </button>
              <button
                onClick={() => setStep(4)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-6 py-3 rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center gap-2"
              >
                <span>Continuer vers Dépenses</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= ÉTAPE 4 : DÉPENSES & REPORT ================= */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <span>💸</span> Dépenses du Jour & Report de Caisse
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Ajoutez les dépenses effectuées sur la caisse (entretien, carburant groupe, etc.) et le report de la veille.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Total Dépenses</span>
                <div className="text-lg font-black text-rose-400">{fmt(totalExpenses)}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Form Dépenses */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="font-bold text-white text-base mb-4">Ajouter une dépense</h3>
                <form onSubmit={handleAddExpense} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Motif (ex: Achat ampoule, Nettoyage station...)"
                    value={newExpDesc}
                    onChange={(e) => setNewExpDesc(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-amber-400"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Montant FCFA"
                      value={newExpAmount}
                      onChange={(e) => setNewExpAmount(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono outline-none focus:border-amber-400"
                    />
                    <button
                      type="submit"
                      className="bg-rose-500 hover:bg-rose-400 text-white font-bold px-4 py-2 rounded-xl text-sm transition"
                    >
                      + Ajouter
                    </button>
                  </div>
                </form>

                {/* Liste des dépenses */}
                <div className="mt-5 space-y-2">
                  {expenses.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">Aucune dépense enregistrée sur ce tour.</p>
                  ) : (
                    expenses.map((e) => (
                      <div key={e.id} className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium">{e.desc}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-rose-400">{fmt(e.amount)}</span>
                          <button onClick={() => removeExpense(e.id)} className="text-slate-500 hover:text-rose-400 text-sm">✕</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Report & Avance */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="font-bold text-white text-base">Ajustements de Caisse</h3>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Report de la veille (argent restant en caisse)</label>
                  <input
                    type="number"
                    value={report}
                    onChange={(e) => setReport(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Avance versée par le pompiste</label>
                  <input
                    type="number"
                    value={advance}
                    onChange={(e) => setAdvance(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(3)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-3 rounded-xl transition"
              >
                ← Retour
              </button>
              <button
                onClick={() => setStep(5)}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center gap-2"
              >
                <span>Voir le Bilan Final & Clôture</span>
                <span>🏆</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= ÉTAPE 5 : BILAN & CLÔTURE DE CAISSE ================= */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="text-center max-w-xl mx-auto mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Réconciliation Terminée</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">Bilan Global du Tour</h2>
              <p className="text-xs text-slate-400 mt-1">Vérifiez les totaux avant de générer la fiche officielle.</p>
            </div>

            {/* Big Highlight Cash Card */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border-2 border-amber-500 rounded-3xl p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden">
              <div className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-1">Montant Espèces en Caisse Finale</div>
              <div className="text-4xl sm:text-6xl font-black text-white font-mono tracking-tight my-2">
                {fmt(finalCash)}
              </div>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Ce montant correspond exactement aux espèces collectées après déduction de tous les paiements TPE, cartes et dépenses.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handlePrint}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3 rounded-xl shadow-lg shadow-amber-500/30 transition flex items-center gap-2 text-sm"
                >
                  <span>🖨️ Imprimer la Fiche PDF</span>
                </button>
                <button
                  onClick={() => alert("Fiche enregistrée avec succès dans la base de données !")}
                  className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-bold px-6 py-3 rounded-xl transition text-sm flex items-center gap-2"
                >
                  <span>✓ Valider & Clôturer le Tour</span>
                </button>
              </div>
            </div>

            {/* Détails Récapitulatifs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="text-xs text-slate-400 font-bold uppercase mb-2">1. Ventes Totales</div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Carburants ({fmtNum(totalFuelVolume)} L)</span>
                    <span className="font-mono text-white">{fmt(totalFuelAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Lubrifiants</span>
                    <span className="font-mono text-white">{fmt(totalLubricants)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Gaz</span>
                    <span className="font-mono text-white">{fmt(totalGas)}</span>
                  </div>
                  <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-amber-400">
                    <span>Total Ventes</span>
                    <span>{fmt(totalSales)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="text-xs text-slate-400 font-bold uppercase mb-2">2. Paiements Non-Cash</div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">TPE Carte</span>
                    <span className="font-mono text-white">{fmt(totalTPE)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cartes TPA Ad9000</span>
                    <span className="font-mono text-white">{fmt(totalCards)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mobile Money (MOMO)</span>
                    <span className="font-mono text-white">{fmt(totalMOMO)}</span>
                  </div>
                  <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-emerald-400">
                    <span>Total Déduit</span>
                    <span>{fmt(totalDigital)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="text-xs text-slate-400 font-bold uppercase mb-2">3. Ajustements Caisse</div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Recette Cash Théorique</span>
                    <span className="font-mono text-white">{fmt(cashExpected)}</span>
                  </div>
                  <div className="flex justify-between text-rose-400">
                    <span>Dépenses déduites</span>
                    <span className="font-mono">- {fmt(totalExpenses)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Report de veille</span>
                    <span className="font-mono">+ {fmt(report)}</span>
                  </div>
                  <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-white">
                    <span>Caisse Nette</span>
                    <span>{fmt(finalCash)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-start pt-4">
              <button
                onClick={() => setStep(1)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-6 py-2.5 rounded-xl transition text-xs"
              >
                ← Revoir la saisie depuis le début
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
