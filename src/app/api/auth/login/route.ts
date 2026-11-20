import { NextRequest, NextResponse } from 'next/server';
import { setSessionUser } from '@/lib/session';
import { initialProfiles } from '@/lib/repository';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, email, password } = body;

    let targetUser = null;

    if (userId) {
      targetUser = initialProfiles.find((u) => u.id === userId);
    } else if (email) {
      const cleanEmail = email.trim().toLowerCase();
      targetUser = initialProfiles.find((u) => u.email.toLowerCase() === cleanEmail);
    }

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Akun tidak ditemukan. Gunakan salah satu email akun demo yang tersedia.' },
        { status: 404 }
      );
    }

    // Set session cookie
    const user = await setSessionUser(targetUser.id);

    return NextResponse.json({
      success: true,
      user,
      message: `Berhasil masuk sebagai ${user.nama}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan sistem' },
      { status: 500 }
    );
  }
}
