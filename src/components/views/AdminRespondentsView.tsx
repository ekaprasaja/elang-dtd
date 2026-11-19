'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { SurveyResultRecord, NikAccessLogItem } from '@/types';
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Clock,
  UserCheck,
  AlertTriangle,
  Lock,
  Search,
  RefreshCw,
  FileText,
  X,
  Check,
} from 'lucide-react';

export const AdminRespondentsView: React.FC = () => {
  const { selectedSurveyId, currentUser } = useApp();
  const [respondents, setRespondents] = useState<SurveyResultRecord[]>([]);
  const [logs, setLogs] = useState<NikAccessLogItem[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'respondents' | 'logs'>('respondents');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Decrypt Modal State
  const [decryptTarget, setDecryptTarget] = useState<SurveyResultRecord | null>(null);
  const [alasan, setAlasan] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedResult, setDecryptedResult] = useState<{ nik: string; name: string } | null>(null);
  const [decryptError, setDecryptError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [resRes, logRes] = await Promise.all([
        fetch(`/api/survey-results?surveyId=${selectedSurveyId}`).then((r) => r.json()),
        fetch('/api/admin/audit-logs').then((r) => r.json()),
      ]);
      setRespondents(resRes.results || []);
      setLogs(logRes.logs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedSurveyId]);

  const handleOpenDecryptModal = (item: SurveyResultRecord) => {
    setDecryptTarget(item);
    setAlasan('');
    setDecryptedResult(null);
    setDecryptError(null);
  };

  const handleExecuteDecrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decryptTarget) return;

    if (!alasan || alasan.trim().length < 5) {
      setDecryptError('Wajib menuliskan alasan operasional resmi (minimal 5 karakter) untuk audit trail.');
      return;
    }

    setIsDecrypting(true);
    setDecryptError(null);

    try {
      const res = await fetch('/api/admin/nik-decrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surveyResultId: decryptTarget.id,
          alasan,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mendekripsi NIK');
      }

      setDecryptedResult({
        name: decryptTarget.nama,
        nik: data.decryptedNik,
      });

      // Reload audit logs
      fetch('/api/admin/audit-logs')
        .then((r) => r.json())
        .then((d) => setLogs(d.logs || []));
    } catch (err: any) {
      setDecryptError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsDecrypting(false);
    }
  };

  const filtered = respondents.filter(
    (r) =>
      r.nama.toLowerCase().includes(search.toLowerCase()) ||
      r.alamat?.toLowerCase().includes(search.toLowerCase()) ||
      r.nama_caleg_ri?.toLowerCase().includes(search.toLowerCase()) ||
      r.partai.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-16 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-white text-sm">Data Responden & Audit Keamanan NIK</h2>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Kepatuhan UU PDP No. 27/2022: NIK tersimpan terenkripsi, tampil termasking, dan akses penuh tercatat audit trail.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('respondents')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeSubTab === 'respondents'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Daftar Responden ({respondents.length})
          </button>
          <button
            onClick={() => setActiveSubTab('logs')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeSubTab === 'logs'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Audit Log Akses ({logs.length})
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: DAFTAR RESPONDEN */}
      {activeSubTab === 'respondents' && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl space-y-3 p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama, caleg, partai, alamat..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <span className="text-xs text-slate-400">
              Menampilkan {filtered.length} dari {respondents.length} responden
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
                <tr>
                  <th className="p-3">Nama Responden</th>
                  <th className="p-3">NIK (Terkripsi UU PDP)</th>
                  <th className="p-3">Wilayah / TPS</th>
                  <th className="p-3">DPT KK</th>
                  <th className="p-3">Caleg DPR RI</th>
                  <th className="p-3">Partai</th>
                  <th className="p-3">Capres</th>
                  <th className="p-3 text-center">Aksi Verifikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-semibold text-white">
                      <div>
                        <span>{item.nama}</span>
                        <p className="text-[10px] text-slate-500 font-normal">{item.jenis_kelamin}, {item.usia} th</p>
                      </div>
                    </td>
                    <td className="p-3 font-mono font-bold text-emerald-400">
                      <span className="bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                        ****{item.nik_last4}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300">
                      <span>{item.tps_nama || 'TPS Belian'}</span>
                    </td>
                    <td className="p-3 font-bold text-center text-slate-200">{item.jumlah_pemilih}</td>
                    <td className="p-3 text-yellow-400 font-medium">{item.nama_caleg_ri || '-'}</td>
                    <td className="p-3 text-slate-300">{item.partai}</td>
                    <td className="p-3 font-semibold text-emerald-400">{item.pilihan_capres_anies_ganjar_prabowo}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleOpenDecryptModal(item)}
                        className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-[11px] font-semibold transition flex items-center gap-1 mx-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Buka NIK Utuh</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: NIK ACCESS AUDIT LOG */}
      {activeSubTab === 'logs' && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 space-y-3 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                Catatan Log Akses NIK (Audit Trail UU PDP)
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Setiap pembukaan NIK lengkap direkam secara permanen (siapa, kapan, dan alasan pembukaan).
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
                <tr>
                  <th className="p-3">Waktu Akses</th>
                  <th className="p-3">Pengakses (Admin)</th>
                  <th className="p-3">Responden Terbuka</th>
                  <th className="p-3">Alasan Operasional</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-slate-500">
                      Belum ada NIK yang dibuka oleh admin. Data sepenuhnya terenkripsi.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 text-slate-400 whitespace-nowrap">
                        {new Date(log.accessed_at).toLocaleString('id-ID')}
                      </td>
                      <td className="p-3 font-semibold text-emerald-400">
                        {log.accessed_by_name}
                      </td>
                      <td className="p-3 text-white font-medium">{log.responden_nama}</td>
                      <td className="p-3 text-slate-300 italic">"{log.alasan}"</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL DEKRIPSI NIK DENGAN AUDIT ================= */}
      {decryptTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-sm">Buka NIK Lengkap (Audit Terikat)</h3>
              </div>
              <button
                onClick={() => setDecryptTarget(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!decryptedResult ? (
              <form onSubmit={handleExecuteDecrypt} className="space-y-3 text-xs">
                <div className="p-3 bg-amber-950/30 border border-amber-500/40 rounded-xl space-y-1">
                  <p className="font-bold text-amber-300">Peringatan Kepatuhan UU PDP:</p>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Membuka NIK responden <strong>{decryptTarget.nama}</strong> akan dicatat permanen dalam audit log sistem. Masukkan alasan operasional resmi (cth: validasi DPT KPU, cek ganda saksi TPS).
                  </p>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Alasan Pembukaan NIK <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={alasan}
                    onChange={(e) => setAlasan(e.target.value)}
                    placeholder="Tuliskan alasan operasional resmi..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {decryptError && (
                  <p className="text-rose-400 text-[11px] font-medium">{decryptError}</p>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setDecryptTarget(null)}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isDecrypting}
                    className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    {isDecrypting ? 'Mendekripsi...' : 'Konfirmasi & Buka NIK'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-emerald-950/50 border border-emerald-500/50 rounded-2xl text-center space-y-2">
                  <span className="text-xs text-slate-400">NIK Lengkap Terverifikasi untuk:</span>
                  <p className="font-bold text-white text-sm">{decryptedResult.name}</p>
                  <div className="py-2 px-3 bg-slate-950 rounded-xl border border-emerald-500/40 inline-block font-mono text-lg font-black tracking-widest text-emerald-400">
                    {decryptedResult.nik}
                  </div>
                  <p className="text-[10px] text-slate-400 pt-1">
                    ✓ Akses ini telah berhasil dicatat ke dalam audit trail keamanan.
                  </p>
                </div>

                <button
                  onClick={() => setDecryptTarget(null)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition"
                >
                  Selesai & Tutup
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
