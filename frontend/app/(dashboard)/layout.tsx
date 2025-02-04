import { Sidebar } from "@/src/components/sidebar/Sidebar";
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/src/utils/firebase/admin';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('auth-token')?.value;

  if (!sessionCookie) {
    redirect('/login');
  }

  try {
    await auth.verifySessionCookie(sessionCookie);
    
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex flex-col flex-grow ml-72">
          {children}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in dashboard layout:', error);
    redirect('/login');
  }
}