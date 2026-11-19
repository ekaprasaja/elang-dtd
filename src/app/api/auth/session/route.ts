import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, setSessionUser } from '@/lib/session';
import { initialProfiles } from '@/lib/repository';

export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({
    user,
    availableProfiles: initialProfiles,
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
