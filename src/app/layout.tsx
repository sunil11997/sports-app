import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import ServiceWorkerRegister from "./sw-register";

import {
  FirebaseProvider,
  initializeFirebase,
} from "@/firebase";

const firebase = initializeFirebase();

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
        <FirebaseProvider
          firebaseApp={firebase.firebaseApp}
          firestore={firebase.firestore}
          auth={firebase.auth}
        >
          <ServiceWorkerRegister />
          {children}
        </FirebaseProvider>
      </body>
    </html>
  );
}