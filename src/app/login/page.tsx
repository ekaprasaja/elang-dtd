'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  Shield,
  KeyRound,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Users,
  Compass,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { availableProfiles, login, notification, setNotification } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('demo123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleQuickLogin = async (userId: string) => {
    setLoading(true);
    setErrorMessage(null);
    const result = await login(userId);
    setLoading(false);
    if (result.success) {
      router.push('/');
    } else {
      setErrorMessage(result.error || 'Gagal masuk akun');
    }
  };

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Silakan masukkan alamat email akun');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      router.push('/');
    } else {
      setErrorMessage(result.error || 'Email tidak terdaftar pada akun demo');
    }
  };

  const getProfileDescription = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Akses penuh, audit NIK responden, rekapitulasi, dan manajemen survei.';
      case 'KOORDINATOR':
        return 'Monitoring progres door-to-door dan tim lapangan Kota Batam.';
      case 'RELAWAN':
        return 'Akses instan form input survei warga & pencarian cepat DPT TPS.';
      case 'VIEWER':
        return 'Akses monitoring analitik eksekutif dan rekapitulasi elektoral.';
      default:
        return 'Akses sistem pemilih.';
    }
  };

  const getProfileIcon = (role: string) => {
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

  return (
    <div className="max-w-xl mx-auto py-8 sm:py-12">
      {/* Branding Card */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 border border-emerald-500/30 p-2 shadow-xl shadow-emerald-500/20 mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-transparent.webp" alt="Logo Partai Elang" className="w-full h-full object-contain" />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-[11px] font-semibold text-emerald-400 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Sistem Resmi Partai Elang Indonesia</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Masuk Akun Elang DTD
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
          Aplikasi Door-to-Door verifikasi pemilih, survei preferensi elektoral, dan audit NIK patuh UU PDP.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-3.5 bg-rose-950/80 border border-rose-500/50 rounded-2xl text-rose-200 text-xs flex items-center gap-2.5 shadow-lg animate-fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Mode 1: Quick 1-Click Demo Profiles */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl mb-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Akses Cepat Akun Demo (1-Klik)</h2>
          </div>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-semibold">
            Siap Uji Coba
          </span>
        </div>

        <p className="text-xs text-slate-400 mb-3">
          Pilih salah satu peran demo di bawah ini untuk langsung masuk dan mengevaluasi sistem tanpa repot mengetik:
        </p>

        <div className="space-y-2.5">
          {availableProfiles.map((p) => (
            <button
              key={p.id}
              disabled={loading}
              onClick={() => handleQuickLogin(p.id)}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-base font-bold shrink-0 group-hover:scale-105 transition-transform">
                  {getProfileIcon(p.role)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                      {p.nama}
                    </p>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                      {p.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">{getProfileDescription(p.role)}</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{p.email}</p>
                </div>
              </div>

              <div className="w-7 h-7 rounded-lg bg-slate-800 group-hover:bg-emerald-600 text-slate-400 group-hover:text-white flex items-center justify-center transition-all shrink-0 ml-2">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Mode 2: Standard Email / Password Form */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800 mb-4">
          <Mail className="w-4 h-4 text-slate-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
            Atau Masuk dengan Email & Sandi
          </h2>
        </div>

        <form onSubmit={handleFormLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Alamat Email Petugas / Relawan
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Contoh: admin@elangdtd.id"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-slate-300">Kata Sandi</label>
              <span className="text-[10px] text-slate-500 font-mono">Default demo: demo123</span>
            </div>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="demo123"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span>Memproses...</span>
            ) : (
              <>
                <span>Masuk Akun Petugas</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      <div className="text-center mt-6">
        <Link
          href="/"
          className="text-xs text-slate-400 hover:text-emerald-400 transition inline-flex items-center gap-1.5"
        >
          <span>← Kembali ke Halaman Utama</span>
        </Link>
      </div>
    </div>
  );
}
