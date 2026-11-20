import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, setSessionUser, clearSession } from '@/lib/session';

export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({
    user,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    const user = await setSessionUser(userId);
    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal mengubah sesi' }, { status: 400 });
  }
}

export async function DELETE() {
  try {
    await clearSession();
    return NextResponse.json({
      success: true,
      message: 'Sesi berhasil diakhiri',
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal keluar' }, { status: 500 });
  }
}
