'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Compass,
  Users,
  Shield,
  Radio,
  FileSpreadsheet,
  ChevronDown,
  UserCheck,
  Check,
  Sparkles,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentUser,
    availableProfiles,
    switchProfile,
    surveys,
    selectedSurveyId,
    setSelectedSurveyId,
    notification,
  } = useApp();

  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);

  const activeSurvey = surveys.find((s) => s.id === selectedSurveyId) || surveys[0];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Active Survey */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-white/10 border border-emerald-500/30 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-transparent.webp" alt="Logo Partai Elang" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm tracking-wide text-white flex items-center gap-1.5">
                  ELANG DTD <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-1.5 py-0.2 rounded font-semibold uppercase">Door to Door</span>
                </h1>
              </div>
              <p className="text-[10px] text-slate-400">Monitoring Survei Pemilih & Elektoral Real-Time</p>
            </div>
          </div>

          {/* Survey Selector Dropdown */}
          {surveys.length > 0 && (
            <div className="relative">
              <select
                value={selectedSurveyId}
                onChange={(e) => setSelectedSurveyId(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 max-w-[190px] truncate"
              >
                {surveys.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Status Indicators & Role Switcher */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          {/* Live indicator */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-800 text-[11px] text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live Sync Supabase</span>
          </div>

          {/* Export Excel Button */}
          <a
            href={`/api/export/excel?surveyId=${selectedSurveyId}`}
            className="flex items-center gap-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 rounded-xl text-xs font-semibold transition shadow-sm"
            title="Download Laporan Excel Agregat (Bebas PII/UU PDP)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Excel</span>
          </a>

          {/* User Session Pill (Secure, static badge) */}
          {currentUser && (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-left">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                {currentUser.role === 'ADMIN' ? '👑' : currentUser.role === 'KOORDINATOR' ? '🎯' : currentUser.role === 'RELAWAN' ? '📱' : '👁️'}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-slate-200 leading-tight">{currentUser.nama}</p>
                <p className="text-[10px] text-emerald-400 uppercase font-bold">{currentUser.role}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div className="max-w-md mx-auto mt-2 bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs px-4 py-2 rounded-xl text-center shadow-lg animate-fade-in flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}
    </header>
  );
};
