'use client';

import React from 'react';
import { DashboardStats, Station } from '@/types';
import { formatAmount } from '@/lib/calculations';

interface DashboardProps {
  stats: DashboardStats;
  station: Station;
  currencySymbol: string;
  pendingAlerts: number;
}

export default function DashboardOverview({
  stats,
  station,
  currencySymbol,
  pendingAlerts,
}: DashboardProps) {
  const fmt = (n: number) => formatAmount(n, currencySymbol);
  const growthPct = stats.yesterday_sales > 0
    ? (((stats.today_sales - stats.yesterday_sales) / stats.yesterday_sales) * 100).toFixed(1)
    : null;

  const cards = [
    {
      icon: '📊',
      label: "Ventes aujourd'hui",
      value: fmt(stats.today_sales),
      sub: growthPct
        ? `${Number(growthPct) >= 0 ? '▲' : '▼'} ${Math.abs(Number(growthPct))}% vs hier`
        : 'Pas de données hier',
      color: 'blue',
      positive: Number(growthPct) >= 0,
    },
    {
      icon: '💰',
      label: 'Caisse du jour',
      value: fmt(stats.today_cash),
      sub: 'Espèces en caisse',
      color: 'green',
    },
    {
      icon: '📅',
      label: 'Ventes ce mois',
      value: fmt(stats.month_sales),
      sub: new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
      color: 'purple',
    },
    {
      icon: '🔔',
      label: 'Alertes en attente',
      value: pendingAlerts.toString(),
      sub: pendingAlerts > 0 ? '⚠️ Action requise' : '✅ Tout va bien',
      color: pendingAlerts > 0 ? 'red' : 'green',
    },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    red: 'bg-red-50 border-red-200 text-red-700',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Bonjour 👋 — {station.name}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card, i) => (
          <div key={i} className={`rounded-xl border p-4 ${colorMap[card.color]}`}>
            <div className="text-2xl mb-1">{card.icon}</div>
            <div className="text-xs text-gray-500 uppercase font-medium mb-1">{card.label}</div>
            <div className="text-xl font-bold text-gray-800">{card.value}</div>
            <div className="text-xs mt-1 opacity-70">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-base font-bold text-gray-700 mb-3">Actions rapides</h2>
        <div className="flex flex-wrap gap-3">
          <a
            href="/daily-sheet/new"
            className="flex items-center gap-2 bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold hover:bg-blue-800 transition shadow-sm"
          >
            ➕ Nouvelle fiche du jour
          </a>
          <a
            href="/daily-sheet"
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-3 rounded-xl font-medium hover:bg-gray-50 transition shadow-sm"
          >
            📋 Voir les fiches
          </a>
          <a
            href="/reports"
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-3 rounded-xl font-medium hover:bg-gray-50 transition shadow-sm"
          >
            📊 Rapports
          </a>
          <a
            href="/deliveries"
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-3 rounded-xl font-medium hover:bg-gray-50 transition shadow-sm"
          >
            🚚 Approvisionnements
          </a>
        </div>
      </div>

      {/* Ventes par produit */}
      {stats.fuel_breakdown.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h2 className="text-base font-bold text-gray-700 mb-4">⛽ Ventes carburants — aujourd'hui</h2>
          <div className="space-y-3">
            {stats.fuel_breakdown.map((item, i) => {
              const maxAmount = Math.max(...stats.fuel_breakdown.map(f => f.amount));
              const pct = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{item.product}</span>
                    <span className="text-gray-500">
                      {new Intl.NumberFormat('fr-FR').format(item.volume)} L · {fmt(item.amount)}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tendance 7 jours */}
      {stats.daily_trend.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-bold text-gray-700 mb-4">📈 Tendance 7 derniers jours</h2>
          <div className="flex items-end gap-2 h-32">
            {stats.daily_trend.slice(-7).map((day, i) => {
              const maxVal = Math.max(...stats.daily_trend.map(d => d.amount));
              const h = maxVal > 0 ? (day.amount / maxVal) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-blue-500 rounded-t transition-all duration-500"
                    style={{ height: `${h}%`, minHeight: day.amount > 0 ? '4px' : '0' }}
                    title={formatAmount(day.amount, currencySymbol)}
                  />
                  <div className="text-xs text-gray-400">
                    {new Date(day.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

