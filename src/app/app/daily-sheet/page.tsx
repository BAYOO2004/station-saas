'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Fuel, 
  Layers, 
  CreditCard, 
  ReceiptText, 
  CheckCircle2, 
  Printer, 
  TrendingUp, 
  Clock, 
  Building2, 
  Trash2, 
  ArrowRight, 
  ArrowLeft,
  ShieldCheck,
  SlidersHorizontal
} from '@/components/icons';
import { generateDailySheetPDF, openPDFForPrint } from '@/lib/pdf/generateDailySheet';

const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(Math.round(n || 0)) + ' FCFA';
const fmtNum = (n: number) => new Intl.NumberFormat('fr-FR').format(n || 0);

export default function CRMStationDashboard() {
  const [activeTab, setActiveTab] = useState<'daily' | 'analytics' | 'history' | 'settings'>('daily');
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Données de la station (BENIN PETRO - HLACOMEY)
  const [date, setDate] = useState('2026-11-06');
  const [shift, setShift] = useState('Tour 24h (Adro & Fernand)');
  
  // Étape 1 : Carburants (Compteurs & Cuves)
  const [fuels, setFuels] = useState([
    { id: '1', name: 'Essence - Pompe 01', type: 'Essence', start: 1659762, end: 1659976, rc: 0, price: 750, jaugeStart: 735, jaugeEnd: 163 },
    { id: '2', name: 'Essence - Pompe 02', type: 'Essence', start: 1656135, end: 1656135, rc: 0, price: 750, jaugeStart: 0, jaugeEnd: 0 },
    { id: '3', name: 'Gasoil - Pompe 01', type: 'Gasoil', start: 532052, end: 532871, rc: 0, price: 765, jaugeStart: 1820, jaugeEnd: 15 },
    { id: '4', name: 'Gasoil - Pompe 02', type: 'Gasoil', start: 874118, end: 874817, rc: 0, price: 765, jaugeStart: 0, jaugeEnd: 0 },
  ]);

  // Étape 2 : Produits Annexes (Gaz & Lubrifiants)
  const [lubricants, setLubricants] = useState([
    { id: '1', name: 'Huile Moteur HE 50 (1L)', open: 0, sold: 0, price: 2500 },
    { id: '2', name: 'Bidon 50 (5L)', open: 0, sold: 0, price: 12000 },
    { id: '3', name: 'Bidon 40 (5L)', open: 0, sold: 0, price: 11500 },
  ]);

  const [gas, setGas] = useState([
    { id: '1', name: 'Gaz Bouteille 6kg (Petite)', open: 18, sold: 18, price: 4500 },
    { id: '2', name: 'Gaz Bouteille 12.5kg (Grande)', open: 45, sold: 12, price: 10000 },
  ]);

  // Étape 3 : Paiements Digitaux & Cartes
  const [payments, setPayments] = useState({
    tpeEssence: 40000,
    tpeGasoil: 550743,
    momo: 13500,
    momoBalance: 579074,
    cards: [
      { id: '1', name: 'Carte Privilège (Essence)', count: 7, amount: 35000 },
      { id: '2', name: 'Carte Noblesse (Essence)', count: 7, amount: 70000 },
      { id: '3', name: 'Sublim Carte (Essence)', count: 2, amount: 50624 },
      { id: '4', name: 'Carte Classic (Gasoil)', count: 1, amount: 2500 },
      { id: '5', name: 'Carte Privilège (Gasoil)', count: 7, amount: 35000 },
      { id: '6', name: 'Carte Noblesse (Gasoil)', count: 7, amount: 70000 },
      { id: '7', name: 'Sublim Carte (Gasoil)', count: 5, amount: 480219 },
    ],
  });

  // Étape 4 : Dépenses & Caisse
  const [expenses, setExpenses] = useState<{ id: string; desc: string; amount: number; category: string }[]>([]);
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCat, setNewCat] = useState('Maintenance');

  const [report, setReport] = useState(0);
  const [advance, setAdvance] = useState(0);

  // ── CALCULS COMPTABLES AUTOMATIQUES ────────────────────────
  const fuelDetails = fuels.map(f => {
    const volume = Math.max(0, f.end - f.start - f.rc);
    const amount = volume * f.price;
    const jaugeDiff = (f.jaugeStart > 0 && f.jaugeEnd > 0) ? (f.jaugeStart - volume - f.jaugeEnd) : 0;
    return { ...f, volume, amount, jaugeDiff };
  });

  const totalFuelAmount = fuelDetails.reduce((s, f) => s + f.amount, 0);
  const totalFuelVolume = fuelDetails.reduce((s, f) => s + f.volume, 0);
  const totalLubricants = lubricants.reduce((s, l) => s + (l.sold * l.price), 0);
  const totalGas = gas.reduce((s, g) => s + (g.sold * g.price), 0);
  const totalSales = totalFuelAmount + totalLubricants + totalGas;

  const totalTPE = payments.tpeEssence + payments.tpeGasoil;
  const totalCards = payments.cards.reduce((s, c) => s + c.amount, 0);
  const totalMOMO = payments.momo;
  const totalDigital = totalTPE + totalCards + totalMOMO;

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const cashExpected = Math.max(0, totalSales - totalDigital);
  const finalCash = cashExpected - totalExpenses - advance + report;

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc || !newAmount) return;
    setExpenses([...expenses, { id: Date.now().toString(), desc: newDesc, amount: Number(newAmount), category: newCat }]);
    setNewDesc('');
    setNewAmount('');
  };

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
      status: 'validated',
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
      expenses: expenses.map(e => ({ description: e.desc, category: e.category, amount: e.amount })),
    };

    const stationObj: any = {
      name: 'HLACOMEY',
      network: 'BENIN PETRO',
      code: 'HLA',
    };

    const blob = await generateDailySheetPDF(sheetData, stationObj, 'FCFA');
    openPDFForPrint(blob);
  };

  const stepsList = [
    { num: 1, title: 'Carburants & Pompes', desc: 'Index compteurs et contrôles cuves', icon: Fuel },
    { num: 2, title: 'Gaz & Lubrifiants', desc: 'Ventes produits dérivés', icon: Layers },
    { num: 3, title: 'Transactions Digitales', desc: 'TPE, Cartes Ad9000 & MOMO', icon: CreditCard },
    { num: 4, title: 'Dépenses & Caisse', desc: 'Justificatifs & fonds de caisse', icon: ReceiptText },
    { num: 5, title: 'Clôture & Validation', desc: 'Arrêté comptable & impression', icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* ── SIDEBAR CRM STRICTE & MODERNE ── */}
      <aside className="w-64 border-r border-slate-800/80 bg-slate-900/60 backdrop-blur-xl flex flex-col justify-between hidden lg:flex">
        <div>
          {/* Logo Brand */}
          <div className="h-16 border-b border-slate-800/80 flex items-center px-6 gap-3">
            <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-sm tracking-tight text-white">StationOS</div>
              <div className="text-[11px] text-slate-400 font-medium">BENIN PETRO Group</div>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="px-3 py-6 space-y-1">
            <div className="px-3 pb-2 text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Gestion Quotidienne
            </div>
            <button
              onClick={() => setActiveTab('daily')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'daily'
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Fuel className="w-4 h-4" />
              <span>Saisie & Contrôle Tour</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'analytics'
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Analytique des Ventes</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'history'
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Historique des Fiches</span>
            </button>

            <div className="pt-6 px-3 pb-2 text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Configuration
            </div>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'settings'
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Paramètres Pompes & Cuves</span>
            </button>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 border-t border-slate-800/80">
          <div className="flex items-center gap-3 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-indigo-400">
              AS
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-200 truncate">Adro Salomon</div>
              <div className="text-[11px] text-slate-400 truncate">Gérant Station HLACOMEY</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── CORPS PRINCIPAL DU CRM ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Station :</span>
              <span className="text-xs font-bold text-slate-200 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/60">
                BENIN PETRO · HLACOMEY
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{shift}</span>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] uppercase font-bold text-slate-400">C.A. Tour Brut</div>
              <div className="text-sm font-bold text-slate-100 font-mono">{fmt(totalSales)}</div>
            </div>
            <div className="w-px h-6 bg-slate-800 hidden sm:block" />
            <div className="text-right hidden sm:block">
              <div className="text-[10px] uppercase font-bold text-indigo-400">Caisse Espèces Nette</div>
              <div className="text-sm font-bold text-indigo-400 font-mono">{fmt(finalCash)}</div>
            </div>
            <button
              onClick={handlePrint}
              className="ml-3 inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer la Fiche</span>
            </button>
          </div>
        </header>

        {/* ── ZONE DE TRAVAIL ── */}
        <div className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Session Active</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">Fiche Journalière de Contrôle des Ventes</h1>
              <p className="text-xs text-slate-400 mt-1">
                Date comptable : <strong className="text-slate-200">{date}</strong> · Relève de caisse 24h effectuée par les chefs de piste.
              </p>
            </div>

            {/* Stepper Tabs Horizontal */}
            <div className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800/80 overflow-x-auto">
              {stepsList.map((st) => {
                const IconComponent = st.icon;
                const isActive = step === st.num;
                const isPassed = step > st.num;
                return (
                  <button
                    key={st.num}
                    onClick={() => setStep(st.num as any)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : isPassed
                        ? 'text-slate-300 hover:bg-slate-900'
                        : 'text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{st.title}</span>
                    <span className="sm:hidden">{st.num}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AnimatePresence for Tab Content */}
          <AnimatePresence mode="wait">
            {/* ================= ÉTAPE 1 : CARBURANTS ================= */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Fuel className="w-4 h-4 text-indigo-400" />
                      Index des Pompes de Carburant
                    </h2>
                    <p className="text-xs text-slate-400">Saisissez l'index de fermeture. Le cubage vendu et le montant total sont calculés automatiquement.</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Volume Total :</span>
                    <span className="ml-2 font-mono text-sm font-bold text-slate-200">{fmtNum(totalFuelVolume)} Litres</span>
                  </div>
                </div>

                {/* Table CRM Moderne */}
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                          <th className="py-3 px-4">Pistolet & Produit</th>
                          <th className="py-3 px-4 text-right">Prix Unitaire</th>
                          <th className="py-3 px-4 text-right">Index Début</th>
                          <th className="py-3 px-4 text-right">Index Fin</th>
                          <th className="py-3 px-4 text-right">Retour Caisse (R.C.)</th>
                          <th className="py-3 px-4 text-right">Sorties Nettes</th>
                          <th className="py-3 px-4 text-right">Montant Vendu</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-medium">
                        {fuels.map((f) => {
                          const volume = Math.max(0, f.end - f.start - f.rc);
                          const amount = volume * f.price;
                          return (
                            <tr key={f.id} className="hover:bg-slate-800/30 transition">
                              <td className="py-3.5 px-4">
                                <div className="font-semibold text-slate-100">{f.name}</div>
                                <span className="inline-block mt-0.5 text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                                  {f.type}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                                {f.price} FCFA
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <input
                                  type="number"
                                  value={f.start}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setFuels(fuels.map(item => item.id === f.id ? { ...item, start: val } : item));
                                  }}
                                  className="w-28 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-right text-xs font-mono text-slate-300 focus:border-indigo-500 outline-none"
                                />
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <input
                                  type="number"
                                  value={f.end}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setFuels(fuels.map(item => item.id === f.id ? { ...item, end: val } : item));
                                  }}
                                  className="w-28 bg-slate-950 border border-indigo-500/30 rounded-lg px-2.5 py-1 text-right text-xs font-mono text-white font-bold focus:border-indigo-500 outline-none"
                                />
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <input
                                  type="number"
                                  value={f.rc}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setFuels(fuels.map(item => item.id === f.id ? { ...item, rc: val } : item));
                                  }}
                                  className="w-20 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-right text-xs font-mono text-slate-400 focus:border-indigo-500 outline-none"
                                />
                              </td>
                              <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-200">
                                {fmtNum(volume)} L
                              </td>
                              <td className="py-3.5 px-4 text-right font-mono font-bold text-indigo-400">
                                {fmt(amount)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-slate-950/60 border-t border-slate-800 px-6 py-4 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">Total Ventes Produits Blancs :</span>
                    <span className="font-mono text-base font-extrabold text-white">{fmt(totalFuelAmount)}</span>
                  </div>
                </div>

                {/* Section Jauge Cuves */}
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Contrôle Physique des Cuves (Jauges)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-slate-200">Cuve Essence (Jauge 6 1/2)</div>
                        <div className="text-[11px] text-slate-400">Niveau départ : 735 cm · Niveau fin : 163 cm</div>
                      </div>
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Écart normal (-78L)
                      </span>
                    </div>

                    <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-slate-200">Cuve Gasoil (Jauge 34)</div>
                        <div className="text-[11px] text-slate-400">Niveau départ : 1820 cm · Niveau fin : 15 cm</div>
                      </div>
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Écart normal (-15L)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Nav */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-5 py-2.5 rounded-lg shadow-sm transition"
                  >
                    <span>Continuer vers Gaz & Huiles</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ================= ÉTAPE 2 : GAZ & LUBRIFIANTS ================= */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-400" />
                      Ventes de Gaz & Lubrifiants
                    </h2>
                    <p className="text-xs text-slate-400">Suivi des stocks journaliers et quantités vendues au comptoir.</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Sous-total Produits :</span>
                    <span className="ml-2 font-mono text-sm font-bold text-indigo-400">{fmt(totalLubricants + totalGas)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Gaz */}
                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">Bouteilles de Gaz</h3>
                    <div className="space-y-3">
                      {gas.map((g) => (
                        <div key={g.id} className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-xs text-slate-200">{g.name}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{fmt(g.price)} / charge</div>
                            <div className="text-[10px] text-slate-400">Stock restant : {Math.max(0, g.open - g.sold)}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-400">Sorties :</span>
                            <input
                              type="number"
                              value={g.sold}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setGas(gas.map(item => item.id === g.id ? { ...item, sold: val } : item));
                              }}
                              className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono font-bold text-white text-xs"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Lubrifiants */}
                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">Lubrifiants & Huiles Moteur</h3>
                    <div className="space-y-3">
                      {lubricants.map((l) => (
                        <div key={l.id} className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-xs text-slate-200">{l.name}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{fmt(l.price)} / bidon</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-400">Quantité :</span>
                            <input
                              type="number"
                              value={l.sold}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setLubricants(lubricants.map(item => item.id === l.id ? { ...item, sold: val } : item));
                              }}
                              className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono font-bold text-white text-xs"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-4 py-2 rounded-lg transition"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Précédent</span>
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-5 py-2.5 rounded-lg shadow-sm transition"
                  >
                    <span>Continuer vers Cartes & MOMO</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ================= ÉTAPE 3 : PAIEMENTS DIGITAUX ================= */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-indigo-400" />
                      Paiements Non-Cash & Cartes Flotte
                    </h2>
                    <p className="text-xs text-slate-400">Les montants ci-dessous sont déduits du chiffre d'affaires pour calculer la caisse espèces nette.</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Non-Cash :</span>
                    <span className="ml-2 font-mono text-sm font-bold text-indigo-400">{fmt(totalDigital)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* TPE & MOMO */}
                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Terminaux Bancaires & Mobile Money</h3>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1 font-medium">TPE Essence (Terminal Carte)</label>
                      <input
                        type="number"
                        value={payments.tpeEssence}
                        onChange={(e) => setPayments({ ...payments, tpeEssence: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1 font-medium">TPE Gasoil (Terminal Carte)</label>
                      <input
                        type="number"
                        value={payments.tpeGasoil}
                        onChange={(e) => setPayments({ ...payments, tpeGasoil: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1 font-medium">Mobile Money Reçu (MOMO)</label>
                      <input
                        type="number"
                        value={payments.momo}
                        onChange={(e) => setPayments({ ...payments, momo: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-indigo-400 font-bold outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Cartes Flotte TPA Ad9000 */}
                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Cartes Réseau TPA Ad9000</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {payments.cards.map((c) => (
                        <div key={c.id} className="bg-slate-950 border border-slate-800/80 rounded-lg p-2.5 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-semibold text-slate-200">{c.name}</div>
                            <div className="text-[10px] text-slate-400">{c.count} transactions enregistrées</div>
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
                            className="w-28 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right font-mono font-semibold text-white text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-4 py-2 rounded-lg transition"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Précédent</span>
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-5 py-2.5 rounded-lg shadow-sm transition"
                  >
                    <span>Continuer vers Dépenses</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ================= ÉTAPE 4 : DÉPENSES & REPORT ================= */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <ReceiptText className="w-4 h-4 text-indigo-400" />
                      Dépenses Décaissées & Ajustements
                    </h2>
                    <p className="text-xs text-slate-400">Enregistrez les sorties d'argent opérées par le gérant durant la vacation.</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Dépenses :</span>
                    <span className="ml-2 font-mono text-sm font-bold text-rose-400">{fmt(totalExpenses)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Form Dépenses */}
                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Ajouter un décaissement</h3>
                    <form onSubmit={handleAddExpense} className="space-y-3">
                      <input
                        type="text"
                        placeholder="Motif de la dépense (ex: Entretien, Carburant groupe...)"
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                      />
                      <div className="flex gap-2">
                        <select
                          value={newCat}
                          onChange={(e) => setNewCat(e.target.value)}
                          className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-xs text-slate-300 outline-none"
                        >
                          <option value="Maintenance">Maintenance</option>
                          <option value="Groupe Électrogène">Groupe</option>
                          <option value="Divers">Divers</option>
                        </select>
                        <input
                          type="number"
                          placeholder="Montant FCFA"
                          value={newAmount}
                          onChange={(e) => setNewAmount(e.target.value)}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white outline-none focus:border-indigo-500"
                        />
                        <button
                          type="submit"
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-4 py-2 rounded-lg text-xs transition"
                        >
                          Ajouter
                        </button>
                      </div>
                    </form>

                    {/* Liste */}
                    <div className="mt-4 space-y-2">
                      {expenses.length === 0 ? (
                        <div className="text-center py-6 text-xs text-slate-400">Aucun décaissement saisi.</div>
                      ) : (
                        expenses.map((e) => (
                          <div key={e.id} className="bg-slate-950 border border-slate-800/80 rounded-lg p-2.5 flex items-center justify-between text-xs">
                            <div>
                              <div className="font-semibold text-slate-200">{e.desc}</div>
                              <div className="text-[10px] text-slate-400">{e.category}</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-bold text-rose-400">{fmt(e.amount)}</span>
                              <button onClick={() => setExpenses(expenses.filter(item => item.id !== e.id))} className="text-slate-400 hover:text-rose-400">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Reports & Avances */}
                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Fonds & Reports</h3>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1 font-medium">Report Caisse (Veille)</label>
                      <input
                        type="number"
                        value={report}
                        onChange={(e) => setReport(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1 font-medium">Avances Versement Pompistes</label>
                      <input
                        type="number"
                        value={advance}
                        onChange={(e) => setAdvance(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    onClick={() => setStep(3)}
                    className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-4 py-2 rounded-lg transition"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Précédent</span>
                  </button>
                  <button
                    onClick={() => setStep(5)}
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-5 py-2.5 rounded-lg shadow-sm transition"
                  >
                    <span>Consulter le Bilan Comptable</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ================= ÉTAPE 5 : CLÔTURE & BILAN ================= */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Big Card CRM Caisse Nette */}
                <div className="bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-6 sm:p-8 text-center relative shadow-lg">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 mb-1">
                    Caisse Espèces Déposée (Net à Verser)
                  </div>
                  <div className="text-4xl sm:text-5xl font-extrabold text-white font-mono my-2 tracking-tight">
                    {fmt(finalCash)}
                  </div>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Montant net exigible en liquide après déduction des paiements dématérialisés et décaissements certifiés.
                  </p>

                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={handlePrint}
                      className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-5 py-2.5 rounded-lg shadow-sm transition"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Imprimer le Procès-Verbal PDF</span>
                    </button>
                    <button
                      onClick={() => alert("Fiche validée et enregistrée avec succès dans le grand livre comptable.")}
                      className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs px-5 py-2.5 rounded-lg border border-slate-700 transition"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Clôturer Définitivement le Tour</span>
                    </button>
                  </div>
                </div>

                {/* Synthèse Tri-Partite */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-2">
                    <div className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">Recettes Brutes</div>
                    <div className="flex justify-between text-slate-400">
                      <span>Carburants ({fmtNum(totalFuelVolume)} L)</span>
                      <span className="font-mono text-slate-200">{fmt(totalFuelAmount)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Lubrifiants & Gaz</span>
                      <span className="font-mono text-slate-200">{fmt(totalLubricants + totalGas)}</span>
                    </div>
                    <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-indigo-400">
                      <span>Total Ventes</span>
                      <span>{fmt(totalSales)}</span>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-2">
                    <div className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">Ventilation Règlements</div>
                    <div className="flex justify-between text-slate-400">
                      <span>TPE Carte</span>
                      <span className="font-mono text-slate-200">{fmt(totalTPE)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Cartes Flotte TPA</span>
                      <span className="font-mono text-slate-200">{fmt(totalCards)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Mobile Money</span>
                      <span className="font-mono text-slate-200">{fmt(totalMOMO)}</span>
                    </div>
                    <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-slate-200">
                      <span>Total Dématérialisé</span>
                      <span>{fmt(totalDigital)}</span>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-2">
                    <div className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">Rapprochement Caisse</div>
                    <div className="flex justify-between text-slate-400">
                      <span>Attendu en Espèces</span>
                      <span className="font-mono text-slate-200">{fmt(cashExpected)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Dépenses Justifiées</span>
                      <span className="font-mono text-rose-400">- {fmt(totalExpenses)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Report Antérieur</span>
                      <span className="font-mono text-slate-200">+ {fmt(report)}</span>
                    </div>
                    <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-white">
                      <span>Solde Caisse</span>
                      <span>{fmt(finalCash)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-start pt-2">
                  <button
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-4 py-2 rounded-lg transition"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Modifier les données de saisie</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
