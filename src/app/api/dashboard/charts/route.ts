import { NextRequest, NextResponse } from 'next/server';
import { dtdRepository } from '@/lib/repository';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const surveyId = searchParams.get('surveyId') || undefined;

  const charts = await dtdRepository.getMultiChartBreakdowns(surveyId);
  return NextResponse.json({ charts });
}
