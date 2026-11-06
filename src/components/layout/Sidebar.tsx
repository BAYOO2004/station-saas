'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  icon: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', icon: '🏠', label: 'Accueil' },
  { href: '/daily-sheet', icon: '📋', label: 'Fiches' },
  { href: '/reports', icon: '📊', label: 'Rapports' },
  { href: '/deliveries', icon: '🚚', label: 'Stocks' },
  { href: '/alerts', icon: '🔔', label: 'Alertes' },
  { href: '/settings', icon: '⚙️', label: 'Paramètres' },
];

interface SidebarProps {
  stationName: string;
  stationNetwork: string;
  userFullName: string;
  unreadAlerts: number;
}

export default function Sidebar({ stationName, stationNetwork, userFullName, unreadAlerts }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 px-2 py-1">
        <div className="flex justify-around">
          {NAV_ITEMS.slice(0, 5).map(item => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center py-1 px-2 rounded-lg transition ${
                  active ? 'text-blue-700' : 'text-gray-500'
                }`}
              >
                <span className="text-xl relative">
                  {item.icon}
                  {item.label === 'Alertes' && unreadAlerts > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {unreadAlerts > 9 ? '9+' : unreadAlerts}
                    </span>
                  )}
                </span>
                <span className="text-xs mt-0.5">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop sidebar */}
      <aside className={`hidden md:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${collapsed ? 'w-16' : 'w-56'}`}>
        {/* Header */}
        <div className={`flex items-center gap-3 p-4 border-b border-gray-100 ${collapsed ? 'justify-center' : ''}`}>
          <span className="text-2xl flex-shrink-0">⛽</span>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="font-bold text-gray-800 text-sm truncate">{stationNetwork}</div>
              <div className="text-xs text-gray-500 truncate">{stationName}</div>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {NAV_ITEMS.map(item => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition text-sm font-medium ${
                  active
                    ? 'bg-blue-700 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.label : ''}
              >
                <span className="text-lg relative flex-shrink-0">
                  {item.icon}
                  {item.label === 'Alertes' && unreadAlerts > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {unreadAlerts > 9 ? '9+' : unreadAlerts}
                    </span>
                  )}
                </span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={`p-4 border-t border-gray-100 ${collapsed ? 'flex justify-center' : ''}`}>
          {!collapsed && (
            <div className="text-xs text-gray-500 mb-3 truncate">
              👤 {userFullName}
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-400 hover:text-gray-600 transition text-sm"
            title={collapsed ? 'Agrandir' : 'Réduire'}
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>
      </aside>
    </>
  );
}

