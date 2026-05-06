
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { PWAProvider } from '@/components/providers/pwa-provider';
import { FirebaseClientProvider } from '@/firebase/client-provider';

export const metadata: Metadata = {
  title: 'शासकीय माध्यमिक आश्रम शाळा वाघंबा - Sports Hub',
  description: 'Professional Sports & Health Management System',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon-41.png', sizes: '41x41', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icon-512.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Waghamba Sports',
    startupImage: '/icon-512.png'
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#0048A0',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Waghamba Sports" />
        <link rel="apple-touch-icon" href="/icon-512.png" />
        <meta name="theme-color" content="#0048A0" />
      </head>
      <body className="font-body antialiased bg-[#0048A0]">
        <FirebaseClientProvider>
          <PWAProvider>
            {children}
            <Toaster />
          </PWAProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
