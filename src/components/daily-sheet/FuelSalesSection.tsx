'use client';

import React, { useState } from 'react';
import { FuelSale, FuelProduct, FuelPump } from '@/types';
import {
  calcSorties, calcVentes, calcFuelAmount,
  calcJaugeVariance, formatAmount
} from '@/lib/calculations';

interface FuelSalesSectionProps {
  fuelSales: FuelSale[];
  products: FuelProduct[];
  pumps: FuelPump[];
  currencySymbol: string;
  onChange: (sales: FuelSale[]) => void;
}

export default function FuelSalesSection({
  fuelSales,
  products,
  pumps,
  currencySymbol,
  onChange,
}: FuelSalesSectionProps) {
  const updateSale = (index: number, field: keyof FuelSale, value: number | string) => {
    const updated = [...fuelSales];
    const sale = { ...updated[index], [field]: value };

    // Recalculs automatiques
    if (field === 'index_start' || field === 'index_end' || field === 'rc') {
      sale.index_start = Number(field === 'index_start' ? value : sale.index_start);
      sale.index_end = Number(field === 'index_end' ? value : sale.index_end);
      sale.rc = Number(field === 'rc' ? value : sale.rc);
      sale.sorties = calcSorties(sale.index_start, sale.index_end);
      sale.ventes = calcVentes(sale.sorties, sale.rc || 0);
      sale.amount = calcFuelAmount(sale.ventes, sale.unit_price);
    }

    if (field === 'unit_price') {
      sale.unit_price = Number(value);
      sale.amount = calcFuelAmount(sale.ventes, sale.unit_price);
    }

    // Jauge variance
    if (field === 'jauge_start' || field === 'jauge_end') {
      sale.jauge_start = Number(field === 'jauge_start' ? value : sale.jauge_start);
      sale.jauge_end = Number(field === 'jauge_end' ? value : sale.jauge_end);
      if (sale.jauge_start && sale.jauge_end) {
        const { theoretical, variance } = calcJaugeVariance(
          sale.jauge_start, sale.jauge_end, sale.ventes
        );
        sale.jauge_theoretical = theoretical;
        sale.jauge_variance = variance;
      }
    }

    updated[index] = sale;
    onChange(updated);
  };

  const totalAmount = fuelSales.reduce((s, f) => s + (f.amount || 0), 0);
  const totalVentes = fuelSales.reduce((s, f) => s + (f.ventes || 0), 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-blue-800 uppercase tracking-wide flex items-center gap-2">
          <span className="text-xl">⛽</span> Ventes Produits Blancs
        </h2>
        <div className="text-right">
          <div className="text-xs text-gray-500">TOTAL 1</div>
          <div className="text-lg font-bold text-blue-700">
            {formatAmount(totalAmount, currencySymbol)}
          </div>
        </div>
      </div>

      {/* Table desktop */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-blue-700 text-white">
              <th className="px-2 py-2 text-left text-xs">PRODUIT</th>
              <th className="px-2 py-2 text-center text-xs">IDX DÉBUT</th>
              <th className="px-2 py-2 text-center text-xs">IDX FIN</th>
              <th className="px-2 py-2 text-center text-xs bg-blue-600">SORTIES</th>
              <th className="px-2 py-2 text-center text-xs">R.C.</th>
              <th className="px-2 py-2 text-center text-xs bg-blue-600">VENTES</th>
              <th className="px-2 py-2 text-center text-xs">P.U</th>
              <th className="px-2 py-2 text-center text-xs bg-blue-600">MONTANT</th>
              <th className="px-2 py-2 text-center text-xs">JAUGE DEB</th>
              <th className="px-2 py-2 text-center text-xs">JAUGE FIN</th>
              <th className="px-2 py-2 text-center text-xs">ÉCART</th>
            </tr>
          </thead>
          <tbody>
            {fuelSales.map((sale, idx) => {
              const hasVariance = sale.jauge_variance && Math.abs(sale.jauge_variance) > 50;
              return (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-2 py-1 font-semibold text-gray-800 text-xs whitespace-nowrap">
                    {sale.fuel_product_name}
                    {sale.pump_number ? (
                      <span className="text-gray-400 ml-1">P{sale.pump_number}</span>
                    ) : null}
                  </td>
                  {/* Index Début */}
                  <td className="px-1 py-1">
                    <input
                      type="number"
                      value={sale.index_start || ''}
                      onChange={e => updateSale(idx, 'index_start', e.target.value)}
                      className="w-24 text-center border border-gray-300 rounded px-1 py-0.5 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
                      placeholder="0"
                    />
                  </td>
                  {/* Index Fin */}
                  <td className="px-1 py-1">
                    <input
                      type="number"
                      value={sale.index_end || ''}
                      onChange={e => updateSale(idx, 'index_end', e.target.value)}
                      className="w-24 text-center border border-gray-300 rounded px-1 py-0.5 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
                      placeholder="0"
                    />
                  </td>
                  {/* SORTIES (auto) */}
                  <td className="px-2 py-1 text-center bg-blue-50">
                    <span className="font-mono text-blue-800 font-bold text-xs">
                      {sale.sorties ? new Intl.NumberFormat('fr-FR').format(sale.sorties) : '—'}
                    </span>
                  </td>
                  {/* R.C. */}
                  <td className="px-1 py-1">
                    <input
                      type="number"
                      value={sale.rc || ''}
                      onChange={e => updateSale(idx, 'rc', e.target.value)}
                      className="w-20 text-center border border-gray-300 rounded px-1 py-0.5 text-xs focus:border-orange-400 focus:ring-1 focus:ring-orange-200 outline-none"
                      placeholder="0"
                    />
                  </td>
                  {/* VENTES (auto) */}
                  <td className="px-2 py-1 text-center bg-blue-50">
                    <span className="font-mono text-blue-800 font-bold text-xs">
                      {sale.ventes ? new Intl.NumberFormat('fr-FR').format(sale.ventes) : '—'}
                    </span>
                  </td>
                  {/* P.U. */}
                  <td className="px-1 py-1">
                    <input
                      type="number"
                      value={sale.unit_price || ''}
                      onChange={e => updateSale(idx, 'unit_price', e.target.value)}
                      className="w-24 text-center border border-gray-300 rounded px-1 py-0.5 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
                      placeholder="0"
                    />
                  </td>
                  {/* MONTANT (auto) */}
                  <td className="px-2 py-1 text-center bg-blue-50">
                    <span className="font-mono text-green-700 font-bold text-xs">
                      {sale.amount ? new Intl.NumberFormat('fr-FR').format(sale.amount) : '—'}
                    </span>
                  </td>
                  {/* Jauge Début */}
                  <td className="px-1 py-1">
                    <input
                      type="number"
                      value={sale.jauge_start || ''}
                      onChange={e => updateSale(idx, 'jauge_start', e.target.value)}
                      className="w-20 text-center border border-gray-300 rounded px-1 py-0.5 text-xs focus:border-purple-400 outline-none"
                      placeholder="cm"
                    />
                  </td>
                  {/* Jauge Fin */}
                  <td className="px-1 py-1">
                    <input
                      type="number"
                      value={sale.jauge_end || ''}
                      onChange={e => updateSale(idx, 'jauge_end', e.target.value)}
                      className="w-20 text-center border border-gray-300 rounded px-1 py-0.5 text-xs focus:border-purple-400 outline-none"
                      placeholder="cm"
                    />
                  </td>
                  {/* Écart Jauge */}
                  <td className="px-2 py-1 text-center">
                    {sale.jauge_variance !== undefined && sale.jauge_variance !== null ? (
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                        hasVariance
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {sale.jauge_variance > 0 ? '+' : ''}
                        {new Intl.NumberFormat('fr-FR').format(sale.jauge_variance)}
                        {hasVariance && ' ⚠️'}
                      </span>
                    ) : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
          {/* Totaux */}
          <tfoot>
            <tr className="bg-blue-800 text-white font-bold">
              <td className="px-2 py-2 text-xs">TOTAL 1</td>
              <td colSpan={4} />
              <td className="px-2 py-2 text-center text-xs">
                {new Intl.NumberFormat('fr-FR').format(totalVentes)} L
              </td>
              <td />
              <td className="px-2 py-2 text-center text-sm">
                {formatAmount(totalAmount, currencySymbol)}
              </td>
              <td colSpan={3} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

