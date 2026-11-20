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
  Sparkles,
  AlertCircle,
  Lock,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Silakan masukkan alamat email dan kata sandi Anda.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      router.push('/');
    } else {
      setErrorMessage(result.error || 'Email atau kata sandi tidak sesuai.');
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center max-w-md mx-auto py-10 px-4">
      {/* Branding Card */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-slate-900/90 border border-amber-500/30 p-2.5 mx-auto flex items-center justify-center shadow-xl shadow-black/50 mb-3 hover:border-amber-400/50 transition">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-transparent.webp" alt="Logo Partai Elang" className="w-full h-full object-contain filter drop-shadow" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-[11px] font-semibold text-amber-300 mb-2.5 shadow-sm">
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          <span>Sistem Resmi Partai Elang Indonesia</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Masuk Akun Elang DTD
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
          Aplikasi Door-to-Door verifikasi pemilih, survei preferensi elektoral, dan audit NIK patuh UU PDP.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-5 p-3.5 bg-rose-950/80 border border-rose-500/50 rounded-2xl text-rose-200 text-xs flex items-center gap-2.5 shadow-lg animate-fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Production Login Form */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
              Otentikasi Akun Petugas
            </h2>
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            Produksi Aktif
          </span>
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
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="petugas@partaielang.id"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-slate-300">Kata Sandi</label>
            </div>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
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
            className="w-full mt-2 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>Memverifikasi Akses...</span>
            ) : (
              <>
                <span>Masuk ke Sistem DTD</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Akses sistem survei DTD terbatas hanya untuk petugas dan relawan resmi Partai Elang Indonesia. Kredensial akun diterbitkan langsung oleh Administrator Wilayah.
          </p>
        </div>
      </div>

      <div className="text-center mt-6">
        <Link
          href="/"
          className="text-xs text-slate-400 hover:text-emerald-400 transition inline-flex items-center gap-1.5"
        >
          <span>← Kembali ke Halaman Utama</span>
        </Link>
      </div>

      <div className="text-center text-[10px] text-slate-600 mt-6">
        Sistem Keamanan Data Terenkripsi • Terlindungi UU PDP No. 27/2022
      </div>
    </div>
  );
}
