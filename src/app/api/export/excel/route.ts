import { NextRequest, NextResponse } from 'next/server';
import { dtdRepository } from '@/lib/repository';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const surveyId = searchParams.get('surveyId') || undefined;

    const buffer = await dtdRepository.generateExcelReport(surveyId);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Laporan_DTD_Monitoring_${Date.now()}.xlsx"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal export data' }, { status: 500 });
  }
}
