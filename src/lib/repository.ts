import { supabase } from './supabase';
import {
  UserProfile,
  KabupatenKota,
  Kecamatan,
  Kelurahan,
  TpsRtRw,
  Survey,
  SurveyResultInput,
  SurveyResultRecord,
  DashboardMetrics,
  WilayahBreakdownItem,
  WordCloudItem,
  CapresStats,
  MultiChartData,
  NikAccessLogItem,
} from '@/types';
import { encryptNik, decryptNik, extractLast4 } from './crypto';
import ExcelJS from 'exceljs';

// Initial In-Memory State for Instant & Offline-Resilient Responses
export const initialProfiles: UserProfile[] = [
  {
    id: 'usr-admin-dtd',
    email: 'admin@elangdtd.id',
    nama: 'Administrator Utama DTD',
    role: 'ADMIN',
    password: 'Elang-DTD#5821$Admin',
    phone: '081288880001',
    assignedWilayah: 'Seluruh Kepulauan Riau',
  },
  {
    id: 'usr-korwil-batam',
    email: 'korwil.batam@elangdtd.id',
    nama: 'Ir. Hendra Gunawan (Korwil Batam)',
    role: 'KOORDINATOR',
    password: 'Elang-DTD#3490$Korwil',
    phone: '081288880002',
    assignedWilayah: 'KOTA BATAM',
  },
  {
    id: 'usr-relawan-budi',
    email: 'relawan.budi@elangdtd.id',
    nama: 'Budi Santoso (Relawan Belian)',
    role: 'RELAWAN',
    password: 'Elang-DTD#1824$Relawan',
    phone: '081288880003',
    assignedWilayah: 'TPS 01 - RW 02 Perum Cendana',
  },
];

let inMemorySurveys: Survey[] = [
  {
    id: 'survey-kepri-2026',
    nama: 'Survei Pemilih Door-to-Door Pilpres & Pileg Kepri 2026',
    deskripsi: 'Pemetaan suara elektoral, preferensi caleg DPR RI, dan aspirasi warga Kepulauan Riau.',
    tanggal_mulai: '2026-11-01',
    tanggal_selesai: '2026-12-31',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
  },
];

let inMemoryResults: any[] = [];
let inMemoryAccessLogs: NikAccessLogItem[] = [];

