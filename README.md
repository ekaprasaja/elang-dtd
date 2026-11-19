# 🦅 Elang DTD - Monitoring Survei Door-to-Door & Rekapitulasi Elektoral

Aplikasi web modern pengganti aplikasi Android lama (`dtdcampaign.online.incode.monitoring`) untuk manajemen survei *door-to-door* (DTD), pemantauan elektabilitas kandidat, rekapitulasi data pemilih berbasis TPS/Kelurahan/Kecamatan/Kabupaten, serta pengelolaan relawan lapangan dengan standar kepatuhan **UU No. 27/2022 tentang Pelindungan Data Pribadi (UU PDP)**.

---

## 🌟 Fitur Utama

1. **Formulir Input Survei Relawan Lapangan (Mobile-First):**
   - Geolocation GPS otomatis, input NIK (validasi format 16 digit), data responden, dan jumlah pemilih (DPT) per rumah.
   - Pilihan caleg DPR RI (pencarian autocomplete & chip partai), calon presiden (head-to-head), dan partai politik.
   - Evaluasi keluhan warga (kebutuhan mendesak, infrastruktur, bansos, dll).
   - Validasi persetujuan pemrosesan data pribadi (*Consent Checkbox* UU PDP) dan selebrasi visual sukses (Confetti).

2. **Dashboard Rekapitulasi Wilayah (Hierarki Kepri):**
   - 5 KPI Utama: Total Responden, Total Pemilih (DPT), Sudah Memilih Langsung & Visi-Misi, Belum Memilih, Persentase Partisipasi.
   - Visualisasi rasio progres pemilih.
   - Tabel breakdown agregasi berjenjang (Kabupaten/Kota ➔ Kecamatan ➔ Kelurahan ➔ TPS).
   - Ekspor laporan rekapitulasi Excel otomatis (bersih dari NIK/PII).

3. **Dashboard Kandidat & Word Cloud Elektabilitas:**
   - Word Cloud Caleg DPR RI dengan bobot ukuran proporsional terhadap jumlah perolehan suara.
   - Statistik Head-to-Head Capres (3-way & 2-way breakdown).
   - Peringkat 5 Partai Politik teratas di wilayah target survei.

4. **Multi-Chart Grafik & Distribusi Pemilih:**
   - Visualisasi komprehensif distribusi pemilih berdasarkan:
     - Kategori Umur (Gen Z, Milenial, Gen X, dsb.)
     - Gender / Jenis Kelamin
     - Tingkat Pendidikan
     - Status Sosio-Ekonomi
     - Visi Misi & Kinerja Kandidat
     - Kunjungan Relawan & Bantuan yang Diterima

5. **Manajemen Responden & Keamanan NIK Patuh UU PDP:**
   - **Enkripsi Rest:** NIK disimpan dalam database PostgreSQL dalam bentuk terenkripsi **AES-256-GCM** dengan salt dan initialization vector (IV) dinamis.
   - **Masking NIK:** Secara default tampilan tabel hanya menampilkan 4 digit terakhir (`****1234`).
   - **Audited Decryption:** Pembukaan NIK lengkap oleh Admin mewajibkan pengisian alasan akses legal, dan setiap akses dicatat ke log audit (`dtd_nik_access_log`) yang tidak dapat dihapus (*tamper-proof*).
   - **Zero PII Export:** File ekspor Excel hanya berisi agregasi statistik numerik dan bebas dari NIK atau informasi pribadi responden.

6. **Role-Based Access Control (RBAC):**
   - **ADMIN**: Akses penuh, kelola survei, dekripsi NIK ter-audit, ekspor data agregat.
   - **KORWIL**: Akses pantauan wilayah binaan, statistik, dan input data relawan.
   - **RELAWAN**: Akses formulir survei door-to-door lapangan dan riwayat entri.
   - **VIEWER**: Akses monitor visual dashboard real-time tanpa kemampuan edit.

---

## 🛠️ Stack Teknologi

- **Framework:** Next.js 15+ (App Router, Server Actions & Route Handlers)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS & Lucide Icons
- **Database:** Supabase PostgreSQL (Tabel terisolasi `dtd_*` dengan Row Level Security)
- **Cryptography:** Node.js Crypto (AES-256-GCM)
- **Visualization:** Recharts & Canvas Confetti
- **Export Engine:** ExcelJS (Aggregate workbooks)

---

## 🚀 Panduan Menjalankan Proyek

### 1. Klon Repositori & Instal Dependensi
```bash
git clone https://github.com/ekaprasaja/elang-dtd.git
cd elang-dtd
pnpm install
```

### 2. Konfigurasi Environment Variables
Salin berkas `.env.example` ke `.env.local`:
```bash
cp .env.example .env.local
```
Isi variabel dengan kredensial Supabase dan kunci enkripsi AES-256:
```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
ENCRYPTION_SECRET=<32-character-random-secret>
```

### 3. Jalankan Server Pengembangan
```bash
pnpm dev
```
Buka browser pada `http://localhost:3000`.

### 4. Build Produksi
```bash
pnpm build
pnpm start
```

---

## 🔒 Arsitektur Database (`dtd_*`)

- `dtd_kabupaten_kota` - Data 7 Kab/Kota di Kepulauan Riau (Batam, Tanjungpinang, Karimun, Bintan, Lingga, Natuna, Anambas).
- `dtd_kecamatan` - Daftar kecamatan per Kab/Kota.
- `dtd_kelurahan` - Daftar kelurahan/desa per kecamatan.
- `dtd_tps_rt_rw` - Metadata RT/RW dan TPS.
- `dtd_surveys` - Entitas kampanye survei aktif.
- `dtd_profiles` - Pengguna sistem dan peran (Admin, Korwil, Relawan, Viewer).
- `dtd_user_assignments` - Penugasan relawan ke wilayah teritorial.
- `dtd_survey_results` - Data survei responden lapangan (NIK terenkripsi AES-256-GCM).
- `dtd_nik_access_log` - Buku tamu audit forensik pembukaan NIK.

---

## 📜 Lisensi
Hak Cipta © 2026 Tim Elang. Seluruh Hak Cipta Dilindungi Undang-Undang.
