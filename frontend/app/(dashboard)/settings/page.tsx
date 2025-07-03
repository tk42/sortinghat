import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/src/utils/firebase/admin';
import { findTeacher } from '@/src/utils/actions/fetch_teacher';
import SettingsPageClient from '@/src/components/settings/SettingsPageClient';

export default async function SettingsPage() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('auth-token')?.value;

  if (!sessionCookie) {
    redirect('/login');
  }

  try {
    const decodedToken = await auth.verifySessionCookie(sessionCookie);
    
    // 現在のアーキテクチャではfindTeacherがidTokenを必要とするため、
    // ここではSSR化を見送り、クライアントサイドでデータをロードする
    const initialTeacher = undefined;
    
    return <SettingsPageClient initialTeacher={initialTeacher} />;
  } catch (error) {
    console.error('Error verifying session:', error);
    redirect('/login');
  }
}

