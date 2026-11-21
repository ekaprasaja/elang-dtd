import { NextRequest, NextResponse } from 'next/server';
import { dtdRepository } from '@/lib/repository';
import { getCurrentUser } from '@/lib/session';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Akses Ditolak: Data elektoral kandidat hanya dapat diakses oleh Administrator.' },
      { status: 403 }
    );
  }

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
