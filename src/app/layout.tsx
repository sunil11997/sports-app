import "./globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import ServiceWorkerRegister from "./sw-register";
import { FirebaseClientProvider } from "@/firebase/client-provider";

export const metadata: Metadata = {
  title: "Waghamba Sports Hub",
  description: "Institutional Physical Education & Sports Management System",
};

export const viewport: Viewport = {
  themeColor: "#1e3a8a",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <FirebaseClientProvider>
          <ServiceWorkerRegister />
          {children}
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
