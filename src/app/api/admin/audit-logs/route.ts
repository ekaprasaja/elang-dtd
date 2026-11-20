import { NextResponse } from 'next/server';
import { dtdRepository } from '@/lib/repository';
import { getCurrentUser } from '@/lib/session';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Akses ditolak: Hanya Administrator yang dapat melihat log audit NIK.' }, { status: 403 });
  }

  const logs = await dtdRepository.getNikAccessLogs();
  return NextResponse.json({ logs });
}
