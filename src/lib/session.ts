import { cookies } from 'next/headers';
import { UserProfile } from '@/types';
import { initialProfiles } from './repository';
import { supabase } from './supabase';

const SESSION_COOKIE_NAME = 'dtd_session_user_id';

export async function getCurrentUser(): Promise<UserProfile | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!userId || userId === 'guest' || userId === 'logged_out') {
    return null;
  }

  // 1. Cek di profil in-memory
  const found = initialProfiles.find((u) => u.id === userId);
  if (found) return found;

  // 2. Cek di tabel sso_users (Supabase)
  if (supabase) {
    try {
      const { data: ssoUser } = await supabase
        .from('sso_users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (ssoUser && ssoUser.status === 'ACTIVE') {
        const isAllowed = ssoUser.is_super_admin || (Array.isArray(ssoUser.allowed_apps) && ssoUser.allowed_apps.includes('dtd'));
        if (isAllowed) {
          return {
            id: ssoUser.id,
            email: ssoUser.email,
            nama: ssoUser.name,
            role: ssoUser.is_super_admin ? 'ADMIN' : (ssoUser.role_in_app?.dtd || 'RELAWAN'),
            phone: ssoUser.phone || '',
            assignedWilayah: ssoUser.is_super_admin ? 'Seluruh Wilayah (Pusat)' : 'Seluruh Kepulauan Riau',
          };
        }
      }

      // 3. Cek di dtd_profiles
      const { data: dtdUser } = await supabase
        .from('dtd_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (dtdUser) {
        return {
          id: dtdUser.id,
          email: dtdUser.email,
          nama: dtdUser.nama,
          role: dtdUser.role,
          phone: dtdUser.phone || '',
          assignedWilayah: dtdUser.assigned_wilayah || 'Seluruh Kepulauan Riau',
        };
      }
    } catch (e) {
      console.error('Failed to get current user from Supabase:', e);
    }
  }

  return null;
}

export async function setSessionUser(userId: string, userObj?: UserProfile): Promise<UserProfile | null> {
  const cookieStore = await cookies();
  const user = userObj || initialProfiles.find((u) => u.id === userId);
  
  if (!user && !userId) return null;

  cookieStore.set(SESSION_COOKIE_NAME, userId, {
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });

  return user || null;
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, 'logged_out', {
    path: '/',
    maxAge: 0,
    sameSite: 'lax',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
}
