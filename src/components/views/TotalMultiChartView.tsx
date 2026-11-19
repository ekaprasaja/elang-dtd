'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { MultiChartData, ChartItem } from '@/types';
import {
  BarChart2,
  PieChart,
  Users,
  HeartHandshake,
  CheckCircle,
  HelpCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export const TotalMultiChartView: React.FC = () => {
  const { selectedSurveyId } = useApp();
  const [charts, setCharts] = useState<MultiChartData | null>(null);
  const [activeCategory, setActiveCategory] = useState<keyof MultiChartData>('menjadiRelawan');
  const [isLoading, setIsLoading] = useState(true);

  const loadCharts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/dashboard/charts?surveyId=${selectedSurveyId}`);
      const data = await res.json();
      if (data.charts) {
        setCharts(data.charts);
      }
    } catch (err) {
      console.error('Failed to load multi charts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCharts();
  }, [selectedSurveyId]);

  const categories: { key: keyof MultiChartData; label: string; icon: string }[] = [
    { key: 'menjadiRelawan', label: 'Kesediaan Jadi Relawan', icon: '🤝' },
    { key: 'tingkatYakin', label: 'Keyakinan Pilihan', icon: '🎯' },
    { key: 'pernahTahuCaleg', label: 'Pengenalan Caleg', icon: '👁️' },
    { key: 'partai', label: 'Preferensi Partai', icon: '🚩' },
    { key: 'usiaKelompok', label: 'Demografi Usia', icon: '👥' },
    { key: 'jenisKelamin', label: 'Jenis Kelamin', icon: '⚖️' },
    { key: 'suku', label: 'Sebaran Suku', icon: '🌴' },
    { key: 'agama', label: 'Sebaran Agama', icon: '🕌' },
  ];

  const activeItems: ChartItem[] = (charts && charts[activeCategory]) || [];

  return (
    <div className="space-y-5 pb-16 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-900 p-4 rounded-2xl border border-purple-500/30">
        <div>
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-purple-400" />
            <h2 className="font-bold text-white text-sm">Dashboard Grafik & Multi-Chart Analitik</h2>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Analisis silang seluruh variabel kategorikal responden door-to-door (PRD §3.3.2).
          </p>
        </div>

        <button
          onClick={loadCharts}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800 transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Segarkan</span>
        </button>
      </div>

      {/* Category Pills Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {categories.map((c) => (
          <button
            key={c.key}
            onClick={() => setActiveCategory(c.key)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeCategory === c.key
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-102'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <span>{c.icon}</span>
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      {/* Active Chart Display */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Distribusi: {categories.find((c) => c.key === activeCategory)?.label}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Proporsi perolehan suara berdasarkan survei tatap muka warga
            </p>
          </div>
          <span className="text-xs font-semibold text-purple-300 bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-500/30">
            {activeItems.reduce((acc, i) => acc + i.count, 0)} Total Responden
          </span>
        </div>

        {/* Visual Progress Bar Chart Breakdown */}
        <div className="space-y-3.5 pt-2">
          {activeItems.map((item, idx) => {
            const colors = [
              'from-purple-500 to-indigo-500 text-purple-400',
              'from-emerald-500 to-green-500 text-emerald-400',
              'from-yellow-500 to-amber-500 text-yellow-400',
              'from-blue-500 to-cyan-500 text-blue-400',
              'from-rose-500 to-pink-500 text-rose-400',
              'from-orange-500 to-amber-500 text-orange-400',
            ];
            const colorClass = colors[idx % colors.length];

            return (
              <div key={item.label} className="space-y-1.5 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-200">{item.label}</span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-white text-sm">{item.percentage}%</span>
                    <span className="text-[11px] text-slate-400">({item.count} suara)</span>
                  </div>
                </div>

                <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden p-0.5">
                  <div
                    className={`bg-gradient-to-r ${colorClass.split(' ')[0]} ${colorClass.split(' ')[1]} h-full rounded-full transition-all duration-700`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
