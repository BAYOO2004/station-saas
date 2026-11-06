'use client';

import React from 'react';
import { GasSale, GasProduct } from '@/types';
import { calcGasAmount, formatAmount } from '@/lib/calculations';

interface GasSalesSectionProps {
  gasSales: GasSale[];
  gasProducts: GasProduct[];
  currencySymbol: string;
  onChange: (sales: GasSale[]) => void;
}

export default function GasSalesSection({
  gasSales,
  gasProducts,
  currencySymbol,
  onChange,
}: GasSalesSectionProps) {
  const updateSale = (index: number, field: keyof GasSale, value: number) => {
    const updated = [...gasSales];
    const sale = { ...updated[index], [field]: value };

    if (field === 'quantity_sold' || field === 'unit_price') {
      sale.quantity_sold = field === 'quantity_sold' ? value : sale.quantity_sold;
      sale.unit_price = field === 'unit_price' ? value : sale.unit_price;
      sale.amount = calcGasAmount(sale.quantity_sold, sale.unit_price);
    }

    // Stock closing auto
    if (field === 'stock_opening' || field === 'stock_in' || field === 'quantity_sold' || field === 'consigne') {
      const opening = field === 'stock_opening' ? value : sale.stock_opening;
      const stockIn = field === 'stock_in' ? value : (sale.stock_in || 0);
      const sold = field === 'quantity_sold' ? value : sale.quantity_sold;
      const consigne = field === 'consigne' ? value : (sale.consigne || 0);
      sale.stock_closing_before = opening + stockIn - sold;
      sale.stock_closing_final = sale.stock_closing_before - consigne;
    }

    updated[index] = sale;
    onChange(updated);
  };

  const totalAmount = gasSales.reduce((s, g) => s + (g.amount || 0), 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-blue-800 uppercase tracking-wide flex items-center gap-2">
          <span className="text-xl">🔵</span> Ventes Gaz
        </h2>
        <div className="text-right">
          <div className="text-xs text-gray-500">TOTAL 3</div>
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
              <th className="px-2 py-2 text-center text-xs">OUVERT.</th>
              <th className="px-2 py-2 text-center text-xs">ENTRÉE</th>
              <th className="px-2 py-2 text-center text-xs">VENTES</th>
              <th className="px-2 py-2 text-center text-xs">CONSIGNE</th>
              <th className="px-2 py-2 text-center text-xs">P.U</th>
              <th className="px-2 py-2 text-center text-xs bg-blue-600">MONTANT</th>
              <th className="px-2 py-2 text-center text-xs bg-blue-600">NBV</th>
              <th className="px-2 py-2 text-center text-xs bg-blue-600">N.FINAL</th>
            </tr>
          </thead>
          <tbody>
            {gasSales.map((sale, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="px-2 py-1 font-semibold text-gray-700 text-xs">{sale.gas_product_name}</td>
                {(['stock_opening', 'stock_in', 'quantity_sold', 'consigne'] as const).map(field => (
                  <td key={field} className="px-1 py-1">
                    <input
                      type="number"
                      value={sale[field] || ''}
                      onChange={e => updateSale(idx, field, Number(e.target.value))}
                      className="w-16 text-center border border-gray-300 rounded px-1 py-0.5 text-xs focus:border-blue-500 outline-none"
                      placeholder="0"
                    />
                  </td>
                ))}
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
                <td className="px-2 py-1 text-center bg-blue-50 font-mono text-blue-800 font-bold text-xs">
                  {sale.stock_closing_before ?? '—'}
                </td>
                <td className="px-2 py-1 text-center bg-blue-50 font-mono text-blue-800 font-bold text-xs">
                  {sale.stock_closing_final ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-blue-800 text-white font-bold">
              <td className="px-2 py-2 text-xs" colSpan={6}>TOTAL 3</td>
              <td className="px-2 py-2 text-center text-sm">{formatAmount(totalAmount, currencySymbol)}</td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

