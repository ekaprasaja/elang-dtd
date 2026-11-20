import { NextRequest, NextResponse } from 'next/server';
import { dtdRepository } from '@/lib/repository';
import { getCurrentUser } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Akses ditolak: Hanya Administrator yang berwenang mendekripsi NIK lengkap.' },
        { status: 403 }
      );
    }

    const { surveyResultId, alasan } = await req.json();
    if (!surveyResultId || !alasan) {
      return NextResponse.json(
        { error: 'ID responden dan alasan pembukaan NIK wajib diisi.' },
        { status: 400 }
      );
    }

    const result = await dtdRepository.decryptNikAudited(surveyResultId, user, alasan);
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal membuka NIK' }, { status: 400 });
  }
}
