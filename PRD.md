# PRD — DTD Monitoring Web App

## 1. Ringkasan
Migrasi aplikasi Android native **"Monitoring"** (package `dtdcampaign.online.incode.monitoring`) menjadi **aplikasi web**, untuk input dan memantau hasil survei door-to-door (DTD) Pemilu (Pilpres & Pileg DPR RI) di Kepulauan Riau secara real-time.

Setelah membaca langsung source code app lama (`SurveyResult.java`, `AreaFragment.java`, `CandidateFragment.java`, `Kecamatan.java`), ditemukan bahwa **struktur data sebenarnya adalah data survei per-responden** (bukan angka agregat per kandidat seperti asumsi draft sebelumnya). PRD ini sudah disesuaikan supaya **persis sama** dengan struktur data app lama, ditambah fitur baru yang diminta (form input relawan, TPS/RT-RW, export).

Stack baru:
- **Frontend:** Next.js, di-deploy ke **Vercel**
- **Backend/DB:** **Supabase** (Postgres + Auth + Realtime + Storage)
- **Dikerjakan oleh:** Google Antigravity (AI coding IDE) berdasarkan dokumen ini + `PLAN.md`

> **Rekomendasi:** sertakan folder `dtd-monitoring-main` (repo Android lama) sebagai referensi untuk Antigravity, terutama `DatabaseLogic.java` (46KB, berisi logika agregasi persis) — PRD ini mendeskripsikan strukturnya tapi tidak men-transkrip seluruh logic line-by-line.

## 2. Latar Belakang & Masalah
Versi lama (Android-only) punya keterbatasan:
- Harus install APK, tidak bisa diakses dari laptop/browser
- Data di-cache di SQLite lokal per device (ActiveAndroid ORM, `survey.db`) — tidak realtime antar pengguna
- Server API lama memakai HTTP cleartext (`usesCleartextTraffic="true"`), tidak aman
- Wilayah (kecamatan/kelurahan) **hardcode di kode Java**, susah di-maintain
- NIK responden disimpan **plaintext** tanpa proteksi khusus — versi baru memperbaiki ini (lihat §9)

Kebutuhan baru: satu aplikasi web untuk **relawan input data responden langsung di lapangan**, dan tim pusat/korwil **memantau hasil realtime**, dari browser.

## 3. Temuan dari Source Code Asli (dasar PRD ini)

### 3.1 Satu record survei = satu responden (bukan agregat)
`SurveyResult.java` (model Android, extends `SugarRecord`/ORM lokal) punya field-field berikut per responden yang diwawancara relawan:

| Field asli | Arti |
|---|---|
| `nama` | Nama responden |
| `nik` | NIK (nomor KTP) |
| `alamat` | Alamat |
| `desa`, `kecamatan`, `kota` | Wilayah responden |
| `jenisKelamin` | Jenis kelamin |
| `usia` | Usia |
| `agama` | Agama |
| `suku` | Suku |
| `telepon` | No. telepon |
| `jumlahPemilih` (int) | Jumlah pemilih (DPT) di rumah/KK responden |
| `tingkatYakin` | Tingkat keyakinan jawaban responden |
| `partai` | Partai pilihan |
| `namaCalegRI` | Nama caleg DPR RI pilihan — **teks bebas**, dipakai untuk word cloud |
| `pernahTahuNamaCaleg` | Pernah tahu/dengar nama calegnya atau belum |
| `memilihLangsung` | Akan memilih langsung (ya/tidak) |
| `memilihVisiMisi` | Memilih berdasar visi-misi atau tidak |
| `menjadiRelawan` | Bersedia jadi relawan atau tidak |
| `pilihanCapresAniesVsGanjarVsPrabowo` | Pilihan head-to-head 3 nama capres |
| `pilihanCapresAniesVsPrabowo` | Pilihan head-to-head Anies vs Prabowo |
| `pilihanCapresGanjarVsPrabowo` | Pilihan head-to-head Ganjar vs Prabowo |

**Implikasi:** tidak ada tabel "kandidat" terstruktur di app lama. Nama caleg DPR RI adalah teks bebas, dan preferensi capres adalah 3 kolom pilihan head-to-head (bukan tabel kandidat dinamis).

