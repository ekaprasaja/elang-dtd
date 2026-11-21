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

  // Jangan tampilkan navigasi tab di halaman login atau saat belum terotentikasi
  if (pathname === '/login' || !currentUser) {
    return null;
  }

  const isAdmin = currentUser?.role === 'ADMIN';

  // JIKA BUKAN ADMIN (RELAWAN / PETUGAS INPUT):
  // SEMBUNYIKAN NAVIGATION BAR DASHBOARD KARENA APLIKASI INPUT HANYA UNTUK INPUT
  if (!isAdmin) {
    return null;
  }

  const navItems = [
    {
      id: 'wilayah',
      label: 'Dashboard Wilayah',
      icon: MapPin,
    },
    {
      id: 'kandidat',
      label: 'Kandidat & Word Cloud',
      icon: Flame,
    },
    {
      id: 'total',
      label: 'Grafik & Total',
      icon: BarChart2,
    },
    {
      id: 'responden',
      label: 'Data Responden & Audit NIK',
      icon: ShieldCheck,
      badge: 'Admin',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'surveys',
      label: 'Kelola Survei',
      icon: FolderKanban,
      badge: 'Admin',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'input',
      label: '📱 Form Input Relawan',
      icon: Smartphone,
      highlight: true,
      badge: 'Mode Input',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId as any);
    if (pathname !== '/') {
      router.push(`/?tab=${tabId}`);
    }
  };

  return (
    <div className="bg-slate-950/80 border-b border-slate-800/80 sticky top-[61px] z-30 px-3 overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto flex items-center gap-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive
                  ? item.highlight
                    ? 'bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-md shadow-emerald-600/30 font-bold scale-[1.02]'
                    : 'bg-slate-800 text-white border border-slate-700 shadow-md font-bold scale-[1.02]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
              {item.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase border ${
                    isActive
                      ? 'bg-white/20 text-white border-white/30'
                      : item.badgeColor || 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
