'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  FileSpreadsheet,
  ChevronDown,
  Sparkles,
  LogOut,
  LogIn,
  User,
  Shield,
  Smartphone,
  MapPin,
  FolderKanban,
  Check,
  ArrowLeft,
  Mail,
  Phone,
} from 'lucide-react';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  const {
    currentUser,
    availableProfiles,
    switchProfile,
    logout,
    surveys,
    selectedSurveyId,
    setSelectedSurveyId,
    notification,
    setActiveTab,
  } = useApp();

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return '👑';
      case 'KOORDINATOR':
        return '🎯';
      case 'RELAWAN':
        return '📱';
      case 'VIEWER':
        return '👁️';
      default:
        return '👤';
    }
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'KOORDINATOR':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'RELAWAN':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    }
  };

  // Header minimal khusus di halaman Login
  if (isLoginPage) {
    return (
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-white/10 border border-emerald-500/30 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-transparent.webp" alt="Logo Partai Elang" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm tracking-wide text-white group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  ELANG DTD <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-1.5 py-0.2 rounded font-semibold uppercase">Door to Door</span>
                </h1>
              </div>
              <p className="text-[10px] text-slate-400">Monitoring Survei Pemilih & Tim Lapangan</p>
            </div>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-xl transition"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
            <span>Kembali ke Dashboard</span>
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Active Survey */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-white/10 border border-emerald-500/30 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-transparent.webp" alt="Logo Partai Elang" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm tracking-wide text-white group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  ELANG DTD <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-1.5 py-0.2 rounded font-semibold uppercase">Door to Door</span>
                </h1>
              </div>
              <p className="text-[10px] text-slate-400">Monitoring Survei Pemilih & Elektoral Real-Time</p>
            </div>
          </Link>

          {/* Survey Selector Dropdown with Clear Label (Only for Authenticated Users) */}
          {currentUser && surveys.length > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs shadow-inner">
              <FolderKanban className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-[11px] text-slate-400 hidden xl:inline">Survei:</span>
              <select
                value={selectedSurveyId}
                onChange={(e) => setSelectedSurveyId(e.target.value)}
                className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none focus:text-white cursor-pointer w-auto max-w-[190px] sm:max-w-[240px] md:max-w-[280px] truncate"
                title="Pilih survei aktif"
              >
                {surveys.map((s) => (
                  <option key={s.id} value={s.id} className="bg-slate-900 text-slate-200 py-1">
                    {s.nama} ({s.cakupanWilayah})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Status Indicators & User Profile Controls */}
        <div className="flex items-center justify-between w-full md:w-auto gap-2.5">
          {/* Live Sync Supabase indicator */}
          {currentUser && (
            <div
              className="hidden sm:flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1.5 rounded-xl border border-slate-800 text-[11px] text-emerald-400"
              title="Terhubung langsung ke basis data Supabase & terenkripsi"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-medium">Live Sync Supabase</span>
            </div>
          )}

          {/* Export Excel Button */}
          {currentUser && (
            <a
              href={`/api/export/excel?surveyId=${selectedSurveyId}`}
              className="flex items-center gap-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 rounded-xl text-xs font-semibold transition shadow-sm"
              title="Download Laporan Excel Agregat (Bebas PII/UU PDP)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Export Excel</span>
              <span className="sm:hidden">Excel</span>
            </a>
          )}

          {/* User Session Dropdown Menu */}
          {currentUser ? (
            <div className="relative flex items-center gap-1.5" ref={dropdownRef}>
              {/* Profile Trigger Button */}
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 px-2.5 py-1.5 rounded-xl text-left transition shadow-sm cursor-pointer group"
                title="Buka Menu Profil & Pengaturan Akun"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">
                  {getRoleIcon(currentUser.role)}
                </div>
                <div className="text-left hidden sm:block max-w-[150px]">
                  <p className="text-xs font-semibold text-slate-200 group-hover:text-white truncate leading-tight">
                    {currentUser.nama}
                  </p>
                  <span
                    className={`inline-block text-[9px] px-1 py-0.2 rounded font-bold uppercase border ${getRoleBadgeColor(
                      currentUser.role
                    )}`}
                  >
                    {currentUser.role}
                  </span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    showProfileDropdown ? 'rotate-180 text-emerald-400' : ''
                  }`}
                />
              </button>

              {/* Quick Logout Icon Button adjacent to user pill */}
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/30 rounded-xl transition cursor-pointer"
                title="Keluar dari Akun (Logout)"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
              </button>

              {/* User Friendly Dropdown Modal */}
              {showProfileDropdown && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-slate-900/98 border border-slate-700/80 rounded-2xl shadow-2xl p-3.5 z-50 animate-fade-in backdrop-blur-xl">
                  {/* Profile Header */}
                  <div className="flex items-start gap-3 pb-3 border-b border-slate-800">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-lg font-bold shrink-0">
                      {getRoleIcon(currentUser.role)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-xs font-bold text-white truncate">{currentUser.nama}</p>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase border ${getRoleBadgeColor(
                            currentUser.role
                          )}`}
                        >
                          {currentUser.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>{currentUser.email}</span>
                      </p>
                      {currentUser.assignedWilayah && (
                        <p className="text-[10px] text-emerald-400/90 truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span>{currentUser.assignedWilayah}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Quick Action Links */}
                  <div className="py-2 space-y-1">
                    <button
                      onClick={() => {
                        setActiveTab('input');
                        setShowProfileDropdown(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition text-left cursor-pointer"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Form Input Survei Lapangan</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('wilayah');
                        setShowProfileDropdown(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition text-left cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5 text-sky-400" />
                      <span>Dashboard Rekapitulasi Wilayah</span>
                    </button>

                    {currentUser.role === 'ADMIN' && (
                      <button
                        onClick={() => {
                          setActiveTab('responden');
                          setShowProfileDropdown(false);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition text-left cursor-pointer"
                      >
                        <Shield className="w-3.5 h-3.5 text-amber-400" />
                        <span>Data Responden & Audit NIK (Admin)</span>
                      </button>
                    )}
                  </div>

                  {/* Logout Button */}
                  <div className="pt-2.5 mt-2 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        logout();
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold transition cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-400" />
                      <span>Keluar dari Akun (Logout)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/30 transition"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk Akun</span>
            </Link>
          )}
        </div>
      </div>

      {/* Toast Notification Banner */}
      {notification && (
        <div className="max-w-md mx-auto mt-2 bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs px-4 py-2 rounded-xl text-center shadow-lg animate-fade-in flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}
    </header>
  );
};