### 3.2 Wilayah: 3 level, hardcode di kode (bukan TPS/RT-RW)
`Kecamatan.java` dan `Kelurahan.java` berisi daftar kecamatan/kelurahan hardcode per kabupaten/kota untuk 7 kab/kota Kepulauan Riau (`arrays.xml`: Batam, Tanjungpinang, Karimun, Bintan, Lingga, Natuna, Kepulauan Anambas). Filter dashboard cuma 3 level: Kabupaten/Kota → Kecamatan → Kelurahan. TPS/RT-RW adalah penambahan baru sesuai permintaan user.

### 3.3 Dashboard "Wilayah" & "Total" — agregat dari data mentah, DAN ada bug di app lama
Sudah ditelusuri langsung ke `DatabaseLogic.java` (query SQLite persis). Hasilnya penting: **beberapa angka di app lama ternyata buggy**, bukan cuma asumsi istilah:

| Label UI | Method | Query yang SEBENARNYA jalan | Status |
|---|---|---|---|
| Jumlah Responden | `getTotal(kota, kecamatan, desa)` | `SurveyResult.count(...)` → setara `COUNT(*) WHERE kota/kecamatan/desa LIKE ...` | ✅ Benar |
| Jumlah DPT | `getDpt(kota, kecamatan, desa)` | `SELECT COUNT(*) FROM ... WHERE kota/kecamatan/desa LIKE ...` — baris `SELECT SUM(jumlah_pemilih) ...` ada di kode tapi **di-comment (`//`), tidak pernah dieksekusi** | 🐛 **BUG** — "Jumlah DPT" di app lama persis sama dengan "Jumlah Responden" (sama-sama COUNT), padahal mestinya SUM dari `jumlah_pemilih` |
| Jumlah Yang Memilih ("ya") | `getYa(kota, kecamatan, desa)` | `SELECT COUNT(*) FROM ... WHERE memilih_langsung='Ya' AND memilih_visi_misi='Ya' AND kota/kecamatan/desa LIKE ...` — baris SUM juga di-comment | 🐛 **BUG serupa** — harusnya SUM `jumlah_pemilih`, yang jalan cuma COUNT. Catatan lain: syaratnya **AND** dari 2 kondisi (`memilih_langsung` DAN `memilih_visi_misi` sama-sama 'Ya'), bukan cuma satu field |
| Jumlah Belum Memilih ("tidak") | — | **Tidak ada method `getTidak()` sama sekali di `DatabaseLogic.java`.** Kemungkinan besar field ini vestigial/tidak pernah benar-benar di-update dari database (tetap nilai default "0") | 🐛 **Kemungkinan tidak pernah berfungsi** |
| Total Pemilih Tersentuh | `getTotalPemilihTersentuh(kota, kecamatan, desa)` | `SELECT SUM(jumlah_pemilih) FROM ... WHERE kota/kecamatan/desa LIKE ...` | ✅ Benar, satu-satunya yang benar-benar SUM |

**Keputusan untuk app baru:** PRD ini **memperbaiki** bug-bug di atas (bukan mereplikasi bug-nya), karena nama labelnya ("Jumlah DPT", "Jumlah Yang Memilih") jelas-jelas dimaksudkan untuk SUM `jumlah_pemilih`, sesuai baris kode yang di-comment — itu adalah intent asli developer yang gagal ter-deploy. Lihat §3.3.1 untuk definisi final yang dipakai app baru.

### 3.3.1 Definisi final untuk app baru (sudah diperbaiki dari bug app lama)
- **Jumlah Responden** = COUNT(*) `survey_results` sesuai filter wilayah
- **Jumlah DPT** = SUM(`jumlah_pemilih`) sesuai filter wilayah *(diperbaiki dari bug COUNT)*
- **Jumlah Yang Memilih** = COUNT(*) WHERE `memilih_langsung` = true AND `memilih_visi_misi` = true, sesuai filter wilayah *(logika AND tetap dipertahankan sesuai app lama, hanya diperbaiki supaya tetap COUNT bukan SUM — karena "jumlah yang memilih" secara semantik memang hitungan orang, bukan jumlah DPT; label app lama sendiri agak ambigu, ini interpretasi paling masuk akal)*
- **Jumlah Belum Memilih** = Jumlah Responden − Jumlah Yang Memilih *(didefinisikan baru, karena app lama tidak pernah benar-benar menghitungnya)*
- **Total Pemilih Tersentuh** = SUM(`jumlah_pemilih`) sesuai filter wilayah (sama seperti app lama, ini sudah benar)

