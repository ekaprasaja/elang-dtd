# PLAN.md — Build Order untuk Google Antigravity

Rencana eksekusi step-by-step untuk membangun ulang **DTD Monitoring Web App** (lihat `PRD.md` untuk spesifikasi lengkap, termasuk §3 "Temuan dari Source Code Asli" dan §9 "Keputusan Privasi NIK" yang penting dibaca dulu). Stack: **Next.js → Vercel**, **Supabase (Postgres + Auth + Realtime)**.

**Catatan:** logika agregasi "Jumlah DPT" / "Jumlah Yang Memilih" / "Total Pemilih Tersentuh" sudah ditelusuri langsung dari `DatabaseLogic.java` app lama dan didefinisikan final di PRD §3.3.1 (lengkap dengan 2 bug yang ditemukan dan sudah diperbaiki) — tidak perlu membaca ulang repo lama untuk bagian ini. Repo lama tetap berguna sebagai referensi umum kalau ada detail lain yang perlu dicek.

Ikuti fase secara berurutan.

---

## Fase 0 — Setup Project
- [ ] Buat project Supabase baru (catat `project URL`, `anon key`, `service role key`)
- [ ] Buat repo git baru `dtd-monitoring-web`
- [ ] Init Next.js (App Router, TypeScript, Tailwind)
- [ ] Install dependency: `@supabase/supabase-js`, `@supabase/ssr`, `recharts`, `react-wordcloud` (atau `d3-cloud`), `exceljs`, `@react-pdf/renderer`
- [ ] Setup `.env.local` + `.gitignore`
- [ ] Connect repo ke Vercel, set env vars di Vercel dashboard
- [ ] Deploy halaman default, pastikan pipeline jalan

## Fase 1 — Enkripsi NIK (setup duluan, sebelum schema lain)
- [ ] Aktifkan ekstensi `pgsodium` (atau `pgcrypto`) di Supabase
- [ ] Buat kunci enkripsi di Supabase Vault — **jangan hardcode di kode aplikasi atau env var publik**
- [ ] Buat Postgres function `encrypt_nik(nik text) returns bytea` dan `get_nik_decrypted(survey_result_id uuid, alasan text) returns text` — fungsi kedua ini yang otomatis insert ke `nik_access_log` setiap dipanggil, dan hanya bisa dieksekusi role `admin`
- [ ] Test enkripsi/dekripsi manual lewat SQL editor sebelum dipakai di tabel sungguhan

## Fase 2 — Database Schema (Supabase)
- [ ] Migration tabel wilayah: `kabupaten_kota`, `kecamatan`, `kelurahan`, `tps_rt_rw`
- [ ] Migration `surveys`
- [ ] Migration `survey_results` dengan kolom `nik_encrypted bytea` + `nik_last4 text` (bukan `nik` plaintext) dan semua field lain dari PRD §6 — **jangan ubah struktur field non-NIK**, itu hasil replikasi persis dari `SurveyResult.java`
- [ ] Migration `nik_access_log`
- [ ] Migration `profiles`, `user_assignments`
- [ ] Seed data wilayah dari `kecamatan.json`/`Kecamatan.java`/`Kelurahan.java` app lama (extract programatically, bukan ketik ulang manual)
- [ ] Setup RLS sesuai PRD §6 — perhatikan khusus: `viewer` pakai view terpisah yang TIDAK mengekspos `nik_encrypted`/`nik_last4` sama sekali
- [ ] Test RLS manual di Supabase SQL editor per role, termasuk coba akses NIK dari role yang tidak boleh — harus gagal

## Fase 3 — Autentikasi
- [ ] Supabase Auth (email/password, sign-up publik dimatikan)
- [ ] `/login`
- [ ] Middleware proteksi route per role
- [ ] Helper ambil role + assignment wilayah
- [ ] Test 4 role

## Fase 4 — Layout & Navigasi
- [ ] Layout minimal untuk relawan (langsung ke form input), lengkap untuk admin/koordinator/viewer
- [ ] Placeholder route: `/input`, `/surveys`, `/surveys/[id]`, `/master-data/wilayah`, `/users`, `/responden` (khusus admin, lihat Fase 11)

## Fase 5 — Master Data Wilayah (Admin)
- [ ] CRUD 4 level wilayah
- [ ] Import bulk dari `kecamatan.json`/`Kelurahan.java` app lama

## Fase 6 — Manajemen User & Penugasan (Admin)
- [ ] Buat user, set role
- [ ] Assign wilayah/TPS ke koordinator & relawan

## Fase 7 — Survey
- [ ] CRUD `/surveys` (nama, tanggal, status)

## Fase 8 — Form Input Relawan (fitur paling kritis)
- [ ] Halaman `/input`, mobile-first
- [ ] Consent notice singkat di awal form (lihat PRD §7.1)
- [ ] Pilih survey aktif → pilih TPS/RT-RW yang ditugaskan
- [ ] Form lengkap sesuai field `survey_results`: data diri responden, **NIK** (di-enkripsi server-side saat submit lewat function `encrypt_nik`, field input NIK jangan di-log di client maupun server log), jumlah pemilih di rumah, partai, nama caleg DPR RI (teks bebas dengan autocomplete dari nama yang sudah pernah diinput supaya mengurangi typo), toggle pernah tahu caleg/memilih langsung/memilih visi-misi/mau jadi relawan, 3 pilihan head-to-head capres
- [ ] Submit → `survey_results` (NIK masuk sebagai `nik_encrypted` + `nik_last4`, bukan plaintext), konfirmasi masked (`****1234`), opsi lanjut input responden berikutnya
- [ ] Error handling koneksi lemah: pesan jelas + retry (pastikan draft form tidak hilang kalau submit gagal, termasuk NIK yang sudah diketik)

