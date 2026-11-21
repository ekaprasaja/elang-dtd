import { NextRequest, NextResponse } from 'next/server';
import { dtdRepository } from '@/lib/repository';
import { getCurrentUser } from '@/lib/session';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Akses Ditolak: Dashboard analitik hanya dapat diakses oleh Administrator.' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const surveyId = searchParams.get('surveyId') || undefined;
  const wilayahId = searchParams.get('wilayahId') || undefined;

  const [metrics, breakdown] = await Promise.all([
    dtdRepository.getDashboardMetrics(surveyId, wilayahId),
    dtdRepository.getWilayahBreakdown(surveyId),
  ]);

  return NextResponse.json({
    metrics,
    breakdown,
  });
}