### 3.3.2 Tab "Grafik" ternyata multi-chart, bukan satu grafik
`DatabaseLogic.java` punya pola berulang `getXxx()` yang mengembalikan `GraphPageAdapter.GraphData` — satu method per field kategorikal, masing-masing `GROUP BY <field>, COUNT(*)`. Yang ketemu: `getMenjadiRelawan()` ("Bersedia Menjadi Relawan"), `getKeyakinanPilihan()` ("Keyakinan Pilihan", dari `tingkat_yakin`), dan pola yang sama kemungkinan besar berulang untuk field lain (partai, pernah tahu caleg, jenis kelamin, agama, suku, pilihan capres). Jadi tab "Grafik" di app lama adalah **swipeable multi-chart** (satu chart breakdown per field kategorikal), bukan satu grafik ringkasan. App baru mereplikasi pola ini: breakdown chart per field kategorikal di `survey_results`.

### 3.4 Dashboard "Kandidat" — word cloud, bukan ranking
`CandidateFragment.java` pakai library `com.mrored.wordcloud.WordCloud` untuk menampilkan word cloud nama caleg DPR RI dari field `nama_caleg_ri` di semua responden. Judul tab asli: *"Calon Anggota Legislatif DPR RI"*.

### 3.5 Daftar Survey — cuma list nama/file, bukan objek terstruktur
`DaftarSurvey.java` adalah wrapper response API generik (`code`, `message`, `data: List<String>`) — "survey" di app lama cukup sederhana: daftar nama dataset survei, bukan objek dengan field kompleks.

## 4. Peran Pengguna (Roles)
| Role | Akses |
|---|---|
| **Admin** | Full akses: kelola survei, wilayah (sampai TPS/RT-RW), user, export laporan, lihat semua dashboard. Akses NIK utuh dicatat di audit log (lihat §9) |
| **Koordinator Wilayah** | Lihat dashboard & kelola relawan untuk wilayah tanggung jawabnya; bisa input juga; NIK tampil **termasking** |
| **Relawan** | Input data responden untuk TPS/RT-RW yang ditugaskan; tidak bisa lihat data wilayah lain; setelah submit, NIK yang baru diinput sendiri tampil termasking juga (bukan plaintext) saat ditampilkan ulang |
| **Viewer / Tim Pusat** | Lihat dashboard (read-only), semua wilayah, bisa export; **tidak pernah melihat NIK**, hanya statistik agregat |

User dibuat manual oleh **Admin** (tidak ada self-registration).

## 5. Lingkup (Scope)

### In-scope
- Autentikasi (Supabase Auth, role-based)
- CRUD **Survey** (nama, tanggal, status)
- CRUD **Wilayah berjenjang**: Kabupaten/Kota → Kecamatan → Kelurahan → **TPS/RT-RW**
- **Form input relawan** — satu record per responden, field persis §3.1, dibatasi ke TPS/RT-RW yang ditugaskan
- Penugasan relawan ke TPS/RT-RW
- Dashboard 3 tab: **Wilayah**, **Kandidat** (word cloud + head-to-head capres), **Total**
- Export laporan (Excel + PDF) — **NIK tidak pernah ikut ter-export**, hanya data agregat/anonim
- Realtime update (Supabase Realtime)
- Mobile-first untuk form input relawan
- **NIK terenkripsi di database + akses dibatasi ketat per role (lihat §9 — ini keputusan final, bukan opsional)**

### Out-of-scope (versi awal)
- Mode offline
- Integrasi otomatis dari sumber eksternal
- Multi-tenant

## 6. Model Data (Supabase / Postgres)

