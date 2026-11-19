'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  Smartphone,
  MapPin,
  Flame,
  BarChart2,
  ShieldCheck,
  FolderKanban,
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { activeTab, setActiveTab, currentUser } = useApp();

  const isAdmin = currentUser?.role === 'ADMIN';

  const navItems = [
    { id: 'input', label: 'Input Survei DTD', icon: Smartphone, highlight: true },
    { id: 'wilayah', label: 'Dashboard Wilayah', icon: MapPin },
    { id: 'kandidat', label: 'Kandidat & Word Cloud', icon: Flame },
    { id: 'total', label: 'Grafik & Total', icon: BarChart2 },
    ...(isAdmin
      ? [
          { id: 'responden', label: 'Data Responden & Audit NIK', icon: ShieldCheck },
          { id: 'surveys', label: 'Kelola Survei', icon: FolderKanban },
        ]
      : []),
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId as any);
    if (pathname !== '/') {
      router.push(`/?tab=${tabId}`);
    }
  };

  return (
    <div className="bg-slate-950/80 border-b border-slate-800/80 sticky top-[61px] z-30 px-3 overflow-x-auto">
      <div className="max-w-7xl mx-auto flex items-center gap-1.5 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? item.highlight
                    ? 'bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-md shadow-emerald-600/30 font-bold'
                    : 'bg-slate-800 text-white border border-slate-700 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
