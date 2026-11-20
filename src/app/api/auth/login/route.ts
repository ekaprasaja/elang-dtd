import { NextRequest, NextResponse } from 'next/server';
import { setSessionUser } from '@/lib/session';
import { initialProfiles } from '@/lib/repository';
import { supabase } from '@/lib/supabase';

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
    let targetUser = initialProfiles.find((u) => u.email.toLowerCase() === cleanEmail);

    // Verify against Supabase dtd_profiles table (Production Database)
    if (supabase) {
      const { data: dbUser, error } = await supabase
        .from('dtd_profiles')
        .select('*')
        .ilike('email', cleanEmail)
        .maybeSingle();

      if (!error && dbUser) {
        if (dbUser.password_hash !== password) {
          return NextResponse.json(
            { error: 'Kredensial tidak valid. Silakan periksa kembali email dan kata sandi Anda.' },
            { status: 401 }
          );
        }
        targetUser = {
          id: dbUser.id,
          email: dbUser.email,
          nama: dbUser.nama,
          role: dbUser.role,
          phone: dbUser.phone || '',
          assignedWilayah: dbUser.assigned_wilayah || targetUser?.assignedWilayah || 'Seluruh Kepulauan Riau',
        };
      } else {
        return NextResponse.json(
          { error: 'Kredensial tidak valid. Silakan periksa kembali email dan kata sandi Anda.' },
          { status: 401 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Database otentikasi belum terkonfigurasi.' },
        { status: 503 }
      );
    }

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Kredensial tidak valid. Silakan periksa kembali email dan kata sandi Anda.' },
        { status: 401 }
      );
    }

    // Set session cookie
    const user = await setSessionUser(targetUser.id);
    if (!user) {
      return NextResponse.json({ error: 'Gagal membuat sesi.' }, { status: 500 });
    }

    const { password: _p, ...safeUser } = user;

    return NextResponse.json({
      success: true,
      user: safeUser,
      message: `Berhasil masuk sebagai ${safeUser.nama}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan sistem' },
      { status: 500 }
    );
  }
}
