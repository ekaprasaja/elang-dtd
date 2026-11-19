import { NextRequest, NextResponse } from 'next/server';
import { dtdRepository } from '@/lib/repository';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const surveyId = searchParams.get('surveyId') || undefined;

  const [candidates, capres] = await Promise.all([
    dtdRepository.getCandidateWordCloud(surveyId),
    dtdRepository.getCapresStats(surveyId),
  ]);

  return NextResponse.json({
    wordCloud: candidates.wordCloud,
    topPartai: candidates.topPartai,
    totalResponsesWithCaleg: candidates.totalResponsesWithCaleg,
    capres,
  });
}
