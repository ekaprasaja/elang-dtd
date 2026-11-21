import { NextRequest, NextResponse } from 'next/server';
import { dtdRepository } from '@/lib/repository';
import { getCurrentUser } from '@/lib/session';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Akses Ditolak: Grafik analitik hanya dapat diakses oleh Administrator.' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const surveyId = searchParams.get('surveyId') || undefined;

  const charts = await dtdRepository.getMultiChartBreakdowns(surveyId);
  return NextResponse.json({ charts });
}
