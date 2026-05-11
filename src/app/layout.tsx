import "./globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import ServiceWorkerRegister from "./sw-register";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { PWAProvider } from "@/components/providers/pwa-provider";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Waghamba Sports Hub",
  description: "Institutional Physical Education & Sports Management System",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "WGB Sports",
  },
};

export const viewport: Viewport = {
  themeColor: "#1e3a8a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="antialiased font-body" suppressHydrationWarning>
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
