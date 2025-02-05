import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { AuthProvider } from "@/src/utils/firebase/authprovider";
import { DrawerProvider } from '@/src/contexts/DrawerContext'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Synergy Match Maker",
  description: "児童の心理特性に基づいて最適な班分けを数理最適化を用いて提案する学校教員向けのアプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
      {(process.env.NODE_ENV !== "production") && (
        <script
            crossOrigin="anonymous"
            src="//unpkg.com/react-scan/dist/auto.global.js"
          />
      )}
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <DrawerProvider>
            {children}
          </DrawerProvider>
        </AuthProvider>
      </body>
    </html>
  );
}