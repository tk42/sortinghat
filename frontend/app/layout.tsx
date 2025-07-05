import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { AuthProvider } from "@/src/utils/firebase/authprovider";
// import { DrawerProvider } from '@/src/contexts/DrawerContext' // Removed with sidebar
import { ChatProvider } from '@/src/contexts/ChatContext'
import { ToastProvider } from '@/src/components/notifications/ToastNotifications'
import SessionSync from '@/src/components/Common/SessionSync'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Synergy Match Maker",
  description: "児童生徒の特性に基づいて最適な班分けを数理最適化を用いて提案する学校教員向けのアプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <ChatProvider>
            <ToastProvider>
              <SessionSync />
              {children}
            </ToastProvider>
          </ChatProvider>
        </AuthProvider>
      </body>
    </html>
  );
}