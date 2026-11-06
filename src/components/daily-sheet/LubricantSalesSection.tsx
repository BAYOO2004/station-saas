'use client';

import React from 'react';
import { LubricantSale, Lubricant } from '@/types';
import { calcLubricantClosing, calcLubricantAmount, formatAmount } from '@/lib/calculations';

interface LubricantSalesSectionProps {
  lubricantSales: LubricantSale[];
  lubricants: Lubricant[];
  currencySymbol: string;
  onChange: (sales: LubricantSale[]) => void;
}

export default function LubricantSalesSection({
  lubricantSales,
  lubricants,
  currencySymbol,
  onChange,
}: LubricantSalesSectionProps) {
  const updateSale = (index: number, field: keyof LubricantSale, value: number) => {
    const updated = [...lubricantSales];
    const sale = { ...updated[index], [field]: value };

    if (field === 'stock_opening' || field === 'stock_in' || field === 'quantity_sold') {
      sale.stock_opening = field === 'stock_opening' ? value : sale.stock_opening;
      sale.stock_in = field === 'stock_in' ? value : sale.stock_in;
      sale.quantity_sold = field === 'quantity_sold' ? value : sale.quantity_sold;
      sale.stock_closing = calcLubricantClosing(sale.stock_opening, sale.stock_in || 0, sale.quantity_sold);
      sale.amount = calcLubricantAmount(sale.quantity_sold, sale.unit_price);
    }
    if (field === 'unit_price') {
      sale.unit_price = value;
      sale.amount = calcLubricantAmount(sale.quantity_sold, sale.unit_price);
    }

    updated[index] = sale;
    onChange(updated);
  };

  const totalAmount = lubricantSales.reduce((s, l) => s + (l.amount || 0), 0);
  const hasAnySales = lubricantSales.some(l => l.quantity_sold > 0 || l.stock_opening > 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-blue-800 uppercase tracking-wide flex items-center gap-2">
          <span className="text-xl">🛢️</span> Ventes Lubrifiants
        </h2>
        <div className="text-right">
          <div className="text-xs text-gray-500">TOTAL 2</div>
          <div className="text-lg font-bold text-blue-700">
            {formatAmount(totalAmount, currencySymbol)}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-blue-700 text-white">
              <th className="px-2 py-2 text-left text-xs">DÉSIGNATION</th>
              <th className="px-2 py-2 text-center text-xs">OUVERTURE</th>
              <th className="px-2 py-2 text-center text-xs">ENTRÉE</th>
              <th className="px-2 py-2 text-center text-xs">VENTES</th>
              <th className="px-2 py-2 text-center text-xs bg-blue-600">FERMETURE</th>
              <th className="px-2 py-2 text-center text-xs">P.U</th>
              <th className="px-2 py-2 text-center text-xs bg-blue-600">MONTANT</th>
            </tr>
          </thead>
          <tbody>
            {lubricantSales.map((sale, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="px-2 py-1 font-semibold text-gray-700 text-xs">{sale.lubricant_name}</td>
                {(['stock_opening', 'stock_in', 'quantity_sold'] as const).map(field => (
                  <td key={field} className="px-1 py-1">
                    <input
                      type="number"
                      value={sale[field] || ''}
                      onChange={e => updateSale(idx, field, Number(e.target.value))}
                      className="w-20 text-center border border-gray-300 rounded px-1 py-0.5 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
                      placeholder="0"
                    />
                  </td>
                ))}
                <td className="px-2 py-1 text-center bg-blue-50">
                  <span className="font-mono text-blue-800 font-bold text-xs">
                    {sale.stock_closing !== undefined ? sale.stock_closing : '—'}
                  </span>
                </td>
                <td className="px-1 py-1">
                  <input
                    type="number"
                    value={sale.unit_price || ''}
                    onChange={e => updateSale(idx, 'unit_price', Number(e.target.value))}
                    className="w-24 text-center border border-gray-300 rounded px-1 py-0.5 text-xs focus:border-blue-500 outline-none"
                    placeholder="0"
                  />
                </td>
                <td className="px-2 py-1 text-center bg-blue-50">
                  <span className="font-mono text-green-700 font-bold text-xs">
                    {sale.amount ? new Intl.NumberFormat('fr-FR').format(sale.amount) : '—'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-blue-800 text-white font-bold">
              <td className="px-2 py-2 text-xs" colSpan={6}>TOTAL 2</td>
              <td className="px-2 py-2 text-center text-sm">{formatAmount(totalAmount, currencySymbol)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

