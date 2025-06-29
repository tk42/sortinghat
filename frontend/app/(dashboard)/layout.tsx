// import { Sidebar } from "@/src/components/sidebar/Sidebar"; // Commented out for new layout
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/src/utils/firebase/admin';
// import Drawer from '@/src/components/Common/Drawer' // Commented out for new layout
// import ChatInterface from '@/src/components/chat/ChatInterface' // Will be replaced with ChatWindow
// import FloatingActionButton from '@/src/components/mobile/FloatingActionButton' // Will be moved to UserAvatarButton

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
      <div className="min-h-screen bg-gray-50">
        {/* Full-width layout without sidebar */}
        {children}
      </div>
    );
  } catch (error) {
    console.error('Error in dashboard layout:', error);
    redirect('/login');
  }
}