```sql
-- Wilayah berjenjang
kabupaten_kota ( id uuid pk, nama text )
kecamatan ( id uuid pk, kabupaten_kota_id uuid fk, nama text )
kelurahan ( id uuid pk, kecamatan_id uuid fk, nama text )
tps_rt_rw ( id uuid pk, kelurahan_id uuid fk, nama text, tipe text ) -- 'tps' | 'rt_rw'

-- Survey
surveys ( id uuid pk, nama text, tanggal_mulai date, tanggal_selesai date,
          status text, created_at timestamptz )

-- Hasil survei PER RESPONDEN
survey_results (
  id uuid pk,
  survey_id uuid fk,
  tps_rt_rw_id uuid fk,
  nama text,
  nik_encrypted bytea,            -- NIK terenkripsi (pgp_sym_encrypt), TIDAK PERNAH plaintext di kolom
  nik_last4 text,                 -- 4 digit terakhir saja, disimpan plaintext untuk tampilan/pencarian cepat
  alamat text,
  jenis_kelamin text,
  usia int,
  agama text,
  suku text,
  telepon text,
  jumlah_pemilih int,
  tingkat_yakin text,
  partai text,
  nama_caleg_ri text,
  pernah_tahu_nama_caleg boolean,
  memilih_langsung boolean,
  memilih_visi_misi boolean,
  menjadi_relawan boolean,
  pilihan_capres_anies_ganjar_prabowo text,
  pilihan_capres_anies_prabowo text,
  pilihan_capres_ganjar_prabowo text,
  input_by uuid fk -> auth.users,
  created_at timestamptz,
  updated_at timestamptz
)

-- Audit khusus akses NIK penuh (wajib, bukan opsional)
nik_access_log (
  id uuid pk,
  survey_result_id uuid fk,
  accessed_by uuid fk -> auth.users,
  accessed_at timestamptz,
  alasan text                     -- diisi user saat klik "lihat NIK lengkap"
)

-- Role & penugasan user
profiles ( id uuid fk -> auth.users, nama text, role text )
user_assignments ( id uuid pk, user_id uuid fk -> auth.users,
                    wilayah_type text, wilayah_id uuid )
```

RLS:
- `admin` → full access ke semua tabel, **termasuk fungsi decrypt NIK** (lewat Postgres function `get_nik_decrypted(survey_result_id, alasan)` yang otomatis menulis ke `nik_access_log` setiap dipanggil — bukan query langsung ke kolom `nik_encrypted`)
- `koordinator` → select wilayahnya (lihat `nik_last4` saja, tidak bisa decrypt), insert/update `survey_results` untuk TPS/RT-RW di bawahnya
- `relawan` → insert untuk `tps_rt_rw_id` yang ditugaskan; select terbatas ke data yang dia input sendiri, NIK tampil `nik_last4` saja
- `viewer` → select-only, tanpa kolom `nik_encrypted`/`nik_last4` sama sekali (pakai view yang expose kolom non-sensitif saja)

## 7. Fitur Detail

### 7.1 Form Input Relawan
- Pilih survey aktif → pilih TPS/RT-RW yang ditugaskan
- Isi data responden lengkap. **Field NIK**: input di-enkripsi saat submit (server-side, via Postgres function/Edge Function — NIK plaintext tidak pernah ditulis ke log atau tabel biasa), relawan melihat konfirmasi masked (`****1234`) setelah submit
- Submit → `survey_results`, konfirmasi jelas, lanjut input responden berikutnya tanpa navigasi ulang
- Error handling koneksi lemah: pesan jelas + retry
- **Consent notice** singkat di awal form: responden diberi tahu data (termasuk NIK) digunakan untuk keperluan survei pemilu dan disimpan sesuai ketentuan privasi

### 7.2 Dashboard: Tab Wilayah
Breakdown berjenjang kecamatan → kelurahan → TPS/RT-RW, pakai definisi final §3.3.1 (sudah diperbaiki dari bug app lama): Jumlah Responden, Jumlah DPT (SUM `jumlah_pemilih`), Jumlah Yang Memilih/Belum Memilih, Total Pemilih Tersentuh. **Tidak ada NIK di tampilan ini sama sekali** — murni angka agregat.

### 7.3 Dashboard: Tab Kandidat
- Word cloud nama caleg DPR RI dari `nama_caleg_ri` (`react-wordcloud`/`d3-cloud`)
- Bar chart ringkasan persentase 3 head-to-head capres

### 7.4 Dashboard: Tab Grafik/Total
Rekap sama seperti Tab Wilayah tapi lintas semua wilayah, **ditambah swipeable multi-chart** breakdown per field kategorikal (bersedia jadi relawan, keyakinan pilihan, pernah tahu caleg, jenis kelamin, agama, suku, partai, 3 pilihan head-to-head capres) — pola `GROUP BY field, COUNT(*)`, sesuai §3.3.2.

### 7.5 Export Laporan
Excel + PDF — **hanya data agregat/anonim**. Tidak ada kolom nama, NIK, alamat, atau telepon individual di file export manapun. Kalau admin butuh data mentah per-responden untuk keperluan lain, itu lewat fitur terpisah (lihat 7.6) yang tercatat di audit log, bukan lewat tombol export biasa.

