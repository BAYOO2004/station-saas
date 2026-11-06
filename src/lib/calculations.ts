import { FuelSale, LubricantSale, GasSale, DailySheetFormData } from '@/types';

// ============================================================
// CALCULS AUTOMATIQUES — Fiche Journalière
// ============================================================

/** Sorties = Index Fin - Index Début */
export function calcSorties(indexStart: number, indexEnd: number): number {
  return Math.max(0, indexEnd - indexStart);
}

/** Ventes = Sorties - RC */
export function calcVentes(sorties: number, rc: number): number {
  return Math.max(0, sorties - rc);
}

/** Montant carburant = Ventes * Prix Unitaire */
export function calcFuelAmount(ventes: number, unitPrice: number): number {
  return round2(ventes * unitPrice);
}

/** Stock fermeture lubrifiant = Ouverture + Entrées - Ventes */
export function calcLubricantClosing(opening: number, stockIn: number, sold: number): number {
  return Math.max(0, opening + stockIn - sold);
}

/** Montant lubrifiant = Quantité vendue * Prix Unitaire */
export function calcLubricantAmount(sold: number, unitPrice: number): number {
  return round2(sold * unitPrice);
}

/** Montant gaz = Quantité vendue * Prix Unitaire */
export function calcGasAmount(sold: number, unitPrice: number): number {
  return round2(sold * unitPrice);
}

/** Total ventes carburants */
export function calcTotalFuelSales(fuelSales: FuelSale[]): number {
  return round2(fuelSales.reduce((sum, s) => sum + (s.amount || 0), 0));
}

/** Total ventes lubrifiants */
export function calcTotalLubricantSales(lubricantSales: LubricantSale[]): number {
  return round2(lubricantSales.reduce((sum, s) => sum + (s.amount || 0), 0));
}

/** Total ventes gaz */
export function calcTotalGasSales(gasSales: GasSale[]): number {
  return round2(gasSales.reduce((sum, s) => sum + (s.amount || 0), 0));
}

/** TOTAL GÉNÉRAL = Carburants + Lubrifiants + Gaz */
export function calcTotalSales(fuel: number, lubricant: number, gas: number): number {
  return round2(fuel + lubricant + gas);
}

/**
 * CAISSE FINALE =
 *   Cash + MOMO reçu + TPE + Tickets + Cartes
 *   - Dépenses
 *   + Report tour précédent
 */
export function calcFinalCash(params: {
  totalCash: number;
  totalMomo: number;
  totalTpe: number;
  totalTickets: number;
  totalLoyaltyCards: number;
  totalExpenses: number;
  reportAmount: number;
  advanceAmount: number;
}): number {
  const {
    totalCash, totalMomo, totalTpe, totalTickets,
    totalLoyaltyCards, totalExpenses, reportAmount, advanceAmount
  } = params;

  const totalIn = totalCash + totalMomo + totalTpe + totalTickets + totalLoyaltyCards + reportAmount;
  return round2(totalIn - totalExpenses - advanceAmount);
}

/**
 * Variance Jauge = Jauge réelle fin - Jauge théorique
 * Jauge théorique = Jauge début - Volume vendu
 */
export function calcJaugeVariance(
  jaugeStart: number,
  jaugeEnd: number,
  volumeSold: number
): { theoretical: number; variance: number } {
  const theoretical = jaugeStart - volumeSold;
  const variance = round2(jaugeEnd - theoretical);
  return { theoretical: round2(theoretical), variance };
}

/**
 * Recompute tous les totaux d'une fiche
 */
export function recomputeSheetTotals(form: DailySheetFormData) {
  const totalFuel = calcTotalFuelSales(form.fuel_sales);
  const totalLubricant = calcTotalLubricantSales(form.lubricant_sales);
  const totalGas = calcTotalGasSales(form.gas_sales);
  const totalSales = calcTotalSales(totalFuel, totalLubricant, totalGas);

  const totalExpenses = round2(
    form.expenses.reduce((sum, e) => sum + (e.amount || 0), 0)
  );

  const cashPayments = form.payment_records.filter(p => p.payment_method_code === 'cash');
  const momoPayments = form.payment_records.filter(p => p.payment_method_code === 'momo');
  const tpePayments = form.payment_records.filter(p => p.payment_method_code === 'tpe');
  const ticketPayments = form.payment_records.filter(p => p.payment_method_code === 'ticket');
  const loyaltyPayments = form.payment_records.filter(p => p.payment_method_code === 'loyalty');

  const totalCash = round2(cashPayments.reduce((s, p) => s + p.amount, 0));
  const totalMomo = round2(momoPayments.reduce((s, p) => s + p.amount, 0));
  const totalTpe = round2(tpePayments.reduce((s, p) => s + p.amount, 0));
  const totalTickets = round2(ticketPayments.reduce((s, p) => s + p.amount, 0));
  const totalLoyaltyCards = round2(loyaltyPayments.reduce((s, p) => s + p.amount, 0));
  const totalPaymentsReceived = round2(totalCash + totalMomo + totalTpe + totalTickets + totalLoyaltyCards);

  const finalCash = calcFinalCash({
    totalCash,
    totalMomo,
    totalTpe,
    totalTickets,
    totalLoyaltyCards,
    totalExpenses,
    reportAmount: form.report_amount || 0,
    advanceAmount: form.advance_amount || 0,
  });

  return {
    total_fuel_sales: totalFuel,
    total_lubricant_sales: totalLubricant,
    total_gas_sales: totalGas,
    total_sales: totalSales,
    total_cash: totalCash,
    total_momo: totalMomo,
    total_tpe: totalTpe,
    total_tickets: totalTickets,
    total_loyalty_cards: totalLoyaltyCards,
    total_payments_received: totalPaymentsReceived,
    total_expenses: totalExpenses,
    final_cash: finalCash,
  };
}

/** Vérifie si la caisse est équilibrée */
export function checkCashBalance(totalSales: number, totalPaymentsReceived: number): {
  isBalanced: boolean;
  variance: number;
} {
  const variance = round2(totalPaymentsReceived - totalSales);
  return { isBalanced: Math.abs(variance) < 1, variance };
}

// Helpers
function round2(val: number): number {
  return Math.round(val * 100) / 100;
}

/** Formater montant avec devise */
export function formatAmount(amount: number, symbol: string = 'FCFA'): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' ' + symbol;
}

/** Formater date en français */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
}

/** Obtenir la date d'aujourd'hui en YYYY-MM-DD */
export function todayDate(): string {
  return new Date().toISOString().split('T')[0];
}

