'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Smartphone,
  ShieldCheck,
  Send,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  MapPin,
  HelpCircle,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const POPULAR_CALEG = [
  'Meireza Endipat Wijaya (Gerindra)',
  'H. Muhammad Rudi (NasDem)',
  'Cen Sui Lan (Golkar)',
  'Mayjen TNI (Purn) Sturman Panjaitan (PDI-P)',
  'Suryani, S.E. (PKS)',
  'Rizki Faisal (Golkar)',
  'Sirajudin Nur (PKB)',
  'Nyat Kadir (NasDem)',
];

const PARTAI_LIST = [
  'Gerindra',
  'Golkar',
  'PDI-P',
  'NasDem',
  'PKS',
  'PKB',
  'Demokrat',
  'PAN',
  'PPP',
  'PSI',
  'Perindo',
  'Belum Menentukan',
];

export const VolunteerInputView: React.FC = () => {
  const { selectedSurveyId, currentUser, setNotification } = useApp();

  // Wilayah Selection State
  const [hierarchy, setHierarchy] = useState<{ kabupaten: any[]; kecamatan: any[]; kelurahan: any[]; tps: any[] }>({
    kabupaten: [],
    kecamatan: [],
    kelurahan: [],
    tps: [],
  });

  const [selectedKab, setSelectedKab] = useState('kab-batam');
  const [selectedKec, setSelectedKec] = useState('kec-batam-kota');
  const [selectedKel, setSelectedKel] = useState('kel-belian');
  const [selectedTps, setSelectedTps] = useState('tps-belian-01');

  // Form State
  const [nama, setNama] = useState('');
  const [nik, setNik] = useState('');
  const [alamat, setAlamat] = useState('');
  const [telepon, setTelepon] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [usia, setUsia] = useState<number>(35);
  const [agama, setAgama] = useState('Islam');
  const [suku, setSuku] = useState('Melayu');
  const [jumlahPemilih, setJumlahPemilih] = useState<number>(3);
  const [tingkatYakin, setTingkatYakin] = useState('Sangat Yakin');
  const [partai, setPartai] = useState('Gerindra');
  const [namaCaleg, setNamaCaleg] = useState('Meireza Endipat Wijaya');
  const [pernahTahuCaleg, setPernahTahuCaleg] = useState(true);
  const [memilihLangsung, setMemilihLangsung] = useState(true);
  const [memilihVisiMisi, setMemilihVisiMisi] = useState(true);
  const [menjadiRelawan, setMenjadiRelawan] = useState(false);
  const [capres3Way, setCapres3Way] = useState('Prabowo');
  const [capresAvsP, setCapresAvsP] = useState('Prabowo');
  const [capresGvsP, setCapresGvsP] = useState('Prabowo');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmission, setLastSubmission] = useState<{ name: string; maskedNik: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load Wilayah
  useEffect(() => {
    fetch('/api/wilayah')
      .then((res) => res.json())
      .then((data) => {
        if (data.kabupaten) {
          setHierarchy(data);
          if (data.kabupaten.length > 0) setSelectedKab(data.kabupaten[0].id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // Filtered dropdowns
  const availableKec = hierarchy.kecamatan.filter((k) => k.kabupaten_kota_id === selectedKab);
  const availableKel = hierarchy.kelurahan.filter((k) => k.kecamatan_id === selectedKec);
  const availableTps = hierarchy.tps.filter((t) => t.kelurahan_id === selectedKel);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanNik = nik.replace(/\D/g, '');
    if (cleanNik.length < 16) {
      setErrorMsg('NIK harus 16 digit angka sesuai KTP.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/survey-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          survey_id: selectedSurveyId,
          tps_rt_rw_id: selectedTps,
          nama,
          nik: cleanNik,
          alamat,
          telepon,
          jenisKelamin,
          usia,
          agama,
          suku,
          jumlah_pemilih: jumlahPemilih,
          tingkat_yakin: tingkatYakin,
          partai,
          nama_caleg_ri: namaCaleg,
          pernah_tahu_nama_caleg: pernahTahuCaleg,
          memilih_langsung: memilihLangsung,
          memilih_visi_misi: memilihVisiMisi,
          menjadi_relawan: menjadiRelawan,
          pilihan_capres_anies_ganjar_prabowo: capres3Way,
          pilihan_capres_anies_prabowo: capresAvsP,
          pilihan_capres_ganjar_prabowo: capresGvsP,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menyimpan hasil survei');
      }

      // Trigger Confetti
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });

      setLastSubmission({
        name: nama,
        maskedNik: data.maskedNik,
      });

      setNotification(`Data responden ${nama} berhasil disimpan & dienkripsi!`);

      // Reset individual fields for next respondent, keep location & party context
      setNama('');
      setNik('');
      setAlamat('');
      setTelepon('');
      setMemilihLangsung(true);
      setMemilihVisiMisi(true);
      setMenjadiRelawan(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem saat menyimpan data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-16 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 p-4 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <Smartphone className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Form Input Responden Door-to-Door</h2>
            <p className="text-[11px] text-slate-400">
              Input per-rumah di TPS/RT-RW. NIK langsung dienkripsi otomatis sesuai UU PDP.
            </p>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
            Petugas: <strong className="text-emerald-400">{currentUser?.nama}</strong>
          </span>
        </div>
      </div>

      {/* UU PDP Consent Notice Banner */}
      <div className="bg-slate-950 p-3 rounded-xl border border-emerald-500/20 flex items-start gap-2.5 text-xs">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-400 leading-relaxed">
          <strong className="text-slate-200">Kepatuhan Privasi & Consent Responden:</strong> Beritahu responden bahwa data demografi dan preferensi survei digunakan murni untuk kajian elektoral pemilu, NIK dienkripsi secara simetris, dan tidak akan dipublikasikan ke pihak ketiga.
        </p>
      </div>

      {/* Success Notification Banner */}
      {lastSubmission && (
        <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/50 rounded-2xl text-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="font-bold text-white">Laporan Responden Tersimpan!</p>
              <p className="text-[11px] text-slate-300">
                Nama: <strong>{lastSubmission.name}</strong> • NIK: <span className="font-mono text-emerald-400 font-bold">{lastSubmission.maskedNik}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setLastSubmission(null)}
            className="text-[10px] bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/40 px-2.5 py-1 rounded-lg font-semibold"
          >
            Tutup
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-950/60 border border-rose-500/50 rounded-xl text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Section 1: Wilayah Penugasan TPS / RT-RW */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5 text-emerald-400">
            <MapPin className="w-3.5 h-3.5" /> 1. Wilayah Penugasan Survei
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            <div>
              <label className="block text-slate-400 font-medium mb-1 text-[11px]">Kabupaten / Kota</label>
              <select
                value={selectedKab}
                onChange={(e) => {
                  setSelectedKab(e.target.value);
                  const firstKec = hierarchy.kecamatan.find((k) => k.kabupaten_kota_id === e.target.value);
                  if (firstKec) setSelectedKec(firstKec.id);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {hierarchy.kabupaten.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1 text-[11px]">Kecamatan</label>
              <select
                value={selectedKec}
                onChange={(e) => {
                  setSelectedKec(e.target.value);
                  const firstKel = hierarchy.kelurahan.find((k) => k.kecamatan_id === e.target.value);
                  if (firstKel) setSelectedKel(firstKel.id);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {availableKec.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1 text-[11px]">Kelurahan / Desa</label>
              <select
                value={selectedKel}
                onChange={(e) => {
                  setSelectedKel(e.target.value);
                  const firstTps = hierarchy.tps.find((t) => t.kelurahan_id === e.target.value);
                  if (firstTps) setSelectedTps(firstTps.id);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {availableKel.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1 text-[11px]">TPS / RT-RW</label>
              <select
                value={selectedTps}
                onChange={(e) => setSelectedTps(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 font-semibold"
              >
                {availableTps.length > 0 ? (
                  availableTps.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nama}
                    </option>
                  ))
                ) : (
                  <option value="tps-belian-01">TPS 01 - RW 02 Perum Cendana</option>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Data Responden & NIK */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5 text-emerald-400">
            <UserCheck className="w-3.5 h-3.5" /> 2. Data Responden & Potensi DPT Rumah
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Nama Lengkap Responden <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Ahmad Rusdi"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-300 font-semibold">
                  Nomor Induk Kependudukan (NIK) <span className="text-rose-400">*</span>
                </label>
                {nik.length >= 4 && (
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">
                    Tersimpan masked: ****{nik.slice(-4)}
                  </span>
                )}
              </div>
              <input
                type="text"
                required
                maxLength={16}
                value={nik}
                onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                placeholder="16 digit nomor KTP (cth: 3174011234560001)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono tracking-wider"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">Alamat Domisili / Rumah</label>
              <input
                type="text"
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                placeholder="Jl. Perumahan / No. Rumah / Gang"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">No. HP / WhatsApp</label>
              <input
                type="tel"
                value={telepon}
                onChange={(e) => setTelepon(e.target.value)}
                placeholder="0812..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1 text-[11px]">Jenis Kelamin</label>
              <select
                value={jenisKelamin}
                onChange={(e: any) => setJenisKelamin(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1 text-[11px]">Usia (Tahun)</label>
              <input
                type="number"
                min={17}
                max={99}
                value={usia}
                onChange={(e) => setUsia(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1 text-[11px]">Agama</label>
              <select
                value={agama}
                onChange={(e) => setAgama(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="Islam">Islam</option>
                <option value="Kristen">Kristen Protestan</option>
                <option value="Katolik">Katolik</option>
                <option value="Buddha">Buddha</option>
                <option value="Hindu">Hindu</option>
                <option value="Konghucu">Konghucu</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1 text-[11px]">Suku</label>
              <select
                value={suku}
                onChange={(e) => setSuku(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="Melayu">Melayu</option>
                <option value="Jawa">Jawa</option>
                <option value="Minang">Minang</option>
                <option value="Batak">Batak</option>
                <option value="Tionghoa">Tionghoa</option>
                <option value="Sunda">Sunda</option>
                <option value="Bugis">Bugis</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-200">Jumlah Pemilih di Rumah Ini (DPT KK)</p>
              <p className="text-[10px] text-slate-400">Total anggota keluarga serumah yang memiliki hak pilih</p>
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setJumlahPemilih(num)}
                  className={`w-8 h-8 rounded-lg font-bold text-xs transition ${
                    jumlahPemilih === num
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Preferensi Pileg DPR RI & Sikap */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5 text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" /> 3. Preferensi Caleg DPR RI & Partai
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Partai Pilihan</label>
              <select
                value={partai}
                onChange={(e) => setPartai(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 font-semibold"
              >
                {PARTAI_LIST.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Nama Caleg DPR RI Pilihan (Word Cloud)
              </label>
              <input
                type="text"
                list="caleg-suggestions"
                value={namaCaleg}
                onChange={(e) => setNamaCaleg(e.target.value)}
                placeholder="Ketik atau pilih nama caleg..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
              />
              <datalist id="caleg-suggestions">
                {POPULAR_CALEG.map((c) => (
                  <option key={c} value={c.split(' (')[0]} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Attitude Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <label className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700 transition">
              <span className="text-slate-300">Pernah tahu/dengar nama Caleg ini?</span>
              <input
                type="checkbox"
                checked={pernahTahuCaleg}
                onChange={(e) => setPernahTahuCaleg(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700 transition">
              <span className="text-slate-300">Akan memilih langsung di TPS?</span>
              <input
                type="checkbox"
                checked={memilihLangsung}
                onChange={(e) => setMemilihLangsung(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700 transition">
              <span className="text-slate-300">Memilih berdasarkan visi-misi?</span>
              <input
                type="checkbox"
                checked={memilihVisiMisi}
                onChange={(e) => setMemilihVisiMisi(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-emerald-950/40 rounded-xl border border-emerald-500/40 cursor-pointer hover:border-emerald-500 transition">
              <span className="text-emerald-300 font-bold">Bersedia menjadi Tim Relawan?</span>
              <input
                type="checkbox"
                checked={menjadiRelawan}
                onChange={(e) => setMenjadiRelawan(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
            </label>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Tingkat Keyakinan Pilihan</label>
            <div className="grid grid-cols-3 gap-2">
              {['Sangat Yakin', 'Yakin', 'Ragu-ragu'].map((ty) => (
                <button
                  key={ty}
                  type="button"
                  onClick={() => setTingkatYakin(ty)}
                  className={`py-2 rounded-xl font-bold transition text-xs ${
                    tingkatYakin === ty
                      ? 'bg-yellow-500 text-slate-950 shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {ty}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: Simulasi Head-to-Head Capres */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5 text-emerald-400">
            🦅 4. Simulasi Pilihan Capres (Head-to-Head)
          </h3>

          <div className="space-y-2.5">
            <div>
              <p className="text-slate-300 font-semibold mb-1">Simulasi 3 Nama (Anies vs Ganjar vs Prabowo)</p>
              <div className="grid grid-cols-3 gap-2">
                {['Prabowo', 'Anies', 'Ganjar'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCapres3Way(c)}
                    className={`py-2 rounded-xl font-bold transition text-xs ${
                      capres3Way === c
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <p className="text-slate-300 font-semibold mb-1">Head-to-Head: Anies vs Prabowo</p>
                <div className="grid grid-cols-2 gap-2">
                  {['Prabowo', 'Anies'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCapresAvsP(c)}
                      className={`py-2 rounded-xl font-bold transition text-xs ${
                        capresAvsP === c
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-slate-300 font-semibold mb-1">Head-to-Head: Ganjar vs Prabowo</p>
                <div className="grid grid-cols-2 gap-2">
                  {['Prabowo', 'Ganjar'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCapresGvsP(c)}
                      className={`py-2 rounded-xl font-bold transition text-xs ${
                        capresGvsP === c
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-500 hover:from-emerald-500 hover:to-green-400 text-white font-bold text-sm rounded-2xl shadow-xl shadow-emerald-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Menyimpan & Mengenkripsi NIK...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Simpan Hasil Survei Responden</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