## Fase 9 — Dashboard: Tab Wilayah & Total
- [ ] `/surveys/[id]` dengan 3 tab
- [ ] Implementasi agregasi **persis definisi final di PRD §3.3.1** (ini sudah final, TIDAK PERLU baca ulang `DatabaseLogic.java` — app lama punya bug di sini yang sudah diperbaiki di PRD):
  - Jumlah Responden = `COUNT(*)` filtered
  - Jumlah DPT = `SUM(jumlah_pemilih)` filtered
  - Jumlah Yang Memilih = `COUNT(*) WHERE memilih_langsung = true AND memilih_visi_misi = true` filtered
  - Jumlah Belum Memilih = Jumlah Responden − Jumlah Yang Memilih
  - Total Pemilih Tersentuh = `SUM(jumlah_pemilih)` filtered
- [ ] Breakdown berjenjang kecamatan → kelurahan → TPS/RT-RW
- [ ] Pastikan query dashboard TIDAK pernah SELECT kolom `nik_encrypted` — hanya kolom agregat
- [ ] Tab Total: rekap sama tapi lintas semua wilayah, ditambah multi-chart breakdown (lihat Fase 10)

## Fase 10 — Dashboard: Tab Kandidat (word cloud) + Multi-chart breakdown
- [ ] Hitung frekuensi `nama_caleg_ri` non-kosong, render word cloud (`react-wordcloud`/`d3-cloud`)
- [ ] Bar chart ringkasan 3 head-to-head capres
- [ ] **Swipeable multi-chart breakdown** (pola `GROUP BY field, COUNT(*)`, sesuai PRD §3.3.2), satu chart per field kategorikal: `menjadi_relawan` ("Bersedia Menjadi Relawan"), `tingkat_yakin` ("Keyakinan Pilihan"), dan field kategorikal lain yang relevan (`partai`, `pernah_tahu_nama_caleg`, `jenis_kelamin`, `agama`, `suku`) — reuse satu komponen chart generik yang menerima nama field + label judul, jangan bikin komponen terpisah per field

## Fase 11 — Halaman Admin "Data Responden" + Audit NIK
- [ ] Tabel daftar responden (nama, wilayah, tanggal input) dengan NIK default tampil `nik_last4` saja
- [ ] Tombol "Lihat NIK lengkap" per baris → modal wajib isi alasan → panggil `get_nik_decrypted()` → otomatis tercatat ke `nik_access_log`
- [ ] Halaman log akses NIK (siapa buka NIK siapa, kapan, alasan apa) — read-only, cuma admin

## Fase 12 — Realtime
- [ ] Subscribe Supabase Realtime ke `survey_results` untuk dashboard (bukan untuk halaman Data Responden yang sensitif)
- [ ] Insert baru dari relawan → dashboard & word cloud update otomatis
- [ ] Test 2 browser: relawan submit, viewer lihat update

## Fase 13 — Export Laporan
- [ ] Excel + PDF — hanya data agregat (rekap wilayah, frekuensi caleg, rekap capres). **Verifikasi tidak ada kolom nama/NIK/alamat/telepon individual ikut ter-export** sebelum fase ini dianggap selesai
- [ ] Filter per survey/wilayah

## Fase 14 — Polish & QA
- [ ] Responsive check `/input` di HP sungguhan
- [ ] Loading state & error handling
- [ ] Test RLS end-to-end: relawan/koordinator/viewer semua dicoba akses NIK lengkap → harus gagal kecuali admin; viewer dicoba akses data responden mentah → harus gagal
- [ ] Verifikasi `nik_access_log` benar-benar terisi tiap kali admin buka NIK lengkap
- [ ] Deploy final ke Vercel, cek env var production
- [ ] Smoke test end-to-end: admin buat survey + assign relawan → relawan submit data responden (dengan NIK) → muncul realtime di dashboard (Wilayah, Kandidat word cloud, Total, tanpa NIK) → admin buka NIK lengkap satu responden (tercatat di log) → export Excel/PDF berhasil (tanpa data pribadi)

---

## Catatan Penting untuk Antigravity
1. **Struktur `survey_results` (selain NIK) adalah hasil pembacaan langsung `SurveyResult.java`** — jangan ganti ke model "kandidat terstruktur" kecuali user minta eksplisit.
2. **NIK: keputusan sudah final** — disimpan terenkripsi (`nik_encrypted`), default tampil termasking (`nik_last4`), akses penuh hanya admin + wajib audit log. Jangan simpan NIK plaintext di kolom manapun, log manapun, atau file export manapun.
3. **Logika agregasi Fase 9 sudah final dan SUDAH DIVERIFIKASI** langsung ke `DatabaseLogic.java` app lama — ternyata app lama punya 2 bug (label "Jumlah DPT" dan "Jumlah Yang Memilih" sebenarnya COUNT bukan SUM di produksi, padahal kode SUM-nya ada tapi di-comment; dan "Jumlah Belum Memilih" tidak pernah benar-benar dihitung). PRD §3.3.1 sudah mendefinisikan versi yang diperbaiki — **ikuti itu, tidak perlu baca ulang file lama untuk bagian ini.**
4. TPS/RT-RW, role relawan dengan penugasan wilayah, fitur export, dan sistem enkripsi/audit NIK adalah **penambahan/perbaikan baru** di luar app lama — bagian ini aman didesain sesuai PRD tanpa perlu mencocokkan app lama (yang dulu plaintext).
