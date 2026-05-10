'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase/services';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const isClient = typeof window !== 'undefined';

  const firebaseServices = useMemo(() => {
    if (!isClient) return null;
    return initializeFirebase();
  }, [isClient]);

  // We ALWAYS return the provider. During SSR (firebaseServices is null), 
  // it provides a "not ready" state instead of missing context.
  return (
    <FirebaseProvider
      firebaseApp={firebaseServices?.firebaseApp}
      auth={firebaseServices?.auth}
      firestore={firebaseServices?.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
