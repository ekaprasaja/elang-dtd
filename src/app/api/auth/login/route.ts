import { NextRequest, NextResponse } from 'next/server';
import { setSessionUser } from '@/lib/session';
import { initialProfiles } from '@/lib/repository';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan kata sandi wajib diisi.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const targetUser = initialProfiles.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Kredensial tidak valid. Silakan periksa kembali email dan kata sandi Anda.' },
        { status: 401 }
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
