import { NextRequest, NextResponse } from 'next/server';
import { dtdRepository } from '@/lib/repository';
import { getCurrentUser } from '@/lib/session';

export async function GET() {
  const surveys = await dtdRepository.getSurveys();
  return NextResponse.json({ surveys });
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Hanya Administrator yang dapat membuat survei baru.' }, { status: 403 });
    }

    const body = await req.json();
    const { nama, deskripsi, tanggal_mulai, tanggal_selesai } = body;

    if (!nama || !tanggal_mulai) {
      return NextResponse.json({ error: 'Nama survei dan tanggal mulai wajib diisi.' }, { status: 400 });
    }

    const newSurvey = await dtdRepository.createSurvey({
      nama,
      deskripsi,
      tanggal_mulai,
      tanggal_selesai,
    });

    return NextResponse.json({
      success: true,
      survey: newSurvey,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal membuat survei' }, { status: 400 });
  }
}
