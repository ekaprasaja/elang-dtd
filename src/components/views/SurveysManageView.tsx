'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { FolderKanban, PlusCircle, Calendar, CheckCircle2, Clock, Send } from 'lucide-react';

export const SurveysManageView: React.FC = () => {
  const { surveys, selectedSurveyId, setSelectedSurveyId, refreshSurveys, setNotification } = useApp();

  const [nama, setNama] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [tanggalMulai, setTanggalMulai] = useState(new Date().toISOString().split('T')[0]);
  const [tanggalSelesai, setTanggalSelesai] = useState('2026-12-31');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama || !tanggalMulai) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama,
          deskripsi,
          tanggal_mulai: tanggalMulai,
          tanggal_selesai: tanggalSelesai,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setNotification(`Survei baru "${nama}" berhasil dibuat!`);
        setNama('');
        setDeskripsi('');
        await refreshSurveys();
      } else {
        alert(data.error || 'Gagal membuat survei');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 pb-16 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <FolderKanban className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="font-bold text-white text-sm">Manajemen Kampanye & Survei DTD</h2>
            <p className="text-[11px] text-slate-400">
              Kelola master survei, periode pelaksanaan, dan aktifkan survei aktif untuk relawan.
            </p>
          </div>
        </div>
      </div>

      {/* Form Buat Survei Baru */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <PlusCircle className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-white text-xs uppercase tracking-wider">
            Buat Survei Kampanye Baru
          </h3>
        </div>

        <form onSubmit={handleCreate} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Nama Survei / Kampanye <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Survei Door-to-Door Pemetaan Dapil Kepri 2026"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Deskripsi & Target Sasaran</label>
            <textarea
              rows={2}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Tuliskan tujuan dan instruksi umum survei ini..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tanggal Mulai</label>
              <input
                type="date"
                required
                value={tanggalMulai}
                onChange={(e) => setTanggalMulai(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tanggal Selesai (Target)</label>
              <input
                type="date"
                value={tanggalSelesai}
                onChange={(e) => setTanggalSelesai(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20 text-xs disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Terbitkan Survei Baru</span>
            </button>
          </div>
        </form>
      </div>

      {/* Daftar Survei */}
      <div className="space-y-3">
        <h3 className="font-bold text-white text-xs uppercase tracking-wider">
          Daftar Survei Aktif & Riwayat ({surveys.length})
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {surveys.map((s) => {
            const isSelected = s.id === selectedSurveyId;
            return (
              <div
                key={s.id}
                className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-slate-900 border-emerald-500/50 shadow-lg'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-white text-sm">{s.nama}</span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold uppercase">
                      {s.status}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] bg-yellow-500 text-slate-950 px-2 py-0.5 rounded-full font-black">
                        Aktif Saat Ini
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300">{s.deskripsi || 'Survei elektoral pemilih Kepulauan Riau'}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {s.tanggal_mulai} s/d {s.tanggal_selesai || 'Selesai'}
                    </span>
                  </div>
                </div>

                {!isSelected && (
                  <button
                    onClick={() => {
                      setSelectedSurveyId(s.id);
                      setNotification(`Survei aktif diubah ke: ${s.nama}`);
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition whitespace-nowrap self-start sm:self-auto"
                  >
                    Pilih Survei Ini
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
