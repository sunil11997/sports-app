import "./globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter, Poppins } from "next/font/google";

import ServiceWorkerRegister from "./sw-register";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { PWAProvider } from "@/components/providers/pwa-provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Waghamba Sports Hub",
  description: "Institutional Physical Education & Sports Management System",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon-192.png",
    shortcut: "/icon-192.png",
    apple: "/icon-512.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "WGB Sports",
  },
};

export const viewport: Viewport = {
  themeColor: "#1e3a8a",
  width: "device-width",
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`} suppressHydrationWarning>
      <body className="antialiased font-sans overflow-x-hidden w-full max-w-full" suppressHydrationWarning>
        <FirebaseClientProvider>
          <PWAProvider>
            <ServiceWorkerRegister />
            {children}
            <Toaster />
          </PWAProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
