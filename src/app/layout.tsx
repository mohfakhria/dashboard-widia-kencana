import { Outfit } from 'next/font/google';
import './globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import ToastProvider from "@/components/toast/ToastProvider";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Widia Kencana",
  description: "Internal Management and Monitoring Platform of PT. Widia Kencana.",
};

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <ToastProvider />
          <AuthProvider> {/* ⬅️ Bungkus semua agar SignInForm bisa akses useAuth() */}
            <SidebarProvider>{children}</SidebarProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}