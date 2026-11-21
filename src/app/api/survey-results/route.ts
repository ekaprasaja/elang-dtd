import { NextRequest, NextResponse } from 'next/server';
import { dtdRepository } from '@/lib/repository';
import { getCurrentUser } from '@/lib/session';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Akses Ditolak: Hanya Administrator yang berwenang melihat rekapitulasi data responden.' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const surveyId = searchParams.get('surveyId') || undefined;

  const results = await dtdRepository.getSurveyResultsForAdmin(surveyId);
  return NextResponse.json({ results });
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    const {
      survey_id,
      tps_rt_rw_id,
      nama,
      nik,
      alamat,
      jenis_kelamin,
      usia,
      agama,
      suku,
      telepon,
      jumlah_pemilih,
      tingkat_yakin,
      partai,
      nama_caleg_ri,
      pernah_tahu_nama_caleg,
      memilih_langsung,
      memilih_visi_misi,
      menjadi_relawan,
      pilihan_capres_anies_ganjar_prabowo,
      pilihan_capres_anies_prabowo,
      pilihan_capres_ganjar_prabowo,
    } = body;

    if (!survey_id || !nama || !nik) {
      return NextResponse.json(
        { error: 'Survey, Nama responden, dan NIK (KTP) wajib diisi.' },
        { status: 400 }
      );
    }

    const cleanNik = String(nik).replace(/\D/g, '');
    if (cleanNik.length < 16) {
      return NextResponse.json(
        { error: 'NIK tidak valid (harus 16 digit angka).' },
        { status: 400 }
      );
    }

    const result = await dtdRepository.submitSurveyResult(
      {
        survey_id,
        tps_rt_rw_id,
        nama,
        nik: cleanNik,
        alamat,
        jenis_kelamin: jenis_kelamin || 'Laki-laki',
        usia: Number(usia) || 30,
        agama,
        suku,
        telepon,
        jumlah_pemilih: Number(jumlah_pemilih) || 1,
        tingkat_yakin: tingkat_yakin || 'Yakin',
        partai: partai || 'Partai Elang',
        nama_caleg_ri,
        pernah_tahu_nama_caleg: Boolean(pernah_tahu_nama_caleg),
        memilih_langsung: Boolean(memilih_langsung),
        memilih_visi_misi: Boolean(memilih_visi_misi),
        menjadi_relawan: Boolean(menjadi_relawan),
        pilihan_capres_anies_ganjar_prabowo: pilihan_capres_anies_ganjar_prabowo || 'Kandidat Garuda',
        pilihan_capres_anies_prabowo: pilihan_capres_anies_prabowo || 'Kandidat Garuda',
        pilihan_capres_ganjar_prabowo: pilihan_capres_ganjar_prabowo || 'Kandidat Garuda',
      },
      user
    );

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Gagal menyimpan hasil survei' },
      { status: 400 }
    );
  }
}