### 7.6 Manajemen Master Data & User (Admin)
- CRUD wilayah 4 level, CRUD survey, CRUD user + penugasan wilayah/TPS
- Halaman khusus admin "Lihat data responden" dengan tombol "lihat NIK lengkap" per baris — setiap klik wajib isi alasan singkat, otomatis tercatat ke `nik_access_log`

## 8. Arsitektur Teknis
- **Frontend:** Next.js 14+ (App Router), Tailwind CSS, Vercel
- **Backend:** Supabase (Postgres, Auth, Realtime, Storage)
- **Enkripsi NIK:** ekstensi `pgsodium` atau `pgcrypto` di Supabase — `pgp_sym_encrypt`/`pgp_sym_decrypt` dengan kunci disimpan di Supabase Vault (bukan di kode aplikasi)
- **Chart:** Recharts; **Word cloud:** `react-wordcloud`/`d3-cloud`
- **Export:** `exceljs`, `@react-pdf/renderer`
- **Env vars:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

## 9. Keputusan Privasi NIK (FINAL)
NIK **tetap disimpan** (dibutuhkan untuk validasi/verifikasi responden seperti app lama), tapi dengan perlindungan berlapis dibanding app lama yang plaintext:

1. **Enkripsi at-rest**: kolom `nik_encrypted` (bukan plaintext), hanya bisa dibaca lewat Postgres function yang dibatasi ke role `admin`
2. **Tampilan default termasking**: semua UI (dashboard, tabel, form) hanya menampilkan `nik_last4` (4 digit terakhir) kecuali admin eksplisit klik "lihat lengkap"
3. **Audit log wajib**: setiap kali NIK penuh dibuka, tercatat siapa/kapan/alasan di `nik_access_log` — tidak bisa dimatikan
4. **Tidak pernah ikut export**: file Excel/PDF yang di-generate dari dashboard tidak memuat NIK sama sekali
5. **Consent notice** ke responden saat input data di lapangan
6. Field sensitif lain (`agama`, `suku`, `telepon`, `alamat`) ikut dibatasi oleh RLS yang sama (tidak bisa dilihat viewer, hanya admin/koordinator wilayah terkait)

Ini pendekatan standar untuk data pribadi spesifik di bawah UU PDP (UU No. 27/2022) — enkripsi + pembatasan akses + audit trail, bukan penghapusan field (karena fungsinya masih dibutuhkan operasional).

## 10. Non-Functional Requirements
- Form input relawan nyaman dipakai 1 tangan di HP
- Dashboard load < 2 detik untuk ribuan baris `survey_results`
- HTTPS semua traffic
- Audit trail: `input_by`, `updated_at`, `nik_access_log`
- Pesan error jelas + retry saat submit gagal karena koneksi lemah

## 11. Asumsi Tersisa
- "Jumlah Belum Memilih" didefinisikan sebagai (Jumlah Responden − Jumlah Yang Memilih) karena app lama tidak pernah benar-benar menghitungnya (lihat §3.3) — kalau user punya definisi lain di pikiran, perlu dikoreksi
- Pilihan capres head-to-head (3 kolom tetap: Anies/Ganjar/Prabowo) direplikasi persis seperti app lama; kalau survey mendatang butuh capres lain, struktur ini perlu digeneralisasi nanti
- Relawan hanya ditugaskan ke TPS/RT-RW; `user_assignments` sudah fleksibel kalau perlu level lain
- Pola `getXxx()` grafik per-field di `DatabaseLogic.java` dikonfirmasi ada untuk `menjadi_relawan` dan `tingkat_yakin`; field lain (partai, pernah tahu caleg, dst) diasumsikan punya pola sama tapi belum ditelusuri satu-satu sampai akhir file (47KB) — cukup jelas polanya untuk direplikasi ke semua field kategorikal yang relevan

## 12. Kriteria Sukses
- Relawan bisa login dari HP dan submit data responden untuk TPS/RT-RW yang ditugaskan dalam < 2 menit per submit
- Update dari relawan langsung terlihat di dashboard tim lain tanpa refresh manual
- Word cloud caleg DPR RI dan breakdown wilayah tampil sama persis semangatnya dengan app lama, hanya lebih kaya (sampai TPS/RT-RW)
- Admin bisa export laporan Excel/PDF (tanpa data pribadi individual)
- NIK terenkripsi, termasking by default, dan setiap akses penuh tercatat di audit log
