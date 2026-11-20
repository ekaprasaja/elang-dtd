import { NextRequest, NextResponse } from 'next/server';
import { dtdRepository } from '@/lib/repository';
import { getCurrentUser } from '@/lib/session';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Akses tidak sah. Silakan login terlebih dahulu.' }, { status: 401 });
    }

    if (user.role === 'RELAWAN') {
      return NextResponse.json(
        { error: 'Akses ditolak: Hanya Administrator atau Koordinator yang berwenang mengekspor data survei.' },
        { status: 403 }
      );
    }

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
