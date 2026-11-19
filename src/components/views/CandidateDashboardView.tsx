'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { WordCloudItem, CapresStats } from '@/types';
import {
  Flame,
  Award,
  Vote,
  TrendingUp,
  RefreshCw,
  Sparkles,
  BarChart2,
  PieChart,
} from 'lucide-react';

export const CandidateDashboardView: React.FC = () => {
  const { selectedSurveyId } = useApp();
  const [wordCloud, setWordCloud] = useState<WordCloudItem[]>([]);
  const [topPartai, setTopPartai] = useState<any[]>([]);
  const [capres, setCapres] = useState<CapresStats | null>(null);
  const [totalCalegResponses, setTotalCalegResponses] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadCandidates = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/dashboard/candidates?surveyId=${selectedSurveyId}`);
      const data = await res.json();
      if (data.wordCloud) {
        setWordCloud(data.wordCloud);
        setTopPartai(data.topPartai || []);
        setCapres(data.capres || null);
        setTotalCalegResponses(data.totalResponsesWithCaleg || 0);
      }
    } catch (err) {
      console.error('Failed to load candidate stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, [selectedSurveyId]);

  const maxVal = wordCloud.length > 0 ? Math.max(...wordCloud.map((w) => w.value)) : 1;

  return (
    <div className="space-y-5 pb-16 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 p-4 rounded-2xl border border-yellow-500/30">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <h2 className="font-bold text-white text-sm">Dashboard Kandidat & Word Cloud Elektoral</h2>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Analisis popularitas Calon Anggota Legislatif DPR RI (Dapil Kepri) & Simulasi Head-to-Head Capres.
          </p>
        </div>

        <button
          onClick={loadCandidates}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800 transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* ================= 1. WORD CLOUD CALEG DPR RI (PRD §3.4) ================= */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              Word Cloud: Calon Anggota Legislatif DPR RI (Dapil Kepulauan Riau)
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Ukuran teks mencerminkan frekuensi nama caleg yang disebut secara spontan oleh warga saat door-to-door.
            </p>
          </div>
          <span className="text-xs font-semibold text-yellow-400 bg-yellow-950/80 px-2.5 py-1 rounded-lg border border-yellow-500/30">
            {totalCalegResponses} Sebutan Terekam
          </span>
        </div>

        {/* Word Cloud Canvas Render */}
        <div className="p-6 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-center gap-4 min-h-[220px]">
          {wordCloud.map((item, idx) => {
            const ratio = item.value / maxVal;
            // Calculate dynamic sizing from 13px up to 34px
            const fontSize = Math.max(13, Math.min(34, Math.round(14 + ratio * 20)));

            const colors = [
              'text-yellow-400 font-black',
              'text-emerald-400 font-extrabold',
              'text-blue-400 font-bold',
              'text-purple-400 font-bold',
              'text-amber-300 font-semibold',
              'text-cyan-300 font-semibold',
              'text-slate-300 font-medium',
            ];
            const colorClass = colors[idx % colors.length];

            return (
              <div
                key={item.text}
                className="group relative cursor-pointer transition transform hover:scale-110"
              >
                <span
                  style={{ fontSize: `${fontSize}px` }}
                  className={`${colorClass} px-3 py-1.5 rounded-xl hover:bg-slate-800/80 transition-all inline-block`}
                >
                  {item.text}
                  <span className="text-[10px] ml-1.5 font-mono opacity-70 bg-slate-900 px-1.5 py-0.5 rounded-full border border-slate-700 inline-block align-middle">
                    {item.value}x
                  </span>
                </span>
              </div>
            );
          })}
        </div>

        {/* Leaderboard Table of Caleg Mentions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {wordCloud.slice(0, 6).map((c, i) => (
            <div
              key={c.text}
              className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center font-bold text-[10px] text-yellow-400">
                  #{i + 1}
                </span>
                <span className="font-semibold text-slate-200">{c.text}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-white text-xs">{c.value}</span>
                <span className="text-[10px] text-slate-500">pemilih</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= 2. SIMULASI HEAD-TO-HEAD CAPRES ================= */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        <div className="pb-3 border-b border-slate-800">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Vote className="w-4 h-4 text-emerald-400" />
            Simulasi Pilihan Calon Presiden (Pilpres)
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Sebaran elektabilitas simulasi 3 nama dan pertarungan head-to-head di Kepulauan Riau
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Simulation A: 3-Way (Prabowo vs Anies vs Ganjar) */}
          <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-white">Simulasi 3 Poros</h4>
              <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                Pilpres Umum
              </span>
            </div>

            <div className="space-y-2.5 pt-1">
              {capres?.threeWay.map((cand) => (
                <div key={cand.name} className="space-y-1 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-200">{cand.name}</span>
                    <span className="text-emerald-400 font-bold">{cand.percentage}% ({cand.count})</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        cand.name === 'Prabowo'
                          ? 'bg-emerald-500'
                          : cand.name === 'Anies'
                          ? 'bg-blue-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${cand.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Simulation B: Head-to-Head Anies vs Prabowo */}
          <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-white">Head-to-Head 1</h4>
              <span className="text-[10px] text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-500/30">
                Anies vs Prabowo
              </span>
            </div>

            <div className="space-y-2.5 pt-1">
              {capres?.aniesVsPrabowo.map((cand) => (
                <div key={cand.name} className="space-y-1 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-200">{cand.name}</span>
                    <span className="text-emerald-400 font-bold">{cand.percentage}% ({cand.count})</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        cand.name === 'Prabowo' ? 'bg-emerald-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${cand.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Simulation C: Head-to-Head Ganjar vs Prabowo */}
          <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-white">Head-to-Head 2</h4>
              <span className="text-[10px] text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/30">
                Ganjar vs Prabowo
              </span>
            </div>

            <div className="space-y-2.5 pt-1">
              {capres?.ganjarVsPrabowo.map((cand) => (
                <div key={cand.name} className="space-y-1 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-200">{cand.name}</span>
                    <span className="text-emerald-400 font-bold">{cand.percentage}% ({cand.count})</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        cand.name === 'Prabowo' ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${cand.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================= 3. SEBARAN PARTAI POLITIK ================= */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-3">
        <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
          <BarChart2 className="w-4 h-4 text-blue-400" />
          Peringkat Elektabilitas Partai Politik (Dapil Kepri)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {topPartai.slice(0, 8).map((p, idx) => (
            <div
              key={p.partai}
              className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">{p.partai}</span>
                <span className="text-[10px] font-mono text-slate-500">#{idx + 1}</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-800 flex justify-between items-baseline">
                <span className="font-bold text-emerald-400 text-sm">{p.percentage}%</span>
                <span className="text-[10px] text-slate-400">{p.count} suara</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
