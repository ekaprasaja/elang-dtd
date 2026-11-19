import { cookies } from 'next/headers';
import { UserProfile } from '@/types';
import { initialProfiles } from './repository';

const SESSION_COOKIE_NAME = 'dtd_session_user_id';

export async function getCurrentUser(): Promise<UserProfile> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (userId) {
    const found = initialProfiles.find((u) => u.id === userId);
    if (found) return found;
  }

  // Default to Admin for comprehensive access
  return initialProfiles[0];
}

export async function setSessionUser(userId: string): Promise<UserProfile> {
  const cookieStore = await cookies();
  const user = initialProfiles.find((u) => u.id === userId) || initialProfiles[0];
  
  cookieStore.set(SESSION_COOKIE_NAME, user.id, {
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax',
  });

  return user;
}
