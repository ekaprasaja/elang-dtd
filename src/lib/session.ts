import { cookies } from 'next/headers';
import { UserProfile } from '@/types';
import { initialProfiles } from './repository';

const SESSION_COOKIE_NAME = 'dtd_session_user_id';

export async function getCurrentUser(): Promise<UserProfile | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!userId || userId === 'guest' || userId === 'logged_out') {
    return null;
  }

  const found = initialProfiles.find((u) => u.id === userId);
  return found || null;
}

export async function setSessionUser(userId: string): Promise<UserProfile | null> {
  const cookieStore = await cookies();
  const user = initialProfiles.find((u) => u.id === userId);
  
  if (!user) return null;

  cookieStore.set(SESSION_COOKIE_NAME, user.id, {
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax',
    httpOnly: true,
  });

  return user;
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, 'logged_out', {
    path: '/',
    maxAge: 0,
    sameSite: 'lax',
    httpOnly: true,
  });
}
