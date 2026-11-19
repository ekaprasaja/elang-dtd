'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { DashboardMetrics, WilayahBreakdownItem } from '@/types';
import {
  Users,
  CheckCircle,
  HelpCircle,
  Share2,
  RefreshCw,
  MapPin,
  TrendingUp,
  Download,
  Filter,
} from 'lucide-react';

export const AreaDashboardView: React.FC = () => {
  const { selectedSurveyId } = useApp();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [breakdown, setBreakdown] = useState<WilayahBreakdownItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/dashboard/metrics?surveyId=${selectedSurveyId}`);
      const data = await res.json();
      if (data.metrics) {
        setMetrics(data.metrics);
        setBreakdown(data.breakdown || []);
      }
    } catch (err) {
      console.error('Failed to load area metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedSurveyId]);

  return (
    <div className="space-y-5 pb-16 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 p-4 rounded-2xl border border-slate-800 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <h2 className="font-bold text-white text-sm">Dashboard Wilayah & Penetrasi Suara</h2>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Agregat hasil survei door-to-door berjenjang (Kepulauan Riau). Diperbarui real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Segarkan</span>
          </button>
          <a
            href={`/api/export/excel?surveyId=${selectedSurveyId}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/30 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Excel</span>
          </a>
        </div>
      </div>

      {/* 5 Big Metric Cards (PRD §3.3.1 - Exact Specification) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Metric 1: Jumlah Responden */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold text-slate-400">Jumlah Responden</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2">
            {metrics?.totalResponden ?? 0}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Rumah/KK dikunjungi</p>
        </div>

        {/* Metric 2: Jumlah DPT (KK) */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold text-slate-400">Jumlah DPT (KK)</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2">
            {metrics?.totalDpt ?? 0}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">SUM pemilih se-keluarga</p>
        </div>

        {/* Metric 3: Jumlah Yang Memilih */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-emerald-500/40 relative overflow-hidden bg-gradient-to-b from-slate-900 to-emerald-950/20">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold text-emerald-400">Jumlah Memilih</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2">
            {metrics?.jumlahMemilih ?? 0}
          </p>
          <p className="text-[10px] text-emerald-400/90 mt-1 font-semibold">
            {metrics?.persentaseMemilih ?? 0}% Pemilih Solid
          </p>
        </div>

        {/* Metric 4: Jumlah Belum Memilih */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold text-slate-400">Belum Memilih</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-400 mt-2">
            {metrics?.jumlahBelumMemilih ?? 0}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Potensi Swing Voters</p>
        </div>

        {/* Metric 5: Total Pemilih Tersentuh */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 relative overflow-hidden col-span-2 md:col-span-1">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold text-purple-400">Total Tersentuh</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <Share2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-300 mt-2">
            {metrics?.totalPemilihTersentuh ?? 0}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Jangkauan DPT agregat</p>
        </div>
      </div>

      {/* Progress Ratio Bar */}
      {metrics && metrics.totalResponden > 0 && (
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-300 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Rasio Konversi Suara Lapangan
            </span>
            <span className="text-emerald-400 font-bold">{metrics.persentaseMemilih}% Siap Memilih</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-800 flex">
            <div
              className="bg-gradient-to-r from-emerald-500 to-green-400 h-full rounded-full transition-all duration-700"
              style={{ width: `${metrics.persentaseMemilih}%` }}
              title={`Memilih: ${metrics.jumlahMemilih}`}
            />
            <div
              className="bg-amber-500/80 h-full rounded-full transition-all duration-700"
              style={{ width: `${100 - metrics.persentaseMemilih}%` }}
              title={`Belum Memilih: ${metrics.jumlahBelumMemilih}`}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Solid Memilih: {metrics.jumlahMemilih} responden
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Ragu / Belum Memilih: {metrics.jumlahBelumMemilih} responden
            </span>
          </div>
        </div>
      )}

      {/* Territorial Breakdown Table */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-xs uppercase tracking-wider">
              Rekapitulasi Suara Per TPS / Wilayah
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Perbandingan hasil survei door-to-door antar TPS & kelurahan
            </p>
          </div>
          <span className="text-xs text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            {breakdown.length} Wilayah Tercatat
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Wilayah / Nama TPS</th>
                <th className="p-3.5 text-center">Responden</th>
                <th className="p-3.5 text-center">DPT (KK)</th>
                <th className="p-3.5 text-center">Memilih (Solid)</th>
                <th className="p-3.5 text-center">Belum Memilih</th>
                <th className="p-3.5 text-center">Persentase</th>
                <th className="p-3.5 text-center">Progres Bar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {breakdown.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-500">
                    Belum ada data survei di wilayah ini.
                  </td>
                </tr>
              ) : (
                breakdown.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-semibold text-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>{item.nama}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-center font-mono text-slate-300 font-bold">{item.totalResponden}</td>
                    <td className="p-3.5 text-center font-mono text-emerald-400 font-bold">{item.totalDpt}</td>
                    <td className="p-3.5 text-center font-mono text-white font-bold">{item.jumlahMemilih}</td>
                    <td className="p-3.5 text-center font-mono text-amber-400">{item.jumlahBelumMemilih}</td>
                    <td className="p-3.5 text-center font-bold text-emerald-400">{item.persentaseMemilih}%</td>
                    <td className="p-3.5 text-center w-36">
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${item.persentaseMemilih}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
