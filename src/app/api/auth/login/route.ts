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

    // 1. Verifikasi Utama Melalui Tabel Sentral SSO
    if (supabase) {
      const { data: ssoUser, error: ssoErr } = await supabase
        .from('sso_users')
        .select('*')
        .ilike('email', cleanEmail)
        .maybeSingle();

      if (ssoUser) {
        if (ssoUser.password_hash !== password) {
          return NextResponse.json(
            { error: 'Kredensial tidak valid. Silakan periksa kembali email dan kata sandi Anda.' },
            { status: 401 }
          );
        }

        if (ssoUser.status !== 'ACTIVE') {
          return NextResponse.json(
            { error: 'Akun Anda telah dinonaktifkan oleh Super Admin.' },
            { status: 403 }
          );
        }

        // PENEGAKAN IZIN APLIKASI: Harus memiliki 'dtd' atau merupakan Super Admin
        const isAllowed = ssoUser.is_super_admin || (Array.isArray(ssoUser.allowed_apps) && ssoUser.allowed_apps.includes('dtd'));
        if (!isAllowed) {
          return NextResponse.json(
            {
              error: 'Akses Ditolak: Akun Anda tidak memiliki izin untuk mengakses Elang DTD. Izin akses survei lapangan hanya dapat diberikan oleh Super Admin Pusat.',
              forbidden: true,
            },
            { status: 403 }
          );
        }

        const role = ssoUser.is_super_admin ? 'ADMIN' : (ssoUser.role_in_app?.dtd || 'RELAWAN');
        const targetUser = {
          id: ssoUser.id,
          email: ssoUser.email,
          nama: ssoUser.name,
          role: role as any,
          phone: ssoUser.phone || '',
          assignedWilayah: ssoUser.is_super_admin ? 'Seluruh Wilayah (Pusat)' : 'Seluruh Kepulauan Riau',
        };

        // Update last login
        await supabase
          .from('sso_users')
          .update({ last_login_at: new Date().toISOString(), last_login_app: 'dtd' })
          .eq('id', ssoUser.id);

        await setSessionUser(targetUser.id, targetUser);

        return NextResponse.json({
          success: true,
          user: targetUser,
          message: `Berhasil masuk sebagai ${targetUser.nama}`,
        });
      }

      // 2. Fallback: Cek tabel dtd_profiles lokal jika ada
      const { data: dbUser, error: dbErr } = await supabase
        .from('dtd_profiles')
        .select('*')
        .ilike('email', cleanEmail)
        .maybeSingle();

      if (!dbErr && dbUser) {
        if (dbUser.password_hash !== password) {
          return NextResponse.json(
            { error: 'Kredensial tidak valid. Silakan periksa kembali email dan kata sandi Anda.' },
            { status: 401 }
          );
        }
        const targetUser = {
          id: dbUser.id,
          email: dbUser.email,
          nama: dbUser.nama,
          role: dbUser.role,
          phone: dbUser.phone || '',
          assignedWilayah: dbUser.assigned_wilayah || 'Seluruh Kepulauan Riau',
        };

        await setSessionUser(targetUser.id, targetUser);
        return NextResponse.json({
          success: true,
          user: targetUser,
          message: `Berhasil masuk sebagai ${targetUser.nama}`,
        });
      }
    }

    return NextResponse.json(
      { error: 'Kredensial tidak valid. Silakan periksa kembali email dan kata sandi Anda.' },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan sistem' },
      { status: 500 }
    );
  }
}
