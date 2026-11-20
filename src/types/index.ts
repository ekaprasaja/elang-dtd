export type UserRole = 'ADMIN' | 'KOORDINATOR' | 'RELAWAN' | 'VIEWER';

export interface UserProfile {
  id: string;
  email: string;
  nama: string;
  role: UserRole;
  password?: string;
  phone?: string;
  avatar_url?: string;
  assignedWilayah?: string;
}

export interface KabupatenKota {
  id: string;
  nama: string;
}

export interface Kecamatan {
  id: string;
  kabupaten_kota_id: string;
  nama: string;
}

export interface Kelurahan {
  id: string;
  kecamatan_id: string;
  nama: string;
}

export interface TpsRtRw {
  id: string;
  kelurahan_id: string;
  nama: string;
  tipe: 'TPS' | 'RT_RW';
}

export interface Survey {
  id: string;
  nama: string;
  deskripsi?: string;
  tanggal_mulai: string;
  tanggal_selesai?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  created_at: string;
}

export interface SurveyResultInput {
  survey_id: string;
  tps_rt_rw_id?: string;
  nama: string;
  nik: string; // Plaintext on client, encrypted before saving to DB
  alamat?: string;
  jenis_kelamin: 'Laki-laki' | 'Perempuan';
  usia: number;
  agama?: string;
  suku?: string;
  telepon?: string;
  jumlah_pemilih: number;
  tingkat_yakin: string;
  partai: string;
  nama_caleg_ri?: string;
  pernah_tahu_nama_caleg: boolean;
  memilih_langsung: boolean;
  memilih_visi_misi: boolean;
  menjadi_relawan: boolean;
  pilihan_capres_anies_ganjar_prabowo: string;
  pilihan_capres_anies_prabowo: string;
  pilihan_capres_ganjar_prabowo: string;
}

export interface SurveyResultRecord {
  id: string;
  survey_id: string;
  tps_rt_rw_id?: string;
  tps_nama?: string;
  kelurahan_nama?: string;
  kecamatan_nama?: string;
  kabupaten_nama?: string;
  nama: string;
  nik_last4: string;
  alamat?: string;
  jenis_kelamin: 'Laki-laki' | 'Perempuan';
  usia: number;
  agama?: string;
  suku?: string;
  telepon?: string;
  jumlah_pemilih: number;
  tingkat_yakin: string;
  partai: string;
  nama_caleg_ri?: string;
  pernah_tahu_nama_caleg: boolean;
  memilih_langsung: boolean;
  memilih_visi_misi: boolean;
  menjadi_relawan: boolean;
  pilihan_capres_anies_ganjar_prabowo: string;
  pilihan_capres_anies_prabowo: string;
  pilihan_capres_ganjar_prabowo: string;
  input_by?: string;
  input_by_name?: string;
  created_at: string;
  updated_at?: string;
}

export interface DashboardMetrics {
  totalResponden: number;
  totalDpt: number;
  jumlahMemilih: number;
  jumlahBelumMemilih: number;
  totalPemilihTersentuh: number;
  persentaseMemilih: number;
}

export interface WilayahBreakdownItem {
  id: string;
  nama: string;
  tipe: 'KABUPATEN' | 'KECAMATAN' | 'KELURAHAN' | 'TPS';
  totalResponden: number;
  totalDpt: number;
  jumlahMemilih: number;
  jumlahBelumMemilih: number;
  totalTersentuh: number;
  persentaseMemilih: number;
}

export interface WordCloudItem {
  text: string;
  value: number;
  partai?: string;
}

export interface CapresStats {
  threeWay: { name: string; count: number; percentage: number }[];
  aniesVsPrabowo: { name: string; count: number; percentage: number }[];
  ganjarVsPrabowo: { name: string; count: number; percentage: number }[];
}

export interface ChartItem {
  label: string;
  count: number;
  percentage: number;
}

export interface MultiChartData {
  menjadiRelawan: ChartItem[];
  tingkatYakin: ChartItem[];
  pernahTahuCaleg: ChartItem[];
  partai: ChartItem[];
  jenisKelamin: ChartItem[];
  usiaKelompok: ChartItem[];
  agama: ChartItem[];
  suku: ChartItem[];
}

export interface NikAccessLogItem {
  id: string;
  survey_result_id: string;
  responden_nama?: string;
  accessed_by: string;
  accessed_by_name: string;
  accessed_at: string;
  alasan: string;
}