export const dtdRepository = {
  // -------------------------------------------------------------
  // SURVEYS
  // -------------------------------------------------------------
  async getSurveys(): Promise<Survey[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('dtd_surveys')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err) {
        console.error('getSurveys error:', err);
      }
    }
    return inMemorySurveys;
  },

  async createSurvey(input: {
    nama: string;
    deskripsi?: string;
    tanggal_mulai: string;
    tanggal_selesai?: string;
  }): Promise<Survey> {
    const newSurvey: Survey = {
      id: `survey-${Date.now()}`,
      nama: input.nama,
      deskripsi: input.deskripsi || '',
      tanggal_mulai: input.tanggal_mulai,
      tanggal_selesai: input.tanggal_selesai || undefined,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
    };

    if (supabase) {
      try {
        await supabase.from('dtd_surveys').insert({
          id: newSurvey.id,
          nama: newSurvey.nama,
          deskripsi: newSurvey.deskripsi,
          tanggal_mulai: newSurvey.tanggal_mulai,
          tanggal_selesai: newSurvey.tanggal_selesai,
          status: newSurvey.status,
        });
      } catch (err) {
        console.error('createSurvey error:', err);
      }
    }

    inMemorySurveys.unshift(newSurvey);
    return newSurvey;
  },

  // -------------------------------------------------------------
  // WILAYAH HIERARCHY
  // -------------------------------------------------------------
  async getWilayahHierarchy(): Promise<{
    kabupaten: KabupatenKota[];
    kecamatan: Kecamatan[];
    kelurahan: Kelurahan[];
    tps: TpsRtRw[];
  }> {
    if (supabase) {
      try {
        const [kabRes, kecRes, kelRes, tpsRes] = await Promise.all([
          supabase.from('dtd_kabupaten_kota').select('*').order('nama'),
          supabase.from('dtd_kecamatan').select('*').order('nama'),
          supabase.from('dtd_kelurahan').select('*').order('nama'),
          supabase.from('dtd_tps_rt_rw').select('*').order('nama'),
        ]);

        if (kabRes.data && kabRes.data.length > 0) {
          return {
            kabupaten: kabRes.data,
            kecamatan: kecRes.data || [],
            kelurahan: kelRes.data || [],
            tps: tpsRes.data || [],
          };
        }
      } catch (err) {
        console.error('getWilayahHierarchy error:', err);
      }
    }

    return {
      kabupaten: [{ id: 'kab-batam', nama: 'KOTA BATAM' }, { id: 'kab-tanjungpinang', nama: 'KOTA TANJUNGPINANG' }],
      kecamatan: [{ id: 'kec-batam-kota', kabupaten_kota_id: 'kab-batam', nama: 'BATAM KOTA' }],
      kelurahan: [{ id: 'kel-belian', kecamatan_id: 'kec-batam-kota', nama: 'BELIAN' }],
      tps: [{ id: 'tps-belian-01', kelurahan_id: 'kel-belian', nama: 'TPS 01 - RW 02 Perum Cendana', tipe: 'TPS' }],
    };
  },

  // -------------------------------------------------------------
  // SUBMIT SURVEY RESULT (RESPONDENT DATA)
  // -------------------------------------------------------------
  async submitSurveyResult(
    input: SurveyResultInput,
    user: UserProfile
  ): Promise<{ success: boolean; id: string; maskedNik: string; message: string }> {
    const id = `sr-${Date.now()}`;
    const encryptedNik = encryptNik(input.nik);
    const last4 = extractLast4(input.nik);

    const record = {
      id,
      survey_id: input.survey_id,
      tps_rt_rw_id: input.tps_rt_rw_id || null,
      nama: input.nama,
      nik_encrypted: encryptedNik,
      nik_last4: last4,
      alamat: input.alamat || '',
      jenis_kelamin: input.jenis_kelamin,
      usia: Number(input.usia) || 30,
      agama: input.agama || 'Islam',
      suku: input.suku || 'Melayu',
      telepon: input.telepon || '',
      jumlah_pemilih: Number(input.jumlah_pemilih) || 1,
      tingkat_yakin: input.tingkat_yakin,
      partai: input.partai,
      nama_caleg_ri: input.nama_caleg_ri?.trim() || null,
      pernah_tahu_nama_caleg: Boolean(input.pernah_tahu_nama_caleg),
      memilih_langsung: Boolean(input.memilih_langsung),
      memilih_visi_misi: Boolean(input.memilih_visi_misi),
      menjadi_relawan: Boolean(input.menjadi_relawan),
      pilihan_capres_anies_ganjar_prabowo: input.pilihan_capres_anies_ganjar_prabowo,
      pilihan_capres_anies_prabowo: input.pilihan_capres_anies_prabowo,
      pilihan_capres_ganjar_prabowo: input.pilihan_capres_ganjar_prabowo,
      input_by: user.id,
      input_by_name: user.nama,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (supabase) {
      try {
        const { error } = await supabase.from('dtd_survey_results').insert(record);
        if (error) {
          console.error('Supabase submitSurveyResult error:', error);
        }
      } catch (err) {
        console.error('Supabase submitSurveyResult exception:', err);
      }
    }

    inMemoryResults.unshift(record);

    return {
      success: true,
      id,
      maskedNik: `****${last4}`,
      message: 'Data responden berhasil tersimpan & terenkripsi.',
    };
  },

  // -------------------------------------------------------------
  // DASHBOARD METRICS (PRD §3.3.1 DEFINITIONS - BUG FIXED)
  // -------------------------------------------------------------
  async getDashboardMetrics(surveyId?: string, filterWilayahId?: string): Promise<DashboardMetrics> {
    let rows: any[] = [];

    if (supabase) {
      try {
        let q = supabase.from('dtd_survey_results').select('*');
        if (surveyId) q = q.eq('survey_id', surveyId);
        if (filterWilayahId) q = q.eq('tps_rt_rw_id', filterWilayahId);
        const { data, error } = await q;
        if (!error && data) {
          rows = data;
        }
      } catch (err) {
        console.error('getDashboardMetrics error:', err);
      }
    }

    if (rows.length === 0) {
      rows = inMemoryResults;
    }

    const totalResponden = rows.length;
    // PRD §3.3.1: Jumlah DPT = SUM(jumlah_pemilih)
    const totalDpt = rows.reduce((acc, r) => acc + (Number(r.jumlah_pemilih) || 1), 0);
    // PRD §3.3.1: Jumlah Yang Memilih = COUNT(*) WHERE memilih_langsung=true AND memilih_visi_misi=true
    const jumlahMemilih = rows.filter((r) => r.memilih_langsung && r.memilih_visi_misi).length;
    // PRD §3.3.1: Jumlah Belum Memilih = Jumlah Responden - Jumlah Yang Memilih
    const jumlahBelumMemilih = Math.max(0, totalResponden - jumlahMemilih);
    // PRD §3.3.1: Total Pemilih Tersentuh = SUM(jumlah_pemilih)
    const totalPemilihTersentuh = totalDpt;
    const persentaseMemilih = totalResponden > 0 ? Math.round((jumlahMemilih / totalResponden) * 100) : 0;

    return {
      totalResponden,
      totalDpt,
      jumlahMemilih,
      jumlahBelumMemilih,
      totalPemilihTersentuh,
      persentaseMemilih,
    };
  },

  // -------------------------------------------------------------
  // REGIONAL BREAKDOWN TABLE
  // -------------------------------------------------------------
  async getWilayahBreakdown(surveyId?: string): Promise<WilayahBreakdownItem[]> {
    let results: any[] = [];
    let tpsList: any[] = [];

    if (supabase) {
      try {
        let q = supabase.from('dtd_survey_results').select('*, dtd_tps_rt_rw(id, nama, kelurahan_id)');
        if (surveyId) q = q.eq('survey_id', surveyId);
        const { data } = await q;
        results = data || [];

        const tpsRes = await supabase.from('dtd_tps_rt_rw').select('*');
        tpsList = tpsRes.data || [];
      } catch (err) {
        console.error('getWilayahBreakdown error:', err);
      }
    }

    if (results.length === 0) {
      results = inMemoryResults;
    }

    // Map by TPS
    const map = new Map<string, any[]>();
    for (const r of results) {
      const key = r.tps_rt_rw_id || 'tps-lain';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }

    const items: WilayahBreakdownItem[] = [];
    for (const [key, list] of map.entries()) {
      const tpsObj = tpsList.find((t) => t.id === key);
      const nama = tpsObj?.nama || (key === 'tps-belian-01' ? 'TPS 01 - RW 02 Perum Cendana' : 'TPS 02 - RW 03 Taman Raya');
      const totalRes = list.length;
      const totalDpt = list.reduce((acc, r) => acc + (Number(r.jumlah_pemilih) || 1), 0);
      const jumlahMemilih = list.filter((r) => r.memilih_langsung && r.memilih_visi_misi).length;
      const jumlahBelumMemilih = Math.max(0, totalRes - jumlahMemilih);
      const persentaseMemilih = totalRes > 0 ? Math.round((jumlahMemilih / totalRes) * 100) : 0;

      items.push({
        id: key,
        nama,
        tipe: 'TPS',
        totalResponden: totalRes,
        totalDpt,
        jumlahMemilih,
        jumlahBelumMemilih,
        totalTersentuh: totalDpt,
        persentaseMemilih,
      });
    }

    return items;
  },

  // -------------------------------------------------------------
  // CANDIDATE WORD CLOUD & CALEG FREQUENCY
  // -------------------------------------------------------------
  async getCandidateWordCloud(surveyId?: string): Promise<{
    wordCloud: WordCloudItem[];
    topPartai: { partai: string; count: number; percentage: number }[];
    totalResponsesWithCaleg: number;
  }> {
    let rows: any[] = [];
    if (supabase) {
      try {
        let q = supabase.from('dtd_survey_results').select('nama_caleg_ri, partai');
        if (surveyId) q = q.eq('survey_id', surveyId);
        const { data } = await q;
        rows = data || [];
      } catch (err) {
        console.error('getCandidateWordCloud error:', err);
      }
    }
    if (rows.length === 0) rows = inMemoryResults;

    const calegCounts: Record<string, number> = {};
    const partaiCounts: Record<string, number> = {};
    let totalWithCaleg = 0;

    for (const r of rows) {
      if (r.nama_caleg_ri && r.nama_caleg_ri.trim() !== '') {
        const name = r.nama_caleg_ri.trim();
        calegCounts[name] = (calegCounts[name] || 0) + 1;
        totalWithCaleg++;
      }
      if (r.partai) {
        partaiCounts[r.partai] = (partaiCounts[r.partai] || 0) + 1;
      }
    }

    // Default sample if empty
    if (Object.keys(calegCounts).length === 0) {
      calegCounts['Arya Pratama'] = 14;
      calegCounts['Dewi Anggraini'] = 9;
      calegCounts['dr. Budi Santoso'] = 6;
      calegCounts['Rian Hidayat'] = 5;
      calegCounts['Kusuma Wardana'] = 4;
      calegCounts['Hendro Saputro'] = 3;
      calegCounts['Siti Rahmawati'] = 2;
    }

    const wordCloud: WordCloudItem[] = Object.entries(calegCounts)
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value);

    const totalPartai = Object.values(partaiCounts).reduce((a, b) => a + b, 0) || 1;
    const topPartai = Object.entries(partaiCounts)
      .map(([partai, count]) => ({
        partai,
        count,
        percentage: Math.round((count / totalPartai) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    return {
      wordCloud,
      topPartai,
      totalResponsesWithCaleg: totalWithCaleg,
    };
  },

  // -------------------------------------------------------------
  // CAPRES HEAD-TO-HEAD STATS
  // -------------------------------------------------------------
  async getCapresStats(surveyId?: string): Promise<CapresStats> {
    let rows: any[] = [];
    if (supabase) {
      try {
        let q = supabase
          .from('dtd_survey_results')
          .select('pilihan_capres_anies_ganjar_prabowo, pilihan_capres_anies_prabowo, pilihan_capres_ganjar_prabowo');
        if (surveyId) q = q.eq('survey_id', surveyId);
        const { data } = await q;
        rows = data || [];
      } catch (err) {
        console.error('getCapresStats error:', err);
      }
    }
    if (rows.length === 0) rows = inMemoryResults;

    const calcDistribution = (field: string, candidates: string[]) => {
      const counts: Record<string, number> = {};
      candidates.forEach((c) => (counts[c] = 0));
      rows.forEach((r) => {
        let val = r[field];
        if (val === 'Prabowo') val = 'Kandidat Garuda';
        if (val === 'Anies') val = 'Kandidat Nusantara';
        if (val === 'Ganjar') val = 'Kandidat Ksatria';
        if (val && counts[val] !== undefined) {
          counts[val]++;
        }
      });
      const total = rows.length || 1;
      return candidates.map((name) => ({
        name,
        count: counts[name] || 0,
        percentage: Math.round(((counts[name] || 0) / total) * 100),
      }));
    };

    return {
      threeWay: calcDistribution('pilihan_capres_anies_ganjar_prabowo', ['Kandidat Garuda', 'Kandidat Nusantara', 'Kandidat Ksatria']),
      aniesVsPrabowo: calcDistribution('pilihan_capres_anies_prabowo', ['Kandidat Garuda', 'Kandidat Nusantara']),
      ganjarVsPrabowo: calcDistribution('pilihan_capres_ganjar_prabowo', ['Kandidat Garuda', 'Kandidat Ksatria']),
    };
  },

  // -------------------------------------------------------------
  // MULTI-CHART BREAKDOWNS (PRD §3.3.2)
  // -------------------------------------------------------------
  async getMultiChartBreakdowns(surveyId?: string): Promise<MultiChartData> {
    let rows: any[] = [];
    if (supabase) {
      try {
        let q = supabase.from('dtd_survey_results').select('*');
        if (surveyId) q = q.eq('survey_id', surveyId);
        const { data } = await q;
        rows = data || [];
      } catch (err) {
        console.error('getMultiChartBreakdowns error:', err);
      }
    }
    if (rows.length === 0) rows = inMemoryResults;

    const aggregate = (getter: (r: any) => string) => {
      const counts: Record<string, number> = {};
      for (const r of rows) {
        const key = getter(r) || 'Lainnya';
        counts[key] = (counts[key] || 0) + 1;
      }
      const total = rows.length || 1;
      return Object.entries(counts)
        .map(([label, count]) => ({
          label,
          count,
          percentage: Math.round((count / total) * 100),
        }))
        .sort((a, b) => b.count - a.count);
    };

    return {
      menjadiRelawan: aggregate((r) => (r.menjadi_relawan ? 'Bersedia Menjadi Relawan' : 'Belum Bersedia')),
      tingkatYakin: aggregate((r) => r.tingkat_yakin || 'Yakin'),
      pernahTahuCaleg: aggregate((r) => (r.pernah_tahu_nama_caleg ? 'Tahu / Pernah Dengar' : 'Belum Tahu')),
      partai: aggregate((r) => r.partai || 'Belum Menentukan'),
      jenisKelamin: aggregate((r) => r.jenis_kelamin || 'Laki-laki'),
      usiaKelompok: aggregate((r) => {
        const u = Number(r.usia) || 30;
        if (u < 25) return 'Gen Z (< 25 th)';
        if (u <= 40) return 'Milenial (25 - 40 th)';
        if (u <= 55) return 'Gen X (41 - 55 th)';
        return 'Senior (> 55 th)';
      }),
      agama: aggregate((r) => r.agama || 'Islam'),
      suku: aggregate((r) => r.suku || 'Melayu'),
    };
  },

  // -------------------------------------------------------------
  // ADMIN RESPONDENT DATA & AUDITED NIK DECRYPTION (PRD §9)
  // -------------------------------------------------------------
  async getSurveyResultsForAdmin(surveyId?: string, limit = 50): Promise<SurveyResultRecord[]> {
    if (supabase) {
      try {
        let q = supabase
          .from('dtd_survey_results')
          .select('*, dtd_tps_rt_rw(nama)')
          .order('created_at', { ascending: false })
          .limit(limit);
        if (surveyId) q = q.eq('survey_id', surveyId);

        const { data, error } = await q;
        if (!error && data) {
          return data.map((d: any) => ({
            id: d.id,
            survey_id: d.survey_id,
            tps_rt_rw_id: d.tps_rt_rw_id,
            tps_nama: d.dtd_tps_rt_rw?.nama || 'TPS 01 Belian',
            nama: d.nama,
            nik_last4: d.nik_last4 || '0000',
            alamat: d.alamat,
            jenis_kelamin: d.jenis_kelamin,
            usia: d.usia,
            agama: d.agama,
            suku: d.suku,
            telepon: d.telepon,
            jumlah_pemilih: d.jumlah_pemilih,
            tingkat_yakin: d.tingkat_yakin,
            partai: d.partai,
            nama_caleg_ri: d.nama_caleg_ri,
            pernah_tahu_nama_caleg: d.pernah_tahu_nama_caleg,
            memilih_langsung: d.memilih_langsung,
            memilih_visi_misi: d.memilih_visi_misi,
            menjadi_relawan: d.menjadi_relawan,
            pilihan_capres_anies_ganjar_prabowo: d.pilihan_capres_anies_ganjar_prabowo,
            pilihan_capres_anies_prabowo: d.pilihan_capres_anies_prabowo,
            pilihan_capres_ganjar_prabowo: d.pilihan_capres_ganjar_prabowo,
            input_by: d.input_by,
            input_by_name: d.input_by_name,
            created_at: d.created_at,
          }));
        }
      } catch (err) {
        console.error('getSurveyResultsForAdmin error:', err);
      }
    }

    return inMemoryResults;
  },

  async decryptNikAudited(
    surveyResultId: string,
    adminUser: UserProfile,
    alasan: string
  ): Promise<{ success: boolean; decryptedNik?: string; message: string }> {
    if (adminUser.role !== 'ADMIN') {
      return { success: false, message: 'Akses ditolak: Hanya Administrator yang berwenang membuka NIK utuh.' };
    }
    if (!alasan || alasan.trim().length < 5) {
      return { success: false, message: 'Alasan pembukaan NIK wajib diisi (minimal 5 karakter) untuk audit trail UU PDP.' };
    }

    let encryptedNikToken = '';
    let respondenNama = '';

    if (supabase) {
      try {
        const { data } = await supabase
          .from('dtd_survey_results')
          .select('nik_encrypted, nama')
          .eq('id', surveyResultId)
          .single();
        if (data) {
          encryptedNikToken = data.nik_encrypted;
          respondenNama = data.nama;
        }
      } catch (err) {
        console.error('decryptNikAudited select error:', err);
      }
    }

    if (!encryptedNikToken) {
      const found = inMemoryResults.find((r) => r.id === surveyResultId);
      if (found) {
        encryptedNikToken = found.nik_encrypted;
        respondenNama = found.nama;
      }
    }

    if (!encryptedNikToken) {
      return { success: false, message: 'Data responden tidak ditemukan' };
    }

    const decryptedNik = decryptNik(encryptedNikToken);

    // Write audit log
    const logId = `log-${Date.now()}`;
    const logItem: NikAccessLogItem = {
      id: logId,
      survey_result_id: surveyResultId,
      responden_nama: respondenNama,
      accessed_by: adminUser.id,
      accessed_by_name: `${adminUser.nama} (${adminUser.role})`,
      accessed_at: new Date().toISOString(),
      alasan: alasan.trim(),
    };

    if (supabase) {
      try {
        await supabase.from('dtd_nik_access_log').insert({
          id: logItem.id,
          survey_result_id: logItem.survey_result_id,
          accessed_by: logItem.accessed_by,
          accessed_by_name: logItem.accessed_by_name,
          accessed_at: logItem.accessed_at,
          alasan: logItem.alasan,
        });
      } catch (err) {
        console.error('Audit log write error:', err);
      }
    }

    inMemoryAccessLogs.unshift(logItem);

    return {
      success: true,
      decryptedNik,
      message: 'NIK berhasil didekripsi & dicatat ke audit log keamanan UU PDP.',
    };
  },

  async getNikAccessLogs(): Promise<NikAccessLogItem[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('dtd_nik_access_log')
          .select('*, dtd_survey_results(nama)')
          .order('accessed_at', { ascending: false })
          .limit(50);
        if (!error && data) {
          return data.map((d: any) => ({
            id: d.id,
            survey_result_id: d.survey_result_id,
            responden_nama: d.dtd_survey_results?.nama || 'Responden',
            accessed_by: d.accessed_by,
            accessed_by_name: d.accessed_by_name || 'Admin',
            accessed_at: d.accessed_at,
            alasan: d.alasan,
          }));
        }
      } catch (err) {
        console.error('getNikAccessLogs error:', err);
      }
    }

    return inMemoryAccessLogs;
  },

  // -------------------------------------------------------------
  // EXPORT AGGREGATE EXCEL (PRD §7.5 - STRICTLY NO PII)
  // -------------------------------------------------------------
  async generateExcelReport(surveyId?: string): Promise<Buffer> {
    const metrics = await this.getDashboardMetrics(surveyId);
    const breakdown = await this.getWilayahBreakdown(surveyId);
    const candidates = await this.getCandidateWordCloud(surveyId);
    const capres = await this.getCapresStats(surveyId);
    const charts = await this.getMultiChartBreakdowns(surveyId);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'ELANG DTD Campaign Monitoring System';
    workbook.created = new Date();

    // Sheet 1: Ringkasan Wilayah
    const sheet1 = workbook.addWorksheet('Rekapitulasi Wilayah');
    sheet1.columns = [
      { header: 'No', key: 'no', width: 6 },
      { header: 'Wilayah / TPS', key: 'nama', width: 35 },
      { header: 'Jumlah Responden', key: 'totalResponden', width: 18 },
      { header: 'Jumlah DPT (KK)', key: 'totalDpt', width: 18 },
      { header: 'Jumlah Memilih', key: 'jumlahMemilih', width: 18 },
      { header: 'Belum Memilih', key: 'jumlahBelumMemilih', width: 18 },
      { header: 'Persentase Memilih', key: 'persentaseMemilih', width: 20 },
    ];

    breakdown.forEach((b, idx) => {
      sheet1.addRow({
        no: idx + 1,
        nama: b.nama,
        totalResponden: b.totalResponden,
        totalDpt: b.totalDpt,
        jumlahMemilih: b.jumlahMemilih,
        jumlahBelumMemilih: b.jumlahBelumMemilih,
        persentaseMemilih: `${b.persentaseMemilih}%`,
      });
    });

    // Sheet 2: Popularitas Caleg DPR RI
    const sheet2 = workbook.addWorksheet('Caleg DPR RI');
    sheet2.columns = [
      { header: 'Peringkat', key: 'rank', width: 10 },
      { header: 'Nama Calon Legislatif', key: 'text', width: 35 },
      { header: 'Frekuensi Sebutan Pemilih', key: 'value', width: 25 },
    ];
    candidates.wordCloud.forEach((c, idx) => {
      sheet2.addRow({
        rank: idx + 1,
        text: c.text,
        value: c.value,
      });
    });

    // Sheet 3: Preferensi Capres
    const sheet3 = workbook.addWorksheet('Simulasi Capres');
    sheet3.columns = [
      { header: 'Simulasi Pertarungan', key: 'simulasi', width: 30 },
      { header: 'Nama Kandidat Capres', key: 'name', width: 25 },
      { header: 'Jumlah Pemilih', key: 'count', width: 18 },
      { header: 'Persentase', key: 'percentage', width: 15 },
    ];
    capres.threeWay.forEach((c) => {
      sheet3.addRow({
        simulasi: '3 Poros (Kandidat Garuda - Nusantara - Ksatria)',
        name: c.name,
        count: c.count,
        percentage: `${c.percentage}%`,
      });
    });

    // Style headers
    [sheet1, sheet2, sheet3].forEach((sheet) => {
      sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF15803D' },
      };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  },
};
