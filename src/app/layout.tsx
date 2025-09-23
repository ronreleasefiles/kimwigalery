import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueueProvider } from '@/contexts/QueueContext';
import { ToastProvider } from '@/contexts/ToastContext';
import QueueTray from '@/components/QueueTray';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kimwi Gallery",
  description: "Ứng dụng quản lý ảnh hiện đại với NextJS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <ToastProvider>
          <QueueProvider>
            {children}
            <QueueTray />
          </QueueProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
