import { NextRequest, NextResponse } from 'next/server';
import { dtdRepository } from '@/lib/repository';

export async function GET(req: NextRequest) {
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
