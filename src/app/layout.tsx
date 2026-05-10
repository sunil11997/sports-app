import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import ServiceWorkerRegister from "./sw-register";

import {
  FirebaseClientProvider,
} from "@/firebase";

export const metadata: Metadata = {
  title: "Sports Hub",
  description: "Sports coaching app",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1e3a8a" />
      </head>

      <body>
        <FirebaseClientProvider>
          <ServiceWorkerRegister />
          {children}
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
