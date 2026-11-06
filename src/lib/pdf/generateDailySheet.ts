import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DailySheet, Station, FuelSale, LubricantSale, GasSale, Expense, PaymentRecord } from '@/types';
import { formatAmount, formatDate } from '@/lib/calculations';

// ============================================================
// GÉNÉRATION PDF — Fiche Journalière
// Reproduit exactement la feuille papier BENIN PETRO
// ============================================================

export async function generateDailySheetPDF(
  sheet: DailySheet,
  station: Station,
  currencySymbol: string = 'FCFA'
): Promise<Blob> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 10;
  let y = 10;

  const fmt = (n: number) => formatAmount(n, currencySymbol);
  const fmtNum = (n: number) => new Intl.NumberFormat('fr-FR').format(n);

  // ── HEADER ──────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(station.network || station.name, pageW / 2, y, { align: 'center' });
  y += 6;

  doc.setFontSize(11);
  doc.text(`STATION: ${station.name}`, margin, y);
  doc.text(`DATE: ${formatDate(sheet.sheet_date)}`, pageW - margin, y, { align: 'right' });
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Tour de M.: ${sheet.tour_manager || ''}`, margin, y);
  doc.text(`Responsable de tour: ${sheet.shift_manager || ''}`, pageW / 2, y);
  y += 8;

  // ── VENTES PRODUITS BLANCS ───────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('VENTES DE PRODUITS BLANCS', pageW / 2, y, { align: 'center' });
  y += 2;

  if (sheet.fuel_sales && sheet.fuel_sales.length > 0) {
    const fuelRows = sheet.fuel_sales.map((s: FuelSale) => [
      s.fuel_product_name,
      fmtNum(s.index_start),
      fmtNum(s.index_end),
      fmtNum(s.sorties),
      fmtNum(s.rc || 0),
      fmtNum(s.ventes),
      fmtNum(s.ventes_communes || s.ventes),
      fmt(s.unit_price),
      fmt(s.amount),
    ]);

    // Totaux carburants
    const totalVol = sheet.fuel_sales.reduce((s: number, f: FuelSale) => s + f.ventes, 0);
    fuelRows.push([
      'TOTAL 1', '', '', '', '', fmtNum(totalVol), '', '', fmt(sheet.total_fuel_sales)
    ]);

    autoTable(doc, {
      startY: y,
      head: [['PRODUIT', 'IDX DEB', 'IDX FIN', 'SORTIES', 'R.C.', 'VENTES', 'V. COMMUN', 'P.U', 'MONTANT']],
      body: fuelRows,
      theme: 'grid',
      headStyles: { fillColor: [30, 80, 160], fontSize: 7, halign: 'center' },
      bodyStyles: { fontSize: 7, halign: 'right' },
      columnStyles: { 0: { halign: 'left', fontStyle: 'bold' } },
      margin: { left: margin, right: margin },
    });
    y = (doc as any).lastAutoTable.finalY + 4;
  }

  // ── VENTES LUBRIFIANTS ────────────────────────────────────
  if (sheet.lubricant_sales && sheet.lubricant_sales.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('VENTES LUBRIFIANTS', pageW / 2, y, { align: 'center' });
    y += 2;

    const lubRows = sheet.lubricant_sales
      .filter((l: LubricantSale) => l.quantity_sold > 0 || l.stock_opening > 0)
      .map((l: LubricantSale) => [
        l.lubricant_name,
        fmtNum(l.stock_opening),
        fmtNum(l.stock_in || 0),
        fmtNum(l.quantity_sold),
        fmtNum(l.stock_closing),
        fmt(l.unit_price),
        fmt(l.amount),
      ]);

    lubRows.push(['TOTAL 2', '', '', '', '', '', fmt(sheet.total_lubricant_sales)]);

    autoTable(doc, {
      startY: y,
      head: [['DÉSIGNATION', 'OUVERTURE', 'ENTRÉE', 'VENTES', 'FERMETURE', 'P.U', 'MONTANT']],
      body: lubRows,
      theme: 'grid',
      headStyles: { fillColor: [30, 80, 160], fontSize: 7, halign: 'center' },
      bodyStyles: { fontSize: 7, halign: 'right' },
      columnStyles: { 0: { halign: 'left' } },
      margin: { left: margin, right: margin },
    });
    y = (doc as any).lastAutoTable.finalY + 4;
  }

  // ── VENTES GAZ ────────────────────────────────────────────
  if (sheet.gas_sales && sheet.gas_sales.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('VENTES DE GAZ', pageW / 2, y, { align: 'center' });
    y += 2;

    const gasRows = sheet.gas_sales
      .filter((g: GasSale) => g.quantity_sold > 0 || g.stock_opening > 0)
      .map((g: GasSale) => [
        g.gas_product_name,
        fmtNum(g.stock_opening),
        fmtNum(g.stock_in || 0),
        fmtNum(g.quantity_sold),
        fmtNum(g.consigne || 0),
        fmt(g.unit_price),
        fmt(g.amount),
        fmtNum(g.stock_closing_before),
        fmtNum(g.stock_closing_final),
      ]);

    gasRows.push(['TOTAL 3', '', '', '', '', '', fmt(sheet.total_gas_sales), '', '']);

    autoTable(doc, {
      startY: y,
      head: [['DÉSIGNATION', 'OUVERT.', 'ENTRÉE', 'VENTES', 'CONSIGNE', 'P.U', 'MONTANT', 'NBV', 'N.FINAL']],
      body: gasRows,
      theme: 'grid',
      headStyles: { fillColor: [30, 80, 160], fontSize: 7, halign: 'center' },
      bodyStyles: { fontSize: 7, halign: 'right' },
      columnStyles: { 0: { halign: 'left' } },
      margin: { left: margin, right: margin },
    });
    y = (doc as any).lastAutoTable.finalY + 4;
  }

  // ── TOTAL GÉNÉRAL ─────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setDrawColor(30, 80, 160);
  doc.setLineWidth(0.5);
  doc.rect(margin, y, pageW - 2 * margin, 8);
  doc.text(`TOTAL 1+2+3 : ${fmt(sheet.total_sales)}`, pageW / 2, y + 5.5, { align: 'center' });
  y += 12;

  // ── SECTION DROITE : DÉPENSES + TPE + CAISSE ─────────────
  const rightX = pageW / 2 + 2;
  const rightW = pageW / 2 - margin - 2;
  let rightY = 50; // Position fixe côté droit

  // Dépenses
  if (sheet.expenses && sheet.expenses.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('DÉPENSES', rightX, rightY);
    rightY += 3;

    const expRows = sheet.expenses.map((e: Expense) => [e.description, fmt(e.amount)]);
    autoTable(doc, {
      startY: rightY,
      head: [['MOTIF', 'MONTANT']],
      body: expRows,
      theme: 'grid',
      headStyles: { fillColor: [200, 50, 50], fontSize: 7 },
      bodyStyles: { fontSize: 7 },
      margin: { left: rightX },
      tableWidth: rightW,
    });
    rightY = (doc as any).lastAutoTable.finalY + 3;
  }

  // Paiements TPE
  const tpePayments = sheet.payment_records?.filter(p => p.payment_method_code === 'tpe') || [];
  if (tpePayments.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('TPE', rightX, rightY + 3);
    const tpeRows = tpePayments.map((p: PaymentRecord) => [
      p.fuel_product_name || '', fmt(p.amount)
    ]);
    autoTable(doc, {
      startY: rightY + 4,
      body: tpeRows,
      theme: 'grid',
      bodyStyles: { fontSize: 7 },
      margin: { left: rightX },
      tableWidth: rightW,
    });
    rightY = (doc as any).lastAutoTable.finalY + 3;
  }

  // Cartes fidélité
  const loyaltyPayments = sheet.payment_records?.filter(p => p.loyalty_card_id) || [];
  if (loyaltyPayments.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('CARTES RÉSEAU', rightX, rightY + 3);
    const cardRows = loyaltyPayments.map((p: PaymentRecord) => [
      `${p.fuel_product_name || ''} - ${p.loyalty_card_name || ''}`,
      fmt(p.amount)
    ]);
    autoTable(doc, {
      startY: rightY + 4,
      body: cardRows,
      theme: 'grid',
      bodyStyles: { fontSize: 7 },
      margin: { left: rightX },
      tableWidth: rightW,
    });
    rightY = (doc as any).lastAutoTable.finalY + 3;
  }

  // RÉSUMÉ CAISSE
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  const cashSummaryData = [
    ['TOTAL TICKETS', fmt(sheet.total_payments_received)],
    ['MOMO', fmt(sheet.momo_amount || 0)],
    ['SOLDE MOMO', fmt(sheet.momo_balance || 0)],
    ['AVANCE', fmt(sheet.advance_amount || 0)],
    ['RECETTE (Cash)', fmt(sheet.total_cash || 0)],
    ['REPORT', fmt(sheet.report_amount || 0)],
    ['DÉPENSES', `- ${fmt(sheet.total_expenses)}`],
  ];

  autoTable(doc, {
    startY: y + 2,
    head: [['', '']],
    body: cashSummaryData,
    theme: 'plain',
    bodyStyles: { fontSize: 8 },
    columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'right' } },
    margin: { left: margin, right: pageW / 2 },
  });

  // CAISSE FINALE — grande case
  const finalY = Math.max((doc as any).lastAutoTable.finalY + 4, rightY + 2);
  doc.setDrawColor(30, 80, 160);
  doc.setLineWidth(1);
  doc.rect(margin, finalY, pageW - 2 * margin, 12);
  doc.setFontSize(13);
  doc.setTextColor(30, 80, 160);
  doc.text(`CAISSE : ${fmt(sheet.final_cash)}`, pageW / 2, finalY + 8, { align: 'center' });

  // Footer
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Généré le ${new Date().toLocaleDateString('fr-FR')} | Station SaaS`,
    pageW / 2, doc.internal.pageSize.getHeight() - 5, { align: 'center' }
  );

  return doc.output('blob');
}

/** Télécharger le PDF */
export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Ouvrir le PDF dans un nouvel onglet (pour imprimer) */
export function openPDFForPrint(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  win?.print();
}

